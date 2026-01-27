-- Migration untuk menambahkan kolom payment_method ke tabel transactions - PostgreSQL Version
-- NOTE: Kolom ini sudah ada di migration-02-transactions-postgres.sql
-- File ini hanya untuk backward compatibility

-- Add payment_method column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE transactions ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cash';
    END IF;
END $$;
