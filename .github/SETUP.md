# GitHub Actions Setup Guide

## 📋 Cara Setup GitHub Actions untuk Auto-Testing

### 1. Push Workflow Files ke GitHub

Workflow files sudah dibuat di `.github/workflows/`:
- `test.yml` - Menjalankan test, lint, type check, dan build
- `pr-check.yml` - Quality check untuk Pull Request

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflows for automated testing"
git push origin main
```

### 2. Setup Branch Protection Rules (Recommended)

Untuk memastikan code hanya bisa di-merge kalau test passing:

1. Buka repository di GitHub
2. Go to **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Branch name pattern: `main`
5. Enable:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
6. Search dan pilih status checks:
   - `Run Tests & Build`
   - `All Checks Passed`
7. Click **Create**

### 3. Setup Repository Secrets (untuk Production)

Jika ingin test dengan database real di CI:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Tambahkan secrets:
   - `JWT_SECRET` - JWT secret key (min 32 karakter)
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

Lalu update workflow file untuk menggunakan secrets:

```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### 4. Workflow Development Strategy

#### Branch Strategy:
```
main          ← production (protected, auto-deploy)
  ↑
develop       ← development (merge dari feature)
  ↑
feature/*     ← feature branches
```

#### Development Flow:

1. **Buat feature branch:**
   ```bash
   git checkout -b feature/nama-fitur
   ```

2. **Develop & commit:**
   ```bash
   git add .
   git commit -m "feat: tambah fitur baru"
   ```

3. **Push ke GitHub:**
   ```bash
   git push origin feature/nama-fitur
   ```

4. **Buat Pull Request:**
   - GitHub akan otomatis menjalankan tests
   - Tunggu sampai semua checks ✅ hijau
   - Review code
   - Merge ke `develop` atau `main`

### 5. Cara Kerja Workflows

#### `test.yml` - Triggered on:
- Push ke branch `main` atau `develop`
- Pull Request ke `main` atau `develop`

**Steps:**
1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run ESLint
5. ✅ TypeScript type check
6. ✅ Run unit tests
7. ✅ Build Next.js app
8. ✅ Upload coverage report

#### `pr-check.yml` - Triggered on:
- Pull Request opened/updated

**Steps:**
1. ✅ Check for console.log (warning)
2. ✅ Run tests with coverage
3. ✅ Comment PR with test results

### 6. Local Testing Sebelum Push

Untuk memastikan tests passing sebelum push:

```bash
# Run all checks locally
npm run lint              # ESLint
npx tsc --noEmit         # Type check
npm run test             # Unit tests
npm run build            # Build check

# Atau buat script di package.json:
npm run ci-check
```

Tambahkan script di `package.json`:
```json
{
  "scripts": {
    "ci-check": "npm run lint && npx tsc --noEmit && npm run test && npm run build"
  }
}
```

### 7. Monitoring Workflows

- **View workflow runs:** Repository → **Actions** tab
- **Check status:** Setiap commit akan ada badge status (✅ atau ❌)
- **View logs:** Click pada workflow run untuk detail logs
- **Download artifacts:** Coverage reports tersedia di artifacts

### 8. Troubleshooting

#### Tests gagal di CI tapi passing di local:
- Pastikan environment variables sama
- Check Node.js version (CI pakai v20)
- Pastikan `npm ci` digunakan (bukan `npm install`)

#### Build gagal di CI:
- Check `.env.example` sudah lengkap
- Pastikan semua dependencies ada di `package.json`
- Test build locally: `npm run build`

#### Type check gagal:
- Run locally: `npx tsc --noEmit`
- Fix semua TypeScript errors

### 9. Badge Status (Optional)

Tambahkan badge di README.md:

```markdown
![Tests](https://github.com/username/kasirpro/actions/workflows/test.yml/badge.svg)
```

Ganti `username/kasirpro` dengan repository path Anda.

---

## 🎯 Best Practices

1. **Selalu run tests local sebelum push**
2. **Buat PR untuk setiap feature** (jangan push langsung ke main)
3. **Tunggu CI checks selesai** sebelum merge
4. **Review coverage report** untuk memastikan code ter-test dengan baik
5. **Fix failing tests immediately** - jangan merge code yang gagal test

---

## 📊 Expected Results

Setelah setup, setiap commit akan:
- ✅ Automatically run tests
- ✅ Check code quality (lint + type check)
- ✅ Verify build success
- ✅ Generate coverage report
- ✅ Block merge jika ada yang gagal (dengan branch protection)

**Workflow duration:** ~2-5 menit per run
