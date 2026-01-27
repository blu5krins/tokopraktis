-- Migration untuk menambahkan fitur multi-unit dan harga hutang - PostgreSQL Version
-- Contoh: Rokok bisa dijual per bungkus atau per batang, dengan harga berbeda jika hutang

-- Add columns if not exist using DO block
DO $$ 
BEGIN
    -- unit_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'unit_type'
    ) THEN
        ALTER TABLE products ADD COLUMN unit_type VARCHAR(20) DEFAULT 'pcs';
    END IF;

    -- has_pieces column  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'has_pieces'
    ) THEN
        ALTER TABLE products ADD COLUMN has_pieces BOOLEAN DEFAULT FALSE;
    END IF;

    -- pieces_per_pack column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'pieces_per_pack'
    ) THEN
        ALTER TABLE products ADD COLUMN pieces_per_pack INT DEFAULT 1;
    END IF;

    -- price_per_piece column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'price_per_piece'
    ) THEN
        ALTER TABLE products ADD COLUMN price_per_piece DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- debt_price column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'debt_price'
    ) THEN
        ALTER TABLE products ADD COLUMN debt_price DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- debt_price_per_piece column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'debt_price_per_piece'
    ) THEN
        ALTER TABLE products ADD COLUMN debt_price_per_piece DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Contoh update untuk rokok:
-- UPDATE products SET 
--   unit_type = 'bungkus',
--   has_pieces = TRUE,
--   pieces_per_pack = 16,
--   price_per_piece = 2500,
--   debt_price = 30000,
--   debt_price_per_piece = 2500
-- WHERE name LIKE '%gudang garam%';
