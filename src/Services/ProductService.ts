import {
  PrismaClient,
  type Product,
  type Category,
  type ShoppingCart,
  Prisma,
} from "@prisma/client";

export interface ProductPreview {
  id: number;
  name: string;
  price: number;
  image: string;
  category: Category;
}

export class ProductService {
  constructor(private readonly client: PrismaClient) {}

  // --- PRODUCT METHODS ---

  /**
   * Retrieves a single product by its unique identifier.
   * @param id The unique ID of the product.
   */
  async findProductById(id: number): Promise<Product | null> {
    return this.client.product.findUnique({
      where: { id },
    });
  }

  /**
   * Retrieves all products, optionally filtered by category.
   * @param category Optional category filter.
   */
  async getAllProducts(category?: Category): Promise<Product[]> {
    return this.client.product.findMany({
      where: category ? { category } : {},
    });
  }

  /**
   * Creates a new product record in the database.
   * @param data Product creation data.
   */
  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.client.product.create({
      data,
    });
  }

  // --- CLIENT AND CART METHODS ---

  /**
   * Fetches a client and retrieves their linked shopping cart ID.
   * @param clientId The unique ID of the client.
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
   * Removes a specific product from a given shopping cart.
   * @param cartId The ID of the cart.
   * @param productId The ID of the product to remove.
   */
  async removeItemFromCart(cartId: number, productId: number) {
    return this.client.cartItem.deleteMany({
      where: {
        shoppingCartId: cartId,
        productId: productId,
      },
    });
  }

  /**
   * Assigns a shopping cart ID to a specific client.
   * @param clientId The ID of the client.
   * @param cartId The ID of the cart to be linked.
   */
  async assignCartToClient(clientId: number, cartId: number) {
    return this.client.client.update({
      where: { id: clientId },
      data: { cartId: cartId },
    });
  }

  /**
   * Retrieves comprehensive client information, including cart items and product details.
   * @param clientId The unique ID of the client.
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

  /**
   * Updates the profile image URL for a client.
   * @param clientId The ID of the client.
   * @param image The new image URL or path.
   */
  async uploadPhotoClient(clientId: number, image: string) {
    return this.client.client.update({
      where: { id: clientId },
      data: { image: image },
    });
  }

  // --- CART OPERATION METHODS ---

  /**
   * Initializes a new empty shopping cart.
   */
  async createCart(): Promise<ShoppingCart> {
    return this.client.shoppingCart.create({
      data: { monto: 0 },
    });
  }

  /**
   * Adds a product to a cart or increments the quantity if it already exists (upsert).
   * @param cartId Target shopping cart ID.
   * @param productId ID of the product to add.
   * @param qty Amount to add.
   */
  async addProductToCart(cartId: number, productId: number, qty: number) {
    return this.client.cartItem.upsert({
      where: {
        productId_shoppingCartId: {
          productId: productId,
          shoppingCartId: cartId,
        },
      },
      update: {
        quantity: {
          increment: qty,
        },
      },
      create: {
        quantity: qty,
        productId: productId,
        shoppingCartId: cartId,
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Retrieves products filtered by category and sorted alphabetically by name.
   * @param category Optional category filter.
   */
  async getProductsByCategory(category?: Category): Promise<Product[]> {
    return this.client.product.findMany({
      where: category ? { category } : {},
      orderBy: { name: "asc" },
    });
  }

  /**
   * Returns basic product info optimized for storefront display (grid view).
   */
  async getStorefrontItems(): Promise<ProductPreview[]> {
    return this.client.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        category: true,
        popularity: true,
      },
    });
  }

  /**
   * Retrieves the most popular products based on their popularity score.
   * @param limit Maximum number of products to return (default 10).
   */
  async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    return this.client.product.findMany({
      orderBy: {
        popularity: "desc",
      },
      take: limit,
    });
  }

  /**
   * Increments the popularity score of all products currently in a cart.
   * Typically called when a purchase is finalized.
   * @param cartId The ID of the cart whose items will be processed.
   */
  async incrementProductPopularity(cartId: number) {
    const items = await this.client.cartItem.findMany({
      where: { shoppingCartId: cartId },
      select: { productId: true, quantity: true },
    });

    const updates = items.map((item) =>
      this.client.product.update({
        where: { id: item.productId },
        data: {
          popularity: {
            increment: item.quantity,
          },
        },
      }),
    );

    return await this.client.$transaction(updates);
  }

  /**
   * Searches for products by name using a case-insensitive partial match.
   * @param query The search string.
   */
  async searchProducts(query: string): Promise<Product[]> {
    return this.client.product.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
    });
  }

  /**
   * Finds a client by their unique username.
   * @param username The username to search for.
   */
  async findClientByUser(username: string) {
    return this.client.client.findFirst({
      where: { user: username },
    });
  }

  /**
   * Creates a new client record.
   * @param data Client creation data.
   */
  async createClient(data: Prisma.ClientCreateInput) {
    return this.client.client.create({
      data,
    });
  }

  /**
   * Deletes all items from a shopping cart.
   * Usually executed after a successful checkout.
   * @param cartId The ID of the cart to empty.
   */
  async clearCart(cartId: number) {
    return this.client.cartItem.deleteMany({
      where: { shoppingCartId: cartId },
    });
  }

  /**
   * Gracefully closes the Prisma database connection.
   */
  async closeConnection(): Promise<void> {
    await this.client.$disconnect();
  }
}
