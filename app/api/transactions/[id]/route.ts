import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const connection = await pool.connect();
  
  try {
    const { id } = await params;
    
    await connection.query('BEGIN');
    
    // Get transaction items to restore stock
    const itemsResult = await connection.query(
      `SELECT ti.*, p.has_pieces, p.pieces_per_pack 
       FROM transaction_items ti
       LEFT JOIN products p ON ti.product_id = p.id
       WHERE ti.transaction_id = $1`,
      [id]
    );
    
    const items = itemsResult.rows;
    
    // Restore stock for each item
    for (const item of items) {
      // Calculate stock to restore (reverse of deduction)
      let stockToRestore = item.quantity;
      
      // Note: We can't determine if original sale was pack or piece from transaction_items
      // So we restore based on quantity recorded
      // If product has pieces, quantity in transaction_items is already in smallest unit (pcs)
      
      await connection.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [stockToRestore, item.product_id]
      );
    }
    
    // Delete transaction (cascade will delete transaction_items and debts)
    await connection.query(
      'DELETE FROM transactions WHERE id = $1',
      [id]
    );
    
    await connection.query('COMMIT');
    
    return NextResponse.json({ 
      success: true,
      message: 'Transaction revoked and stock restored'
    });
    
  } catch (error: any) {
    await connection.query('ROLLBACK');
    console.error('Error revoking transaction:', error);
    return NextResponse.json({ 
      error: 'Failed to revoke transaction',
      details: error.message 
    }, { status: 500 });
  } finally {
    connection.release();
  }
}
