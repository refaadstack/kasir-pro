import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedData() {
  console.log('🌱 Seeding categories and products...\n')

  // 1. Seed Categories
  console.log('📁 Creating categories...')
  const categories = [
    { name: 'Makanan', emoji: '🍱' },
    { name: 'Minuman', emoji: '🥤' },
    { name: 'Snack', emoji: '🍿' },
    { name: 'Rokok', emoji: '🚬' },
    { name: 'Lainnya', emoji: '📦' },
  ]

  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', cat.name)
      .single()

    if (existing) {
      console.log(`   ✓ ${cat.name} (already exists)`)
      categoryMap[cat.name] = existing.id
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert([cat])
        .select()
        .single()

      if (error) {
        console.error(`   ✗ Error creating ${cat.name}:`, error.message)
      } else {
        console.log(`   ✓ ${cat.name} created`)
        categoryMap[cat.name] = data.id
      }
    }
  }

  // 2. Seed Products
  console.log('\n📦 Creating products...')
  const products = [
    {
      name: 'Nasi Goreng Spesial',
      sku: 'MKN-001',
      price: 18000,
      stock: 50,
      category: 'Makanan',
      emoji: '🍳',
    },
    {
      name: 'Mie Ayam Bakso',
      sku: 'MKN-002',
      price: 15000,
      stock: 40,
      category: 'Makanan',
      emoji: '🍜',
    },
    {
      name: 'Ayam Geprek',
      sku: 'MKN-003',
      price: 20000,
      stock: 35,
      category: 'Makanan',
      emoji: '🍗',
    },
    {
      name: 'Soto Ayam',
      sku: 'MKN-004',
      price: 16000,
      stock: 30,
      category: 'Makanan',
      emoji: '🍲',
    },
    {
      name: 'Es Teh Manis',
      sku: 'MNM-001',
      price: 5000,
      stock: 100,
      category: 'Minuman',
      emoji: '🍵',
    },
    {
      name: 'Es Jeruk',
      sku: 'MNM-002',
      price: 6000,
      stock: 80,
      category: 'Minuman',
      emoji: '🍊',
    },
    {
      name: 'Kopi Hitam',
      sku: 'MNM-003',
      price: 8000,
      stock: 60,
      category: 'Minuman',
      emoji: '☕',
    },
    {
      name: 'Jus Alpukat',
      sku: 'MNM-004',
      price: 12000,
      stock: 40,
      category: 'Minuman',
      emoji: '🥑',
    },
    {
      name: 'Chitato 68g',
      sku: 'SNK-001',
      price: 12000,
      stock: 45,
      category: 'Snack',
      emoji: '🥔',
    },
    {
      name: 'Oreo Original',
      sku: 'SNK-002',
      price: 10000,
      stock: 50,
      category: 'Snack',
      emoji: '🍪',
    },
    {
      name: 'Indomie Goreng',
      sku: 'SNK-003',
      price: 3500,
      stock: 100,
      category: 'Snack',
      emoji: '🍜',
    },
    {
      name: 'Sampoerna Mild 16',
      sku: 'RKK-001',
      price: 30000,
      stock: 100,
      category: 'Rokok',
      emoji: '🚬',
    },
    {
      name: 'Marlboro Merah',
      sku: 'RKK-002',
      price: 32000,
      stock: 80,
      category: 'Rokok',
      emoji: '🚬',
    },
  ]

  for (const product of products) {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', product.sku)
      .single()

    if (existing) {
      console.log(`   ✓ ${product.name} (already exists)`)
    } else {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          category_id: categoryMap[product.category], // snake_case
          emoji: product.emoji,
          is_active: true, // snake_case
        }])

      if (error) {
        console.error(`   ✗ Error creating ${product.name}:`, error.message)
      } else {
        console.log(`   ✓ ${product.name} created`)
      }
    }
  }

  console.log('\n✨ Seeding completed!\n')
}

seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
