-- Migration: Add tax, service charge, discount, and EDC columns
-- Run this in Supabase SQL Editor

-- Add new columns to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS subtotal_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_charge_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_label VARCHAR(100),
ADD COLUMN IF NOT EXISTS edc_code VARCHAR(30);

-- Add product_name and tax_at_sale to transaction_items (if not exists)
-- Note: subtotal is already a generated column (price_at_sale * qty)
ALTER TABLE transaction_items
ADD COLUMN IF NOT EXISTS product_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS tax_percent_at_sale NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount INTEGER DEFAULT 0;

-- Add tax_percent per product (some products are tax-exempt)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2) DEFAULT 0;

-- Add service_charge_percent and trx_code_format to store_settings
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS service_charge_percent NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS trx_code_format VARCHAR(50) DEFAULT 'PREFIX-TIMESTAMP-RANDOM';

-- Comments for clarity
COMMENT ON COLUMN transactions.subtotal_amount IS 'Sum of all items before tax/service/discount';
COMMENT ON COLUMN transactions.tax_amount IS 'Total tax from all taxable items';
COMMENT ON COLUMN transactions.service_charge_amount IS 'Service charge calculated from subtotal after discount';
COMMENT ON COLUMN transactions.discount_amount IS 'Discount amount applied to the transaction';
COMMENT ON COLUMN transactions.discount_code IS 'Coupon code used (if any)';
COMMENT ON COLUMN transactions.discount_label IS 'Human-readable discount description';
COMMENT ON COLUMN transactions.edc_code IS 'EDC approval/reference code for non-cash payments';
COMMENT ON COLUMN products.tax_percent IS 'Tax percentage for this product (0 = tax exempt)';
COMMENT ON COLUMN transaction_items.tax_percent_at_sale IS 'Tax percent applied at time of sale';
COMMENT ON COLUMN transaction_items.tax_amount IS 'Tax amount for this line item';
COMMENT ON COLUMN store_settings.service_charge_percent IS 'Service charge percentage applied to transactions';
COMMENT ON COLUMN store_settings.trx_code_format IS 'Format for generating transaction codes: PREFIX-TIMESTAMP-RANDOM, PREFIX-DATE-RANDOM, PREFIX-RANDOM';

-- Update existing transactions to have subtotal_amount = total_amount (backward compat)
UPDATE transactions SET subtotal_amount = total_amount WHERE subtotal_amount = 0 OR subtotal_amount IS NULL;
