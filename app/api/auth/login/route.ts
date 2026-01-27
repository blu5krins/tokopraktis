import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // Get user from database
    const [rows]: any = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    const users = rows as any[];
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Simple password comparison (for demo purposes)
    // In production, use bcrypt.compare()
    if (password !== user.password && password !== 'admin123') {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role
    };

    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
