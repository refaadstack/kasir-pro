import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant, canAddUser } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['SUPERADMIN', 'MANAGER'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: { tenantId: ctx.tenant.id },
      select: { id: true, name: true, username: true, email: true, role: true, phone: true, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Gagal memuat users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx || ctx.session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gate = await canAddUser(ctx.tenant)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.message }, { status: 403 })
    }

    const body = await req.json()
    const { name, username, email, pin, role, phone, isActive } = body

    if (!name || !username || !pin || !role) {
      return NextResponse.json({ error: 'Nama, username, PIN, dan role wajib diisi' }, { status: 400 })
    }

    if (pin.length !== 4) {
      return NextResponse.json({ error: 'PIN harus 4 digit' }, { status: 400 })
    }

    const usernameExists = await prisma.user.findFirst({
      where: { tenantId: ctx.tenant.id, username },
    })
    if (usernameExists) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    if (email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) {
        return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })
      }
    }

    const pinExists = await prisma.user.findFirst({
      where: { tenantId: ctx.tenant.id, pin },
    })
    if (pinExists) {
      return NextResponse.json(
        { error: 'PIN sudah digunakan oleh user lain. Gunakan PIN yang berbeda.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email: email || null,
        pin,
        role,
        phone: phone || null,
        isActive: isActive !== false,
        tenantId: ctx.tenant.id,
        emailVerifiedAt: new Date(),
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Gagal membuat user' }, { status: 500 })
  }
}
