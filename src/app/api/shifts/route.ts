import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

// GET - Get all shifts or active shift
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active') === 'true'
    const kasirId = searchParams.get('kasir_id')

    let query = supabase
      .from('shifts')
      .select(`
        *,
        kasir:users!shifts_kasir_id_fkey(id, name, email)
      `)
      .order('started_at', { ascending: false })

    // Filter for active shifts only
    if (active) {
      query = query.is('ended_at', null)
    }

    // Filter by kasir_id if provided
    if (kasirId) {
      query = query.eq('kasir_id', kasirId)
    }

    const { data: shifts, error } = await query

    if (error) throw error

    return NextResponse.json(shifts || [])
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

// POST - Start a new shift
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['KASIR', 'SUPERVISOR', 'MANAGER', 'SUPERADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const schema = z.object({
      kasir_id: z.string().uuid(),
    })

    const validated = schema.parse(body)

    // Check if kasir already has an active shift
    const { data: activeShift } = await supabase
      .from('shifts')
      .select('id')
      .eq('kasir_id', validated.kasir_id)
      .is('ended_at', null)
      .single()

    if (activeShift) {
      return NextResponse.json(
        { error: 'Kasir sudah memiliki shift aktif' },
        { status: 400 }
      )
    }

    // Create new shift
    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({
        kasir_id: validated.kasir_id,
        started_at: new Date().toISOString(),
        total_sales: 0,
        total_transactions: 0,
      })
      .select(`
        *,
        kasir:users!shifts_kasir_id_fkey(id, name, email)
      `)
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'START_SHIFT',
      target: shift.kasir.name,
      detail: `Shift dimulai`,
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error starting shift:', error)
    return NextResponse.json(
      { error: 'Failed to start shift' },
      { status: 500 }
    )
  }
}
