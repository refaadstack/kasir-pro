-- Cash Drawer Schema
-- Run this in Supabase SQL Editor

-- Add cash drawer columns to shifts table
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS opening_cash INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS closing_cash INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS expected_cash INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cash_difference INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opening_notes TEXT,
ADD COLUMN IF NOT EXISTS closing_notes TEXT;

-- Comments for clarity
COMMENT ON COLUMN shifts.opening_cash IS 'Initial cash in drawer when shift starts';
COMMENT ON COLUMN shifts.closing_cash IS 'Actual cash counted when shift ends';
COMMENT ON COLUMN shifts.expected_cash IS 'Expected cash = opening_cash + cash sales';
COMMENT ON COLUMN shifts.cash_difference IS 'Difference between actual and expected (closing - expected)';
COMMENT ON COLUMN shifts.opening_notes IS 'Notes when opening shift';
COMMENT ON COLUMN shifts.closing_notes IS 'Notes when closing shift (e.g., reason for difference)';
