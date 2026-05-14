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

    const app =
      client_id === process.env["STORE_CLIENT_ID"] &&
      client_secret === process.env["STORE_CLIENT_SECRET"];

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
  public registerUser = async (req: Request, res: Response) => {
    const { user, password, balance } = req.body;

    try {
      const newUser = await this.bankService.RegisterUser({
        user: user,
        password: password,
        balance: balance || 0,
      });

      if (newUser) {
        return res
          .status(201)
          .json({ status: "success", message: "New User creaded" });
      }
      return res.status(400).json({ error: "Cannot create to User" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
  public getConfig = (_req: Request, res: Response) => {
    return res.json({
      status: "success",
      taxRate: this.bankService.getTaxRate(),
      currency: "USD",
    });
  };

  // --- MIDDLEWARE: Validate OAuth2 ---
  public validateOAuth2 = (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): void => {
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
      const decoded = jwt.verify(
        token,
        process.env["JWT_SECRET"] || "default_secret",
      );
      req.appContext = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Token expired" });
      return;
    }
  };

  // --- CONTROLLER: Login (User Context) ---
  public loginUser = async (req: Request, res: Response) => {
    const { user, password, callbackUrl } = req.body;
    const client = await this.bankService.TryAccess(user, password);

    if (!client) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const sessionToken = jwt.sign(
      { userId: client.id, username: client.user, role: "BANK_CUSTOMER" },
      process.env["JWT_SECRET"] || "default_secret",
      { expiresIn: "20m" },
    );

    if (callbackUrl) {
      const successUrl = new URL(callbackUrl);
      successUrl.searchParams.append("token", sessionToken);
      successUrl.searchParams.append("status", "authorized");

      return res.json({
        token: sessionToken,
        redirect: successUrl.toString(),
      });
    }

    return res.json({ token: sessionToken, redirect: "/bank/dashboard.html" });
  };
  public authorizePayment = async (req: Request, res: Response) => {
    const { user, password, callbackUrl } = req.body;
    const client = await this.bankService.TryAccess(user, password);

    if (!client) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const sessionToken = jwt.sign(
      { userId: client.id, username: client.user, type: "PAYMENT_AUTH" },
      process.env["JWT_SECRET"] || "default_secret",
      { expiresIn: "10m" },
    );

    try {
      const successUrl = new URL(callbackUrl);
      successUrl.searchParams.append("token", sessionToken);
      return res.json({ status: "success", redirect: successUrl.toString() });
    } catch (e) {
      return res.status(400).json({ error: "return URL does not valid" });
    }
  };

  // --- CONTROLLER: Charge Payment ---
  public chargePayment = async (req: CustomRequest, res: Response) => {
    const customerToken = req.headers["x-customer-token"] as string;
    const { monto, sealerId } = req.body;
    try {
      const decoded = jwt.verify(
        customerToken,
        process.env["JWT_SECRET"] || "default_secret",
      ) as any;

      const userId = decoded.userId;

      const success = await this.bankService.ChargePayment(
        monto,
        sealerId,
        userId,
      );

      if (success) {
        return res.json({
          status: "success",
          transactionId: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        });
      }

      return res.status(400).json({ error: "Insufficient funds" });
    } catch (error) {
      console.error("ERROR in charge:", error);
      return res.status(401).json({ error: "Bank Sesion expired" });
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
        process.env["JWT_SECRET"] || "default_secret",
      ) as any;

      const user = await this.bankService.GetUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      console.log("User: ", user.balance);

      return res.json({
        user: user.user,
        balance: user.balance,
        id: user.id,
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
        process.env["JWT_SECRET"] || "default_secret",
      ) as any;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const updatedUser = await this.bankService.TopUp(decoded.userId, amount);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        message: "Charge valid",
        newBalance: updatedUser.balance,
      });
    } catch (error) {
      return res.status(401).json({ error: "invalid session" });
    }
  };
}
