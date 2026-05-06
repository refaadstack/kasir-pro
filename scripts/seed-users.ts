import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedUsers() {
  console.log('🌱 Seeding users...')

  const users = [
    {
      name: 'Admin Utama',
      email: 'admin@kasirpro.com',
      pin: '1234', // Plain text PIN (tidak di-hash)
      role: 'SUPERADMIN',
      is_active: true,
    },
    {
      name: 'Manager Toko',
      email: 'manager@kasirpro.com',
      pin: '1234',
      role: 'MANAGER',
      is_active: true,
    },
    {
      name: 'Budi Santoso',
      email: 'budi@kasirpro.com',
      pin: '1234',
      role: 'KASIR',
      is_active: true,
    },
    {
      name: 'Sari Maharani',
      email: 'sari@kasirpro.com',
      pin: '4321',
      role: 'KASIR',
      is_active: true,
    },
  ]

  for (const user of users) {
    console.log(`\n📝 Creating user: ${user.name} (${user.email})`)

    // Cek apakah user sudah ada
    const { data: existing } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', user.email)
      .single()

    if (existing) {
      console.log(`   ⚠️  User already exists, updating...`)
      const { error } = await supabase
        .from('users')
        .update({
          name: user.name,
          pin: user.pin, // Plain text PIN
          role: user.role,
          is_active: user.is_active,
        })
        .eq('email', user.email)

      if (error) {
        console.error(`   ❌ Error updating user:`, error.message)
      } else {
        console.log(`   ✅ User updated successfully`)
      }
    } else {
      const { error } = await supabase.from('users').insert([user])

      if (error) {
        console.error(`   ❌ Error creating user:`, error.message)
      } else {
        console.log(`   ✅ User created successfully`)
      }
    }
  }

  console.log('\n✨ Seeding completed!')
  console.log('\n📋 Login credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  users.forEach((user) => {
    console.log(`${user.role.padEnd(12)} | ${user.email.padEnd(25)} | PIN: ${user.pin}`)
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

seedUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
