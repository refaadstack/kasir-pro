-- =========================================
-- KASIRPRO DATABASE SCHEMA
-- =========================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- ENUM TYPES
-- =========================================
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'MANAGER', 'KASIR');
CREATE TYPE "PaymentMethod" AS ENUM ('TUNAI', 'QRIS', 'TRANSFER');
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'VOID');

-- =========================================
-- TABLES
-- =========================================

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"          TEXT,
  "email"         TEXT NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  "role"          "Role" NOT NULL DEFAULT 'KASIR',
  "phone"         TEXT,
  "pin"           TEXT,
  "isActive"      BOOLEAN NOT NULL DEFAULT true,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- Categories
CREATE TABLE IF NOT EXISTS "categories" (
  "id"    TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"  TEXT NOT NULL,
  "emoji" TEXT NOT NULL DEFAULT '📦',
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "categories_name_key" UNIQUE ("name")
);

-- Products
CREATE TABLE IF NOT EXISTS "products" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"       TEXT NOT NULL,
  "sku"        TEXT NOT NULL,
  "price"      FLOAT8 NOT NULL,
  "stock"      INTEGER NOT NULL DEFAULT 0,
  "categoryId" TEXT,
  "imageUrl"   TEXT,
  "emoji"      TEXT NOT NULL DEFAULT '📦',
  "isActive"   BOOLEAN NOT NULL DEFAULT true,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "products_sku_key" UNIQUE ("sku")
);

-- Shifts
CREATE TABLE IF NOT EXISTS "shifts" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "shiftId"     TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "startTime"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "endTime"     TIMESTAMPTZ,
  "openingCash" FLOAT8,
  "closingCash" FLOAT8,
  "totalSales"  FLOAT8 NOT NULL DEFAULT 0,
  CONSTRAINT "shifts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "shifts_shiftId_key" UNIQUE ("shiftId")
);

-- Transactions
CREATE TABLE IF NOT EXISTS "transactions" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "trxId"         TEXT NOT NULL,
  "userId"        TEXT NOT NULL,
  "shiftId"       TEXT,
  "totalAmount"   FLOAT8 NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  "cashReceived"  FLOAT8,
  "change"        FLOAT8,
  "status"        "TransactionStatus" NOT NULL DEFAULT 'SUCCESS',
  "voidReason"    TEXT,
  "voidBy"        TEXT,
  "voidAt"        TIMESTAMPTZ,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "transactions_trxId_key" UNIQUE ("trxId")
);

-- Transaction Items
CREATE TABLE IF NOT EXISTS "transaction_items" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "transactionId" TEXT NOT NULL,
  "productId"     TEXT NOT NULL,
  "qty"           INTEGER NOT NULL,
  "priceAtSale"   FLOAT8 NOT NULL,
  CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL,
  "action"    TEXT NOT NULL,
  "detail"    TEXT NOT NULL,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Store Settings
CREATE TABLE IF NOT EXISTS "store_settings" (
  "id"            TEXT NOT NULL,
  "storeName"     TEXT NOT NULL DEFAULT 'KasirPro',
  "logoUrl"       TEXT,
  "taxPercent"    FLOAT8 NOT NULL DEFAULT 0,
  "receiptPrefix" TEXT NOT NULL DEFAULT 'TRX',
  CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- =========================================
-- FOREIGN KEYS
-- =========================================
ALTER TABLE "products"
  ADD CONSTRAINT "products_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shifts"
  ADD CONSTRAINT "shifts_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_shiftId_fkey"
  FOREIGN KEY ("shiftId") REFERENCES "shifts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transaction_items"
  ADD CONSTRAINT "transaction_items_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "transactions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transaction_items"
  ADD CONSTRAINT "transaction_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- =========================================
-- SEED DATA
-- =========================================

-- Store settings
INSERT INTO "store_settings" ("id", "storeName", "taxPercent", "receiptPrefix")
VALUES ('default', 'KasirPro Demo', 0, 'TRX')
ON CONFLICT ("id") DO NOTHING;

-- Categories
INSERT INTO "categories" ("name", "emoji") VALUES
  ('Makanan', '🍱'),
  ('Minuman', '🥤'),
  ('Snack', '🍿'),
  ('Rokok', '📦')
ON CONFLICT ("name") DO NOTHING;

-- Users
INSERT INTO "users" ("name", "email", "role", "pin", "isActive") VALUES
  ('Owner',   'owner@kasirpro.com',   'SUPERADMIN', '1234', true),
  ('Manager', 'manager@kasirpro.com', 'MANAGER',    '1234', true),
  ('Budi S.', 'kasir1@kasirpro.com',  'KASIR',      '1234', true),
  ('Sari M.', 'kasir2@kasirpro.com',  'KASIR',      '1234', true)
ON CONFLICT ("email") DO NOTHING;

-- Products
INSERT INTO "products" ("name", "sku", "price", "stock", "categoryId", "emoji")
SELECT 'Nasi Goreng Spesial', 'MKN-001', 18000, 50, id, '🍳' FROM "categories" WHERE "name" = 'Makanan'
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("name", "sku", "price", "stock", "categoryId", "emoji")
SELECT 'Mie Ayam Bakso', 'MKN-002', 15000, 40, id, '🍜' FROM "categories" WHERE "name" = 'Makanan'
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("name", "sku", "price", "stock", "categoryId", "emoji")
SELECT 'Ayam Geprek', 'MKN-003', 20000, 35, id, '🍗' FROM "categories" WHERE "name" = 'Makanan'
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("name", "sku", "price", "stock", "categoryId", "emoji")
SELECT 'Es Teh Manis', 'MNM-001', 5000, 100, id, '🍵' FROM "categories" WHERE "name" = 'Minuman'
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("name", "sku", "price", "stock", "categoryId", "emoji")
SELECT 'Es Jeruk', 'MNM-002', 6000, 80, id, '🍊' FROM "categories" WHERE "name" = 'Minuman'
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("name", "sku", "price", "stock", "categoryId", "emoji")
SELECT 'Chitato 68g', 'SNK-001', 12000, 45, id, '🥔' FROM "categories" WHERE "name" = 'Snack'
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("name", "sku", "price", "stock", "categoryId", "emoji")
SELECT 'Sampoerna Mild 16', 'RKK-001', 30000, 100, id, '📦' FROM "categories" WHERE "name" = 'Rokok'
ON CONFLICT ("sku") DO NOTHING;