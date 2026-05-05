import { PrismaClient, Category } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Starting Seed ---')

  // 1. Create a shopping cart
  const cart = await prisma.shoppingCart.create({
    data: {
      monto: 0,
    }
  })

  // 2. Create a Client and link it to the Cart
  const client = await prisma.client.upsert({
    where: { user: 'testuser' },
    update: {},
    create: {
      id: 1, // Force ID 1 for your test
      user: 'testuser',
      password: 'password123',
      shoppingCartId: cart.id
    }
  })

  // 3. Create a test Product
  const product = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, // Force ID 1 for your test
      name: 'Laptop Gamer',
      description: 'A very powerful laptop',
      price: 1500.00,
      image: 'https://via.placeholder.com/150',
      category: Category.DIGITAL,
      stock: 50
    }
  })

  // 4. Create a Bank Client (ATM) with sufficient balance
  await prisma.clientATM.upsert({
    where: { user: 'testuser' },
    update: {},
    create: {
      user: 'testuser',
      password: 'password123',
      balance: 10000.00 // Give them 10k so they can make purchases
    }
  })

  console.log({
    message: '✅ Data seeded successfully',
    clientCreated: client.user,
    productId: product.id,
    cartId: cart.id
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })