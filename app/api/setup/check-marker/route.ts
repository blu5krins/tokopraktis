import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check if setup completion marker exists
    const setupMarkerPath = path.join(process.cwd(), '.setup-complete');
    const exists = fs.existsSync(setupMarkerPath);

    return NextResponse.json({ exists });
  } catch (error) {
    return NextResponse.json({ exists: false });
  }
}
