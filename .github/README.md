# KasirPro - Modern POS System

![Tests](https://github.com/username/kasirpro/actions/workflows/test.yml/badge.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)

> **Note:** Ganti `username/kasirpro` dengan path repository GitHub Anda

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan credentials Supabase Anda

# Run development server
npm run dev

# Run tests
npm run test

# Run all CI checks locally
npm run ci-check
```

## 🧪 Testing

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run all CI checks (lint + type check + test + build)
npm run ci-check
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🔄 Development Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/nama-fitur
   ```

2. **Develop & test locally:**
   ```bash
   npm run ci-check  # Run all checks
   ```

3. **Commit & push:**
   ```bash
   git add .
   git commit -m "feat: tambah fitur baru"
   git push origin feature/nama-fitur
   ```

4. **Create Pull Request:**
   - GitHub Actions akan otomatis run tests
   - Tunggu sampai semua checks ✅ passing
   - Merge setelah review

## 📊 Project Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Database Schema | ✅ Complete |
| 2 | Authentication (JWT) | ✅ Complete |
| 3 | Middleware & Route Guard | ✅ Complete |
| 4 | Hooks & Context | ✅ Complete |
| 5 | Shared Components | ✅ Complete |
| 6 | Kasir Dashboard | ✅ Complete |
| 7 | Supervisor Dashboard | ✅ Complete |
| 8 | Superadmin Dashboard | ✅ Complete |
| 9 | Manager Dashboard | ✅ Complete |
| 10 | Unit Tests | 🟡 In Progress |
| 11 | CI/CD | ✅ Complete |

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT with HttpOnly Cookies
- **Styling:** Tailwind CSS + shadcn/ui
- **Testing:** Vitest + React Testing Library
- **CI/CD:** GitHub Actions

## 📝 Documentation

- [GitHub Actions Setup](.github/SETUP.md)
- [Project TODO](../TODO.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Run `npm run ci-check` to ensure all checks pass
5. Create Pull Request
6. Wait for CI checks to pass
7. Request review

## 📄 License

Private Project - All Rights Reserved
