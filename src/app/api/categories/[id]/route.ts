import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// PATCH /api/categories/[id] - Update category
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .update({ name: name.trim() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('audit_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'UPDATE_CATEGORY',
      target: name,
      detail: `Kategori diupdate menjadi "${name}"`,
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal mengupdate kategori' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get category name before deleting
    const { data: category } = await supabase
      .from('categories')
      .select('name')
      .eq('id', params.id)
      .single()

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    // Log activity
    if (category) {
      await supabase.from('audit_logs').insert({
        user_id: session.id,
        user_name: session.name,
        action: 'DELETE_CATEGORY',
        target: category.name,
        detail: `Kategori "${category.name}" dihapus`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus kategori' },
      { status: 500 }
    )
  }
}
