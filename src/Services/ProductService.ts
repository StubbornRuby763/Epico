import {
  PrismaClient,
  type Product,
  type Category,
  type ShoppingCart,
  Prisma,
} from "@prisma/client";

export class ProductService {
  constructor(private readonly client: PrismaClient) {}

  // --- PRODUCT METHODS ---

  async findProductById(id: number): Promise<Product | null> {
    return this.client.product.findUnique({
      where: { id },
    });
  }

  async getAllProducts(category?: Category): Promise<Product[]> {
    return this.client.product.findMany({
      where: category ? { category } : {},
    });
  }

  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.client.product.create({
      data,
    });
  }

  // --- CLIENT AND CART METHODS (NEW) ---

  /**
   * Gets a client and their associated cart ID
   */
  async getClientWithCart(clientId: number) {
    return this.client.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        cartId: true,
      },
    });
  }

  /**
   * Links a newly created cart to a client
   */
  async assignCartToClient(clientId: number, cartId: number) {
    return this.client.client.update({
      where: { id: clientId },
      data: { cartId: cartId },
    });
  }

  /**
   * Gets the cart with all its items and product information
   * Required for calculating the 'total' in the Manager
   */
  async getClientFullData(clientId: number) {
    return this.client.client.findUnique({
      where: { id: clientId },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  // --- CART OPERATION METHODS ---

  async createCart(): Promise<ShoppingCart> {
    return this.client.shoppingCart.create({
      data: { monto: 0 },
    });
  }

  async addProductToCart(cartId: number, productId: number, qty: number) {
    return this.client.cartItem.create({
      data: {
        quantity: qty,
        shoppingCartId: cartId,
        productId: productId,
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Removes all items from a cart (called after a successful payment)
   */
  async clearCart(cartId: number) {
    return this.client.cartItem.deleteMany({
      where: { shoppingCartId: cartId },
    });
  }

  async closeConnection(): Promise<void> {
    await this.client.$disconnect();
  }
}
