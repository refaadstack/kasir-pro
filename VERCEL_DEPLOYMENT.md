# 🚀 Vercel Deployment Guide

## Masalah: Login Tidak Bisa di Vercel

### ✅ Solusi yang Sudah Diterapkan:

1. **Update cookie settings** - Tambah `secure: true` untuk production
2. **Environment variables** - Perlu di-set di Vercel

---

## 📋 Step-by-Step Deployment

### 1. Setup Environment Variables di Vercel

**PENTING:** Tanpa ini, login tidak akan berfungsi!

1. Buka project di Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Tambahkan variables berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret (HARUS SAMA dengan local!)
JWT_SECRET=your_jwt_secret_minimum_32_characters_long

# Node Environment (otomatis di-set Vercel)
NODE_ENV=production
```

**Cara Mendapatkan Supabase Keys:**

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

**Generate JWT_SECRET:**

```bash
# Di terminal local:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Atau:
openssl rand -hex 32
```

### 2. Verifikasi Environment Variables

Setelah set env vars, pastikan:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Harus diawali `https://`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Panjang ~200+ karakter
- ✅ `JWT_SECRET` - Minimal 32 karakter
- ✅ Semua variables di-set untuk **Production**, **Preview**, dan **Development**

### 3. Redeploy

Setelah set env vars:

```bash
# Option 1: Push ke GitHub (auto-deploy)
git add .
git commit -m "fix: add secure cookie for production"
git push origin main

# Option 2: Manual redeploy di Vercel
# Vercel Dashboard → Deployments → Redeploy
```

### 4. Test Login di Production

1. Buka URL Vercel: `https://your-app.vercel.app`
2. Go to `/login`
3. Login dengan credentials:
   - Email: `admin@kasirpro.com`
   - PIN: `9999`
4. Jika berhasil → redirect ke dashboard ✅

---

## 🐛 Troubleshooting

### Problem 1: "Email atau PIN salah" (padahal benar)

**Penyebab:**
- Database Supabase tidak bisa diakses
- `SUPABASE_SERVICE_ROLE_KEY` salah

**Solusi:**
```bash
# Check di Vercel Logs:
1. Vercel Dashboard → Deployments → Latest
2. Click "View Function Logs"
3. Cari error "Supabase" atau "Database"

# Fix:
1. Vercel Settings → Environment Variables
2. Update SUPABASE_SERVICE_ROLE_KEY dengan key yang benar
3. Redeploy
```

### Problem 2: Login berhasil tapi redirect ke login lagi

**Penyebab:**
- Cookie tidak ter-set (JWT_SECRET salah)
- Cookie settings tidak cocok

**Solusi:**
```bash
# Check JWT_SECRET:
1. Pastikan JWT_SECRET di Vercel SAMA dengan local
2. Minimal 32 karakter
3. Tidak ada spasi atau karakter aneh

# Check cookie:
1. Browser DevTools → Application → Cookies
2. Cari cookie "kasirpro_token"
3. Jika tidak ada → JWT_SECRET salah
```

### Problem 3: "Terjadi kesalahan server"

**Penyebab:**
- Environment variables tidak lengkap
- Supabase connection error

**Solusi:**
```bash
# Check Vercel Logs:
1. Vercel Dashboard → Deployments → View Function Logs
2. Cari error message detail

# Common fixes:
- Set semua env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET)
- Pastikan Supabase project aktif
- Check Supabase API keys valid
```

### Problem 4: CORS Error

**Penyebab:**
- Supabase RLS (Row Level Security) blocking

**Solusi:**
```sql
-- Di Supabase SQL Editor, disable RLS untuk development:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE shifts DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

---

## 🔍 Debug Mode

Untuk debug di production, tambahkan logging:

### Update `src/app/api/auth/login/route.ts`:

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Login attempt:', { email: body.email })
    
    // ... rest of code ...
    
    console.log('User found:', { id: user.id, role: user.role })
    console.log('Token generated:', token ? 'yes' : 'no')
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    // ... rest of code ...
  }
}
```

**View logs:**
1. Vercel Dashboard → Deployments → Latest
2. Click "View Function Logs"
3. Lihat console.log output

---

## ✅ Checklist Deployment

Sebelum deploy, pastikan:

- [ ] Environment variables sudah di-set di Vercel
- [ ] `JWT_SECRET` sama dengan local
- [ ] Supabase project aktif dan accessible
- [ ] Database sudah ada data users
- [ ] RLS disabled (untuk development)
- [ ] Cookie settings sudah include `secure: true`
- [ ] Build successful di local (`npm run build`)
- [ ] Tests passing (`npm run test`)

---

## 🎯 Quick Fix Commands

```bash
# 1. Update cookie settings (sudah dilakukan)
# File: src/app/api/auth/login/route.ts
# Added: secure: process.env.NODE_ENV === 'production'

# 2. Test build local
npm run build

# 3. Test login local
npm run dev
# Open http://localhost:3000/login

# 4. Commit & push
git add .
git commit -m "fix: add secure cookie for production deployment"
git push origin main

# 5. Wait for Vercel auto-deploy (~2 minutes)

# 6. Test di production
# Open https://your-app.vercel.app/login
```

---

## 📊 Expected Behavior

### Local (Development):
- Cookie: `httpOnly=true, secure=false, sameSite=lax`
- Works on `http://localhost:3000`

### Production (Vercel):
- Cookie: `httpOnly=true, secure=true, sameSite=lax`
- Works on `https://your-app.vercel.app`

---

## 🆘 Still Not Working?

Jika masih tidak bisa login di Vercel:

1. **Share error message** dari:
   - Browser console (F12 → Console)
   - Network tab (F12 → Network → login request)
   - Vercel Function Logs

2. **Check environment variables:**
   ```bash
   # Di Vercel Dashboard:
   Settings → Environment Variables
   
   # Pastikan ada:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - JWT_SECRET
   ```

3. **Test Supabase connection:**
   ```bash
   # Buat test endpoint:
   # src/app/api/test-db/route.ts
   
   import { supabase } from '@/lib/supabase'
   import { NextResponse } from 'next/server'
   
   export async function GET() {
     const { data, error } = await supabase
       .from('users')
       .select('count')
       .limit(1)
     
     return NextResponse.json({ 
       success: !error,
       error: error?.message,
       hasData: !!data 
     })
   }
   ```
   
   Test: `https://your-app.vercel.app/api/test-db`

---

**Need help?** Share the error message dan saya akan bantu debug! 🚀
