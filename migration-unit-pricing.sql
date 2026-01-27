-- Migration untuk menambahkan fitur multi-unit dan harga hutang
-- Contoh: Rokok bisa dijual per bungkus atau per batang, dengan harga berbeda jika hutang

-- Tambah kolom unit_type (jenis satuan utama: bungkus, pcs, kg, dll)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'unit_type'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE products ADD COLUMN unit_type VARCHAR(20) DEFAULT "pcs" AFTER stock',
    'SELECT "Column unit_type already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambah kolom has_pieces (apakah bisa dijual per satuan kecil, misal per batang)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'has_pieces'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE products ADD COLUMN has_pieces TINYINT(1) DEFAULT 0 AFTER unit_type',
    'SELECT "Column has_pieces already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambah kolom pieces_per_pack (jumlah satuan kecil dalam 1 satuan besar, misal 16 batang per bungkus)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'pieces_per_pack'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE products ADD COLUMN pieces_per_pack INT DEFAULT 1 AFTER has_pieces',
    'SELECT "Column pieces_per_pack already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambah kolom price_per_piece (harga jual per satuan kecil, misal per batang)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'price_per_piece'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE products ADD COLUMN price_per_piece DECIMAL(10,2) DEFAULT 0 AFTER pieces_per_pack',
    'SELECT "Column price_per_piece already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambah kolom debt_price (harga jual jika hutang untuk satuan besar)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'debt_price'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE products ADD COLUMN debt_price DECIMAL(10,2) DEFAULT 0 AFTER price_per_piece',
    'SELECT "Column debt_price already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambah kolom debt_price_per_piece (harga hutang per satuan kecil)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'debt_price_per_piece'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE products ADD COLUMN debt_price_per_piece DECIMAL(10,2) DEFAULT 0 AFTER debt_price',
    'SELECT "Column debt_price_per_piece already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Contoh update untuk rokok:
-- UPDATE products SET 
--   unit_type = 'bungkus',
--   has_pieces = 1,
--   pieces_per_pack = 16,
--   price_per_piece = 2500,
--   debt_price = 30000,
--   debt_price_per_piece = 2500
-- WHERE name LIKE '%gudang garam%';
