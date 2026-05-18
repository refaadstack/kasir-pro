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
      .order('started_at', { ascending: false })

    if (active) {
      query = query.is('ended_at', null)
    }

    if (kasirId) {
      query = query.eq('kasir_id', kasirId)
    }

    const { data: shifts, error } = await query

    if (error) {
      console.error('GET shifts error:', JSON.stringify(error))
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
      .eq('kasir_id', validated.kasir_id)
      .is('ended_at', null)
      .maybeSingle()

    if (activeShift) {
      return NextResponse.json(
        { error: 'Kasir sudah memiliki shift aktif' },
        { status: 400 }
      )
    }

    // Try insert with cash drawer columns first
    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({
        kasir_id: validated.kasir_id,
        opening_cash: validated.opening_cash,
        opening_notes: validated.opening_notes || null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Insert shift error:', JSON.stringify(error))

      // Fallback: try minimal insert
      const { data: fallbackShift, error: fallbackError } = await supabase
        .from('shifts')
        .insert({
          kasir_id: validated.kasir_id,
        })
        .select('*')
        .single()

      if (fallbackError) {
        console.error('Fallback insert error:', JSON.stringify(fallbackError))
        return NextResponse.json(
          { error: 'Failed to start shift', detail: fallbackError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(fallbackShift, { status: 201 })
    }

    // Log activity (fire and forget)
    supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'OPEN_DRAWER',
      target: session.name,
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
