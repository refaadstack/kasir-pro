# Contributing Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 20 atau lebih baru
- npm atau yarn
- Git
- Supabase account (untuk database)

### Setup Development Environment

1. **Clone repository:**
   ```bash
   git clone https://github.com/username/kasirpro.git
   cd kasirpro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` dan isi dengan credentials Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret_min_32_chars
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

## 🔄 Development Workflow

### 1. Create Feature Branch

Selalu buat branch baru untuk setiap feature atau bugfix:

```bash
# Untuk feature baru
git checkout -b feature/nama-fitur

# Untuk bugfix
git checkout -b fix/nama-bug

# Untuk improvement
git checkout -b improve/nama-improvement
```

### 2. Make Changes

- Write clean, readable code
- Follow TypeScript best practices
- Add comments untuk logic yang kompleks
- Update tests jika diperlukan

### 3. Test Locally

**PENTING:** Selalu test sebelum commit!

```bash
# Run all checks (recommended)
npm run ci-check

# Atau run satu per satu:
npm run lint              # Check code style
npx tsc --noEmit         # Check TypeScript errors
npm run test             # Run unit tests
npm run build            # Test build
```

### 4. Commit Changes

Gunakan conventional commit format:

```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(kasir): add product search functionality"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "test(cart): add cart context tests"
git commit -m "docs: update README with setup instructions"
git commit -m "refactor(api): simplify transaction endpoint"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Code style changes (formatting, etc)
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### 5. Push to GitHub

```bash
git push origin feature/nama-fitur
```

**GitHub Actions akan otomatis:**
- ✅ Run ESLint
- ✅ Run TypeScript type check
- ✅ Run unit tests
- ✅ Build Next.js app
- ✅ Generate coverage report

### 6. Create Pull Request

1. Go to GitHub repository
2. Click **"New Pull Request"**
3. Select your branch
4. Fill in PR template:
   - **Title:** Clear, descriptive title
   - **Description:** What changes were made and why
   - **Testing:** How to test the changes
   - **Screenshots:** If UI changes

5. Wait for CI checks to complete
6. Request review from team members

### 7. Address Review Comments

- Make requested changes
- Push updates to same branch
- CI will automatically re-run

### 8. Merge

Once approved and all checks pass:
- Click **"Merge Pull Request"**
- Delete branch after merge

## 🧪 Testing Guidelines

### Writing Tests

Tests harus ditulis untuk:
- ✅ New features
- ✅ Bug fixes
- ✅ Complex logic
- ✅ API endpoints
- ✅ React components with logic

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should do something specific', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx vitest run __tests__/path/to/test.test.ts
```

### Test Coverage Goals

- **Minimum:** 70% coverage
- **Target:** 80%+ coverage
- **Critical paths:** 100% coverage (auth, payments, transactions)

## 📝 Code Style Guidelines

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  role: 'KASIR' | 'SUPERVISOR' | 'MANAGER' | 'SUPERADMIN'
}

function getUser(id: string): Promise<User | null> {
  // Implementation
}

// ❌ Bad
function getUser(id: any): any {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// ❌ Bad - No types
export function Button({ label, onClick, disabled }) {
  // ...
}
```

### Naming Conventions

- **Components:** PascalCase (`ProductCard`, `CartPanel`)
- **Functions:** camelCase (`getUserById`, `calculateTotal`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_ITEMS`, `API_URL`)
- **Files:** kebab-case (`product-card.tsx`, `use-cart.ts`)

### File Organization

```
src/
├── app/                    # Next.js pages
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   └── [feature]/         # Feature-specific components
├── context/               # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utilities & helpers
│   ├── db/               # Database queries
│   └── utils/            # Helper functions
└── types/                # TypeScript types
```

## 🐛 Debugging

### Common Issues

**1. Tests failing locally:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run test
```

**2. Build errors:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next
npm run build
```

**3. Environment variables not working:**
- Pastikan `.env.local` ada dan terisi
- Restart dev server setelah update env vars
- Check variable names (harus `NEXT_PUBLIC_` untuk client-side)

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Getting Help

- **Questions?** Open a GitHub Discussion
- **Bug?** Open a GitHub Issue
- **Feature request?** Open a GitHub Issue with `enhancement` label

## ✅ Checklist Before PR

- [ ] Code follows style guidelines
- [ ] All tests passing (`npm run test`)
- [ ] TypeScript has no errors (`npx tsc --noEmit`)
- [ ] Build successful (`npm run build`)
- [ ] Added/updated tests for changes
- [ ] Updated documentation if needed
- [ ] Commit messages follow conventional format
- [ ] No console.log statements left in code
- [ ] Tested in browser (if UI changes)

---

**Thank you for contributing! 🎉**
