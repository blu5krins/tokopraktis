-- Migration untuk menambahkan kolom payment_method ke tabel transactions

SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'transactions' 
    AND COLUMN_NAME = 'payment_method'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE transactions ADD COLUMN payment_method VARCHAR(20) DEFAULT "cash" AFTER change_amount',
    'SELECT "Column payment_method already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
