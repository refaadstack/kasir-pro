'use client'

import { useRef } from 'react'
import { X, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type ReceiptItem = {
  product_name: string
  qty: number
  price: number
  subtotal: number
}

type Transaction = {
  code: string
  total: number
  payment_method: string
  amount_paid: number
  change: number
  created_at: string
  kasir: {
    name: string
  }
  items: ReceiptItem[]
}

type Settings = {
  store_name: string
  store_address: string
  store_phone: string
  receipt_footer: string
}

type ThermalReceiptProps = {
  transaction: Transaction
  settings: Settings
  onClose: () => void
}

export function ThermalReceipt({ transaction, settings, onClose }: ThermalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '', 'width=300,height=600')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Struk - ${transaction.code}</title>
              <style>
                @media print {
                  @page { margin: 0; }
                  body { margin: 0; }
                }
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.4;
                  padding: 10px;
                  width: 280px;
                  margin: 0 auto;
                }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .line { border-top: 1px dashed #000; margin: 8px 0; }
                .item { display: flex; justify-content: space-between; margin: 4px 0; }
                .total { font-size: 14px; font-weight: bold; }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('Rp', 'Rp ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm bg-[#0d0d14] border-white/10">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">Preview Struk</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Receipt Preview */}
          <div className="bg-white p-4 rounded-lg mb-4 overflow-auto max-h-[60vh]">
            <div ref={receiptRef} style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', lineHeight: '1.4' }}>
              {/* Store Info */}
              <div className="center bold" style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px' }}>{settings.store_name}</div>
                {settings.store_address && <div style={{ fontSize: '11px' }}>{settings.store_address}</div>}
                {settings.store_phone && <div style={{ fontSize: '11px' }}>Telp: {settings.store_phone}</div>}
              </div>

              <div className="line" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

              {/* Transaction Info */}
              <div style={{ marginBottom: '8px' }}>
                <div>No: {transaction.code}</div>
                <div>Tanggal: {formatDate(transaction.created_at)}</div>
                <div>Kasir: {transaction.kasir.name}</div>
              </div>

              <div className="line" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

              {/* Items */}
              <div style={{ marginBottom: '8px' }}>
                {transaction.items.map((item, index) => (
                  <div key={index} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.product_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span>{item.qty} x {formatCurrency(item.price)}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="line" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

              {/* Total */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
                  <span>TOTAL</span>
                  <span>{formatCurrency(transaction.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>{transaction.payment_method}</span>
                  <span>{formatCurrency(transaction.amount_paid)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Kembalian</span>
                  <span>{formatCurrency(transaction.change)}</span>
                </div>
              </div>

              <div className="line" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

              {/* Footer */}
              <div className="center" style={{ textAlign: 'center', fontSize: '11px', marginTop: '8px' }}>
                <div>{settings.receipt_footer}</div>
                <div style={{ marginTop: '4px' }}>Powered by KasirPro</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              Tutup
            </Button>
            <Button
              onClick={handlePrint}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
