import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { TRIAL_DAYS } from '@/lib/plans'

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
  return base || 'toko'
}

async function uniqueSlug(input: string) {
  const base = slugify(input)
  let slug = base
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.tenant.findUnique({ where: { slug } })
    if (!exists) return slug
    slug = `${base}-${crypto.randomBytes(3).toString('hex')}`
  }
  return `${base}-${Date.now()}`
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(`${appUrl()}/login?error=invalid`)
  }

  try {
    const verification = await prisma.emailVerification.findUnique({ where: { token } })
    if (!verification || verification.expiresAt.getTime() < Date.now()) {
      return NextResponse.redirect(`${appUrl()}/login?error=expired`)
    }

    const user = await prisma.user.findUnique({ where: { id: verification.userId } })
    if (!user) {
      return NextResponse.redirect(`${appUrl()}/login?error=invalid`)
    }

    if (!user.tenantId) {
      const slug = await uniqueSlug(user.name || user.email.split('@')[0])
      const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

      await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: user.name || user.email.split('@')[0],
            slug,
            ownerId: user.id,
            plan: 'TRIAL',
            status: 'trialing',
            trialEndsAt,
          },
        })

        await tx.user.update({
          where: { id: user.id },
          data: { tenantId: tenant.id, role: 'SUPERADMIN', emailVerifiedAt: new Date() },
        })

        await tx.storeSettings.create({
          data: { id: tenant.id, tenantId: tenant.id, storeName: user.name || 'KasirPro' },
        })
      })
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } })
    }

    await prisma.emailVerification.deleteMany({ where: { userId: user.id } })

    return NextResponse.redirect(`${appUrl()}/login?verified=1`)
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.redirect(`${appUrl()}/login?error=server`)
  }
}
