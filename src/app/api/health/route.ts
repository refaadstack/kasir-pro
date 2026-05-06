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
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    checks.checks.database = !error
  } catch (error) {
    console.error('Database check failed:', error)
    checks.checks.database = false
  }

  // Check if all critical checks pass (ignore jwt_secret_length as it's just info)
  const criticalChecks = {
    jwt_secret: checks.checks.jwt_secret,
    supabase_url: checks.checks.supabase_url,
    supabase_key: checks.checks.supabase_key,
    database: checks.checks.database,
  }
  
  const allChecksPass = Object.values(criticalChecks).every(v => v === true)

  return NextResponse.json(
    {
      status: allChecksPass ? 'healthy' : 'unhealthy',
      ...checks,
    },
    { status: allChecksPass ? 200 : 503 }
  )
}
