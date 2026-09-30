# 💰 Kasir Pro

&gt; **SaaS POS system for Indonesian UMKM — from manual bookkeeping to digital transactions.**

## The Problem
Small businesses (UMKM) around me still record transactions manually. They need affordable, easy-to-use POS that just works.

## What I Built
A SaaS POS where UMKM owners can:
- Set up their store in minutes
- Manage products and inventory
- Print receipts automatically
- Handle multiple user roles (kasir, supervisor, manager, superadmin)

## Key Features
- 🏪 Multi-tenant architecture
- 🖨️ Printer integration
- 📊 Role-based dashboards (Kasir, Supervisor, Manager, Superadmin)
- 💳 Subscription-ready billing structure

## Tech Stack
- **Next.js 14 (App Router)** — framework
- **TypeScript** — type-safe development
- **MySQL + Prisma ORM** — database (self-hosted)
- **Tailwind CSS + shadcn/ui** — styling
- **JWT with HttpOnly Cookies** — authentication
- **Midtrans via refaadstack payment-service** — subscription billing
- **Vitest + React Testing Library** — testing
- **Docker + Cloudflare Tunnel** — deployment

## Project Status

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

## What I Learned
- SaaS architecture and multi-tenancy patterns
- Modern React patterns (App Router, Server Components)
- CI/CD with GitHub Actions
- Type-safe development with TypeScript

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Isi DATABASE_URL (MySQL), JWT_SECRET, PAYMENT_*, CLOUDMAIL_*

# Sinkronkan schema ke database
npm run db:push

# Seed data demo
npm run seed

# Run development server
npm run dev