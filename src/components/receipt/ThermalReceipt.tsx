'use client'

import { useRef } from 'react'
import { X, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ReceiptItem = {
  name: string
  qty: number
  price: number
  subtotal: number
}

type ReceiptProps = {
  isOpen: boolean
  onClose: () => void
  data: {
    trx_code: string
    created_at: string
    items: ReceiptItem[]
    total_amount: number
    payment_method: string
    cash_received: number
    change_amount: number
    kasir_name?: string
  }
  settings: {
    store_name: string
    store_address?: string
    store_phone?: string
    receipt_footer?: string
    paper_width?: '58mm' | '80mm'
  }
}

export function ThermalReceipt({ isOpen, onClose, data, settings }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const paperWidth = settings.paper_width || '58mm'
  const maxWidth = paperWidth === '80mm' ? '80mm' : '58mm'

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow || !receiptRef.current) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk - ${data.trx_code}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; width: ${maxWidth}; padding: 4px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; }
            .item-name { font-size: 11px; }
            .item-detail { display: flex; justify-content: space-between; font-size: 11px; padding-left: 8px; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; }
            .footer { text-align: center; font-size: 10px; margin-top: 8px; }
            @media print {
              body { width: ${maxWidth}; }
              @page { size: ${maxWidth} auto; margin: 0; }
            }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#16161f] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Preview Struk</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} size="sm" className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold">
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="bg-white text-black p-4 rounded-lg mx-auto font-mono text-xs" style={{ maxWidth }}>
            <div ref={receiptRef}>
              {/* Store Header */}
              <div className="center">
                <div className="bold" style={{ fontSize: '14px' }}>{settings.store_name}</div>
                {settings.store_address && <div>{settings.store_address}</div>}
                {settings.store_phone && <div>Telp: {settings.store_phone}</div>}
              </div>

              <div className="line" />

              {/* Transaction Info */}
              <div className="row"><span>No:</span><span>{data.trx_code}</span></div>
              <div className="row"><span>Tgl:</span><span>{formatDate(data.created_at)}</span></div>
              {data.kasir_name && <div className="row"><span>Kasir:</span><span>{data.kasir_name}</span></div>}

              <div className="line" />

              {/* Items */}
              {data.items.map((item, i) => (
                <div key={i}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-detail">
                    <span>{item.qty} x {formatCurrency(item.price)}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}

              <div className="line" />

              {/* Totals */}
              <div className="total-row">
                <span>TOTAL</span>
                <span>Rp {formatCurrency(data.total_amount)}</span>
              </div>
              <div className="row">
                <span>{data.payment_method}</span>
                <span>Rp {formatCurrency(data.cash_received)}</span>
              </div>
              {data.change_amount > 0 && (
                <div className="row">
                  <span>Kembali</span>
                  <span>Rp {formatCurrency(data.change_amount)}</span>
                </div>
              )}

              <div className="line" />

              {/* Footer */}
              <div className="footer">
                {settings.receipt_footer || 'Terima kasih atas kunjungan Anda!'}
                <br />
                <span style={{ fontSize: '9px' }}>Powered by KasirPro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
