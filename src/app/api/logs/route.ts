import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// POST /api/logs - Create a new audit log entry
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, detail } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const { error } = await supabase.from('audit_logs').insert({
      user_id: session.id,
      action,
      detail: detail || null,
    })

    if (error) {
      console.error('Log insert error:', JSON.stringify(error))
      return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    // Fetch logs
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch logs', detail: error.message },
        { status: 500 }
      )
    }

    // Fetch users to map names
    const { data: users } = await supabase
      .from('users')
      .select('id, name')

    const userMap = new Map<string, string>()
    users?.forEach(u => userMap.set(u.id, u.name))

    // Attach user name to each log
    const logsWithUser = (logs || []).map(log => ({
      ...log,
      user: { name: userMap.get(log.user_id) || 'System' },
    }))

    return NextResponse.json(logsWithUser)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
