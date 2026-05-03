import { PrismaClient, Role, PaymentMethod, TransactionStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Store settings
  await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'KasirPro Demo',
      receiptPrefix: 'TRX',
    },
  })

  // Categories
  const categories = [
    { name: 'Makanan', emoji: '🍱' },
    { name: 'Minuman', emoji: '🥤' },
    { name: 'Snack', emoji: '🍿' },
    { name: 'Rokok', emoji: '📦' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }

  // Products (from dummy data)
  const products = [
    { name: 'Nasi Goreng Spesial', sku: 'MKN-001', price: 18000, category: 'Makanan', stock: 50, emoji: '🍳' },
    { name: 'Mie Ayam Bakso', sku: 'MKN-002', price: 15000, category: 'Makanan', stock: 40, emoji: '🍜' },
    { name: 'Ayam Geprek', sku: 'MKN-003', price: 20000, category: 'Makanan', stock: 35, emoji: '🍗' },
    { name: 'Es Teh Manis', sku: 'MNM-001', price: 5000, category: 'Minuman', stock: 100, emoji: '🍵' },
    { name: 'Chitato 68g', sku: 'SNK-001', price: 12000, category: 'Snack', stock: 45, emoji: '🥔' },
    { name: 'Sampoerna Mild 16', sku: 'RKK-001', price: 30000, category: 'Rokok', stock: 100, emoji: '📦' },
    // Add more from dummy...
  ]

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { name: p.category } })
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...p,
        categoryId: category?.id,
      },
    })
  }

  // Users (demo accounts)
  const users = [
    { email: 'owner@kasirpro.com', role: 'SUPERADMIN', name: 'Owner', pin: '1234' },
    { email: 'manager@kasirpro.com', role: 'MANAGER', name: 'Manager', pin: '1234' },
    { email: 'kasir1@kasirpro.com', role: 'KASIR', name: 'Budi S.', pin: '1234' },
    { email: 'kasir2@kasirpro.com', role: 'KASIR', name: 'Sari M.', pin: '1234' },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
  }

  // Sample transactions (for stats)
  await prisma.transaction.createMany({
    data: [
      { trxId: 'TRX-001', userId: 'kasir1@kasirpro.com', totalAmount: 28000, paymentMethod: 'TUNAI', cashReceived: 30000 },
      { trxId: 'TRX-002', userId: 'kasir2@kasirpro.com', totalAmount: 15000, paymentMethod: 'QRIS' },
      // More...
    ],
  })

  console.log('✅ Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

