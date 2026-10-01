import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/password'

const schema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Akun ini tidak memakai password' }, { status: 400 })
    }

    const valid = await verifyPassword(parsed.data.currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Password lama salah' }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(parsed.data.newPassword) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
