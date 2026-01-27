import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Double security check: both .env.local and setup marker
    const envPath = path.join(process.cwd(), '.env.local');
    const envExists = fs.existsSync(envPath);

    const setupMarkerPath = path.join(process.cwd(), '.setup-complete');
    const markerExists = fs.existsSync(setupMarkerPath);

    // Check if database config is valid in .env.local
    let hasValidConfig = false;
    if (envExists) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      hasValidConfig = envContent.includes('DATABASE_NAME') && 
                       envContent.includes('DATABASE_USER') &&
                       envContent.includes('DATABASE_HOST');
    }

    // Setup is complete only if both marker exists AND config is valid
    const isSetup = markerExists && hasValidConfig;

    // Create response
    const response = NextResponse.json({ isSetup });

    // Only set cookie if setup is complete AND cookie doesn't exist yet
    if (isSetup) {
      response.cookies.set('setup-complete', 'true', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 * 10 // 10 years
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ isSetup: false });
  }
}
