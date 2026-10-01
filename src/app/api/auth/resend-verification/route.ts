import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMail, verificationEmail } from '@/lib/mail'

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = z.object({ email: z.string().email() }).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email tidak valid' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (user && user.email && !user.emailVerifiedAt) {
      const token = crypto.randomBytes(32).toString('hex')
      await prisma.emailVerification.create({
        data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      })
      const url = `${appUrl()}/api/auth/verify?token=${token}`
      try {
        await sendMail({ to: user.email, ...verificationEmail(user.name, url) })
      } catch (error) {
        console.error('Resend verification email failed:', error)
      }
    }

    return NextResponse.json({ success: true, message: 'Jika email terdaftar, link verifikasi telah dikirim.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
