import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos_warung1',
};

// GET - Get all stock purchases with product details
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        sp.*,
        p.name as product_name,
        p.category as category_name
      FROM stock_purchases sp
      LEFT JOIN products p ON sp.product_id = p.id
      ORDER BY sp.purchase_date DESC, sp.created_at DESC
    `);
    
    await connection.end();
    
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

    const connection = await mysql.createConnection(dbConfig);
    
    // Calculate total cost
    const total_cost = quantity * purchase_price;
    
    // Insert stock purchase record
    const [result] = await connection.execute(
      `INSERT INTO stock_purchases 
       (product_id, supplier_name, quantity, purchase_price, total_cost, notes, purchase_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_id, supplier_name, quantity, purchase_price, total_cost, notes || null, purchase_date]
    );
    
    // Update product stock
    await connection.execute(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity, product_id]
    );
    
    // Update product purchase_price if provided
    await connection.execute(
      'UPDATE products SET purchase_price = ? WHERE id = ?',
      [purchase_price, product_id]
    );
    
    await connection.end();
    
    return NextResponse.json({ 
      message: 'Stock purchase created successfully',
      id: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating stock purchase:', error);
    return NextResponse.json({ error: 'Failed to create stock purchase' }, { status: 500 });
  }
}
