import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/settings - Get settings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Gagal memuat pengaturan' },
      { status: 500 }
    )
  }
}

// PATCH /api/settings - Update settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { store_name, store_address, store_phone, receipt_footer } = body

    const { data, error } = await supabase
      .from('settings')
      .update({
        store_name,
        store_address,
        store_phone,
        receipt_footer,
      })
      .eq('id', 1)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'UPDATE_SETTINGS',
      target: 'Settings',
      detail: 'Pengaturan toko diupdate',
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal mengupdate pengaturan' },
      { status: 500 }
    )
  }
}
