import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows]: any = await query('SELECT * FROM products WHERE id = $1', [id]);
    const products = rows as any[];
    
    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(products[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, price, cost_price, sell_price, stock, category_id,
      unit_type, has_pieces, pieces_per_pack, price_per_piece, debt_price, debt_price_per_piece 
    } = body;
    
    await query(
      `UPDATE products SET 
        name = $1, price = $2, cost_price = $3, sell_price = $4, stock = $5, category_id = $6,
        unit_type = $7, has_pieces = $8, pieces_per_pack = $9, price_per_piece = $10, debt_price = $11, debt_price_per_piece = $12
      WHERE id = $13`,
      [
        name, 
        sell_price || price || 0, 
        cost_price || 0, 
        sell_price || price || 0, 
        stock || 0, 
        category_id || null,
        unit_type || 'pcs', 
        has_pieces || false, 
        pieces_per_pack || 1, 
        price_per_piece || 0, 
        debt_price || 0, 
        debt_price_per_piece || 0,
        id
      ]
    );
    
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
