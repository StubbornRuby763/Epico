import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { PrismaClient } from "@prisma/client";
import { ApiManager } from "./BankApi.js";
import { BankService } from "#services/BankService.js";

const router = Router();
const prisma = new PrismaClient();

const apiManager = new ApiManager();
const bankService = new BankService(prisma, 0.05);

// --- PUBLIC ROUTES ---
router.post("/oauth/token", (req, res) =>
  apiManager.tokenController(req as any, res),
);

// --- PRIVATE ROUTES (NEED TOKEN) ---
router.post(
  "/bank/charge",
  (req: Request, res: Response, next: NextFunction) =>
    apiManager.validateOAuth2(req as any, res, next),
  async (req: Request, res: Response) => {
    const { monto, sealerId, clientId } = req.body;

    if (!monto || !sealerId || !clientId) {
      return res.status(400).json({ error: "Missing required data" });
    }

    const success = await bankService.ChargePayment(monto, sealerId, clientId);

    if (success) {
      return res.json({ status: "success", message: "Transaction completed" });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Insufficient funds or system error",
      });
    }
  },
);

export default router;
