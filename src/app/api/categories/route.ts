import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(categories || [])
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Gagal memuat kategori' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori harus diisi' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim() })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'CREATE_CATEGORY',
      target: name,
      detail: `Kategori "${name}" ditambahkan`,
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal menambahkan kategori' },
      { status: 500 }
    )
  }
}
