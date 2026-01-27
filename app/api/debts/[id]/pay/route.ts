import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = await params;
    const body = await request.json();
    const { amount } = body;
    
    // Insert payment record
    await connection.query(
      'INSERT INTO debt_payments (debt_id, amount) VALUES (?, ?)',
      [id, amount]
    );
    
    // Update debt
    await connection.query(
      'UPDATE debts SET paid_amount = paid_amount + ?, remaining_amount = remaining_amount - ? WHERE id = ?',
      [amount, amount, id]
    );
    
    // Update status if fully paid
    await connection.query(
      'UPDATE debts SET status = "paid" WHERE id = ? AND remaining_amount <= 0',
      [id]
    );
    
    await connection.commit();
    
    return NextResponse.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT * FROM debt_payments WHERE debt_id = ? ORDER BY payment_date DESC',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
