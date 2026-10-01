import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx || ctx.session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const target = await prisma.user.findFirst({
      where: { id: params.id, tenantId: ctx.tenant.id },
    })
    if (!target) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    const body = await req.json()
    const { name, username, email, pin, role, phone, isActive } = body

    if (username) {
      const usernameExists = await prisma.user.findFirst({
        where: { tenantId: ctx.tenant.id, username, id: { not: params.id } },
      })
      if (usernameExists) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
      }
    }

    if (email) {
      const emailExists = await prisma.user.findFirst({
        where: { email, id: { not: params.id } },
      })
      if (emailExists) {
        return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })
      }
    }

    if (pin && pin.length === 4) {
      const pinExists = await prisma.user.findFirst({
        where: { tenantId: ctx.tenant.id, pin, id: { not: params.id } },
      })
      if (pinExists) {
        return NextResponse.json(
          { error: 'PIN sudah digunakan oleh user lain. Gunakan PIN yang berbeda.' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email || null
    if (pin && pin.length === 4) updateData.pin = pin
    if (role !== undefined) updateData.role = role
    if (phone !== undefined) updateData.phone = phone || null
    if (isActive !== undefined) updateData.isActive = isActive

    const user = await prisma.user.update({ where: { id: params.id }, data: updateData })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Gagal mengupdate user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx || ctx.session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (ctx.session.id === params.id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
    }

    const target = await prisma.user.findFirst({
      where: { id: params.id, tenantId: ctx.tenant.id },
    })
    if (!target) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 })
  }
}
