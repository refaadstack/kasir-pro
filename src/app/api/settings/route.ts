import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const DEFAULT_SETTINGS = {
  id: 1,
  store_name: 'KasirPro',
  store_address: '',
  store_phone: '',
  receipt_footer: 'Terima kasih!',
  paper_width: '58mm',
  logo_url: null,
  tax_percent: 0,
  receipt_prefix: 'TRX',
}

// GET /api/settings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Settings fetch error:', JSON.stringify(error))
      return NextResponse.json(DEFAULT_SETTINGS)
    }

    return NextResponse.json(data || DEFAULT_SETTINGS)
  } catch (error) {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

// PATCH /api/settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()

    // Only update fields that exist
    const allowedFields = ['store_name', 'store_address', 'store_phone', 'receipt_footer', 'paper_width', 'logo_url', 'tax_percent', 'receipt_prefix']
    const updateData: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in body) {
        updateData[key] = body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diupdate' }, { status: 400 })
    }

    // Try update existing row
    const { data, error } = await supabase
      .from('store_settings')
      .update(updateData)
      .eq('id', 1)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Settings update error:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Gagal mengupdate pengaturan', detail: error.message || JSON.stringify(error) },
        { status: 500 }
      )
    }

    // Log
    supabase.from('audit_logs').insert({
      user_id: session.id,
      action: 'UPDATE_SETTINGS',
      detail: `Updated: ${Object.keys(updateData).join(', ')}`,
    }).then(() => {})

    return NextResponse.json(data || updateData)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pengaturan', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
