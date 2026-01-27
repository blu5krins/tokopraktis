import { Pool } from 'pg';

// Support both DATABASE_URL (Supabase/Neon) and individual env vars (local PostgreSQL)
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        // Supabase-specific settings
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'pos_warung',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        max: 10,
      }
);

// Helper to convert MySQL-style execute to PostgreSQL query
export async function query(sql: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return [result.rows, result.fields || []];
  } finally {
    client.release();
  }
}

export default pool;
