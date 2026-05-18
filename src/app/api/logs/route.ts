import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*, user:users!user_id(name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      // Fallback tanpa join jika gagal
      const { data: logsSimple, error: errSimple } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (errSimple) {
        return NextResponse.json(
          { error: 'Failed to fetch logs', detail: errSimple.message || JSON.stringify(errSimple) },
          { status: 500 }
        )
      }
      return NextResponse.json(logsSimple || [])
    }

    return NextResponse.json(logs || [])
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
