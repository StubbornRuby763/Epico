import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { BankService } from "#services/BankService.js";

interface CustomRequest extends Request {
  appContext?: any;
}

export class ApiManager {
  private bankService: BankService;

  constructor() {
    const prisma = new PrismaClient();
    this.bankService = new BankService(prisma, 0.05);
  }

  // --- CONTROLLER: OAuth Token (App to App) ---
  public tokenController = (req: Request, res: Response) => {
    const { client_id, client_secret } = req.body;

    const app = (client_id === process.env["STORE_CLIENT_ID"] && 
                 client_secret === process.env["STORE_CLIENT_SECRET"]);

    if (!app) {
      return res.status(401).json({ error: "Invalid_client" });
    }

    const token = jwt.sign(
      { appId: client_id },
      process.env["JWT_SECRET"] || "default_secret",
      { expiresIn: "1h" },
    );

    return res.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: 3600,
    });
  };

  // --- MIDDLEWARE: Validate OAuth2 ---
  public validateOAuth2 = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid token" });
        return; 
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Token empty" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env["JWT_SECRET"] || "default_secret");
        req.appContext = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Token expired" });
        return;
    }
  };

  // --- CONTROLLER: Login (User Context) ---
  public loginUser = async (req: Request, res: Response) => {
    const { user, password } = req.body;
    const client = await this.bankService.TryAccess(user, password);

    if (!client) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const sessionToken = jwt.sign(
      { userId: client.id, username: client.user, role: 'BANK_CUSTOMER' },
      process.env["JWT_SECRET"] || "default_secret",
      { expiresIn: "2h" }
    );

    return res.json({ token: sessionToken, redirect: "/bank/dashboard.html" });//redirect
  };
  // --- CONTROLLER: Register (Create New Account) ---
  public registerUser = async (req: Request, res: Response) => {
    const { user, password, balance } = req.body;

    if (!user || !password) {
      return res.status(400).json({ error: "User and password are required" });
    }

    const newClient = await this.bankService.RegisterUser({
      user,
      password,
      balance: balance || 0
    });

    if (!newClient) {
      return res.status(400).json({ error: "User already exists or invalid data" });
    }

    return res.status(201).json({ 
      message: "User registered successfully",
      userId: newClient.id 
    });
  };

  // --- CONTROLLER: Charge Payment ---
  public chargePayment = async (req: Request, res: Response) => {
    const { monto, sealerId, clientId } = req.body;

    if (!monto || !sealerId || !clientId) {
      return res.status(400).json({ error: "Missing required data" });
    }

    try {
      const success = await this.bankService.ChargePayment(monto, sealerId, clientId);
      if (success) {
        return res.json({ status: "success", message: "Transaction completed" });
      }
      return res.status(400).json({ status: "error", message: "Insufficient funds" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
  public getUserProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(
      token, 
      process.env["JWT_SECRET"] || "default_secret"
    ) as any;

    const user = await this.bankService.GetUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: user.user,
      balance: user.balance,
      id: user.id
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid session" });
  }
  };
  public topUpBalance = async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) return res.status(401).json({ error: "No token" });

      const decoded = jwt.verify(
        token,
        process.env["JWT_SECRET"] || "default_secret"
      ) as any;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const updatedUser = await this.bankService.TopUp(decoded.userId, amount;

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ 
        message: "Charge valid", 
        newBalance: updatedUser.balance 
      });
    } catch (error) {
      return res.status(401).json({ error: "invalid session" });
    }
  };
}