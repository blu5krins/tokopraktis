#!/usr/bin/env node

/**
 * POS System - Setup Installer
 * Interactive setup wizard untuk instalasi pertama kali
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function execCommand(command, description) {
  try {
    log(`\n⏳ ${description}...`, 'cyan');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} berhasil!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} gagal!`, 'red');
    return false;
  }
}

async function checkNodeVersion() {
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major >= 16) {
      log(`✅ Node.js ${version} terdeteksi`, 'green');
      return true;
    } else {
      log(`❌ Node.js versi ${version} terlalu lama. Minimal versi 16.x`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Node.js tidak terdeteksi!', 'red');
    return false;
  }
}

async function checkMySQL() {
  try {
    execSync('mysql --version', { stdio: 'ignore' });
    log('✅ MySQL terdeteksi', 'green');
    return true;
  } catch (error) {
    log('⚠️  MySQL tidak terdeteksi di PATH', 'yellow');
    log('   Pastikan MySQL/Laragon sudah running', 'yellow');
    return true; // Continue anyway
  }
}

function createEnvFile(config) {
  const envContent = `# Database Configuration
DATABASE_HOST=${config.host}
DATABASE_USER=${config.user}
DATABASE_PASSWORD=${config.password}
DATABASE_NAME=${config.database}

# Application
NODE_ENV=development
PORT=3000
`;

  fs.writeFileSync('.env.local', envContent);
  log('✅ File .env.local berhasil dibuat', 'green');
}

function updateDbConfig(config) {
  const dbPath = path.join(__dirname, 'lib', 'db.ts');
  
  if (!fs.existsSync(dbPath)) {
    log('⚠️  File lib/db.ts tidak ditemukan', 'yellow');
    return;
  }

  const dbContent = `import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || '${config.host}',
  user: process.env.DATABASE_USER || '${config.user}',
  password: process.env.DATABASE_PASSWORD || '${config.password}',
  database: process.env.DATABASE_NAME || '${config.database}',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
`;

  fs.writeFileSync(dbPath, dbContent);
  log('✅ Konfigurasi database diperbarui', 'green');
}

async function setupDatabase(config) {
  const mysql = require('mysql2/promise');
  
  try {
    log('\n⏳ Menghubungkan ke MySQL...', 'cyan');
    
    // Connect without database first
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });

    log('✅ Koneksi ke MySQL berhasil!', 'green');

    // Create database
    log(`\n⏳ Membuat database ${config.database}...`, 'cyan');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    log('✅ Database berhasil dibuat!', 'green');

    // Use the database
    await connection.query(`USE ${config.database}`);

    // Import migrations
    const migrations = [
      'migration.sql',
      'migration-users.sql',
      'migration-stock-purchases.sql',
      'migration-settings.sql',
      'migration-payment-method.sql',
      'migration-unit-pricing.sql'
    ];

    for (const file of migrations) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        log(`\n⏳ Mengimport ${file}...`, 'cyan');
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim());
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await connection.query(statement);
            } catch (err) {
              // Ignore errors for IF EXISTS statements
              if (!err.message.includes('already exists')) {
                log(`   ⚠️  ${err.message}`, 'yellow');
              }
            }
          }
        }
        log(`✅ ${file} berhasil diimport`, 'green');
      }
    }

    await connection.end();
    return true;

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('   Pastikan:', 'yellow');
    log('   - MySQL sudah running (Laragon/XAMPP)', 'yellow');
    log('   - Username dan password benar', 'yellow');
    log('   - Port 3306 tidak diblokir', 'yellow');
    return false;
  }
}

async function main() {
  console.clear();
  
  log('╔════════════════════════════════════════════════╗', 'cyan');
  log('║                                                ║', 'cyan');
  log('║      🛒 POS SYSTEM - SETUP INSTALLER 🛒       ║', 'bright');
  log('║                                                ║', 'cyan');
  log('║        Instalasi Otomatis untuk Warung        ║', 'cyan');
  log('║                                                ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  
  log('\nSelamat datang di Setup Installer POS System!', 'bright');
  log('Setup ini akan membantu Anda menginstall aplikasi dengan mudah.\n', 'cyan');

  // Step 1: Check requirements
  log('📋 STEP 1: Memeriksa Requirements\n', 'bright');
  
  const nodeOk = await checkNodeVersion();
  if (!nodeOk) {
    log('\n❌ Instalasi dibatalkan. Install Node.js v16+ terlebih dahulu.', 'red');
    process.exit(1);
  }
  
  await checkMySQL();

  // Step 2: Database configuration
  log('\n📋 STEP 2: Konfigurasi Database\n', 'bright');
  log('Masukkan informasi database MySQL Anda:', 'cyan');
  log('(Tekan Enter untuk menggunakan nilai default)\n');

  const dbConfig = {
    host: await question('  Database Host [localhost]: ') || 'localhost',
    user: await question('  Database User [root]: ') || 'root',
    password: await question('  Database Password [kosong]: ') || '',
    database: await question('  Database Name [pos_warung1]: ') || 'pos_warung1'
  };

  // Step 3: Confirm configuration
  log('\n📋 STEP 3: Konfirmasi Konfigurasi\n', 'bright');
  log('Konfigurasi yang akan digunakan:', 'cyan');
  log(`  Host: ${dbConfig.host}`, 'yellow');
  log(`  User: ${dbConfig.user}`, 'yellow');
  log(`  Password: ${dbConfig.password ? '***' : '(kosong)'}`, 'yellow');
  log(`  Database: ${dbConfig.database}`, 'yellow');

  const confirm = await question('\nLanjutkan dengan konfigurasi ini? (Y/n): ');
  if (confirm.toLowerCase() === 'n') {
    log('\n❌ Instalasi dibatalkan.', 'red');
    rl.close();
    return;
  }

  // Step 4: Install dependencies
  log('\n📋 STEP 4: Install Dependencies\n', 'bright');
  const installChoice = await question('Install npm dependencies? (Y/n): ');
  
  if (installChoice.toLowerCase() !== 'n') {
    if (!execCommand('npm install', 'Menginstall dependencies')) {
      log('\n⚠️  Instalasi dependencies gagal, tapi setup akan dilanjutkan', 'yellow');
    }
  }

  // Step 5: Create .env file
  log('\n📋 STEP 5: Membuat File Konfigurasi\n', 'bright');
  createEnvFile(dbConfig);
  updateDbConfig(dbConfig);

  // Step 6: Setup database
  log('\n📋 STEP 6: Setup Database\n', 'bright');
  const setupDb = await question('Setup database otomatis? (Y/n): ');
  
  if (setupDb.toLowerCase() !== 'n') {
    const dbSuccess = await setupDatabase(dbConfig);
    
    if (!dbSuccess) {
      log('\n⚠️  Setup database gagal!', 'yellow');
      log('Anda bisa setup manual:', 'yellow');
      log('1. Buka phpMyAdmin atau MySQL client', 'cyan');
      log('2. Buat database: CREATE DATABASE pos_warung1;', 'cyan');
      log('3. Import file migration-*.sql satu per satu', 'cyan');
    }
  }

  // Step 7: Build application
  log('\n📋 STEP 7: Build Aplikasi\n', 'bright');
  const buildChoice = await question('Build aplikasi sekarang? (y/N): ');
  
  if (buildChoice.toLowerCase() === 'y') {
    execCommand('npm run build', 'Building aplikasi');
  }

  // Done!
  log('\n╔════════════════════════════════════════════════╗', 'green');
  log('║                                                ║', 'green');
  log('║          ✅ INSTALASI SELESAI! ✅             ║', 'bright');
  log('║                                                ║', 'green');
  log('╚════════════════════════════════════════════════╝', 'green');

  log('\n🎉 Setup berhasil diselesaikan!', 'bright');
  log('\n📝 Langkah selanjutnya:', 'cyan');
  log('   1. Jalankan aplikasi:', 'yellow');
  log('      npm run dev', 'green');
  log('\n   2. Buka browser:', 'yellow');
  log('      http://localhost:3000', 'green');
  log('\n   3. Login dengan:', 'yellow');
  log('      Username: admin', 'green');
  log('      Password: admin123', 'green');
  log('\n   ⚠️  PENTING: Ganti password setelah login pertama!', 'red');
  log('\n📚 Dokumentasi lengkap: Lihat README.md', 'cyan');
  
  rl.close();
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
  log('\n\n❌ Instalasi dibatalkan oleh user.', 'red');
  process.exit(0);
});

// Run
main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
