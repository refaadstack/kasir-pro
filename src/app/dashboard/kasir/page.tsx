'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartPanel } from '@/components/pos/CartPanel'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Product } from '@/hooks/useProducts'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Clock } from 'lucide-react'

export default function KasirDashboard() {
  const { addItem } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [hasActiveShift, setHasActiveShift] = useState<boolean | null>(null)

  useEffect(() => {
    if (user) {
      checkActiveShift()
    }
  }, [user])

  const checkActiveShift = async () => {
    try {
      const res = await fetch(`/api/shifts?active=true&kasir_id=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setHasActiveShift(data.length > 0)
      } else {
        setHasActiveShift(false)
      }
    } catch {
      setHasActiveShift(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    })

    toast({
      title: 'Ditambahkan ke keranjang',
      description: product.name,
    })
  }

  // Loading state
  if (hasActiveShift === null) {
    return (
      <div className="p-4">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // No active shift - show prompt to open shift
  if (!hasActiveShift) {
    return (
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-black text-white">Point of Sale</h1>
          <p className="text-sm text-white/40 mt-1">
            Pilih produk dan proses transaksi
          </p>
        </div>

        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Shift Belum Aktif</h3>
            <p className="text-sm text-white/60 mb-6">
              Anda harus membuka cash drawer dan memulai shift sebelum dapat melakukan transaksi.
            </p>
            <Button
              onClick={() => router.push('/dashboard/kasir/shift')}
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
            >
              <Clock className="w-4 h-4 mr-2" />
              Buka Shift Sekarang
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-amber-400/10 border-amber-400/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Wallet className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-400 text-sm">Kenapa Harus Buka Shift?</h3>
                <p className="text-xs text-amber-400/80 mt-1">
                  Shift mencatat semua transaksi Anda, menghitung total penjualan, dan membantu rekonsiliasi kas di akhir shift.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Has active shift - show POS
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-black text-white">Point of Sale</h1>
        <p className="text-sm text-white/40 mt-1">
          Pilih produk dan proses transaksi
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product Grid - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ProductGrid onAddToCart={handleAddToCart} />
        </div>

        {/* Cart Panel - 1 column on large screens */}
        <div>
          <CartPanel />
        </div>
      </div>
    </div>
  )
}
