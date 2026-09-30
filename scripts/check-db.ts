import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 Checking database...\n')

  const [tenants, users, products] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.product.count(),
  ])

  console.log(`✅ Connected. tenants=${tenants} users=${users} products=${products}`)

  const list = await prisma.user.findMany({
    select: { name: true, email: true, role: true, tenant: { select: { name: true } } },
  })
  list.forEach((u) => console.log(`   - ${u.name} (${u.email}) [${u.role}] @ ${u.tenant?.name ?? '-'}`))
}

checkDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
