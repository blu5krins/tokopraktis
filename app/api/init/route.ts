import { NextResponse } from 'next/server';
// This route is no longer needed - use /setup installer instead

export async function GET() {
  return NextResponse.json({ 
    message: 'Please use /setup installer to initialize the database',
    redirect: '/setup'
  }, { status: 410 }); // 410 Gone
}
