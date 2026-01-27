import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await query('SELECT * FROM categories ORDER BY name');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    const [result]: any = await query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
      [name, description]
    );
    
    return NextResponse.json({ id: result[0].id, name, description });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
