'use client'

import { useState, useEffect } from 'react'
import { X, Receipt, Printer, CheckCircle2, XCircle, CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type TransactionItem = {
  id: string
  product_id: string
  product_name: string
  price_at_sale: number
  qty: number
  subtotal: number
}

type TransactionDetail = {
  id: string
  trx_code: string
  total_amount: number
  subtotal_amount: number
  tax_amount: number
  service_charge_amount: number
  discount_amount: number
  discount_code: string | null
  discount_label: string | null
  edc_code: string | null
  payment_method: string
  cash_received: number
  change_amount: number
  status: string
  void_reason: string | null
  void_by: string | null
  void_at: string | null
  created_at: string
  items: TransactionItem[]
}

type TransactionDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  transactionId: string | null
}

export function TransactionDetailModal({ isOpen, onClose, transactionId }: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchDetail()
    }
  }, [isOpen, transactionId])

  const fetchDetail = async () => {
    if (!transactionId) return
    try {
      setIsLoading(true)
      const res = await fetch(`/api/transactions?with_items=true&limit=200`)
      if (res.ok) {
        const data = await res.json()
        const found = data.find((t: TransactionDetail) => t.id === transactionId)
        setTransaction(found || null)
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = async () => {
    if (!transaction) return

    const settingsRes = await fetch('/api/settings')
    const storeSettings = settingsRes.ok ? await settingsRes.json() : { store_name: 'KasirPro', store_address: '', store_phone: '', receipt_footer: 'Terima kasih!', paper_width: '58mm' }

    const paperWidth = storeSettings.paper_width || '58mm'
    const logoHtml = storeSettings.logo_url ? `<div style="text-align:center;margin-bottom:4px"><img src="${storeSettings.logo_url}" style="height:32px;object-fit:contain" /></div>` : ''

    const itemsHtml = (transaction.items || []).map(item =>
      `<div style="font-size:11px">${item.product_name || 'Produk'}</div><div style="display:flex;justify-content:space-between;padding-left:8px;font-size:11px"><span>${item.qty} x ${item.price_at_sale.toLocaleString('id-ID')}</span><span>${(item.subtotal || item.price_at_sale * item.qty).toLocaleString('id-ID')}</span></div>`
    ).join('')

    const discountHtml = transaction.discount_amount > 0
      ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:#666"><span>Diskon${transaction.discount_code ? ` (${transaction.discount_code})` : ''}</span><span>-${transaction.discount_amount.toLocaleString('id-ID')}</span></div>`
      : ''

    const taxHtml = transaction.tax_amount > 0
      ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:#666"><span>Pajak</span><span>${transaction.tax_amount.toLocaleString('id-ID')}</span></div>`
      : ''

    const serviceHtml = transaction.service_charge_amount > 0
      ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:#666"><span>Service Charge</span><span>${transaction.service_charge_amount.toLocaleString('id-ID')}</span></div>`
      : ''

    const edcHtml = transaction.edc_code
      ? `<div style="display:flex;justify-content:space-between;font-size:11px"><span>Ref EDC</span><span>${transaction.edc_code}</span></div>`
      : ''

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Struk</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:${paperWidth};padding:4px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:4px 0}.r{display:flex;justify-content:space-between}@media print{@page{size:${paperWidth} auto;margin:0}}</style></head><body>
        ${logoHtml}
        <div class="c"><div class="b" style="font-size:14px">${storeSettings.store_name || 'KasirPro'}</div>${storeSettings.store_address ? `<div>${storeSettings.store_address}</div>` : ''}${storeSettings.store_phone ? `<div>Telp: ${storeSettings.store_phone}</div>` : ''}</div>
        <div class="l"></div>
        <div class="r"><span>No:</span><span>${transaction.trx_code}</span></div>
        <div class="r"><span>Tgl:</span><span>${new Date(transaction.created_at).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
        ${transaction.status === 'VOID' ? '<div style="text-align:center;font-weight:bold;color:red;margin:4px 0">*** VOID ***</div>' : ''}
        <div class="l"></div>
        ${itemsHtml}
        <div class="l"></div>
        ${discountHtml}
        ${taxHtml}
        ${serviceHtml}
        <div class="r" style="font-weight:bold;font-size:13px"><span>TOTAL</span><span>Rp ${transaction.total_amount.toLocaleString('id-ID')}</span></div>
        <div class="r"><span>${transaction.payment_method}</span><span>Rp ${transaction.cash_received.toLocaleString('id-ID')}</span></div>
        ${transaction.change_amount > 0 ? `<div class="r"><span>Kembali</span><span>Rp ${transaction.change_amount.toLocaleString('id-ID')}</span></div>` : ''}
        ${edcHtml}
        <div class="l"></div>
        <div class="c" style="font-size:10px;margin-top:8px">${storeSettings.receipt_footer || 'Terima kasih!'}<br><span style="font-size:9px">Powered by KasirPro</span></div>
        <script>window.onload=function(){window.print();window.close()}</script>
      </body></html>`)
      printWindow.document.close()
    }
  }

  if (!isOpen) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#16161f] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#16161f] z-10">
          <div>
            <h2 className="text-lg font-bold text-white">Detail Transaksi</h2>
            {transaction && (
              <p className="text-xs text-white/40 mono">{transaction.trx_code}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : !transaction ? (
          <div className="p-8 text-center">
            <p className="text-white/60">Transaksi tidak ditemukan</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Status Card */}
            <Card className={`border ${transaction.status === 'SUCCESS' ? 'bg-green-400/5 border-green-400/20' : 'bg-red-400/5 border-red-400/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {transaction.status === 'SUCCESS' ? (
                    <div className="w-12 h-12 bg-green-400/10 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-red-400/10 rounded-xl flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${transaction.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.status === 'SUCCESS' ? 'Transaksi Berhasil' : 'Transaksi Dibatalkan (VOID)'}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {new Date(transaction.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {transaction.void_reason && (
                      <p className="text-xs text-red-400/80 mt-1">Alasan: {transaction.void_reason}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="bg-white/[0.04] border-white/10">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Item Transaksi</h3>
                <div className="space-y-2">
                  {(transaction.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.product_name || 'Produk'}</p>
                        <p className="text-xs text-white/40 mono">{item.qty} x {formatCurrency(item.price_at_sale)}</p>
                      </div>
                      <p className="text-sm font-bold text-amber-400 mono ml-2">
                        {formatCurrency(item.subtotal || item.price_at_sale * item.qty)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="bg-white/[0.04] border-white/10">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Ringkasan Pembayaran</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white mono">{formatCurrency(transaction.subtotal_amount || transaction.total_amount)}</span>
                  </div>
                  {transaction.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Diskon {transaction.discount_code ? `(${transaction.discount_code})` : transaction.discount_label || ''}</span>
                      <span className="text-green-400 mono">-{formatCurrency(transaction.discount_amount)}</span>
                    </div>
                  )}
                  {transaction.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Pajak</span>
                      <span className="text-white mono">{formatCurrency(transaction.tax_amount)}</span>
                    </div>
                  )}
                  {transaction.service_charge_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Service Charge</span>
                      <span className="text-white mono">{formatCurrency(transaction.service_charge_amount)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="font-bold text-white">Total</span>
                    <span className="font-black text-amber-400 text-lg mono">{formatCurrency(transaction.total_amount)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> {transaction.payment_method}
                      </span>
                      <span className="text-white mono">{formatCurrency(transaction.cash_received)}</span>
                    </div>
                    {transaction.change_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Kembalian</span>
                        <span className="text-white mono">{formatCurrency(transaction.change_amount)}</span>
                      </div>
                    )}
                    {transaction.edc_code && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Ref EDC</span>
                        <span className="text-blue-400 mono font-semibold">{transaction.edc_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">
                Tutup
              </Button>
              <Button onClick={handlePrint} className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold">
                <Printer className="w-4 h-4 mr-2" />
                Cetak Struk
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
