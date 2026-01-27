import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check Node.js (we're already running, so it's true)
    const node = true;

    // Check if node_modules exists
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    const dependencies = fs.existsSync(nodeModulesPath);

    return NextResponse.json({ 
      node, 
      dependencies 
    });
  } catch (error) {
    return NextResponse.json({ 
      node: true, 
      dependencies: false 
    });
  }
}
