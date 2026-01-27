import { NextRequest, NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await query('SELECT * FROM settings');
    
    const settings: any = {
      bank_name: '',
      account_number: '',
      account_holder: '',
      qris_image: ''
    };

    (rows as any[]).forEach(row => {
      settings[row.setting_key] = row.setting_value || '';
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bank_name, account_number, account_holder, qris_image } = body;

    // Update or insert each setting
    const settings = [
      { key: 'bank_name', value: bank_name || '' },
      { key: 'account_number', value: account_number || '' },
      { key: 'account_holder', value: account_holder || '' },
      { key: 'qris_image', value: qris_image || '' }
    ];

    for (const setting of settings) {
      await query(
        `INSERT INTO settings (setting_key, setting_value) 
         VALUES ($1, $2) 
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $2`,
        [setting.key, setting.value]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
