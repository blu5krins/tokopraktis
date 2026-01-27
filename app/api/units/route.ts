import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await query('SELECT * FROM units ORDER BY name');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Unit name is required' }, { status: 400 });
    }
    
    const [result]: any = await query(
      'INSERT INTO units (name, description) VALUES ($1, $2) RETURNING id',
      [name, description || null]
    );
    
    return NextResponse.json({ success: true, id: result[0].id }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating unit:', error);
    
    // Handle duplicate unit name
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Unit name already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 });
  }
}
