# KASIRPRO — TODO FULLSTACK NEXT.JS 14
> Stack Final: Next.js 14 App Router · TypeScript · Supabase JS Client · JWT Cookie · Vitest · GitHub Actions

---

## RINGKASAN ARSITEKTUR AUTH

```
Login (email + PIN)
  → API /api/auth/login
  → Query Supabase: SELECT * FROM users WHERE email = ? AND pin = ?
  → Cocok → sign JWT (payload: { id, name, role }) → set cookie "token"
  → Middleware baca cookie → verify JWT → cek role → allow/redirect
  → Logout → hapus cookie "token"
```

**Tidak ada:** Supabase Auth, Prisma, ORM, session server-side.
**Ada:** 1 tabel `users`, query langsung via `@supabase/supabase-js`, JWT stateless.

---

## STACK & DEPENDENCIES

```bash
# Sudah ada
next@14  typescript  tailwindcss  shadcn/ui  recharts  lucide-react

# Tambah ini
npm install @supabase/supabase-js   # query DB langsung
npm install jose                     # sign & verify JWT (edge-compatible)
npm install zod                      # validasi input API

# Dev / Testing
npm install -D vitest @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D msw
npm install -D happy-dom
```

---

## STATUS KESELURUHAN

| Phase | Nama | Status |
|-------|------|--------|
| 0 | Planning & Setup Ulang | ✅ Selesai |
| 1 | Database Schema di Supabase | 🔴 Belum |
| 2 | Auth (JWT Cookie, no Supabase Auth) | ✅ Selesai |
| 3 | Middleware + Route Guard per Role | ✅ Selesai |
| 4 | Hooks + Context | ✅ Selesai |
| 5 | Shared Components | ✅ Selesai |
| 6 | Halaman Kasir + API | ✅ Selesai |
| 7 | Halaman Supervisor + API | 🔴 Belum |
| 8 | Halaman Superadmin + API | ✅ Selesai |
| 9 | Halaman Manager + API | ✅ Selesai |
| 10 | Unit Test per Fitur | 🔴 Belum |
| 11 | CI/CD GitHub Actions | 🔴 Belum |

---

## ✅ PHASE 0 — PLANNING & SETUP ULANG

- [x] Analisis repo lama (HTML vanilla)
- [x] Tetapkan 3 role: Kasir, Supervisor, Superadmin
- [x] Putuskan stack final: Supabase JS + JWT cookie (no Prisma, no Supabase Auth)
- [x] Hapus dependencies tidak terpakai dari `package.json`:
  - `@supabase/auth-helpers-nextjs`
  - `@supabase/auth-helpers-react`
  - `@supabase/ssr`
- [x] Install dependencies baru: `jose`, `zod`, `vitest`, `@testing-library/react`, `msw`, `happy-dom`
- [x] Tambah script di `package.json`:
  ```json
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
  ```
- [x] Buat `vitest.config.ts`
- [x] Buat `vitest.setup.ts` (import `@testing-library/jest-dom`)

---

## 🔴 PHASE 1 — DATABASE SCHEMA DI SUPABASE

> Semua dilakukan via Supabase Dashboard → SQL Editor. Tidak ada migrasi file.

### 1.1 — Buat Tabel

- [ ] Jalankan SQL ini di Supabase SQL Editor:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  pin VARCHAR(4) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('KASIR', 'SUPERVISOR', 'SUPERADMIN')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category_id UUID REFERENCES categories(id),
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  total_sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kasir_id UUID REFERENCES users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_sales INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  kasir_id UUID REFERENCES users(id),
  shift_id UUID REFERENCES shifts(id),
  total INTEGER NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('TUNAI','QRIS','TRANSFER')),
  amount_paid INTEGER,
  change INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED','VOIDED')),
  void_reason TEXT,
  voided_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  subtotal INTEGER NOT NULL
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(100),
  action VARCHAR(50) NOT NULL,
  target VARCHAR(100),
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name VARCHAR(100) DEFAULT 'KasirPro',
  store_address TEXT,
  store_phone VARCHAR(20),
  receipt_header TEXT,
  receipt_footer TEXT DEFAULT 'Terima kasih!',
  low_stock_threshold INTEGER DEFAULT 10,
  critical_stock_threshold INTEGER DEFAULT 5,
  payment_cash BOOLEAN DEFAULT true,
  payment_qris BOOLEAN DEFAULT true,
  payment_transfer BOOLEAN DEFAULT true
);

INSERT INTO settings (id) VALUES (1);
```

### 1.2 — Seed Data

- [ ] Jalankan SQL seed di Supabase SQL Editor:

```sql
INSERT INTO categories (name) VALUES
  ('Makanan'), ('Minuman'), ('Snack'), ('Rokok'), ('Lainnya');

-- Setelah categories, ambil UUID-nya lalu:
INSERT INTO users (name, email, pin, role) VALUES
  ('Budi Santoso',  'budi@kasirpro.com',  '1234', 'KASIR'),
  ('Sari Maharani', 'sari@kasirpro.com',  '4321', 'SUPERVISOR'),
  ('Admin Utama',   'admin@kasirpro.com', '9999', 'SUPERADMIN');

-- Seed produk (ganti <uuid-makanan> dll dengan UUID hasil query categories)
INSERT INTO products (name, category_id, price, stock) VALUES
  ('Nasi Goreng',   '<uuid-makanan>', 15000, 50),
  ('Mie Ayam',      '<uuid-makanan>', 12000, 40),
  ('Es Teh',        '<uuid-minuman>', 5000,  100),
  ('Es Jeruk',      '<uuid-minuman>', 7000,  80),
  ('Keripik Singo', '<uuid-snack>',   8000,  60);
```

### 1.3 — Koneksi Library

- [ ] Buat `lib/supabase.ts`:
  ```ts
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // service role, bypass RLS
  )
  ```

- [ ] Update `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  JWT_SECRET=ganti_dengan_random_string_panjang_minimal_32_karakter
  ```

- [ ] Buat `lib/db/users.ts` — query helper: cari user by email+pin, list, CRUD
- [ ] Buat `lib/db/products.ts` — list, CRUD, update stok, update total_sold
- [ ] Buat `lib/db/transactions.ts` — create, list, detail, void
- [ ] Buat `lib/db/shifts.ts` — start, end, active, list
- [ ] Buat `lib/db/reports.ts` — summary, daily, monthly
- [ ] Buat `lib/db/settings.ts` — get, update
- [ ] Buat `lib/db/logs.ts` — insert log, list
- [ ] Buat `lib/activityLogger.ts` — helper `logActivity(userId, userName, action, target?, detail?)`

---

## 🔴 PHASE 2 — AUTH (JWT COOKIE)

### 2.1 — JWT Helper

- [x] Buat `lib/jwt.ts`:
  ```ts
  import { SignJWT, jwtVerify } from 'jose'

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

  export type JWTPayload = {
    id: string
    name: string
    email: string
    role: 'KASIR' | 'SUPERVISOR' | 'SUPERADMIN'
  }

  export async function signToken(payload: JWTPayload): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret)
  }

  export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, secret)
      return payload as JWTPayload
    } catch {
      return null
    }
  }
  ```

### 2.2 — Auth Helper

- [x] Buat `lib/auth.ts`:
  ```ts
  import { cookies } from 'next/headers'
  import { verifyToken, JWTPayload } from './jwt'

  export const COOKIE_NAME = 'kasirpro_token'

  export async function getSession(): Promise<JWTPayload | null> {
    const token = cookies().get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  }
  ```

### 2.3 — API Auth Routes

- [x] Buat `app/api/auth/login/route.ts`:
  - Validasi body: `{ email, pin }` via Zod
  - Query: `SELECT * FROM users WHERE email = $1 AND pin = $2 AND is_active = true`
  - Tidak ketemu → 401 `{ error: 'Email atau PIN salah' }`
  - Ketemu → `signToken` → set cookie `kasirpro_token` (HttpOnly, SameSite: lax, MaxAge: 8 jam)
  - Return: `{ role, name, redirectTo: '/dashboard/[role]' }`

- [x] Buat `app/api/auth/logout/route.ts`:
  - DELETE cookie `kasirpro_token`
  - Return 200

- [x] Buat `app/api/auth/me/route.ts`:
  - Baca cookie → verify JWT
  - Return payload user atau 401

### 2.4 — Login Page

- [x] Buat `app/login/page.tsx` — Server Component, redirect jika sudah login
- [x] Buat `app/login/LoginForm.tsx` — Client Component:
  - Input email
  - PinPad 4 digit
  - Animasi shake jika salah
  - Loading state
  - `fetch('/api/auth/login')` → redirect berdasarkan `role` di response

---

## ✅ PHASE 3 — MIDDLEWARE + ROUTE GUARD

### 3.1 — Rewrite `middleware.ts`

- [x] Implementasi lengkap:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

const ROLE_ROUTES: Record<string, string[]> = {
  '/dashboard/kasir':      ['KASIR', 'SUPERVISOR', 'SUPERADMIN'],
  '/dashboard/supervisor': ['SUPERVISOR', 'SUPERADMIN'],
  '/dashboard/superadmin': ['SUPERADMIN'],
}

function roleToDashboard(role: string) {
  if (role === 'SUPERADMIN') return '/dashboard/superadmin'
  if (role === 'SUPERVISOR') return '/dashboard/supervisor'
  return '/dashboard/kasir'
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('kasirpro_token')?.value

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname === '/login') {
    if (token) {
      const payload = await verifyToken(token)
      if (payload) return NextResponse.redirect(new URL(roleToDashboard(payload.role), req.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.redirect(new URL('/login', req.url))

    const matchedRoute = Object.keys(ROLE_ROUTES).find(r => pathname.startsWith(r))
    if (matchedRoute && !ROLE_ROUTES[matchedRoute].includes(payload.role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    const res = NextResponse.next()
    res.headers.set('x-user-id',   payload.id)
    res.headers.set('x-user-role', payload.role)
    res.headers.set('x-user-name', payload.name)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 3.2 — Halaman Sistem

- [x] Buat `app/unauthorized/page.tsx`
- [x] Buat `app/not-found.tsx`
- [x] Buat `app/error.tsx`

---

## ✅ PHASE 4 — HOOKS + CONTEXT

- [x] Buat `context/AuthContext.tsx` — fetch `/api/auth/me`, state user + logout()
- [x] Buat `hooks/useAuth.ts`
- [x] Buat `context/CartContext.tsx` — useReducer: ADD/REMOVE/UPDATE_QTY/CLEAR, persist sessionStorage
- [x] Buat `hooks/useCart.ts`
- [x] Buat `hooks/useProducts.ts` — fetch + filter client-side
- [x] Buat `hooks/useShift.ts` — fetch shift aktif, timer, start/end
- [x] Buat `hooks/useDashboardStats.ts` — fetch summary stats
- [x] Update `app/layout.tsx` — wrap AuthProvider + CartProvider + Toaster

---

## ✅ PHASE 5 — SHARED COMPONENTS

- [x] `components/layout/Sidebar.tsx`
- [x] `components/layout/BottomNav.tsx`
- [x] `components/layout/Navbar.tsx`
- [x] `components/layout/RoleBadge.tsx`
- [x] `components/layout/ShiftStatusBadge.tsx`
- [x] `components/ui/PinPad.tsx` — callback `onComplete(pin: string)`
- [x] `components/ui/StatsCard.tsx`
- [x] `components/ui/StatusBadge.tsx`
- [x] `components/ui/EmptyState.tsx`
- [x] `components/ui/LoadingSpinner.tsx`
- [x] `components/ui/ConfirmDialog.tsx`
- [x] `components/data/DataTable.tsx`
- [ ] `components/data/SalesChart.tsx`
- [ ] `components/data/ProductStatsTable.tsx`

---

## ✅ PHASE 6 — HALAMAN KASIR + API

- [x] `app/dashboard/kasir/layout.tsx` - Layout dengan sidebar & bottom nav
- [x] `app/dashboard/kasir/page.tsx` — 2 panel POS (ProductGrid + CartPanel)
- [x] `app/dashboard/kasir/shift/page.tsx` - Shift management (start/end shift)
- [x] `app/dashboard/kasir/riwayat/page.tsx` - Riwayat transaksi kasir
- [x] `components/pos/ProductGrid.tsx` — grid + filter + search + badge
- [x] `components/pos/ProductCard.tsx`
- [x] `components/pos/CartPanel.tsx`
- [x] `components/pos/PaymentModal.tsx`
- [x] `components/layout/KasirSidebar.tsx` - Sidebar navigation
- [x] `components/layout/KasirBottomNav.tsx` - Mobile bottom navigation
- [x] `POST /api/transactions` — insert transaksi + kurangi stok + log
- [x] `GET  /api/transactions` - Get all transactions
- [x] `POST /api/shifts` - Start new shift
- [x] `GET  /api/shifts?active=true&kasir_id=xxx` - Get active shift
- [x] `PATCH /api/shifts/:id` - End shift

### Fitur Lengkap Kasir:
1. **POS (Point of Sale)** - ProductGrid dengan search & filter, CartPanel, PaymentModal
2. **Shift Management** - Start/end shift, live timer, real-time stats
3. **Riwayat Transaksi** - View transaksi kasir sendiri, print receipt, grouped by date
4. **Navigation** - Sidebar (desktop) & Bottom Nav (mobile) dengan 3 menu

### API Shifts:
- `POST /api/shifts` - Start shift (kasir_id required)
- `GET /api/shifts?active=true&kasir_id=xxx` - Get active shift for kasir
- `GET /api/shifts` - Get all shifts (with filters)
- `PATCH /api/shifts/:id` - End shift (calculate total_sales & total_transactions)
- `GET /api/shifts/:id` - Get shift detail

---

## 🔴 PHASE 7 — HALAMAN SUPERVISOR + API

- [ ] `app/dashboard/supervisor/layout.tsx`
- [ ] `app/dashboard/supervisor/page.tsx`
- [ ] `app/dashboard/supervisor/transaksi/page.tsx`
- [ ] `components/supervisor/VoidModal.tsx` — alasan + PinPad verifikasi
- [ ] `app/dashboard/supervisor/laporan/page.tsx`
- [ ] `app/dashboard/supervisor/shift/page.tsx`
- [ ] `GET  /api/transactions`
- [ ] `GET  /api/transactions/:id`
- [ ] `POST /api/transactions/:id/void` — verifikasi PIN, update status, log
- [ ] `GET  /api/reports/summary`
- [ ] `GET  /api/reports/daily`
- [ ] `GET  /api/shifts`

---

## ✅ PHASE 8 — HALAMAN SUPERADMIN + API

- [x] `app/dashboard/superadmin/layout.tsx`
- [x] `app/dashboard/superadmin/page.tsx` - Dashboard dengan real-time stats
- [x] Produk: page list + tambah + edit + `ProductModal.tsx`
- [x] Kategori: page CRUD + `CategoryModal.tsx`
- [x] Karyawan: page list + tambah + edit + `KaryawanModal.tsx`
- [x] Transaksi: page full + preview struk
- [x] `ThermalReceipt.tsx` - Preview & print struk thermal
- [x] `app/dashboard/superadmin/log/page.tsx` - Activity log
- [x] `app/dashboard/superadmin/laporan/page.tsx` - Laporan penjualan
- [x] `app/dashboard/superadmin/pengaturan/page.tsx` - Settings toko
- [x] `app/dashboard/superadmin/notifikasi/page.tsx` - Pengaturan notifikasi
- [x] `app/dashboard/superadmin/keamanan/page.tsx` - Ubah PIN & keamanan
- [x] `app/dashboard/superadmin/more/page.tsx` - Menu lainnya
- [x] `POST/PATCH/DELETE /api/products`
- [x] `POST/PATCH/DELETE /api/categories`
- [x] `GET/POST/PATCH/DELETE /api/users`
- [x] `GET /api/logs`
- [x] `GET /api/reports` (today, week, month)
- [x] `GET/PATCH /api/settings`
- [x] `GET /api/dashboard/stats` - Real-time dashboard stats

### Fitur Lengkap Superadmin:
1. **Dashboard** - Real-time stats, grafik 7 hari, quick actions
2. **Produk** - CRUD produk dengan kategori, stok, harga
3. **Kategori** - Manajemen kategori produk
4. **Karyawan** - Manajemen user (KASIR, SUPERVISOR, SUPERADMIN)
5. **Transaksi** - View semua transaksi + print thermal receipt
6. **Laporan** - Laporan penjualan (hari ini, minggu, bulan) + top products
7. **Log** - Activity log semua aktivitas sistem
8. **Pengaturan** - Info toko, footer struk, threshold stok
9. **Notifikasi** - Pengaturan notifikasi (placeholder untuk future)
10. **Keamanan** - Ubah PIN, info akun (placeholder untuk future)

---

## ✅ PHASE 9 — HALAMAN MANAGER + API

Manager adalah role yang memiliki akses read-only untuk monitoring dan reporting. Manager dapat melihat semua data tapi tidak dapat melakukan perubahan (CRUD).

### Fitur Manager:
- [x] `app/dashboard/manager/layout.tsx` - Layout dengan sidebar & bottom nav
- [x] `app/dashboard/manager/page.tsx` - Dashboard dengan real-time stats
- [x] `app/dashboard/manager/transaksi/page.tsx` - View semua transaksi + print receipt
- [x] `app/dashboard/manager/laporan/page.tsx` - Laporan penjualan (today/week/month)
- [x] `app/dashboard/manager/karyawan/page.tsx` - View data karyawan (read-only)
- [x] `app/dashboard/manager/log/page.tsx` - Activity log sistem
- [x] `app/dashboard/manager/more/page.tsx` - Menu lainnya
- [x] `components/layout/ManagerSidebar.tsx` - Sidebar navigation
- [x] `components/layout/ManagerBottomNav.tsx` - Mobile bottom navigation
- [x] Middleware updated - Manager route guard & redirect

### Akses Manager:
- ✅ Dashboard - Real-time stats & charts
- ✅ Transaksi - View & print receipts (read-only)
- ✅ Laporan - Sales reports & analytics (read-only)
- ✅ Karyawan - View employee data (read-only)
- ✅ Activity Log - View system logs (read-only)
- ❌ Produk - No access (Superadmin only)
- ❌ Kategori - No access (Superadmin only)
- ❌ Pengaturan - No access (Superadmin only)

### API yang Digunakan:
- GET `/api/dashboard/stats` - Dashboard statistics
- GET `/api/transactions` - All transactions
- GET `/api/reports?period=today|week|month` - Sales reports
- GET `/api/users` - Employee data
- GET `/api/logs` - Activity logs
- GET `/api/settings` - Store settings (for receipt printing)

---

## 🔴 PHASE 10 — UNIT TEST PER FITUR

### Setup

- [ ] Buat `vitest.config.ts`:
  ```ts
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'
  import path from 'path'

  export default defineConfig({
    plugins: [react()],
    test: {
      environment: 'happy-dom',
      setupFiles: ['./vitest.setup.ts'],
      globals: true,
      coverage: { reporter: ['text', 'lcov'], exclude: ['node_modules', '.next'] },
    },
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  })
  ```

- [ ] Buat `vitest.setup.ts`: `import '@testing-library/jest-dom'`
- [ ] Buat `__tests__/msw/handlers.ts` — mock semua API
- [ ] Buat `__tests__/msw/server.ts` — MSW setup

### Test JWT & Auth

- [ ] `__tests__/lib/jwt.test.ts`:
  - signToken → menghasilkan string
  - verifyToken token valid → return payload
  - verifyToken token expired → return null
  - verifyToken token palsu → return null

- [ ] `__tests__/api/auth/login.test.ts`:
  - Email + PIN benar → 200 + Set-Cookie
  - PIN salah → 401
  - User nonaktif → 401
  - Body tidak lengkap → 400

- [ ] `__tests__/components/login/LoginForm.test.tsx`:
  - Render input email dan PinPad
  - Kredensial benar → redirect ke dashboard
  - Kredensial salah → pesan error + shake
  - Submit disabled saat loading

### Test PinPad

- [ ] `__tests__/components/ui/PinPad.test.tsx`:
  - Klik angka → tampil di display
  - Backspace → hapus digit terakhir
  - 4 digit → `onComplete` dipanggil
  - Reset setelah complete

### Test Cart

- [ ] `__tests__/context/CartContext.test.tsx`:
  - ADD_ITEM → item masuk, total bertambah
  - ADD_ITEM duplikat → qty bertambah (tidak duplikat baris)
  - REMOVE_ITEM → item hilang
  - UPDATE_QTY → qty dan subtotal update
  - CLEAR_CART → kosong, total 0

### Test API Transactions

- [ ] `__tests__/api/transactions/create.test.ts`:
  - Transaksi valid → 201, stok berkurang, log ada
  - Stok tidak cukup → 400
  - Tidak ada shift aktif → 400
  - Tidak auth → 401

- [ ] `__tests__/api/transactions/void.test.ts`:
  - PIN supervisor benar → status VOIDED
  - PIN salah → 403
  - Transaksi sudah VOIDED → 400
  - Role KASIR void → 403

### Test Middleware

- [ ] `__tests__/middleware.test.ts`:
  - `/` → redirect `/login`
  - `/login` + token KASIR valid → redirect `/dashboard/kasir`
  - `/dashboard/kasir` tanpa token → redirect `/login`
  - `/dashboard/supervisor` + token KASIR → redirect `/unauthorized`
  - `/dashboard/superadmin` + token SUPERVISOR → redirect `/unauthorized`
  - `/dashboard/superadmin` + token SUPERADMIN → next()

### Test Komponen Kasir

- [ ] `__tests__/components/kasir/ProductGrid.test.tsx`:
  - Render produk
  - Search → filter client-side
  - Filter kategori → hanya kategori itu
  - Stok 0 → badge Habis, tidak bisa klik
  - Best seller badge pada produk `total_sold` tertinggi

- [ ] `__tests__/components/kasir/CartPanel.test.tsx`:
  - Cart kosong → EmptyState
  - Tambah item → tampil dengan qty + subtotal benar
  - Klik + → qty bertambah
  - Klik - pada qty 1 → tetap 1
  - Klik hapus → item hilang
  - Total dihitung benar

- [ ] `__tests__/components/kasir/PaymentModal.test.tsx`:
  - Input nominal < total → tombol disabled
  - Input nominal > total → kembalian = bayar - total
  - Submit → POST ke `/api/transactions`

### Test Hooks

- [ ] `__tests__/hooks/useProducts.test.ts`:
  - Mount → fetch produk
  - Set search → produk terfilter
  - Set kategori → produk terfilter
  - Loading state benar

- [ ] `__tests__/hooks/useShift.test.ts`:
  - Mount → fetch shift aktif
  - Tidak ada shift → null
  - startShift() → POST + state update
  - endShift() → PATCH + state cleared

---

## 🔴 PHASE 11 — CI/CD GITHUB ACTIONS

### Workflow File

- [ ] Buat `.github/workflows/test.yml`:

```yaml
name: Test & Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Run unit tests
        run: npm run test
        env:
          JWT_SECRET: test_secret_ci_only_32chars_minimum
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          SUPABASE_SERVICE_ROLE_KEY: test_key

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/
```

### Konfigurasi Vercel

- [ ] Settings → Git → Production Branch: `main`
- [ ] Tambah env vars di Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`
- [ ] Workflow dev: kerja di branch `develop` → merge ke `main` hanya kalau GitHub Actions ✅

### Branch Strategy

```
main          ← production (auto-deploy Vercel)
develop       ← development harian
feature/*     ← branch per fitur, merge ke develop
```

---

## STRUKTUR FOLDER FINAL

```
kasir-pro/
├── .github/workflows/test.yml
├── __tests__/
│   ├── msw/handlers.ts + server.ts
│   ├── lib/jwt.test.ts
│   ├── api/auth/login.test.ts
│   ├── api/transactions/create.test.ts + void.test.ts
│   ├── components/
│   │   ├── ui/PinPad.test.tsx
│   │   ├── login/LoginForm.test.tsx
│   │   └── kasir/ProductGrid + CartPanel + PaymentModal.test.tsx
│   ├── context/CartContext.test.tsx
│   ├── hooks/useProducts + useShift.test.ts
│   └── middleware.test.ts
├── app/
│   ├── layout.tsx
│   ├── not-found.tsx + error.tsx + unauthorized/
│   ├── login/ (page + LoginForm + actions)
│   ├── dashboard/
│   │   ├── kasir/ (layout + page + shift + riwayat)
│   │   ├── supervisor/ (layout + page + transaksi + laporan + shift)
│   │   └── superadmin/ (layout + page + produk + kategori + karyawan
│   │                     + transaksi + struk + log + laporan + pengaturan)
│   └── api/
│       ├── auth/ (login + logout + me)
│       ├── products/ + categories/
│       ├── transactions/ + transactions/[id]/void/
│       ├── shifts/ + shifts/active/ + shifts/[id]/
│       ├── reports/ (summary + daily + monthly)
│       ├── users/ + logs/ + settings/
├── components/
│   ├── layout/ (Sidebar + BottomNav + Navbar + RoleBadge + ShiftStatusBadge)
│   ├── ui/ (PinPad + StatsCard + StatusBadge + EmptyState + LoadingSpinner + ConfirmDialog)
│   ├── data/ (DataTable + SalesChart + ProductStatsTable)
│   ├── kasir/ (ProductGrid + ProductCard + CartPanel + PaymentModal + ReceiptPreview + ShiftSummary)
│   ├── supervisor/ (VoidModal)
│   └── superadmin/ (ProductForm + KaryawanForm + ThermalReceipt)
├── context/ (AuthContext + CartContext)
├── hooks/ (useAuth + useCart + useShift + useProducts + useDashboardStats)
├── lib/
│   ├── jwt.ts + auth.ts + supabase.ts + activityLogger.ts
│   └── db/ (users + products + transactions + shifts + reports + settings + logs)
├── types/index.ts
├── middleware.ts
├── vitest.config.ts + vitest.setup.ts
└── .env.local
```

---

## URUTAN PENGERJAAN

```
Phase 1 (DB Supabase) → Phase 2 (Auth JWT) → Phase 3 (Middleware)
         ↓
Phase 4 (Hooks) → Phase 5 (Components)
         ↓
Phase 6 (Kasir) → Phase 7 (Supervisor) → Phase 8 (Superadmin)
         ↓
Phase 9 (Test) → Phase 10 (CI/CD)
```

**Satu sesi ideal:**
1. Buat 1 API route + lib/db helper-nya
2. Buat komponen / halaman yang pakai API itu
3. Tulis test untuk keduanya
4. Commit → push ke `develop`
5. Merge ke `main` hanya kalau Actions ✅ hijau