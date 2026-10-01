import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { verifyPin } from '@/lib/password'

const schema = z.object({
  currentPin: z.string().optional(),
  newPin: z.string().length(4, 'PIN harus 4 digit'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { currentPin, newPin } = parsed.data

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    if (user.pin) {
      if (!currentPin || !(await verifyPin(currentPin, user.pin))) {
        return NextResponse.json({ error: 'PIN lama salah' }, { status: 403 })
      }
    }

    const pinExists = await prisma.user.findFirst({
      where: { tenantId: session.tenantId, pin: newPin, id: { not: user.id } },
    })
    if (pinExists) {
      return NextResponse.json(
        { error: 'PIN sudah digunakan oleh user lain. Gunakan PIN yang berbeda.' },
        { status: 400 }
      )
    }

    await prisma.user.update({ where: { id: user.id }, data: { pin: newPin } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change PIN error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
