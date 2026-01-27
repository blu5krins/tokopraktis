import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, c.name as customer_name, c.phone, d.transaction_id
      FROM debts d
      JOIN customers c ON d.customer_id = c.id
      WHERE d.status = 'unpaid' OR d.remaining_amount > 0
      ORDER BY c.name ASC, d.created_at DESC
    `);
    
    // Fetch transaction items for each debt
    const debtsWithItems = await Promise.all(
      (rows as any[]).map(async (debt) => {
        if (debt.transaction_id) {
          const [items] = await pool.query(
            'SELECT product_name, quantity, price, subtotal FROM transaction_items WHERE transaction_id = ?',
            [debt.transaction_id]
          );
          return { ...debt, transaction_items: JSON.stringify(items) };
        }
        return { ...debt, transaction_items: '[]' };
      })
    );
    
    return NextResponse.json(debtsWithItems);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch debts' }, { status: 500 });
  }
}
