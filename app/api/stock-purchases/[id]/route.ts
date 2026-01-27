import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos_warung1',
};

// DELETE - Delete stock purchase
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await mysql.createConnection(dbConfig);
    
    // Get purchase details before deleting to reverse stock
    const [purchases]: any = await connection.execute(
      'SELECT product_id, quantity FROM stock_purchases WHERE id = ?',
      [id]
    );
    
    if (purchases.length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Stock purchase not found' }, { status: 404 });
    }
    
    const purchase = purchases[0];
    
    // Delete the purchase record
    await connection.execute('DELETE FROM stock_purchases WHERE id = ?', [id]);
    
    // Reverse the stock (subtract the quantity that was added)
    await connection.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [purchase.quantity, purchase.product_id]
    );
    
    await connection.end();
    
    return NextResponse.json({ message: 'Stock purchase deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock purchase:', error);
    return NextResponse.json({ error: 'Failed to delete stock purchase' }, { status: 500 });
  }
}
