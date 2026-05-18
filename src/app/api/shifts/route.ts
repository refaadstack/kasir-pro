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
      .select('*')
      .order('start_time', { ascending: false })

    if (active) {
      query = query.is('end_time', null)
    }

    if (kasirId) {
      query = query.eq('user_id', kasirId)
    }

    const { data: shifts, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch shifts', detail: error.message },
        { status: 500 }
      )
    }

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
    if (!session || !['KASIR', 'MANAGER', 'SUPERADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const schema = z.object({
      kasir_id: z.string(),
      opening_cash: z.number().min(0).default(0),
      opening_notes: z.string().optional(),
    })

    const validated = schema.parse(body)

    // Check if kasir already has an active shift
    const { data: activeShift } = await supabase
      .from('shifts')
      .select('id')
      .eq('user_id', validated.kasir_id)
      .is('end_time', null)
      .maybeSingle()

    if (activeShift) {
      return NextResponse.json(
        { error: 'Kasir sudah memiliki shift aktif' },
        { status: 400 }
      )
    }

    // Generate shift code
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
    const shiftCode = `SHF-${dateStr}-${timeStr}`

    // Create new shift
    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({
        user_id: validated.kasir_id,
        shift_code: shiftCode,
        opening_cash: validated.opening_cash,
        opening_notes: validated.opening_notes || null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Insert shift error:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Failed to start shift', detail: error.message },
        { status: 500 }
      )
    }

    // Log activity
    supabase.from('audit_logs').insert({
      user_id: session.id,
      action: 'OPEN_DRAWER',
      detail: `Buka shift dengan modal kas Rp ${validated.opening_cash.toLocaleString('id-ID')}`,
    }).then(() => {})

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
      { error: 'Failed to start shift', detail: String(error) },
      { status: 500 }
    )
  }
}
