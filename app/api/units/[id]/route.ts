import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description } = body;
    const { id } = params;
    
    if (!name) {
      return NextResponse.json({ error: 'Unit name is required' }, { status: 400 });
    }
    
    await query(
      'UPDATE units SET name = $1, description = $2 WHERE id = $3',
      [name, description || null, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating unit:', error);
    
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Unit name already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await query('DELETE FROM units WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting unit:', error);
    
    // Handle foreign key constraint
    if (error.code === '23503') {
      return NextResponse.json({ 
        error: 'Cannot delete unit that is being used by products' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 });
  }
}
