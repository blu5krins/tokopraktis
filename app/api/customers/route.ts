import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await query('SELECT * FROM customers ORDER BY name');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address } = body;
    
    const [result]: any = await query(
      'INSERT INTO customers (name, phone, address) VALUES ($1, $2, $3) RETURNING id',
      [name, phone || '', address || '']
    );
    
    return NextResponse.json({ id: result[0].id, name, phone, address });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
