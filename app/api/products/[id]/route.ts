import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
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
      name, price, cost_price, sell_price, stock, category,
      unit_type, has_pieces, pieces_per_pack, price_per_piece, debt_price, debt_price_per_piece 
    } = body;
    
    await pool.query(
      `UPDATE products SET 
        name = ?, price = ?, cost_price = ?, sell_price = ?, stock = ?, category = ?,
        unit_type = ?, has_pieces = ?, pieces_per_pack = ?, price_per_piece = ?, debt_price = ?, debt_price_per_piece = ?
      WHERE id = ?`,
      [
        name, price || sell_price, cost_price || 0, sell_price || price, stock, category,
        unit_type || 'pcs', has_pieces || 0, pieces_per_pack || 1, price_per_piece || 0, debt_price || 0, debt_price_per_piece || 0,
        id
      ]
    );
    
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
