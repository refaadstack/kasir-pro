'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Smartphone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CartDiscount } from '@/context/CartContext'

type PaymentMethod = 'TUNAI' | 'QRIS' | 'TRANSFER'

type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  tax_percent: number
}

type PaymentModalProps = {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  total: number
  subtotal: number
  discount: CartDiscount | null
  discountAmount: number
  onSuccess: () => void
}

export function PaymentModal({ isOpen, onClose, cart, total, subtotal, discount, discountAmount, onSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI')
  const [amountPaid, setAmountPaid] = useState('')
  const [edcCode, setEdcCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [serviceChargePercent, setServiceChargePercent] = useState(0)
  const { toast } = useToast()

  // Fetch settings for service charge
  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          setServiceChargePercent(data.service_charge_percent || 0)
        })
        .catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

  // Calculate tax per item (only taxable items)
  const taxAmount = cart.reduce((sum, item) => {
    if (item.tax_percent > 0) {
      return sum + Math.round(item.price * item.qty * item.tax_percent / 100)
    }
    return sum
  }, 0)

  // Service charge on total after discount
  const serviceChargeAmount = Math.round(total * serviceChargePercent / 100)
  const grandTotal = total + taxAmount + serviceChargeAmount

  const amountPaidNum = parseInt(amountPaid) || 0
  const change = amountPaidNum - grandTotal
  const canPay = paymentMethod === 'TUNAI' ? amountPaidNum >= grandTotal : edcCode.trim().length > 0

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
            taxPercent: item.tax_percent || 0,
            taxAmount: item.tax_percent > 0 ? Math.round(item.price * item.qty * item.tax_percent / 100) : 0,
          })),
          total: subtotal,
          grandTotal,
          taxAmount,
          serviceChargeAmount,
          discountAmount: discountAmount || 0,
          discountCode: discount?.code || null,
          discountLabel: discount?.label || null,
          edcCode: paymentMethod !== 'TUNAI' ? edcCode.trim() || null : null,
          paymentMethod,
          amountPaid: paymentMethod === 'TUNAI' ? amountPaidNum : grandTotal,
          change: paymentMethod === 'TUNAI' ? Math.max(0, change) : 0,
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
          items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price, subtotal: item.price * item.qty, tax_percent: item.tax_percent })),
          subtotal_amount: subtotal,
          discount_amount: discountAmount,
          discount_code: discount?.code || null,
          tax_amount: taxAmount,
          service_charge_amount: serviceChargeAmount,
          total_amount: grandTotal,
          payment_method: paymentMethod,
          cash_received: paymentMethod === 'TUNAI' ? amountPaidNum : grandTotal,
          change_amount: paymentMethod === 'TUNAI' ? Math.max(0, change) : 0,
          edc_code: paymentMethod !== 'TUNAI' ? edcCode.trim() || null : null,
        }

        // Print receipt via new window
        const printWindow = window.open('', '_blank', 'width=400,height=600')
        if (printWindow) {
          const itemsHtml = receiptData.items.map(item => 
            `<div style="font-size:11px">${item.name}${item.tax_percent > 0 ? ' *' : ''}</div><div style="display:flex;justify-content:space-between;padding-left:8px;font-size:11px"><span>${item.qty} x ${item.price.toLocaleString('id-ID')}</span><span>${item.subtotal.toLocaleString('id-ID')}</span></div>`
          ).join('')

          const paperWidth = storeSettings.paper_width || '58mm'
          const logoHtml = storeSettings.logo_url ? `<div style="text-align:center;margin-bottom:4px"><img src="${storeSettings.logo_url}" style="height:32px;object-fit:contain" /></div>` : ''

          const discountHtml = receiptData.discount_amount > 0
            ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:#666"><span>Diskon${receiptData.discount_code ? ` (${receiptData.discount_code})` : ''}</span><span>-${receiptData.discount_amount.toLocaleString('id-ID')}</span></div>`
            : ''

          const taxHtml = receiptData.tax_amount > 0
            ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:#666"><span>Pajak</span><span>${receiptData.tax_amount.toLocaleString('id-ID')}</span></div>`
            : ''

          const serviceHtml = receiptData.service_charge_amount > 0
            ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:#666"><span>Service (${serviceChargePercent}%)</span><span>${receiptData.service_charge_amount.toLocaleString('id-ID')}</span></div>`
            : ''

          const edcHtml = receiptData.edc_code
            ? `<div style="display:flex;justify-content:space-between;font-size:11px"><span>Ref EDC</span><span>${receiptData.edc_code}</span></div>`
            : ''

          printWindow.document.write(`<html><head><title>Struk</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:${paperWidth};padding:4px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:4px 0}.r{display:flex;justify-content:space-between}@media print{@page{size:${paperWidth} auto;margin:0}}</style></head><body>
            ${logoHtml}
            <div class="c"><div class="b" style="font-size:14px">${storeSettings.store_name || 'KasirPro'}</div>${storeSettings.store_address ? `<div>${storeSettings.store_address}</div>` : ''}${storeSettings.store_phone ? `<div>Telp: ${storeSettings.store_phone}</div>` : ''}</div>
            <div class="l"></div>
            <div class="r"><span>No:</span><span>${receiptData.trx_code}</span></div>
            <div class="r"><span>Tgl:</span><span>${new Date().toLocaleString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span></div>
            <div class="l"></div>
            ${itemsHtml}
            <div class="l"></div>
            ${receiptData.discount_amount > 0 ? `<div class="r"><span>Subtotal</span><span>Rp ${receiptData.subtotal_amount.toLocaleString('id-ID')}</span></div>` : ''}
            ${discountHtml}
            ${taxHtml}
            ${serviceHtml}
            <div class="r" style="font-weight:bold;font-size:13px"><span>TOTAL</span><span>Rp ${receiptData.total_amount.toLocaleString('id-ID')}</span></div>
            <div class="r"><span>${receiptData.payment_method}</span><span>Rp ${receiptData.cash_received.toLocaleString('id-ID')}</span></div>
            ${receiptData.change_amount > 0 ? `<div class="r"><span>Kembali</span><span>Rp ${receiptData.change_amount.toLocaleString('id-ID')}</span></div>` : ''}
            ${edcHtml}
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

  // Generate quick amounts based on grandTotal
  const quickAmounts = [
    Math.ceil(grandTotal / 50000) * 50000,
    Math.ceil(grandTotal / 100000) * 100000,
    Math.ceil(grandTotal / 100000) * 100000 + 100000,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= grandTotal)

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

          {/* Summary */}
          <div className="mb-6 p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl space-y-2">
            {(discountAmount > 0 || taxAmount > 0 || serviceChargeAmount > 0) && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white/60 mono">{formatCurrency(subtotal)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Diskon{discount?.code ? ` (${discount.code})` : ''}</span>
                <span className="text-green-400 mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Pajak (per item)</span>
                <span className="text-white/60 mono">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {serviceChargeAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Service ({serviceChargePercent}%)</span>
                <span className="text-white/60 mono">{formatCurrency(serviceChargeAmount)}</span>
              </div>
            )}
            <div className={`${(discountAmount > 0 || taxAmount > 0 || serviceChargeAmount > 0) ? 'border-t border-amber-400/20 pt-2' : ''}`}>
              <div className="text-sm text-white/60 mb-1">Total Pembayaran</div>
              <div className="text-3xl font-black text-amber-400 mono">
                {formatCurrency(grandTotal)}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-white mb-3 block">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setPaymentMethod('TUNAI'); setEdcCode('') }}
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
                {quickAmounts.slice(0, 3).map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-all"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {/* Exact amount button */}
              <button
                onClick={() => handleQuickAmount(grandTotal)}
                className="w-full p-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 rounded-lg text-xs font-semibold text-amber-400 transition-all"
              >
                Uang Pas: {formatCurrency(grandTotal)}
              </button>

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

          {/* Non-cash: EDC Code */}
          {paymentMethod !== 'TUNAI' && (
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-xl">
                <p className="text-sm text-blue-400">
                  {paymentMethod === 'QRIS' 
                    ? 'Pastikan pembayaran QRIS sudah berhasil sebelum melanjutkan.'
                    : 'Pastikan transfer sudah masuk sebelum melanjutkan.'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">
                  Kode Unik EDC / Referensi *
                </label>
                <Input
                  type="text"
                  value={edcCode}
                  onChange={(e) => setEdcCode(e.target.value.toUpperCase())}
                  placeholder={paymentMethod === 'QRIS' ? 'Contoh: QR-123456' : 'Contoh: TF-789012'}
                  className="bg-white/5 border-white/10 text-white mono font-semibold tracking-wider"
                  maxLength={30}
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Masukkan kode approval/referensi dari mesin EDC atau bukti transfer
                </p>
              </div>
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
