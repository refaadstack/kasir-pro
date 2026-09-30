const BASE_URL = (process.env.PAYMENT_SERVICE_URL || '').replace(/\/$/, '')
const PRODUCT_KEY = process.env.PAYMENT_PRODUCT_KEY || ''

export type CreatePaymentInput = {
  productOrderId: string
  amount: number
  customer: { name?: string; email?: string }
  callbackUrl: string
  items?: { id?: string; name?: string; price?: number; quantity?: number }[]
  expiresAt?: string
}

export type CreatePaymentResult = {
  transactionNumber: string
  paymentUrl: string
  status: string
  grossAmount: string
}

export type PaymentStatus = {
  transactionNumber: string
  productOrderId: string | null
  amount: string
  grossAmount: string
  status: 'pending' | 'paid' | 'failed' | 'expired'
  paidAt: string | null
  paymentMethod: string | null
}

function requireConfig() {
  if (!BASE_URL) throw new Error('PAYMENT_SERVICE_URL is not configured')
  if (!PRODUCT_KEY) throw new Error('PAYMENT_PRODUCT_KEY is not configured')
}

export async function createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  requireConfig()

  const res = await fetch(`${BASE_URL}/api/v1/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Product-Key': PRODUCT_KEY },
    body: JSON.stringify({
      product_order_id: input.productOrderId,
      amount: input.amount,
      customer: input.customer,
      callback_url: input.callbackUrl,
      items: input.items,
      expires_at: input.expiresAt,
    }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.success) {
    throw new Error(`Payment service error (${res.status}): ${json?.message || 'unknown error'}`)
  }

  const rawUrl: string = json.payment_url || ''
  const paymentUrl = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`

  return {
    transactionNumber: json.transaction_number,
    paymentUrl,
    status: json.status,
    grossAmount: json.gross_amount,
  }
}

export async function getPayment(transactionNumber: string): Promise<PaymentStatus | null> {
  requireConfig()

  const res = await fetch(`${BASE_URL}/api/v1/transactions/${encodeURIComponent(transactionNumber)}`, {
    headers: { 'X-Product-Key': PRODUCT_KEY },
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.success) return null

  const t = json.transaction
  return {
    transactionNumber: t.transaction_number,
    productOrderId: t.product_order_id,
    amount: t.amount,
    grossAmount: t.gross_amount,
    status: t.status,
    paidAt: t.paid_at,
    paymentMethod: t.payment_method,
  }
}

export async function getFees(amount?: number, paymentMethod?: string) {
  const params = new URLSearchParams()
  if (amount) params.set('amount', String(amount))
  if (paymentMethod) params.set('payment_method', paymentMethod)

  const res = await fetch(`${BASE_URL}/api/v1/payment-fees?${params.toString()}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}
