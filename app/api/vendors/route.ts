import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await query(
      `SELECT 
        v.*,
        COUNT(sp.id) as total_purchases,
        COALESCE(SUM(sp.quantity), 0) as total_quantity,
        COALESCE(SUM(sp.total_cost), 0) as total_cost,
        MAX(sp.purchase_date) as last_purchase_date
      FROM vendors v
      LEFT JOIN stock_purchases sp ON v.id = sp.vendor_id
      GROUP BY v.id
      ORDER BY v.name ASC`
    );
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact_person, phone, email, address, notes } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nama vendor wajib diisi' }, { status: 400 });
    }

    // Check if vendor already exists
    const [existing]: any = await query(
      'SELECT id FROM vendors WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Vendor dengan nama ini sudah ada' }, { status: 400 });
    }

    const [result]: any = await query(
      `INSERT INTO vendors (name, contact_person, phone, email, address, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [name.trim(), contact_person || null, phone || null, email || null, address || null, notes || null]
    );

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Vendor dengan nama ini sudah ada' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
