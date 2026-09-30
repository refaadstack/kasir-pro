import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

function generateTrxCode(prefix: string, format: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

  switch (format) {
    case 'PREFIX-DATE-RANDOM':
      return `${prefix}-${dateStr}-${random}`
    case 'PREFIX-RANDOM':
      return `${prefix}-${random}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
    case 'PREFIX-TIMESTAMP-RANDOM':
    default:
      return `${prefix}-${timestamp}-${random}`
  }
}

type CartItem = {
  productId: string
  productName: string
  price: number
  qty: number
  subtotal: number
  taxPercent?: number
  taxAmount?: number
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { session, tenant } = ctx

    const body = await req.json()
    const {
      items,
      total,
      paymentMethod,
      amountPaid,
      change,
      taxAmount,
      serviceChargeAmount,
      discountAmount,
      discountCode,
      discountLabel,
      edcCode,
      grandTotal,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items wajib diisi' }, { status: 400 })
    }

    if (!total || !paymentMethod) {
      return NextResponse.json({ error: 'Total dan metode pembayaran wajib diisi' }, { status: 400 })
    }

    const activeShift = await prisma.shift.findFirst({
      where: { userId: session.id, endTime: null, tenantId: tenant.id },
    })
    if (!activeShift) {
      return NextResponse.json(
        { error: 'Tidak ada shift aktif. Buka shift terlebih dahulu.' },
        { status: 400 }
      )
    }

    const settings = await prisma.storeSettings.findUnique({ where: { id: tenant.id } })
    const prefix = settings?.receiptPrefix || 'TRX'
    const format = settings?.trxCodeFormat || 'PREFIX-TIMESTAMP-RANDOM'
    const code = generateTrxCode(prefix, format)

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          trxCode: code,
          userId: session.id,
          shiftId: activeShift.id,
          totalAmount: grandTotal || total,
          subtotalAmount: total,
          taxAmount: taxAmount || 0,
          serviceChargeAmount: serviceChargeAmount || 0,
          discountAmount: discountAmount || 0,
          discountCode: discountCode || null,
          discountLabel: discountLabel || null,
          edcCode: edcCode || null,
          paymentMethod,
          cashReceived: amountPaid || grandTotal || total,
          changeAmount: change || 0,
          status: 'SUCCESS',
          tenantId: tenant.id,
        },
      })

      await tx.transactionItem.createMany({
        data: (items as CartItem[]).map((item) => ({
          transactionId: transaction.id,
          productId: item.productId,
          productName: item.productName,
          priceAtSale: item.price,
          qty: item.qty,
          subtotal: item.subtotal,
          taxPercentAtSale: item.taxPercent || 0,
          taxAmount: item.taxAmount || 0,
          tenantId: tenant.id,
        })),
      })

      for (const item of items as CartItem[]) {
        await tx.product.updateMany({
          where: { id: item.productId, tenantId: tenant.id },
          data: { stock: { decrement: item.qty } },
        })
      }

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'CREATE_TRANSACTION',
          detail: `Total: Rp ${(grandTotal || total).toLocaleString('id-ID')}, Method: ${paymentMethod}${edcCode ? `, EDC: ${edcCode}` : ''}${discountCode ? `, Kupon: ${discountCode}` : ''}`,
          tenantId: tenant.id,
        },
      })

      return transaction
    })

    return NextResponse.json({ success: true, code: result.trxCode, id: result.id })
  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { session, tenant } = ctx

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const shiftId = searchParams.get('shift_id')
    const paymentMethodFilter = searchParams.get('payment_method')
    const withItems = searchParams.get('with_items') === 'true'

    const where: Record<string, unknown> = { tenantId: tenant.id }
    if (status) where.status = status
    if (shiftId) where.shiftId = shiftId
    if (paymentMethodFilter) where.paymentMethod = paymentMethodFilter
    if (session.role === 'KASIR') where.userId = session.id

    const data = await prisma.transaction.findMany({
      where,
      include: withItems ? { items: true } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
