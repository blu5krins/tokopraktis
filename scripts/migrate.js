// Script untuk menjalankan migration database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const runMigration = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pos_warung',
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true
  });

  try {
    console.log('🔄 Memulai migration...');

    // Cek apakah kolom cost_price sudah ada
    const [costPriceCheck] = await connection.query(
      `SELECT COUNT(*) as count 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'products' 
       AND COLUMN_NAME = 'cost_price'`
    );

    if (costPriceCheck[0].count === 0) {
      console.log('➕ Menambahkan kolom cost_price...');
      await connection.query(
        'ALTER TABLE products ADD COLUMN cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER price'
      );
      console.log('✅ Kolom cost_price berhasil ditambahkan');
    } else {
      console.log('ℹ️  Kolom cost_price sudah ada');
    }

    // Cek apakah kolom sell_price sudah ada
    const [sellPriceCheck] = await connection.query(
      `SELECT COUNT(*) as count 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'products' 
       AND COLUMN_NAME = 'sell_price'`
    );

    if (sellPriceCheck[0].count === 0) {
      console.log('➕ Menambahkan kolom sell_price...');
      await connection.query(
        'ALTER TABLE products ADD COLUMN sell_price DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER cost_price'
      );
      console.log('✅ Kolom sell_price berhasil ditambahkan');
    } else {
      console.log('ℹ️  Kolom sell_price sudah ada');
    }

    // Update sell_price dari price untuk data yang sudah ada
    console.log('🔄 Update sell_price dari price...');
    const [updateResult] = await connection.query(
      'UPDATE products SET sell_price = price WHERE sell_price = 0 OR sell_price IS NULL'
    );
    console.log(`✅ ${updateResult.affectedRows} produk diupdate`);

    console.log('✅ Migration selesai!');
  } catch (error) {
    console.error('❌ Migration gagal:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

runMigration()
  .then(() => {
    console.log('👍 Semua migration berhasil dijalankan');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
