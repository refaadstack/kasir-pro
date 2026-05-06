import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, sku, price, stock, categoryId, emoji, isActive } = body

    // Cek SKU duplikat (kecuali produk ini sendiri)
    if (sku) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .neq('id', params.id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'SKU sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (sku !== undefined) updateData.sku = sku
    if (price !== undefined) updateData.price = parseFloat(price)
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (categoryId !== undefined) updateData.category_id = categoryId || null
    if (emoji !== undefined) updateData.emoji = emoji
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate produk' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
}
