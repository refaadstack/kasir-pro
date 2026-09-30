import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

function addMonths(date: Date, months: number) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYMENT_CALLBACK_SECRET
    const provided = req.headers.get('x-payment-callback-key')
    if (!secret || provided !== secret) {
      return NextResponse.json({ error: 'Invalid callback key' }, { status: 401 })
    }

    const body = await req.json()
    const productOrderId = body.product_order_id
    const status = body.status

    if (!productOrderId) {
      return NextResponse.json({ error: 'Missing product_order_id' }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({ where: { productOrderId } })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const mapped =
      status === 'paid' ? 'paid' : status === 'failed' ? 'failed' : status === 'expired' ? 'expired' : 'pending'

    if (invoice.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    if (mapped !== 'paid') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: mapped, raw: body as Prisma.InputJsonValue },
      })
      return NextResponse.json({ success: true })
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: invoice.tenantId } })
    const now = new Date()
    const base =
      tenant?.status === 'active' && tenant.currentPeriodEnd && tenant.currentPeriodEnd > now
        ? tenant.currentPeriodEnd
        : now
    const periodStart = base
    const periodEnd = addMonths(base, invoice.months)

    await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          paidAt: body.paid_at ? new Date(body.paid_at) : now,
          periodStart,
          periodEnd,
          raw: body as Prisma.InputJsonValue,
        },
      }),
      prisma.tenant.update({
        where: { id: invoice.tenantId },
        data: { plan: 'PREMIUM', status: 'active', currentPeriodEnd: periodEnd },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Billing webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
