-- =========================================
-- KASIRPRO LOGIN FIX - RLS ONLY (Run this!)
-- =========================================

-- Users RLS policy (allows login query)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public login policy" ON "users";
CREATE POLICY "public login policy" ON "users" 
FOR SELECT TO anon USING ("isActive" = true);

-- Products/Categories public read (POS needs)
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public categories" ON "categories";
CREATE POLICY "public categories" ON "categories" FOR SELECT TO anon USING (true);

ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public products" ON "products";
CREATE POLICY "public products" ON "products" FOR SELECT TO anon USING ("isActive" = true);

-- Demo users (safe upsert)
INSERT INTO "users" ("email", "name", "role", "pin", "isActive") VALUES
  ('owner@kasirpro.com', 'Owner', 'SUPERADMIN', '1234', true),
  ('manager@kasirpro.com', 'Manager', 'MANAGER', '1234', true),
  ('kasir1@kasirpro.com', 'Budi', 'KASIR', '1234', true)
ON CONFLICT ("email") DO UPDATE SET "pin" = EXCLUDED."pin", "isActive" = true, "updatedAt" = NOW();

-- =========================================
-- DONE! Test: owner@kasirpro.com / 1234
-- =========================================
