import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Import Services and Managers
import { ProductService } from "#services/ProductService.js";
import { ProductManager } from "#store/Managers/ProductManager.js";
import { ApiManager } from "#bank/BankApi.js";
import { BankService } from "#services/BankService.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Global middleware to log each request
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 1. Prisma Initialization
const prisma = new PrismaClient();

// 2. Layer Instantiation
const productsService = new ProductService(prisma);
const bankService = new BankService(prisma, 0.05); // 5% commission

const productManager = new ProductManager(productsService);
const apiManager = new ApiManager();

/**
 * BANK ROUTES
 */
app.post("/api/v1/oauth/token", (req: Request, res: Response) => {
  console.log("--- Generating Access Token ---");
  return apiManager.tokenController(req, res);
});

app.post(
  "/api/v1/bank/charge",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("--- Validating OAuth2 ---");
    apiManager.validateOAuth2(req as any, res, next);
  },
  async (req: Request, res: Response) => {
    const { monto, sealerId, clientId } = req.body;
    console.log(`--- Processing Bank Charge ---`);
    console.log(
      `Data: Amount: ${monto}, Sealer: ${sealerId}, Client: ${clientId}`,
    );

    try {
      const success = await bankService.ChargePayment(
        monto,
        sealerId,
        clientId,
      );
      if (success) {
        console.log("Payment successfully processed in BankService");
        res.json({ status: "success", message: "Money successfully deducted" });
      } else {
        console.warn("Insufficient funds for client:", clientId);
        res
          .status(400)
          .json({ status: "error", message: "Insufficient funds" });
      }
    } catch (error: any) {
      console.error("Error in /bank/charge:", error.message);
      res.status(500).json({ status: "error", message: error.message });
    }
  },
);

/**
 * STORE ROUTES
 */
app.post("/api/v1/cart/add", async (req: Request, res: Response) => {
  const { productId, clientId, qty } = req.body;
  console.log(`--- Adding to Cart ---`);
  console.log(
    `Product ID: ${productId}, Client: ${clientId}, Quantity: ${qty}`,
  );

  try {
    const item = await productManager.addToCart(
      Number(productId),
      Number(clientId),
      Number(qty),
    );
    console.log("Item added successfully");
    res.json(item);
  } catch (error: any) {
    console.error("Error in /cart/add:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/v1/cart/pay", async (req: Request, res: Response) => {
  const { clientId } = req.body;
  console.log(`--- Starting Cart Payment Process ---`);
  console.log(`Client ID: ${clientId}`);

  try {
    const result = await productManager.pay(Number(clientId));
    console.log("Payment process completed successfully");
    res.json(result);
  } catch (error: any) {
    console.error("Error in /cart/pay:", error.message);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env["PORT"] || 3000;
app.listen(PORT, () => {
  console.log("--------------------------------------------------");
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log("--------------------------------------------------");
});

// Clean shutdown
process.on("SIGINT", async () => {
  console.log("\nClosing Prisma connection and shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
});
