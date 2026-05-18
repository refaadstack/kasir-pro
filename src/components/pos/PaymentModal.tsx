'use client'

import { useState } from 'react'
import { X, CreditCard, Smartphone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

type PaymentMethod = 'TUNAI' | 'QRIS' | 'TRANSFER'

type CartItem = {
  id: string
  name: string
  price: number
  qty: number
}

type PaymentModalProps = {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  total: number
  onSuccess: () => void
}

export function PaymentModal({ isOpen, onClose, cart, total, onSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI')
  const [amountPaid, setAmountPaid] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  if (!isOpen) return null

  const amountPaidNum = parseInt(amountPaid) || 0
  const change = amountPaidNum - total
  const canPay = paymentMethod === 'TUNAI' ? amountPaidNum >= total : true

  const handleQuickAmount = (amount: number) => {
    setAmountPaid(amount.toString())
  }

  const handlePay = async () => {
    if (!canPay) return

    setIsProcessing(true)

    try {
      // Fetch store settings for receipt
      const settingsRes = await fetch('/api/settings')
      const storeSettings = settingsRes.ok ? await settingsRes.json() : { store_name: 'KasirPro', store_address: '', store_phone: '', receipt_footer: 'Terima kasih!', paper_width: '58mm' }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            qty: item.qty,
            subtotal: item.price * item.qty,
          })),
          total,
          paymentMethod,
          amountPaid: paymentMethod === 'TUNAI' ? amountPaidNum : total,
          change: paymentMethod === 'TUNAI' ? change : 0,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: 'Transaksi Berhasil!',
          description: `Kode: ${data.code}`,
        })

        // Auto print receipt
        const receiptData = {
          trx_code: data.code,
          created_at: new Date().toISOString(),
          items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price, subtotal: item.price * item.qty })),
          total_amount: total,
          payment_method: paymentMethod,
          cash_received: paymentMethod === 'TUNAI' ? amountPaidNum : total,
          change_amount: paymentMethod === 'TUNAI' ? Math.max(0, change) : 0,
        }

        // Print receipt via new window
        const printWindow = window.open('', '_blank', 'width=400,height=600')
        if (printWindow) {
          const itemsHtml = receiptData.items.map(item => 
            `<div style="font-size:11px">${item.name}</div><div style="display:flex;justify-content:space-between;padding-left:8px;font-size:11px"><span>${item.qty} x ${item.price.toLocaleString('id-ID')}</span><span>${item.subtotal.toLocaleString('id-ID')}</span></div>`
          ).join('')

          const paperWidth = storeSettings.paper_width || '58mm'
          const logoHtml = storeSettings.logo_url ? `<div style="text-align:center;margin-bottom:4px"><img src="${storeSettings.logo_url}" style="height:32px;object-fit:contain" /></div>` : ''

          printWindow.document.write(`<html><head><title>Struk</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:${paperWidth};padding:4px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:4px 0}.r{display:flex;justify-content:space-between}@media print{@page{size:${paperWidth} auto;margin:0}}</style></head><body>
            ${logoHtml}
            <div class="c"><div class="b" style="font-size:14px">${storeSettings.store_name || 'KasirPro'}</div>${storeSettings.store_address ? `<div>${storeSettings.store_address}</div>` : ''}${storeSettings.store_phone ? `<div>Telp: ${storeSettings.store_phone}</div>` : ''}</div>
            <div class="l"></div>
            <div class="r"><span>No:</span><span>${receiptData.trx_code}</span></div>
            <div class="r"><span>Tgl:</span><span>${new Date().toLocaleString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span></div>
            <div class="l"></div>
            ${itemsHtml}
            <div class="l"></div>
            <div class="r" style="font-weight:bold;font-size:13px"><span>TOTAL</span><span>Rp ${receiptData.total_amount.toLocaleString('id-ID')}</span></div>
            <div class="r"><span>${receiptData.payment_method}</span><span>Rp ${receiptData.cash_received.toLocaleString('id-ID')}</span></div>
            ${receiptData.change_amount > 0 ? `<div class="r"><span>Kembali</span><span>Rp ${receiptData.change_amount.toLocaleString('id-ID')}</span></div>` : ''}
            <div class="l"></div>
            <div class="c" style="font-size:10px;margin-top:8px">${storeSettings.receipt_footer || 'Terima kasih!'}<br><span style="font-size:9px">Powered by KasirPro</span></div>
            <script>window.onload=function(){window.print();window.close()}</script>
          </body></html>`)
          printWindow.document.close()
        }

        onSuccess()
        onClose()
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Gagal memproses transaksi')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-[#0d0d14] border-white/10 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">Pembayaran</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Total */}
          <div className="mb-6 p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl">
            <div className="text-sm text-white/60 mb-1">Total Pembayaran</div>
            <div className="text-3xl font-black text-amber-400 mono">
              {formatCurrency(total)}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-white mb-3 block">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('TUNAI')}
                className={`p-3 rounded-xl border transition-all ${
                  paymentMethod === 'TUNAI'
                    ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-semibold">Tunai</div>
              </button>
              <button
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3 rounded-xl border transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-semibold">QRIS</div>
              </button>
              <button
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 rounded-xl border transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-semibold">Transfer</div>
              </button>
            </div>
          </div>

          {/* Cash Payment */}
          {paymentMethod === 'TUNAI' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">
                  Jumlah Uang
                </label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0"
                  className="text-xl font-bold mono bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[50000, 100000, 200000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-all"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {/* Change */}
              {amountPaidNum > 0 && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Kembalian</span>
                    <span className={`text-lg font-bold mono ${
                      change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(Math.max(0, change))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Non-cash info */}
          {paymentMethod !== 'TUNAI' && (
            <div className="mb-6 p-4 bg-blue-400/10 border border-blue-400/20 rounded-xl">
              <p className="text-sm text-blue-400">
                {paymentMethod === 'QRIS' 
                  ? 'Pastikan pembayaran QRIS sudah berhasil sebelum melanjutkan.'
                  : 'Pastikan transfer sudah masuk sebelum melanjutkan.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handlePay}
              disabled={!canPay || isProcessing}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
            >
              {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
