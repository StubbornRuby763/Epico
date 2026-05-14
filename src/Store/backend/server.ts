import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { ProductService } from "#services/ProductService.js";
import { ProductManager } from "./StoreApi.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const productService = new ProductService(prisma);
const apiManager = new ProductManager(productService);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- ROUTES ---

/**
 * Retrieves payment configuration for the bank gateway
 */
app.get("/store/payment-config", async (_req, res) => {
  try {
    const config = await apiManager.getBankConfig();
    res.json(config);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

/**
 * Gets all products for the storefront
 */
app.get("/store/products", async (_req, res) => {
  try {
    const products = await apiManager.getStorefront();
    res.json({ status: "success", data: products });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * Filters products by category
 */
app.get("/store/products/category/:cat", async (req, res) => {
  try {
    const category = req.params.cat.toUpperCase() as any;
    const products = await apiManager.getProductsByCategory(category);
    res.json({ status: "success", data: products });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: "Invalid category" });
  }
});

/**
 * Adds an item to the shopping cart
 */
app.post("/store/cart/add", async (req, res) => {
  try {
    const { productId, clientId, qty } = req.body;
    const item = await apiManager.addToCart(productId, clientId, qty || 1);
    res.json({ status: "success", data: item });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * Processes payment using a bank authorization token
 */
app.post("/store/cart/pay", async (req, res) => {
  try {
    const { clientId, bankToken } = req.body;

    if (!bankToken) {
      return res.status(400).json({
        status: "error",
        message: "Bank authorization token is missing.",
      });
    }

    const result = await apiManager.pay(clientId, bankToken);
    return res.json({ status: "success", ...result });
  } catch (error: any) {
    return res.status(400).json({ status: "error", message: error.message });
  }
});

/**
 * Mock OAuth token endpoint
 */
app.post("/store/oauth/token", (_req, res) => {
  res.json({ access_token: "startup_token_pixel_art", expires_in: 3600 });
});

/**
 * Handles user login and session generation
 */
app.post("/store/login", async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Username and password are required",
        });
    }

    const result = await apiManager.login(user, password);
    const sessionToken = `session_${Buffer.from(user).toString("base64")}_${Date.now()}`;

    return res.json({
      status: "success",
      token: sessionToken,
      user: result.user,
      redirect: result.redirect,
    });
  } catch (error: any) {
    // Note: Using 401 Unauthorized for login failures
    return res
      .status(401)
      .json({ status: "error", message: "Invalid credentials" });
  }
});

/**
 * Handles new user registration
 */
app.post("/store/register", async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Username and password are required",
        });
    }

    const result = await apiManager.register(user, password);
    return res.json({ status: "success", ...result });
  } catch (error: any) {
    return res.status(400).json({ status: "error", message: error.message });
  }
});

/**
 * Updates client profile image
 */
app.post("/store/update-image", async (req, res) => {
  try {
    const { clientId, image } = req.body;

    if (!clientId || !image) {
      return res.status(400).json({
        status: "error",
        message: "ClientId and image URL are required",
      });
    }

    const result = await apiManager.uploadImage(clientId, image);
    return res.json({
      status: "success",
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * Removes a product from the cart
 */
app.delete("/store/cart/remove", async (req, res) => {
  try {
    const { productId, clientId } = req.body;
    const result = await apiManager.removeFromCart(productId, clientId);
    res.json({ status: "success", message: "Product removed", data: result });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * Retrieves trending products (highest popularity)
 */
app.get("/store/products/trending", async (req, res) => {
  try {
    const limitQuery = req.query["limit"];
    const limit = limitQuery ? parseInt(limitQuery as string) : 5;

    const trending = await apiManager.getTrending(limit);
    res.json({ status: "success", data: trending });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * Gets cart details for a specific client
 */
app.get("/store/cart/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const fullData = await apiManager.getClientData(parseInt(clientId));

    console.log(`Client Query: ${clientId} | DB CartID: ${fullData?.cartId}`);

    return res.json({
      status: "success",
      clientId: fullData?.id,
      associatedCartId: fullData?.cartId,
      data: fullData?.cart,
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * Retrieves clearance items (lowest popularity) with discounts
 */
app.get("/store/products/clearance", async (req, res) => {
  try {
    const limitQuery = req.query["limit"];
    const limit = limitQuery ? parseInt(limitQuery as string) : 5;

    const clearance = await prisma.product.findMany({
      take: limit,
      orderBy: {
        popularity: "asc",
      },
      include: {
        discount: true,
      },
    });

    res.json({ status: "success", data: clearance });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

const PORT = process.env["STOREPORT"] || 5000;
app.listen(PORT, () => {
  console.log(`Store backend running on: http://localhost:${PORT}`);
});
