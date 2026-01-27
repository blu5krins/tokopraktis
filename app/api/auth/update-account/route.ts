import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { user_id, current_password, new_username, new_password } = await request.json();

    if (!user_id || !current_password) {
      return NextResponse.json(
        { error: 'User ID dan password saat ini harus diisi' },
        { status: 400 }
      );
    }

    // Get current user data
    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [user_id]
    );

    const users = rows as any[];
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Verify current password
    if (current_password !== user.password) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 401 }
      );
    }

    // Update username and/or password
    let updateQuery = 'UPDATE users SET ';
    const updateParams: any[] = [];
    const updates: string[] = [];

    if (new_username) {
      // Check if username already exists
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [new_username, user_id]
      );
      
      if ((existingUsers as any[]).length > 0) {
        return NextResponse.json(
          { error: 'Username sudah digunakan' },
          { status: 409 }
        );
      }

      updates.push('username = ?');
      updateParams.push(new_username);
    }

    if (new_password) {
      updates.push('password = ?');
      updateParams.push(new_password);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada perubahan yang dilakukan' },
        { status: 400 }
      );
    }

    updateQuery += updates.join(', ') + ' WHERE id = ?';
    updateParams.push(user_id);

    await db.query(updateQuery, updateParams);

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui akun' },
      { status: 500 }
    );
  }
}
