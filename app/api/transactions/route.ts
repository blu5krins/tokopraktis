import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const body = await request.json();
    const { items, total, payment, change, customer_id, payment_method } = body;
    
    // Calculate total from items
    const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    
    // Generate transaction code
    const transactionCode = `TRX${Date.now()}`;
    
    // Insert transaction
    const [transactionResult] = await connection.query(
      'INSERT INTO transactions (transaction_code, total_amount, grand_total, payment_amount, change_amount, customer_id, payment_method, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionCode, total || calculatedTotal, total || calculatedTotal, payment, change, customer_id, payment_method || 'cash', 1]
    );
    
    const transactionId = (transactionResult as any).insertId;
    
    // Insert transaction items and update stock
    for (const item of items) {
      await connection.query(
        'INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [transactionId, item.id, item.name, item.quantity, item.price, item.subtotal]
      );
      
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }
    
    await connection.commit();
    
    return NextResponse.json({ 
      message: 'Transaction successful', 
      transactionId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*, 
        c.name as customer_name,
        CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END as is_debt
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN debts d ON d.transaction_id = t.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `);
    
    // Fetch items for each transaction
    const transactionsWithItems = await Promise.all(
      (rows as any[]).map(async (transaction) => {
        const [items] = await pool.query(
          'SELECT product_name, quantity, price, subtotal FROM transaction_items WHERE transaction_id = ?',
          [transaction.id]
        );
        return { ...transaction, items };
      })
    );
    
    return NextResponse.json(transactionsWithItems);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
