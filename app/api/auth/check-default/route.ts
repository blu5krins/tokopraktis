import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check if admin password is still default (admin123)
    const [rows]: any = await query(
      'SELECT password FROM users WHERE username = $1',
      ['admin']
    );

    const users = rows as any[];
    
    if (users.length === 0) {
      return NextResponse.json({ isDefault: false });
    }

    const isDefault = users[0].password === 'admin123';

    return NextResponse.json({ isDefault });
  } catch (error) {
    console.error('Error checking password status:', error);
    return NextResponse.json({ isDefault: false }, { status: 500 });
  }
}
