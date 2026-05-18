'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus, Tag, X, Percent, Ban } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaymentModal } from './PaymentModal'
import { useToast } from '@/hooks/use-toast'

export function CartPanel() {
  const { items, updateQty, removeItem, total, clearCart, discount, discountAmount, totalAfterDiscount, applyDiscount, removeDiscount } = useCart()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [showDiscountForm, setShowDiscountForm] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [voidModal, setVoidModal] = useState<{ open: boolean; item: { id: string; name: string; qty: number; price: number } | null }>({ open: false, item: null })
  const [voidReason, setVoidReason] = useState('')
  const [voidPin, setVoidPin] = useState('')
  const [isVoiding, setIsVoiding] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePaymentSuccess = () => {
    clearCart()
    setIsPaymentModalOpen(false)
  }

  const handleVoidItem = async () => {
    if (!voidModal.item || !voidReason.trim() || voidPin.length !== 4) return

    setIsVoiding(true)
    try {
      // Verify PIN with manager/admin and log void
      const res = await fetch('/api/transactions/void-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: voidPin,
          reason: voidReason.trim(),
          itemName: voidModal.item.name,
          itemQty: voidModal.item.qty,
          itemPrice: voidModal.item.price,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Gagal void item')
      }

      const data = await res.json()

      // Remove item from cart
      removeItem(voidModal.item.id)

      toast({
        title: 'Item di-void',
        description: `${voidModal.item.name} dihapus. Approved by: ${data.approvedBy}`,
      })

      setVoidModal({ open: false, item: null })
      setVoidReason('')
      setVoidPin('')
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' })
    } finally {
      setIsVoiding(false)
    }
  }

  const handleApplyDiscount = () => {
    const val = parseFloat(discountValue)
    if (!val || val <= 0) {
      toast({ title: 'Error', description: 'Masukkan nilai diskon yang valid', variant: 'destructive' })
      return
    }
    if (discountType === 'percent' && val > 100) {
      toast({ title: 'Error', description: 'Diskon persen maksimal 100%', variant: 'destructive' })
      return
    }
    if (discountType === 'fixed' && val > total) {
      toast({ title: 'Error', description: 'Diskon tidak boleh melebihi total', variant: 'destructive' })
      return
    }

    applyDiscount({
      type: discountType,
      value: val,
      code: couponCode || undefined,
      label: couponCode ? `Kupon: ${couponCode}` : `Diskon ${discountType === 'percent' ? `${val}%` : formatCurrency(val)}`,
    })

    toast({ title: 'Diskon diterapkan', description: couponCode ? `Kupon ${couponCode} berhasil` : 'Diskon berhasil diterapkan' })
    setShowDiscountForm(false)
    setCouponCode('')
    setDiscountValue('')
  }

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <>
      <div className="bg-white/[0.04] border border-white/10 p-6 rounded-2xl shadow-xl h-fit sticky top-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">
            Keranjang <span className="text-amber-400">({totalItems})</span>
          </h3>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="p-2 hover:bg-red-400/10 border border-white/10 hover:border-red-400/30 rounded-lg transition-all"
              title="Kosongkan keranjang"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto mb-6 scrollbar-thin">
          {items.map((item) => (
            <div key={item.id} className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">
                    {item.name}
                    {item.tax_percent > 0 && (
                      <span className="ml-1 text-[10px] text-orange-400 font-normal">({item.tax_percent}% pajak)</span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 mono">{formatCurrency(item.price)}</div>
                </div>
                <button
                  onClick={() => setVoidModal({ open: true, item: { id: item.id, name: item.name, qty: item.qty, price: item.price } })}
                  className="p-1.5 hover:bg-red-400/10 border border-transparent hover:border-red-400/30 rounded-lg transition-all"
                  title="Void item"
                >
                  <Ban className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                  >
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                  <span className="w-8 text-center font-bold text-white mono">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="text-sm font-bold text-amber-400 mono">
                  {formatCurrency(item.price * item.qty)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 ? (
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Discount Section */}
            {discount ? (
              <div className="flex items-center justify-between p-3 bg-green-400/10 border border-green-400/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-xs font-semibold text-green-400">{discount.label || 'Diskon'}</p>
                    <p className="text-xs text-green-400/60">-{formatCurrency(discountAmount)}</p>
                  </div>
                </div>
                <button onClick={removeDiscount} className="p-1 hover:bg-red-400/10 rounded">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <>
                {!showDiscountForm ? (
                  <button
                    onClick={() => setShowDiscountForm(true)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-400/30 rounded-xl transition-all text-sm text-white/60 hover:text-green-400"
                  >
                    <Tag className="w-4 h-4" />
                    Tambah Diskon / Kupon
                  </button>
                ) : (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Diskon / Kupon</span>
                      <button onClick={() => setShowDiscountForm(false)} className="p-1 hover:bg-white/10 rounded">
                        <X className="w-3 h-3 text-white/40" />
                      </button>
                    </div>
                    <Input
                      placeholder="Kode kupon (opsional)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="bg-white/5 border-white/10 text-white text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDiscountType('percent')}
                        className={`flex-1 p-2 rounded-lg text-xs font-semibold transition-all ${discountType === 'percent' ? 'bg-green-400/20 text-green-400 border border-green-400/30' : 'bg-white/5 text-white/60 border border-white/10'}`}
                      >
                        <Percent className="w-3 h-3 mx-auto mb-0.5" />
                        Persen
                      </button>
                      <button
                        onClick={() => setDiscountType('fixed')}
                        className={`flex-1 p-2 rounded-lg text-xs font-semibold transition-all ${discountType === 'fixed' ? 'bg-green-400/20 text-green-400 border border-green-400/30' : 'bg-white/5 text-white/60 border border-white/10'}`}
                      >
                        Rp
                        <div className="text-[10px]">Nominal</div>
                      </button>
                    </div>
                    <Input
                      type="number"
                      placeholder={discountType === 'percent' ? 'Contoh: 10' : 'Contoh: 5000'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="bg-white/5 border-white/10 text-white text-sm"
                      min="0"
                    />
                    <Button
                      onClick={handleApplyDiscount}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-2"
                      size="sm"
                    >
                      Terapkan Diskon
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Totals */}
            <div className="space-y-2">
              {discount && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40">Subtotal</span>
                    <span className="text-sm text-white/60 mono">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-green-400">Diskon</span>
                    <span className="text-sm text-green-400 mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60 font-semibold">Total</span>
                <span className="text-2xl font-black text-amber-400 mono">
                  {formatCurrency(totalAfterDiscount)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-bold py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all"
            >
              💳 Bayar Sekarang
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-white/40 text-sm">Keranjang kosong</p>
            <p className="text-white/20 text-xs mt-1">Pilih produk untuk memulai</p>
          </div>
        )}
      </div>

      {/* Void Item Modal */}
      {voidModal.open && voidModal.item && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setVoidModal({ open: false, item: null }); setVoidReason(''); setVoidPin('') }} />
          <div className="relative w-full max-w-sm bg-[#16161f] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-400/10 rounded-lg flex items-center justify-center">
                  <Ban className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Void Item</h2>
                  <p className="text-[11px] text-white/40">Perlu approval Manager/Admin</p>
                </div>
              </div>
              <button onClick={() => { setVoidModal({ open: false, item: null }); setVoidReason(''); setVoidPin('') }} className="p-2 hover:bg-white/5 rounded-lg">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Item info */}
              <div className="p-3 bg-red-400/5 border border-red-400/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{voidModal.item.name}</p>
                    <p className="text-xs text-white/40">{voidModal.item.qty}x @ {formatCurrency(voidModal.item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-red-400 mono">
                    {formatCurrency(voidModal.item.price * voidModal.item.qty)}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Alasan Void *</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Contoh: Pelanggan berubah pikiran, salah input, dll."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-red-400/30 placeholder:text-white/20"
                  rows={2}
                  autoFocus
                />
              </div>

              {/* PIN Manager/Admin */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">PIN Manager / Admin *</label>
                <Input
                  type="password"
                  value={voidPin}
                  onChange={(e) => setVoidPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="bg-white/5 border-white/10 text-white text-center text-2xl tracking-[0.5em] mono"
                  maxLength={4}
                />
                <p className="text-[11px] text-white/40 mt-1">Masukkan PIN akun Manager atau Superadmin untuk approval</p>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-white/10">
              <Button
                onClick={() => { setVoidModal({ open: false, item: null }); setVoidReason(''); setVoidPin('') }}
                variant="outline"
                className="flex-1 border-white/10 text-white hover:bg-white/5"
                disabled={isVoiding}
              >
                Batal
              </Button>
              <Button
                onClick={handleVoidItem}
                disabled={!voidReason.trim() || voidPin.length !== 4 || isVoiding}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                {isVoiding ? 'Memverifikasi...' : 'Void Item'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={items}
        total={totalAfterDiscount}
        subtotal={total}
        discount={discount}
        discountAmount={discountAmount}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}
