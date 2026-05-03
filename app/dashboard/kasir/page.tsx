'use client'

export default function KasirDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500/10 to-orange-500/10">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-8">
          Kasir Dashboard
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Product Grid + Cart */}
            <div className="bg-app-card p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold mb-6">Produk</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Product cards with 🏆 best seller */}
                <div className="group cursor-pointer">
                  <div className="bg-white/10 backdrop-blur p-4 rounded-xl hover:bg-white/20 transition-all group-hover:scale-105">
                    <div className="text-3xl mb-2">🍳</div>
                    <div className="font-semibold text-white mb-1">Nasi Goreng</div>
                    <div className="text-amber-400 font-bold text-lg">Rp 18.000</div>
                    <div className="flex items-center mt-2">
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full mr-2">🏆 BEST SELLER</span>
                      <span className="text-xs text-white/60">Stok: 50</span>
                    </div>
                  </div>
                </div>
                {/* More products */}
              </div>
            </div>
          </div>
          
          {/* Cart Panel */}
          <div className="space-y-4">
            <div className="bg-app-card p-6 rounded-2xl shadow-xl sticky top-6">
              <h3 className="font-semibold text-white mb-4">Keranjang</h3>
              <div className="space-y-3 mb-6">
                {/* Cart items */}
              </div>
              <div className="space-y-3">
                <div className="text-right">
                  <div className="text-sm text-white/60 mb-2">Total</div>
                  <div className="text-2xl font-bold text-amber-400">Rp 0</div>
                </div>
                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Bayar
                </button>
              </div>
            </div>
            
            {/* Shift Status */}
            <div className="bg-app-card p-6 rounded-2xl shadow-xl">
              <h3 className="font-semibold text-white mb-4">Shift</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Status</span>
                  <span className="font-semibold text-green-400">Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

