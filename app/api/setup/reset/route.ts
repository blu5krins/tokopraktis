import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    // Security: Check if code matches expected reset code
    // This is a one-time emergency reset, use with caution
    const RESET_CODE = process.env.EMERGENCY_RESET_CODE || 'NEVER_SET_THIS_IN_PRODUCTION';

    if (code !== RESET_CODE || RESET_CODE === 'NEVER_SET_THIS_IN_PRODUCTION') {
      return NextResponse.json({ 
        error: 'Invalid reset code' 
      }, { status: 403 });
    }

    // Remove setup marker
    const setupMarkerPath = path.join(process.cwd(), '.setup-complete');
    if (fs.existsSync(setupMarkerPath)) {
      fs.unlinkSync(setupMarkerPath);
    }

    // Remove .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      fs.unlinkSync(envPath);
    }

    // Create response
    const response = NextResponse.json({ 
      success: true,
      message: 'Setup has been reset. Please run setup again.' 
    });

    // Remove setup-complete cookie
    response.cookies.delete('setup-complete');

    return response;
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Reset failed' 
    }, { status: 500 });
  }
}
