import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ownerPassword = bcrypt.hashSync('owner1234', 12)
const adminPassword = bcrypt.hashSync('admin1234', 12)

async function main() {
  console.log('🌱 Seeding...')

  const slug = 'kasirpro-demo'
  let tenant = await prisma.tenant.findUnique({ where: { slug } })

  const owner = await prisma.user.upsert({
    where: { email: 'owner@kasirpro.com' },
    update: { password: ownerPassword, pin: '1234' },
    create: {
      name: 'Owner',
      email: 'owner@kasirpro.com',
      password: ownerPassword,
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
    update: { tenantId: tenant.id, username: 'manager' },
    create: {
      name: 'Manager',
      email: 'manager@kasirpro.com',
      username: 'manager',
      pin: '2345',
      role: 'MANAGER',
      isActive: true,
      tenantId: tenant.id,
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.user.upsert({
    where: { email: 'kasir@kasirpro.com' },
    update: { tenantId: tenant.id, username: 'budi' },
    create: {
      name: 'Budi S.',
      email: 'kasir@kasirpro.com',
      username: 'budi',
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

  await prisma.user.upsert({
    where: { email: 'admin@refaadstack.com' },
    update: { isPlatformAdmin: true, emailVerifiedAt: new Date(), password: adminPassword },
    create: {
      name: 'Platform Admin',
      email: 'admin@refaadstack.com',
      password: adminPassword,
      pin: '9999',
      role: 'SUPERADMIN',
      isActive: true,
      isPlatformAdmin: true,
      emailVerifiedAt: new Date(),
    },
  })

  console.log('✅ Seed selesai')
  console.log('   Owner   : owner@kasirpro.com / owner1234  (PIN approval 1234)')
  console.log('   Staff   : /staff/kasirpro-demo → manager / 2345, budi / 3456')
  console.log('   Platform: admin@refaadstack.com / admin1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
