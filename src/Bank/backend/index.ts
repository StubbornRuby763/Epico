import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { ApiManager } from "./BankApi.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const apiManager = new ApiManager();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * BANK ROUTES 
*/

app.post("/api/v1/oauth/token", (req, res) => apiManager.tokenController(req, res));

app.post("/api/v1/login", (req, res) => apiManager.loginUser(req, res));

app.post(
  "/api/v1/bank/charge",
  (req, res, next) => apiManager.validateOAuth2(req as any, res, next),
  (req, res) => apiManager.chargePayment(req, res)
);

app.post("/api/v1/register", (req, res) => apiManager.registerUser(req, res));

app.get("/api/v1/user/profile", (req, res) => apiManager.getUserProfile(req, res));

app.post("/api/v1/bank/topup", (req, res) => apiManager.topUpBalance(req, res));

app.use(express.static("public"));


const PORT = process.env["PORT"] || 3000;
app.listen(PORT, () => {
  console.log(`Bank Server running at: http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("\nClosing Prisma and exiting...");
  await prisma.$disconnect();
  process.exit(0);
});