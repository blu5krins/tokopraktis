import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await query('SELECT * FROM products ORDER BY name');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, price, cost_price, sell_price, stock, category_id,
      unit_type, has_pieces, pieces_per_pack, price_per_piece, debt_price, debt_price_per_piece 
    } = body;
    
    console.log('Creating product:', { name, category_id, price: sell_price || price });
    
    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    
    const [result]: any = await query(
      `INSERT INTO products (
        name, price, cost_price, sell_price, stock, category_id,
        unit_type, has_pieces, pieces_per_pack, price_per_piece, debt_price, debt_price_per_piece
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
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
        debt_price_per_piece || 0
      ]
    );
    
    console.log('Product created:', result[0]);
    
    return NextResponse.json({ 
      id: result[0].id, 
      name,
      message: 'Product created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error.message 
    }, { status: 500 });
  }
}
