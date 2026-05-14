import { ProductService } from "#services/ProductService.js";
import { type Category } from "@prisma/client";

/**
 * Manager class to handle business logic for the Store API.
 * Acts as a bridge between the Service layer and the Express controllers.
 */
export class ProductManager {
  private readonly clientIdStore = process.env["STORE_CLIENT_ID"];
  private readonly clientSecretStore = process.env["STORE_CLIENT_SECRET"];

  constructor(private readonly productDb: ProductService) {}

  // --- QUERY METHODS (For Frontend) ---

  /**
   * Retrieves products optimized for the initial grid display.
   */
  async getStorefront() {
    return await this.productDb.getStorefrontItems();
  }

  /**
   * Filters products by category (Digital, Consume, etc.).
   */
  async getProductsByCategory(category: Category) {
    return await this.productDb.getProductsByCategory(category);
  }

  /**
   * Fetches global bank configuration (tax rates, currency).
   */
  async getBankConfig() {
    try {
      const response = await fetch("http://localhost:3000/api/v1/bank/config");
      if (!response.ok) throw new Error("Error fetching bank config");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Could not retrieve bank configuration:", error);
      return { taxRate: 0, currency: "USD" };
    }
  }

  /**
   * Search logic for the TopBar search input.
   */
  async search(query: string) {
    if (!query || query.length < 2) return [];
    return await this.productDb.searchProducts(query);
  }

  /**
   * Retrieves full details for a specific product.
   */
  async getProductDetail(id: number) {
    const product = await this.productDb.findProductById(id);
    if (!product) throw new Error("Product not found");
    return product;
  }

  // --- CART AND PAYMENT METHODS ---

  /**
   * Adds an item to the client's cart. Creates a cart if one doesn't exist.
   */
  async addToCart(productId: number, clientId: number, qty: number) {
    let client = await this.productDb.getClientWithCart(clientId);
    if (!client) throw new Error("Client not found");

    let cartId: number;

    if (client.cartId) {
      cartId = client.cartId;
    } else {
      const newCart = await this.productDb.createCart();
      await this.productDb.assignCartToClient(clientId, newCart.id);
      cartId = newCart.id;
    }

    return await this.productDb.addProductToCart(cartId, productId, qty);
  }

  /**
   * Private logic to obtain a bank access token (Backend-to-Backend Auth).
   */
  private async getBankToken(): Promise<string> {
    try {
      const response = await fetch("http://localhost:3000/api/v1/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.clientIdStore,
          client_secret: this.clientSecretStore,
        }),
      });

      if (!response.ok) throw new Error("Could not authenticate with bank");

      const data: any = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Bank Auth Error:", error);
      return "error_token";
    }
  }

  /**
   * Removes a specific item from the client's shopping cart.
   */
  async removeFromCart(productId: number, clientId: number) {
    const client = await this.productDb.getClientWithCart(clientId);
    if (!client || !client.cartId) throw new Error("Shopping cart not found");

    return await this.productDb.removeItemFromCart(client.cartId, productId);
  }

  /**
   * Processes the payment for the current cart and updates product popularity.
   */
  async pay(clientId: number, bankToken: string) {
    const clientData = await this.productDb.getClientFullData(clientId);
    if (!clientData || !clientData.cart) {
      throw new Error("Shopping cart not found or empty");
    }

    // Calculate total
    const total = clientData.cart.items.reduce((acc: number, item: any) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    const finalTotal = Number(total.toFixed(2));
    console.log("Calculated Totals:", total, "-> Final:", finalTotal);

    if (finalTotal <= 0) throw new Error("Total must be greater than 0");

    // Get Backend-to-Backend token
    const appToken = await this.getBankToken();

    // Charge the customer
    const response = await fetch("http://localhost:3000/api/v1/bank/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appToken}`,
        "X-Customer-Token": bankToken,
      },
      body: JSON.stringify({
        amount: finalTotal,
        sellerId: 1,
        customerToken: bankToken,
      }),
    });

    const result: any = await response.json();

    if (response.ok && result.status === "success") {
      // Logic for post-payment success
      await this.productDb.incrementProductPopularity(clientData.cart.id);
      await this.productDb.clearCart(clientData.cart.id);

      return {
        success: true,
        message: "Payment processed and popularity updated",
        transactionId: result.transactionId,
      };
    } else {
      throw new Error(result.message || "Payment declined");
    }
  }

  /**
   * Retrieves all data for a specific client (including nested cart items).
   */
  async getClientData(clientId: number) {
    return await this.productDb.getClientFullData(clientId);
  }

  /**
   * Validates user credentials and returns safe client data.
   */
  async login(user: string, pass: string) {
    const client = await this.productDb.findClientByUser(user);

    if (!client) {
      throw new Error("User does not exist");
    }

    if (client.password !== pass) {
      throw new Error("Invalid password");
    }

    const { password, ...clientSafeData } = client;
    return {
      success: true,
      message: "Login successful",
      user: clientSafeData,
      redirect: "/store/",
    };
  }

  /**
   * Handles registration logic for new users and initializes a cart.
   */
  async register(user: string, pass: string) {
    const existing = await this.productDb.findClientByUser(user);
    if (existing) {
      throw new Error("Username already taken");
    }

    const newCart = await this.productDb.createCart();

    const newClient = await this.productDb.createClient({
      user: user,
      password: pass,
      cart: { connect: { id: newCart.id } },
      // Default placeholder image
      image:
        "https://as1.ftcdn.net/v2/jpg/03/53/11/00/1000_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg",
    });

    return {
      success: true,
      message: "Account created successfully",
      clientId: newClient.id,
    };
  }

  /**
   * Updates the client's profile image URL.
   */
  async uploadImage(clientId: number, image: string) {
    if (!image) throw new Error("Invalid image URL");

    const upload = await this.productDb.uploadPhotoClient(clientId, image);
    return {
      success: true,
      message: "Image updated successfully",
      image: upload.image,
    };
  }

  /**
   * Retrieves top trending products based on popularity score.
   */
  async getTrending(limit: number = 5) {
    return await this.productDb.getTrendingProducts(limit);
  }
}
