'use client'

export default function ManagerDashboard() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Manager Dashboard
        </h1>
        <div className="text-sm text-white/60">
          Shift Aktif: 2 | Karyawan: 4
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur border border-white/20 p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-3xl font-bold text-white mb-1">Rp 4.2M</div>
          <div className="text-white/60 text-sm">Penjualan Hari Ini</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur border border-white/20 p-8 rounded-2xl shadow-2xl">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-3xl font-bold text-green-300 mb-1">156</div>
          <div className="text-white/60 text-sm">Transaksi</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur border border-white/20 p-8 rounded-2xl shadow-2xl">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-blue-300 mb-1">87%</div>
          <div className="text-white/60 text-sm">Kepuasan</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur border border-white/20 p-8 rounded-2xl shadow-2xl">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-3xl font-bold text-purple-300 mb-1">4</div>
          <div className="text-white/60 text-sm">Karyawan Aktif</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Stats - Best Sellers */}
        <div className="bg-app-card p-8 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Produk Terlaris</h2>
            <span className="text-sm text-white/60">30 hari terakhir</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="text-2xl">🍳</div>
              <div className="flex-1">
                <div className="font-bold text-white">Nasi Goreng Spesial</div>
                <div className="text-sm text-white/70">SKU: MKN-001</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-400">125</div>
                <div className="text-sm text-white/60">terjual</div>
                <div className="text-sm text-green-400 font-semibold">Rp 2.25M</div>
              </div>
            </div>
            {/* More top products */}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-app-card p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Transaksi Terbaru</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <div className="font-bold text-white">TRX-001</div>
                <div className="text-sm text-white/70">Budi S. - TUNAI</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-400">Rp 28.000</div>
                <div className="text-xs text-green-400">2 item</div>
              </div>
            </div>
            {/* More */}
          </div>
        </div>
      </div>

      {/* Full Data Tables */}
      <div className="bg-app-card p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Data Transaksi</h2>
          <div className="space-x-2">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all">
              Hari ini
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all">
              Minggu ini
            </button>
          </div>
        </div>
        {/* Table from shadcn */}
        <div className="overflow-x-auto">
          {/* DataTable component */}
          <div className="text-sm text-white/60">Table placeholder - Full CRUD ready</div>
        </div>
      </div>
    </div>
  )
}

