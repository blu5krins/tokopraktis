import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows]: any = await query(
      `SELECT 
        v.*,
        COUNT(sp.id) as total_purchases,
        COALESCE(SUM(sp.quantity), 0) as total_quantity,
        COALESCE(SUM(sp.total_cost), 0) as total_cost,
        MAX(sp.purchase_date) as last_purchase_date
      FROM vendors v
      LEFT JOIN stock_purchases sp ON v.id = sp.vendor_id
      WHERE v.id = $1
      GROUP BY v.id`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, contact_person, phone, email, address, notes } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nama vendor wajib diisi' }, { status: 400 });
    }

    // Check if another vendor has the same name
    const [existing]: any = await query(
      'SELECT id FROM vendors WHERE LOWER(name) = LOWER($1) AND id != $2',
      [name.trim(), id]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Vendor dengan nama ini sudah ada' }, { status: 400 });
    }

    const [result]: any = await query(
      `UPDATE vendors 
       SET name = $1, 
           contact_person = $2, 
           phone = $3, 
           email = $4, 
           address = $5, 
           notes = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name.trim(), contact_person || null, phone || null, email || null, address || null, notes || null, id]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error updating vendor:', error);
    
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Vendor dengan nama ini sudah ada' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if vendor has any purchases
    const [purchases]: any = await query(
      'SELECT COUNT(*) as count FROM stock_purchases WHERE vendor_id = $1',
      [id]
    );

    if (purchases && purchases[0] && Number(purchases[0].count) > 0) {
      return NextResponse.json({ 
        error: 'Tidak dapat menghapus vendor yang memiliki riwayat pembelian' 
      }, { status: 400 });
    }

    const [result]: any = await query(
      'DELETE FROM vendors WHERE id = $1 RETURNING *',
      [id]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
