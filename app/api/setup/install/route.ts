import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { host, user, password, database, port } = await request.json();

    // Connect to PostgreSQL server and use the specified database
    const pool = new Pool({
      host,
      user,
      password,
      database,
      port: port || 5432
    });

    const client = await pool.connect();

    try {
      // Get all PostgreSQL migration files
      const migrationsDir = process.cwd();
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.startsWith('migration') && f.endsWith('-postgres.sql'))
        .sort();

      // Execute each migration file
      for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        // Split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          try {
            await client.query(statement);
          } catch (error: any) {
            // Ignore duplicate errors (table already exists, constraint already exists)
            if (!error.message.includes('already exists') && 
                !error.message.includes('duplicate key')) {
              console.error(`Error executing statement from ${file}:`, error);
              throw error; // Re-throw if it's a real error
            }
            // Log ignored errors for debugging
            console.log(`Ignored duplicate error in ${file}:`, error.message);
          }
        }
      }
    } finally {
      client.release();
      await pool.end();
    }

    // Create or update .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = `# Database Configuration
DATABASE_HOST=${host}
DATABASE_USER=${user}
DATABASE_PASSWORD=${password}
DATABASE_NAME=${database}
DATABASE_PORT=${port || 5432}

# App Configuration
NODE_ENV=development
PORT=3000

# Security (change these in production)
JWT_SECRET=your-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-secret-session-key-change-this-in-production
`;

    fs.writeFileSync(envPath, envContent);

    // Update lib/db.ts with new configuration
    const dbTsPath = path.join(process.cwd(), 'lib', 'db.ts');
    const dbTsContent = `import { Pool } from 'pg';

const pool = new Pool({
  host: '${host}',
  user: '${user}',
  password: '${password}',
  database: '${database}',
  port: ${port || 5432},
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return [result.rows, result];
}

export default pool;
`;

    fs.writeFileSync(dbTsPath, dbTsContent);

    // Create setup completion marker
    const setupMarkerPath = path.join(process.cwd(), '.setup-complete');
    fs.writeFileSync(setupMarkerPath, new Date().toISOString());

    // Create response with setup-complete cookie
    const response = NextResponse.json({ 
      success: true,
      message: 'Database berhasil disetup!' 
    });

    // Set cookie to mark setup as complete
    response.cookies.set('setup-complete', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 * 10 // 10 years
    });

    return response;
  } catch (error: any) {
    console.error('Setup error:', error);
    
    return NextResponse.json({ 
      error: error.message || 'Setup gagal' 
    }, { status: 500 });
  }
}
