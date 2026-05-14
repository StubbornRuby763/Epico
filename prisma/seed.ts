import { PrismaClient, Category } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Starting Seed ---')
  const client = await prisma.client.upsert({
    where: { user: 'root' },
    update: {},
    create: {
      user: 'root',
      password: 'admin',
      //configure with the url image
      image: "",
      cart: {
        create: { monto: 0 }
      }
    },
    include: { cart: true }
  })

  const product = await prisma.product.upsert({
    where: { name: 'Secret' }, 
    update: {},
    create: {
      name: 'Secret',
      description: 'A secret',
      price: 100000.00,
      //configure
      image: '',
      category: Category.DIGITAL,
      stock: 50
    }
  })

  await prisma.clientATM.upsert({
    where: { user: 'root' },
    update: { balance: 10000.00 },
    create: {
      user: 'root',
      password: 'admin',
      balance: 10000.00
    }
  })

  console.log('Seeding finished successfully')
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