import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const DEFAULT_SETTINGS = {
  id: 1,
  store_name: 'KasirPro',
  store_address: '',
  store_phone: '',
  receipt_footer: 'Terima kasih!',
}

// GET /api/settings - Get settings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      console.error('Settings fetch error:', JSON.stringify(error))
      // Return defaults if table doesn't exist or other error
      return NextResponse.json(DEFAULT_SETTINGS)
    }

    return NextResponse.json(data || DEFAULT_SETTINGS)
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Return defaults on any error
    return NextResponse.json(DEFAULT_SETTINGS)
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

    const { data, error } = await supabase
      .from('store_settings')
      .update(body)
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      console.error('Settings update error:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Gagal mengupdate pengaturan', detail: error.message || JSON.stringify(error) },
        { status: 500 }
      )
    }

    // Log activity
    supabase.from('audit_logs').insert({
      user_id: session.id,
      action: 'UPDATE_SETTINGS',
      detail: 'Pengaturan toko diupdate',
    }).then(() => {})

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pengaturan', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
