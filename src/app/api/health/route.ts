import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      jwt_secret: !!process.env.JWT_SECRET,
      jwt_secret_length: process.env.JWT_SECRET?.length || 0,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      database: false,
    },
  }

  // Test database connection
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    checks.checks.database = !error
  } catch (error) {
    console.error('Database check failed:', error)
  }

  const allChecksPass = Object.values(checks.checks).every(v => v === true)

  return NextResponse.json(
    {
      status: allChecksPass ? 'healthy' : 'unhealthy',
      ...checks,
    },
    { status: allChecksPass ? 200 : 503 }
  )
}
