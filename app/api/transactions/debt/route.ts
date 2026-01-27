import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';

export async function POST(request: Request) {
  const connection = await pool.connect();
  
  try {
    await connection.query('BEGIN');
    
    const body = await request.json();
    const { items, total, payment, change, customer_id, debt_amount } = body;
    
    // Insert transaction
    const transactionResult = await connection.query(
      'INSERT INTO transactions (total, payment, change_amount, customer_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [total, payment, change, customer_id]
    );
    
    const transactionId = transactionResult.rows[0].id;
    
    // Insert transaction items and update stock
    for (const item of items) {
      await connection.query(
        'INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
        [transactionId, item.id, item.name, item.quantity, item.price, item.subtotal]
      );
      
      await connection.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.id]
      );
    }
    
    // Insert debt record
    await connection.query(
      'INSERT INTO debts (customer_id, transaction_id, amount, paid_amount, remaining_amount, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [customer_id, transactionId, total, payment, debt_amount, debt_amount > 0 ? 'unpaid' : 'paid']
    );
    
    await connection.query('COMMIT');
    
    return NextResponse.json({ 
      message: 'Debt transaction successful', 
      transactionId 
    });
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Debt transaction error:', error);
    return NextResponse.json({ error: 'Failed to process debt transaction' }, { status: 500 });
  } finally {
    connection.release();
  }
}
