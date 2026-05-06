import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('🔍 Checking database structure...\n')

  // Cek tabel users
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Tabel users mungkin belum dibuat. Jalankan SQL schema di Supabase Dashboard.')
  } else {
    console.log('✅ Tabel users ditemukan!')
    if (data && data.length > 0) {
      console.log('\n📋 Struktur kolom:')
      console.log(Object.keys(data[0]))
      console.log('\n📊 Sample data:')
      console.log(data[0])
    } else {
      console.log('\n⚠️  Tabel kosong, belum ada data.')
    }
  }

  // List semua users
  const { data: allUsers, error: listError } = await supabase
    .from('users')
    .select('id, name, email, role')

  if (!listError && allUsers) {
    console.log(`\n👥 Total users: ${allUsers.length}`)
    allUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
    })
  }
}

checkDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
