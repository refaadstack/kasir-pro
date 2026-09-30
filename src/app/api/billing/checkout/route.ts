import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { createPayment } from '@/lib/payment'
import { PLANS, isPlanCode, type PlanCode } from '@/lib/plans'

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx || ctx.session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    if (!isPlanCode(body.plan)) {
      return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 })
    }
    const plan = PLANS[body.plan as PlanCode]

    const productOrderId = `INV-${ctx.tenant.id.slice(0, 8)}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: ctx.tenant.id,
        planCode: plan.code,
        amount: plan.amount,
        months: plan.months,
        status: 'pending',
        productOrderId,
      },
    })

    const payment = await createPayment({
      productOrderId,
      amount: plan.amount,
      customer: { name: ctx.session.name || ctx.tenant.name, email: ctx.session.email },
      callbackUrl: `${appUrl()}/api/billing/webhook`,
      items: [{ id: plan.code, name: `KasirPro Premium - ${plan.label}`, price: plan.amount, quantity: 1 }],
    })

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        providerTransactionNumber: payment.transactionNumber,
        paymentUrl: payment.paymentUrl,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, paymentUrl: payment.paymentUrl, invoiceId: invoice.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pembayaran', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
