import { ProductService } from "#services/ProductService.js";

export class ProductManager {
  private readonly clientIdStore: string;
  private readonly clientSecretStore: string;

  constructor(private readonly ProductDB: ProductService) {
    this.clientIdStore = process.env["STORE_CLIENT_ID"] || "";
    this.clientSecretStore = process.env["STORE_CLIENT_SECRET"] || "";
  }

  /**
   * Private method to automatically obtain the bank token
   */
  private async getBankToken(): Promise<string> {
    const response = await fetch("http://localhost:3000/api/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientIdStore,
        client_secret: this.clientSecretStore,
      }),
    });

    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Could not authenticate the store with the bank",
      );
    }

    return data.access_token;
  }

  async addToCart(ProductId: number, ClientId: number, qty: number) {
    let client = await this.ProductDB.getClientWithCart(ClientId);
    let cartId: number;

    if (!client?.cartId) {
      const newCart = await this.ProductDB.createCart();
      await this.ProductDB.assignCartToClient(ClientId, newCart.id);
      cartId = newCart.id;
    } else {
      cartId = client.cartId;
    }
    return await this.ProductDB.addProductToCart(cartId, ProductId, qty);
  }

  async pay(ClientId: number) {
    const clientData = await this.ProductDB.getClientFullData(ClientId);
    if (!clientData || !clientData.cart)
      throw new Error("ShoppingCart not found");

    const total = clientData.cart.items.reduce((acc: number, item: any) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    const token = await this.getBankToken();

    const response = await fetch("http://localhost:3000/api/v1/bank/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        monto: total,
        sealerId: 1,
        clientId: ClientId,
      }),
    });

    const result: any = await response.json();

    if (response.ok && result.status === "success") {
      await this.ProductDB.clearCart(clientData.cart.id);
      return { success: true, message: "Payment processed and cart cleared" };
    } else {
      throw new Error(result.message || "Error in payment gateway");
    }
  }
}
