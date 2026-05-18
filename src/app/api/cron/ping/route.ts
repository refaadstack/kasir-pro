import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Ping database to keep Supabase project alive
// Supabase pauses free-tier projects after 7 days of inactivity
// Call this endpoint every 24 hours via Vercel Cron or external service
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ping database with a simple query
    const startTime = Date.now()
    const { data, error } = await supabase
      .from('store_settings')
      .select('id, store_name')
      .eq('id', 1)
      .single()

    const responseTime = Date.now() - startTime

    if (error) {
      console.error('Database ping failed:', error)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database ping failed',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    // Log the ping (fire and forget)
    supabase.from('audit_logs').insert({
      user_id: null,
      user_name: 'SYSTEM',
      action: 'DB_PING',
      target: 'database',
      detail: `Ping successful - ${responseTime}ms`,
    }).then(() => {})

    return NextResponse.json({
      status: 'ok',
      message: 'Database is alive',
      store: data?.store_name || 'KasirPro',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      nextPing: '24 hours',
    })
  } catch (error) {
    console.error('Cron ping error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
