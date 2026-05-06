# 🚀 Quick Start Guide - GitHub Actions

## Cara Kerja Auto-Testing

Setiap kali kamu **commit** atau **push** ke GitHub, GitHub Actions akan otomatis:

1. ✅ Install dependencies
2. ✅ Run ESLint (code quality check)
3. ✅ Run TypeScript type check
4. ✅ Run unit tests (21 tests)
5. ✅ Build Next.js application
6. ✅ Upload coverage report

**Jika ada yang gagal, commit tidak bisa di-merge!**

---

## 📋 Step-by-Step: Commit dengan Auto-Test

### 1. Buat Perubahan di Code

```bash
# Edit file yang mau diubah
code src/components/MyComponent.tsx
```

### 2. Test di Local (PENTING!)

```bash
# Run semua checks sekaligus
npm run ci-check

# Atau satu per satu:
npm run test              # Run tests
npm run lint              # Check code style
npx tsc --noEmit         # Check TypeScript
npm run build            # Test build
```

**💡 Tip:** Selalu run `npm run ci-check` sebelum commit untuk menghindari gagal di CI!

### 3. Commit Changes

```bash
# Stage files
git add .

# Commit dengan message yang jelas
git commit -m "feat: tambah fitur search produk"

# Format commit message:
# feat: untuk feature baru
# fix: untuk bugfix
# test: untuk tambah/update tests
# docs: untuk update dokumentasi
```

### 4. Push ke GitHub

```bash
# Push ke branch kamu
git push origin feature/nama-fitur

# Atau push ke main (jika sudah setup)
git push origin main
```

### 5. Lihat Status di GitHub

1. Buka repository di GitHub
2. Go to **Actions** tab
3. Lihat workflow yang sedang running
4. Tunggu sampai selesai (biasanya 2-5 menit)

**Status:**
- 🟡 **Yellow (Running)** - Tests sedang berjalan
- ✅ **Green (Success)** - Semua tests passing!
- ❌ **Red (Failed)** - Ada yang gagal, perlu diperbaiki

### 6. Jika Tests Gagal

```bash
# Lihat error di GitHub Actions logs
# Fix error di local
# Test lagi
npm run ci-check

# Commit fix
git add .
git commit -m "fix: resolve test errors"
git push origin feature/nama-fitur
```

GitHub Actions akan otomatis run lagi!

---

## 🎯 Common Commands

### Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
```

### Testing

```bash
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### Quality Checks

```bash
npm run lint             # Run ESLint
npx tsc --noEmit        # TypeScript check
npm run ci-check        # Run ALL checks (recommended!)
```

### Database

```bash
npm run seed:users       # Seed users
npm run seed:products    # Seed products
npm run check:db         # Check database connection
```

---

## 🔄 Workflow Examples

### Example 1: Tambah Feature Baru

```bash
# 1. Buat branch baru
git checkout -b feature/product-filter

# 2. Develop feature
# ... edit files ...

# 3. Test local
npm run ci-check

# 4. Commit & push
git add .
git commit -m "feat(kasir): add product category filter"
git push origin feature/product-filter

# 5. Buat Pull Request di GitHub
# 6. Wait for CI checks ✅
# 7. Merge!
```

### Example 2: Fix Bug

```bash
# 1. Buat branch
git checkout -b fix/cart-total-calculation

# 2. Fix bug
# ... edit files ...

# 3. Add test untuk bug
# ... create test file ...

# 4. Test local
npm run test
npm run ci-check

# 5. Commit & push
git add .
git commit -m "fix(cart): correct total calculation for discounts"
git push origin fix/cart-total-calculation

# 6. Create PR → Wait for CI → Merge
```

### Example 3: Update Tests

```bash
# 1. Add new tests
# ... create test files ...

# 2. Run tests
npm run test

# 3. Check coverage
npm run test:coverage

# 4. Commit
git add .
git commit -m "test(auth): add login flow tests"
git push origin main
```

---

## 🛡️ Branch Protection (Recommended)

Untuk memastikan code quality, setup branch protection:

### Setup di GitHub:

1. **Settings** → **Branches** → **Add rule**
2. Branch name: `main`
3. Enable:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
4. Select checks:
   - `Run Tests & Build`
   - `All Checks Passed`
5. **Save**

**Setelah setup:**
- ❌ Tidak bisa push langsung ke `main`
- ✅ Harus buat Pull Request
- ✅ Tests harus passing sebelum merge
- ✅ Code review required

---

## 📊 Monitoring & Debugging

### View Test Results

```bash
# Local
npm run test

# GitHub
Repository → Actions → Click workflow run → View logs
```

### View Coverage Report

```bash
# Generate coverage
npm run test:coverage

# Open coverage report
open coverage/index.html  # Mac
start coverage/index.html # Windows
```

### Debug Failing Tests

```bash
# Run specific test file
npx vitest run __tests__/path/to/test.test.ts

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run with verbose output
npx vitest run --reporter=verbose
```

---

## ⚡ Pro Tips

### 1. Pre-commit Hook (Optional)

Install Husky untuk auto-run tests sebelum commit:

```bash
npm install -D husky
npx husky init
echo "npm run ci-check" > .husky/pre-commit
```

Sekarang tests akan run otomatis setiap kali commit!

### 2. VS Code Extensions

Install extensions untuk better DX:

- **ESLint** - Real-time linting
- **Vitest** - Run tests in VS Code
- **GitHub Actions** - View workflow status

### 3. Git Aliases

Tambahkan di `~/.gitconfig`:

```ini
[alias]
  ci = "!npm run ci-check && git commit"
  pushf = "!npm run ci-check && git push"
```

Usage:
```bash
git ci -m "feat: new feature"  # Auto-run ci-check before commit
git pushf                       # Auto-run ci-check before push
```

---

## 🆘 Troubleshooting

### Tests passing local tapi gagal di CI

**Penyebab:**
- Environment variables berbeda
- Node version berbeda
- Dependencies tidak sync

**Solusi:**
```bash
# Pastikan menggunakan Node 20
node -v

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests
npm run test
```

### Build gagal di CI

**Penyebab:**
- TypeScript errors
- Missing environment variables
- Import errors

**Solusi:**
```bash
# Check TypeScript
npx tsc --noEmit

# Test build local
npm run build

# Check .env.example lengkap
```

### Workflow tidak running

**Penyebab:**
- Workflow file belum di-push
- Branch tidak match config

**Solusi:**
```bash
# Pastikan workflow files ada
ls -la .github/workflows/

# Push workflow files
git add .github/
git commit -m "ci: add GitHub Actions workflows"
git push origin main
```

---

## 📚 Next Steps

1. ✅ Push workflow files ke GitHub
2. ✅ Setup branch protection (optional tapi recommended)
3. ✅ Buat Pull Request untuk test workflow
4. ✅ Add badge ke README
5. ✅ Share dengan team!

---

**Happy coding! 🎉**

Jika ada pertanyaan, buka issue di GitHub atau contact maintainer.
