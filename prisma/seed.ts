import { PrismaClient } from '@prisma/client'

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

  // Users
  const kasir1 = await prisma.user.upsert({
    where: { email: 'owner@kasirpro.com' },
    update: {},
    create: { email: 'owner@kasirpro.com', role: 'SUPERADMIN', name: 'Owner', pin: '1234' },
  })
  const kasir2 = await prisma.user.upsert({
    where: { email: 'kasir1@kasirpro.com' },
    update: {},
    create: { email: 'kasir1@kasirpro.com', role: 'KASIR', name: 'Budi S.', pin: '1234' },
  })

  // Transaksi pakai userId yang benar
  await prisma.transaction.createMany({
    data: [
      { trxId: 'TRX-001', userId: kasir2.id, totalAmount: 28000, paymentMethod: 'TUNAI', cashReceived: 30000, change: 2000 },
      { trxId: 'TRX-002', userId: kasir2.id, totalAmount: 15000, paymentMethod: 'QRIS' },
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