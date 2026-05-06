# 🧪 Local Testing Guide (Tanpa GitHub Actions)

Karena GitHub Actions tidak bisa digunakan, kita akan run semua tests di local sebelum push.

---

## 🚀 Quick Commands

```bash
# Run ALL checks sebelum commit
npm run ci-check

# Atau run satu per satu:
npm run lint -- --max-warnings=100  # Code quality
npx tsc --noEmit                    # Type check
npm run test                        # Unit tests
npm run build                       # Build check
```

---

## 📋 Development Workflow (Tanpa CI/CD)

### 1. Develop Feature

```bash
# Buat branch baru
git checkout -b feature/nama-fitur

# Develop...
# Edit files...
```

### 2. Test Local (PENTING!)

```bash
# Run all checks
npm run ci-check

# Jika ada error, fix dulu sebelum commit!
```

### 3. Commit & Push

```bash
# Stage files
git add .

# Commit
git commit -m "feat: tambah fitur baru"

# Push
git push origin feature/nama-fitur
```

### 4. Merge (Manual)

```bash
# Checkout ke main
git checkout main

# Merge feature branch
git merge feature/nama-fitur

# Push ke main
git push origin main
```

---

## ✅ Pre-Commit Checklist

Sebelum setiap commit, pastikan:

- [ ] `npm run lint -- --max-warnings=100` ✅ passing
- [ ] `npx tsc --noEmit` ✅ no errors
- [ ] `npm run test` ✅ all tests passing
- [ ] `npm run build` ✅ build successful
- [ ] Manual test di browser ✅ works

---

## 🎯 Testing Commands Detail

### 1. ESLint (Code Quality)

```bash
# Run ESLint
npm run lint

# With max warnings
npm run lint -- --max-warnings=100

# Fix auto-fixable issues
npm run lint -- --fix

# Check specific file
npx eslint src/path/to/file.tsx
```

**Expected:** 73 warnings, 0 errors

### 2. TypeScript Type Check

```bash
# Check all TypeScript errors
npx tsc --noEmit

# Watch mode (auto-check on save)
npx tsc --noEmit --watch
```

**Expected:** No errors

### 3. Unit Tests

```bash
# Run all tests
npm run test

# Watch mode (auto-run on changes)
npm run test:watch

# With coverage
npm run test:coverage

# Run specific test file
npx vitest run __tests__/lib/jwt.test.ts

# Run tests matching pattern
npx vitest run -t "should sign token"
```

**Expected:** 21/21 tests passing

### 4. Build Check

```bash
# Build for production
npm run build

# Check build output
ls -la .next/

# Test production build locally
npm run build && npm run start
```

**Expected:** 44 routes compiled successfully

---

## 🔄 Automated Pre-Commit Hook (Optional)

Install Husky untuk auto-run tests sebelum commit:

### Setup:

```bash
# Install Husky
npm install -D husky

# Initialize
npx husky init

# Add pre-commit hook
echo "npm run ci-check" > .husky/pre-commit

# Make executable (Linux/Mac)
chmod +x .husky/pre-commit
```

### Usage:

Sekarang setiap kali `git commit`, akan otomatis run `npm run ci-check`!

```bash
git add .
git commit -m "feat: new feature"
# → Automatically runs ci-check
# → If fails, commit is blocked
# → If passes, commit succeeds
```

---

## 📊 Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
# Windows:
start coverage/index.html

# Mac:
open coverage/index.html

# Linux:
xdg-open coverage/index.html
```

**Coverage Goals:**
- Lines: 70%+
- Statements: 70%+
- Functions: 70%+
- Branches: 60%+

---

## 🐛 Debugging Tests

### Debug Failing Tests:

```bash
# Run with verbose output
npx vitest run --reporter=verbose

# Run specific test file
npx vitest run __tests__/components/ui/PinPad.test.tsx

# Run in watch mode (auto-rerun)
npm run test:watch

# Run with UI (interactive)
npx vitest --ui
```

### Debug in VS Code:

1. Install **Vitest** extension
2. Open test file
3. Click "Run Test" button di gutter
4. Set breakpoints
5. Debug interactively

---

## 🎨 Code Quality Tips

### Fix Common Issues:

**1. Unused Variables:**
```typescript
// ❌ Bad
import { Button } from './button'
// Button not used

// ✅ Good
// Remove unused import
```

**2. Missing Dependencies in useEffect:**
```typescript
// ❌ Bad
useEffect(() => {
  fetchData()
}, []) // Missing fetchData dependency

// ✅ Good
useEffect(() => {
  fetchData()
}, [fetchData])

// Or use useCallback:
const fetchData = useCallback(() => {
  // ...
}, [])
```

**3. Explicit Any:**
```typescript
// ❌ Bad
function handleClick(e: any) { }

// ✅ Good
function handleClick(e: React.MouseEvent<HTMLButtonElement>) { }
```

---

## 📝 Git Workflow (Tanpa CI/CD)

### Branch Strategy:

```
main          ← production (stable)
  ↑
develop       ← development (testing)
  ↑
feature/*     ← feature branches
```

### Workflow:

```bash
# 1. Create feature branch
git checkout -b feature/product-search

# 2. Develop & test
npm run ci-check

# 3. Commit
git add .
git commit -m "feat(kasir): add product search"

# 4. Push
git push origin feature/product-search

# 5. Merge to develop (manual)
git checkout develop
git merge feature/product-search
npm run ci-check  # Test again!
git push origin develop

# 6. Merge to main (when ready)
git checkout main
git merge develop
npm run ci-check  # Final test!
git push origin main
```

---

## 🚀 Deployment Workflow

### Before Deploy to Vercel:

```bash
# 1. Run all checks
npm run ci-check

# 2. Test build
npm run build

# 3. Test production locally
npm run start
# Open http://localhost:3000

# 4. If all good, push to main
git push origin main

# 5. Vercel will auto-deploy
# Wait ~2 minutes

# 6. Test production
# Open https://your-app.vercel.app
```

---

## 📊 Status Dashboard (Manual)

Buat file `STATUS.md` untuk track status:

```markdown
# Project Status

Last Updated: 2026-05-06

## Tests
- ✅ Unit Tests: 21/21 passing
- ✅ TypeScript: No errors
- ⚠️  ESLint: 73 warnings

## Build
- ✅ Local Build: Success (44 routes)
- ✅ Vercel Deploy: Success
- ✅ Production: Working

## Features
- ✅ Kasir Dashboard
- ✅ Supervisor Dashboard
- ✅ Manager Dashboard
- ✅ Superadmin Dashboard

## Known Issues
- None

## Next Steps
- [ ] Fix ESLint warnings
- [ ] Add more tests
- [ ] Improve coverage
```

---

## 🎯 Daily Checklist

Setiap hari sebelum mulai coding:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if updated)
npm install

# 3. Run tests
npm run test

# 4. Start dev server
npm run dev
```

Setiap hari sebelum selesai coding:

```bash
# 1. Run all checks
npm run ci-check

# 2. Commit changes
git add .
git commit -m "feat: what you did today"

# 3. Push
git push origin main
```

---

## 🆘 Troubleshooting

### Tests Failing:

```bash
# Clear cache
rm -rf node_modules .next
npm install

# Run tests
npm run test
```

### Build Failing:

```bash
# Check TypeScript errors
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next
npm run build
```

### Lint Errors:

```bash
# Auto-fix
npm run lint -- --fix

# Check specific file
npx eslint src/path/to/file.tsx --fix
```

---

**Happy coding! 🎉**

Remember: **Always run `npm run ci-check` before pushing!**
