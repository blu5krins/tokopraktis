import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';

// GET - Get all stock purchases with product details
export async function GET() {
  try {
    const [rows]: any = await query(`
      SELECT 
        sp.*,
        p.name as product_name,
        c.name as category_name
      FROM stock_purchases sp
      LEFT JOIN products p ON sp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY sp.purchase_date DESC, sp.created_at DESC
    `);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching stock purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch stock purchases' }, { status: 500 });
  }
}

// POST - Create new stock purchase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, supplier_name, quantity, purchase_price, notes, purchase_date } = body;
    
    if (!product_id || !supplier_name || !quantity || !purchase_price || !purchase_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate total cost
    const total_cost = quantity * purchase_price;
    
    // Insert stock purchase record
    const [result]: any = await query(
      `INSERT INTO stock_purchases 
       (product_id, supplier_name, quantity, purchase_price, total_cost, notes, purchase_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [product_id, supplier_name, quantity, purchase_price, total_cost, notes || null, purchase_date]
    );
    
    // Update product stock
    await query(
      'UPDATE products SET stock = stock + $1 WHERE id = $2',
      [quantity, product_id]
    );
    
    // Update product purchase_price if provided
    await query(
      'UPDATE products SET purchase_price = $1 WHERE id = $2',
      [purchase_price, product_id]
    );
    
    return NextResponse.json({ 
      message: 'Stock purchase created successfully',
      id: result[0].id 
    });
  } catch (error) {
    console.error('Error creating stock purchase:', error);
    return NextResponse.json({ error: 'Failed to create stock purchase' }, { status: 500 });
  }
}
