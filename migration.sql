-- Migration untuk menambahkan kolom cost_price dan sell_price ke tabel products
-- Jalankan SQL ini di database jika tabel products sudah ada

-- Cek dan tambah kolom cost_price (harga beli)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'cost_price'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE products ADD COLUMN cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER price',
    'SELECT "Column cost_price already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Cek dan tambah kolom sell_price (harga jual)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'sell_price'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE products ADD COLUMN sell_price DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER cost_price',
    'SELECT "Column sell_price already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update sell_price dengan nilai dari price untuk produk yang sudah ada (hanya jika sell_price = 0)
UPDATE products 
SET sell_price = price 
WHERE sell_price = 0 OR sell_price IS NULL;
