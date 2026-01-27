import mysql from 'mysql2/promise';

// Support both DATABASE_URL (Vercel/PlanetScale) and individual env vars (local)
const pool = process.env.DATABASE_URL 
  ? mysql.createPool(process.env.DATABASE_URL) // PlanetScale connection string
  : mysql.createPool({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'pos_warung',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

export default pool;
