# ⬡ KasirPro

> **Sistem Point of Sale (POS) modern berbasis web** — ringan, responsif, dan siap diintegrasikan ke Laravel.

🔗 **Live Demo:** [username.github.io/kasirpro](https://username.github.io/kasirpro)

---

## 📸 Tampilan

| Landing Page | Halaman Kasir | Admin Panel |
|---|---|---|
| Pilih mode akses | POS dua panel + cart | Bottom nav ala Android |

---

## ✨ Fitur

### 🖥 Halaman Kasir (`/kasir/`)
- Grid produk dengan filter kategori & pencarian real-time
- Cart interaktif — tambah, ubah qty, hapus item
- Tombol **Bayar** dengan modal pembayaran (Tunai / QRIS / Transfer), hitung kembalian otomatis, quick cash button
- Tombol **Batal** untuk kosongkan cart sebelum bayar (tanpa PIN)
- **Login karyawan** dengan numpad PIN — animasi shake jika salah
- Dashboard shift — durasi, total penjualan, riwayat transaksi
- **Void transaksi** hanya bisa dilakukan pada transaksi yang *sudah selesai*, memerlukan PIN supervisor + alasan
- Laporan harian dengan filter periode

### ⚙ Admin Panel (`/admin/`)
- **Dashboard** — statistik ringkas, bar chart 7 hari, produk terlaris, alert stok kritis
- **Manajemen Produk** — CRUD lengkap, filter kategori, badge stok (normal/rendah/kritis)
- **Manajemen Karyawan** — CRUD, role (Kasir / Supervisor / Admin), PIN, status aktif
- **Transaksi** — tabel semua transaksi, detail item, void dengan PIN supervisor
- **Struk & Cetak** — preview struk thermal, pilih transaksi, print langsung (`window.print()`)
- **Log Aktivitas** — timeline semua kejadian (transaksi, void, login, produk, shift), filter per kategori
- **Laporan** — ringkasan bulanan, ranking kasir, filter periode
- **Pengaturan** — info toko, konfigurasi struk, metode bayar, alert stok, PIN keamanan
- Navigasi **bottom nav** ala Android + drawer "Lainnya"

---

## 🗂 Struktur Folder

```
kasirpro/
├── index.html          # Landing page — pilih Kasir atau Admin
├── kasir/
│   └── index.html      # Halaman POS kasir utama
└── admin/
    └── index.html      # Admin panel lengkap
```

---

## 🚀 Cara Pakai

### Lokal
Cukup buka `index.html` di browser — tidak perlu server, tidak perlu install apapun.

```bash
# Clone repo
git clone https://github.com/username/kasirpro.git
cd kasirpro

# Buka langsung di browser
open index.html
# atau
start index.html   # Windows
```

### GitHub Pages
1. Push ke GitHub
2. **Settings → Pages → Source:** `main` branch, folder `/` (root)
3. Akses di `https://username.github.io/kasirpro/`

---

## 🛠 Tech Stack

| | |
|---|---|
| **HTML5** | Struktur semantik, siap migrasi ke Blade |
| **Tailwind CSS** | Via CDN, utility-first styling |
| **Vanilla JS** | Tanpa framework — ringan, cepat |
| **Google Fonts** | Sora + JetBrains Mono |

Tidak ada build step. Tidak ada `node_modules`. Tidak ada bundler.

---

## 🔌 Migrasi ke Laravel

Proyek ini dirancang agar mudah dipindahkan ke Laravel Blade atau Inertia.js.

### Struktur target Laravel
```
resources/views/
├── kasir/
│   ├── pos.blade.php        ← dari kasir/index.html
│   └── login.blade.php
└── admin/
    └── index.blade.php      ← dari admin/index.html

public/
├── js/pos.js
└── css/pos.css
```

### Ganti dummy data dengan API
Setiap data dummy sudah terpisah dan diberi komentar. Contoh penggantian:

```javascript
// SEBELUM — dummy data
const PRODUCTS = [ { id: 1, name: 'Nasi Goreng', ... } ];

// SESUDAH — fetch dari Laravel API
const res = await fetch('/api/products', {
  headers: { 'X-CSRF-TOKEN': token, 'Accept': 'application/json' }
});
const PRODUCTS = await res.json();
```

### Endpoint API yang perlu dibuat

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/products` | List produk + stok |
| `GET` | `/api/categories` | List kategori |
| `POST` | `/api/transactions` | Simpan transaksi |
| `POST` | `/api/transactions/{id}/void` | Void transaksi |
| `POST` | `/kasir/login` | Auth karyawan via PIN |
| `POST` | `/api/shifts/start` | Mulai shift |
| `POST` | `/api/shifts/end` | Akhiri shift |
| `GET` | `/api/reports` | Data laporan |

### Role-based UI di Blade
```blade
{{-- Tombol void hanya untuk supervisor ke atas --}}
@if(auth()->user()->role !== 'kasir')
  <button onclick="openVoidModal('{{ $trx->id }}')">Void</button>
@endif
```

---

## 🔐 Demo Credentials

> Data ini hanya untuk demo frontend. Ganti dengan autentikasi Laravel di produksi.

| Nama | Role | PIN |
|---|---|---|
| Budi Santoso | Kasir | `1234` |
| Sari Maharani | Kasir | `1234` |
| Joko Widodo | Supervisor | `1234` |

PIN Supervisor (untuk void): `1234`

---

## 📋 Roadmap

- [x] Halaman POS kasir
- [x] Login karyawan dengan PIN
- [x] Dashboard shift
- [x] Admin panel dengan bottom nav
- [x] Manajemen produk & karyawan
- [x] Struk & cetak
- [x] Log aktivitas
- [x] Void transaksi dengan otorisasi
- [ ] Integrasi Laravel backend
- [ ] Printer thermal (ESC/POS)
- [ ] Struk digital via WhatsApp
- [ ] Mode offline (Service Worker)
- [ ] Dark / Light mode toggle

---

## 📄 Lisensi

MIT — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<div align="center">
  Dibuat dengan ☕ untuk kasir Indonesia
</div>
