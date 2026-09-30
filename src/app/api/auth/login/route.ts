import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { COOKIE_NAME } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  pin: z.string().length(4, 'PIN harus 4 digit'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const { email, pin } = validation.data

    const user = await prisma.user.findFirst({
      where: { email, isActive: true },
      include: { tenant: true },
    })

    if (!user || !user.pin) {
      return NextResponse.json({ error: 'Email atau PIN salah' }, { status: 401 })
    }

    let pinValid = false
    if (user.pin.startsWith('$2b$') || user.pin.startsWith('$2a$')) {
      pinValid = await bcrypt.compare(pin, user.pin)
    } else {
      pinValid = user.pin === pin
    }

    if (!pinValid) {
      return NextResponse.json({ error: 'Email atau PIN salah' }, { status: 401 })
    }

    if (user.emailVerifiedAt === null && user.tenantId === null) {
      return NextResponse.json(
        { error: 'Email belum diverifikasi. Cek inbox untuk link verifikasi.' },
        { status: 403 }
      )
    }

    const tenant = user.tenant
    const token = await signToken({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      plan: tenant?.plan || 'TRIAL',
    })

    const redirectMap: Record<string, string> = {
      KASIR: '/dashboard/kasir',
      MANAGER: '/dashboard/manager',
      SUPERADMIN: '/dashboard/superadmin',
    }

    const response = NextResponse.json({
      role: user.role,
      name: user.name,
      redirectTo: redirectMap[user.role] || '/dashboard/kasir',
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
