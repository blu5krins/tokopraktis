import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const connection = await pool.connect();
  
  try {
    await connection.query('BEGIN');
    
    const { id } = await params;
    const body = await request.json();
    const { amount } = body;
    
    // Insert payment record
    await connection.query(
      'INSERT INTO debt_payments (debt_id, amount) VALUES ($1, $2)',
      [id, amount]
    );
    
    // Update debt
    await connection.query(
      'UPDATE debts SET paid_amount = paid_amount + $1, remaining_amount = remaining_amount - $2 WHERE id = $3',
      [amount, amount, id]
    );
    
    // Update status if fully paid
    await connection.query(
      'UPDATE debts SET status = $1 WHERE id = $2 AND remaining_amount <= 0',
      ['paid', id]
    );
    
    await connection.query('COMMIT');
    
    return NextResponse.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    await connection.query('ROLLBACK');
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
    const [rows]: any = await query(
      'SELECT * FROM debt_payments WHERE debt_id = $1 ORDER BY payment_date DESC',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
