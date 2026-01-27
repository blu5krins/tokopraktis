import mysql from 'mysql2/promise';

// Default configuration - will be replaced by setup installer
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'pos_warung',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
