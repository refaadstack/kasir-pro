import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  const slug = 'kasirpro-demo'
  let tenant = await prisma.tenant.findUnique({ where: { slug } })

  const owner = await prisma.user.upsert({
    where: { email: 'owner@kasirpro.com' },
    update: {},
    create: {
      name: 'Owner',
      email: 'owner@kasirpro.com',
      pin: '1234',
      role: 'SUPERADMIN',
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  })

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'KasirPro Demo',
        slug,
        ownerId: owner.id,
        plan: 'PREMIUM',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })
  }

  await prisma.user.update({ where: { id: owner.id }, data: { tenantId: tenant.id } })

  await prisma.user.upsert({
    where: { email: 'manager@kasirpro.com' },
    update: { tenantId: tenant.id },
    create: {
      name: 'Manager',
      email: 'manager@kasirpro.com',
      pin: '2345',
      role: 'MANAGER',
      isActive: true,
      tenantId: tenant.id,
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.user.upsert({
    where: { email: 'kasir@kasirpro.com' },
    update: { tenantId: tenant.id },
    create: {
      name: 'Budi S.',
      email: 'kasir@kasirpro.com',
      pin: '3456',
      role: 'KASIR',
      isActive: true,
      tenantId: tenant.id,
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.storeSettings.upsert({
    where: { id: tenant.id },
    update: {},
    create: { id: tenant.id, tenantId: tenant.id, storeName: 'KasirPro Demo' },
  })

  const categoryData = [
    { name: 'Makanan', emoji: '🍱' },
    { name: 'Minuman', emoji: '🥤' },
    { name: 'Snack', emoji: '🍿' },
    { name: 'Rokok', emoji: '🚬' },
  ]

  const categoryMap: Record<string, string> = {}
  for (const cat of categoryData) {
    const row = await prisma.category.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: cat.name } },
      update: {},
      create: { name: cat.name, emoji: cat.emoji, tenantId: tenant.id },
    })
    categoryMap[cat.name] = row.id
  }

  const products = [
    { name: 'Nasi Goreng Spesial', sku: 'MKN-001', price: 18000, stock: 50, category: 'Makanan', emoji: '🍳' },
    { name: 'Mie Ayam Bakso', sku: 'MKN-002', price: 15000, stock: 40, category: 'Makanan', emoji: '🍜' },
    { name: 'Es Teh Manis', sku: 'MNM-001', price: 5000, stock: 100, category: 'Minuman', emoji: '🍵' },
    { name: 'Chitato 68g', sku: 'SNK-001', price: 12000, stock: 45, category: 'Snack', emoji: '🥔' },
    { name: 'Sampoerna Mild 16', sku: 'RKK-001', price: 30000, stock: 100, category: 'Rokok', emoji: '🚬' },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: p.sku } },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        categoryId: categoryMap[p.category],
        emoji: p.emoji,
        tenantId: tenant.id,
      },
    })
  }

  console.log('✅ Seed selesai')
  console.log('   owner@kasirpro.com / PIN 1234')
  console.log('   manager@kasirpro.com / PIN 2345')
  console.log('   kasir@kasirpro.com / PIN 3456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
