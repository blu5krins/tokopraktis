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
    
    console.log('Creating category:', { name, description });
    
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    const [result]: any = await query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id',
      [name]
    );
    
    console.log('Category created:', result[0]);
    
    return NextResponse.json({ 
      id: result[0].id, 
      name,
      message: 'Category created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ 
      error: 'Failed to create category',
      details: error.message 
    }, { status: 500 });
  }
}
