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

// POST - Start a new shift with opening cash drawer
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['KASIR', 'MANAGER', 'SUPERADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const schema = z.object({
      kasir_id: z.string().uuid(),
      opening_cash: z.number().min(0, 'Modal kas tidak boleh negatif').default(0),
      opening_notes: z.string().optional(),
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

    // Create new shift with opening cash
    const shiftData: Record<string, unknown> = {
      kasir_id: validated.kasir_id,
      started_at: new Date().toISOString(),
      total_sales: 0,
      total_transactions: 0,
    }

    // Only add cash drawer fields if they exist in the table
    if (validated.opening_cash !== undefined) {
      shiftData.opening_cash = validated.opening_cash
    }
    if (validated.opening_notes) {
      shiftData.opening_notes = validated.opening_notes
    }

    const { data: shift, error } = await supabase
      .from('shifts')
      .insert(shiftData)
      .select(`
        *,
        kasir:users!shifts_kasir_id_fkey(id, name, email)
      `)
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      // If error is about missing columns, try without cash drawer fields
      if (error.message?.includes('opening_cash') || error.message?.includes('column')) {
        const { data: fallbackShift, error: fallbackError } = await supabase
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

        if (fallbackError) throw fallbackError

        return NextResponse.json(fallbackShift, { status: 201 })
      }
      throw error
    }

    // Log activity
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount)

    await supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'OPEN_DRAWER',
      target: shift.kasir.name,
      detail: `Buka shift dengan modal kas ${formatCurrency(validated.opening_cash)}`,
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
      { error: 'Failed to start shift', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
