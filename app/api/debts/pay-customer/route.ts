import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';

export async function POST(request: Request) {
  const connection = await pool.connect();
  
  try {
    await connection.query('BEGIN');
    
    const { customer_id, amount } = await request.json();
    
    if (!customer_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Get all unpaid debts for this customer, ordered by created date (oldest first)
    const debtsResult = await connection.query(
      `SELECT * FROM debts 
       WHERE customer_id = $1 AND remaining_amount > 0 
       ORDER BY created_at ASC`,
      [customer_id]
    );
    const debts = debtsResult.rows;

    let remainingPayment = amount;
    
    // Distribute payment across debts (FIFO - oldest first)
    for (const debt of debts as any[]) {
      if (remainingPayment <= 0) break;
      
      const debtRemaining = Number(debt.remaining_amount);
      const paymentForThisDebt = Math.min(remainingPayment, debtRemaining);
      
      const newPaid = Number(debt.paid_amount) + paymentForThisDebt;
      const newRemaining = debtRemaining - paymentForThisDebt;
      const newStatus = newRemaining <= 0 ? 'paid' : 'unpaid';
      
      await connection.query(
        `UPDATE debts 
         SET paid_amount = $1, remaining_amount = $2, status = $3 
         WHERE id = $4`,
        [newPaid, newRemaining, newStatus, debt.id]
      );
      
      remainingPayment -= paymentForThisDebt;
    }
    
    await connection.query('COMMIT');
    
    return NextResponse.json({ 
      message: 'Payment successful',
      amount_paid: amount,
      remaining_payment: remainingPayment
    });
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  } finally {
    connection.release();
  }
}
