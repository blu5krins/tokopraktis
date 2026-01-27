import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: Request) {
  try {
    const { host, user, password, database, port } = await request.json();

    // Test connection to PostgreSQL server AND check if database exists
    const pool = new Pool({
      host,
      user,
      password,
      database,
      port: port || 5432,
      connectionTimeoutMillis: 5000
    });

    const client = await pool.connect();
    
    // Test if we can connect to the database
    await client.query('SELECT 1');
    client.release();
    await pool.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Koneksi berhasil dan database ditemukan!' 
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    let errorMessage = 'Koneksi gagal';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'PostgreSQL server tidak berjalan. Pastikan PostgreSQL aktif.';
    } else if (error.code === '28P01') {
      errorMessage = 'Username atau password salah.';
    } else if (error.code === '3D000') {
      errorMessage = 'Database belum dibuat. Silakan buat database manual terlebih dahulu di pgAdmin atau psql.';
    } else {
      errorMessage = error.message || 'Koneksi gagal';
    }

    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 400 });
  }
}
