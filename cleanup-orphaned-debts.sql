-- Cleanup script for orphaned debts (debts with transaction_id = NULL)
-- These are created when transactions were deleted but debts weren't

-- First, check orphaned debts
SELECT * FROM debts WHERE transaction_id IS NULL;

-- Delete orphaned debts (run this after checking above)
DELETE FROM debts WHERE transaction_id IS NULL;

-- Verify cleanup
SELECT COUNT(*) as remaining_debts FROM debts;
SELECT * FROM debts;
