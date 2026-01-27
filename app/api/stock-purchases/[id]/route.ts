import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';

// DELETE - Delete stock purchase
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get purchase details before deleting to reverse stock
    const [purchases]: any = await query(
      'SELECT product_id, quantity FROM stock_purchases WHERE id = $1',
      [id]
    );
    
    if (purchases.length === 0) {
      return NextResponse.json({ error: 'Stock purchase not found' }, { status: 404 });
    }
    
    const purchase = purchases[0];
    
    // Delete the purchase record
    await query('DELETE FROM stock_purchases WHERE id = $1', [id]);
    
    // Reverse the stock (subtract the quantity that was added)
    await query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [purchase.quantity, purchase.product_id]
    );
    
    return NextResponse.json({ message: 'Stock purchase deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock purchase:', error);
    return NextResponse.json({ error: 'Failed to delete stock purchase' }, { status: 500 });
  }
}
