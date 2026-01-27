import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
  try {
    const { host, user, password, database } = await request.json();

    // Test connection to MySQL server AND check if database exists
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database
    });

    // Test if we can connect to the database
    await connection.ping();
    await connection.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Koneksi berhasil dan database ditemukan!' 
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    let errorMessage = 'Koneksi gagal';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'MySQL server tidak berjalan. Pastikan Laragon/XAMPP aktif.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Username atau password salah.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Database belum dibuat. Silakan buat database manual terlebih dahulu di phpMyAdmin atau MySQL.';
    } else {
      errorMessage = error.message || 'Koneksi gagal';
    }

    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 400 });
  }
}
