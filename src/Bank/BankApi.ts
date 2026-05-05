import jwt from "jsonwebtoken";
// 1. Unified and clean import
import type { Request, Response, NextFunction } from "express";

// Interface to extend Express Request
interface CustomRequest extends Request {
  appContext?: any;
}

const AUTHORIZED_APPS = [
  {
    clientId: process.env["STORE_CLIENT_ID"],
    clientSecret: process.env["STORE_CLIENT_SECRET"],
  },
];

export class ApiManager {
  // Controller to generate the token
  public tokenController = (req: Request, res: Response) => {
    const { client_id, client_secret } = req.body;

    const app = AUTHORIZED_APPS.find(
      (a) => a.clientId === client_id && a.clientSecret === client_secret,
    );

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

  // Middleware to validate the token
  public validateOAuth2 = (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): void | Response => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify that the token actually exists after splitting
    if (!token) {
      return res.status(401).json({ error: "Token format is invalid" });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env["JWT_SECRET"] || "default_secret",
      );
      req.appContext = decoded;
      // IMPORTANT: In Express, middlewares don't always return a value,
      // but they must call next() or respond.
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Token expired or tampered" });
    }
  };
}
