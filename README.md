# 🛒 Next POS - Point of Sale System

A complete web-based Point of Sale application built with Next.js 16 and MySQL. Perfect for small retail stores, grocery shops, and mini markets.

## ✨ Features

- 💰 **Sales Transaction** - Quick checkout with cash and credit payment
- 📦 **Product Management** - Manage products, categories, and inventory
- 👥 **Customer Management** - Customer data and transaction history
- 💳 **Debt Tracking** - Record and manage customer debts with FIFO payment
- 📊 **Dashboard** - Sales statistics and business overview
- 📈 **Reports** - Transaction and inventory reports
- 🏪 **Stock Purchasing** - Track stock purchases from suppliers
- 🔐 **Multi-user** - Admin and cashier roles
- 🌐 **Web Installer** - Easy 4-step installation wizard

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 5.7+ or MariaDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd next-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create MySQL database**
   ```sql
   CREATE DATABASE pos_warung;
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser and follow web installer**
   - Navigate to `http://localhost:3000`
   - You'll be automatically redirected to `/setup`
   - Complete the 4-step installation wizard
   - Login with default credentials:
     - Username: `admin`
     - Password: `admin123`

⚠️ **Important:** Change the default password after first login!

## 🔧 Tech Stack

- **Framework:** Next.js 16.1.3 (App Router + Turbopack)
- **Database:** MySQL with mysql2/promise
- **UI:** Tailwind CSS + Lucide Icons
- **Notifications:** SweetAlert2

## 📁 Project Structure

```
next-pos/
├── app/
│   ├── api/           # API routes
│   ├── setup/         # Web installer
│   └── page.tsx       # Main application
├── components/        # React components
├── lib/              # Database connection
├── migration-*.sql   # Database migrations
└── proxy.ts          # Middleware for routing
```

## 🔐 Security

- Cookie-based authentication with HTTP-only flag
- Setup page auto-locks after installation
- Auto-logout after 15 minutes of inactivity
- Environment variables for sensitive data

## 🛠️ Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔄 Reset Installation

To reset and reinstall:

1. Remove setup files:
   ```bash
   rm .setup-complete .env.local
   ```

2. Recreate database:
   ```sql
   DROP DATABASE pos_warung;
   CREATE DATABASE pos_warung;
   ```

3. Refresh browser and run installer again

## 📝 Environment Variables

The installer automatically creates `.env.local`. Template available in `.env.example`:

```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=pos_warung
NODE_ENV=development
PORT=3000
```

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for small businesses**

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd next-pos
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. **Buka Web Installer**:
   - Buka browser: `http://localhost:3000/setup`
   - Follow langkah-langkah di web installer:
     - **Step 1**: System check (Node.js & dependencies)
     - **Step 2**: Konfigurasi database (host, user, password, nama database)
     - **Step 3**: Install database (auto-create DB dan import migrations)
     - **Step 4**: Selesai! Login dengan admin/admin123

5. **Installer akan otomatis**:
   - ✅ Check system requirements
   - ✅ Test koneksi database
   - ✅ Buat database
   - ✅ Import semua migrations
   - ✅ Generate .env.local
   - ✅ Siap digunakan!

**Screenshot**: Web installer memiliki UI modern dengan progress bar dan panduan lengkap.

---

### 📝 Instalasi Manual

Jika instalasi otomatis gagal, ikuti langkah manual:

### 1️⃣ Setup Database

#### Menggunakan Laragon (Recommended):

1. **Buka Laragon** dan start semua services (Apache, MySQL)
2. **Akses phpMyAdmin**:
   - Klik kanan icon Laragon di system tray
   - Pilih "Database" → "phpMyAdmin"
   - Atau buka browser: `http://localhost/phpmyadmin`

3. **Buat Database Baru**:
   ```sql
   CREATE DATABASE pos_warung1;
   ```
   - Klik tab "SQL" di phpMyAdmin
   - Copy-paste command di atas
   - Klik "Go"

4. **Import Database**:
   - Pilih database `pos_warung1` di sidebar kiri
   - Klik tab "Import"
   - Klik "Choose File"
   - Pilih file `migration.sql` dari folder project
   - Klik "Go" untuk import

5. **Import File Migrasi Lainnya** (satu per satu):
   - `migration-users.sql` - Tabel users & akun default
   - `migration-stock-purchases.sql` - Tabel pembelian stok
   - `migration-settings.sql` - Tabel pengaturan (jika ada)
   - `migration-payment-method.sql` - Payment methods (jika ada)
   - `migration-unit-pricing.sql` - Unit pricing (jika ada)

#### Menggunakan MySQL Command Line:

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE pos_warung1;
USE pos_warung1;

# Import file SQL
SOURCE /path/to/migration.sql;
SOURCE /path/to/migration-users.sql;
SOURCE /path/to/migration-stock-purchases.sql;
```

---

### 2️⃣ Setup Project

1. **Buka Terminal/Command Prompt**
   - Tekan `Win + R`, ketik `cmd`, Enter

2. **Masuk ke Folder Project**:
   ```bash
   cd e:\arUnix\web\next-pos
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```
   
   Tunggu hingga proses selesai (bisa memakan waktu 2-5 menit)

---

### 3️⃣ Konfigurasi Database

Cek file `lib/db.ts` pastikan konfigurasi sesuai:

```typescript
// lib/db.ts
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',          // Username MySQL (default: root)
  password: '',          // Password MySQL (default: kosong untuk Laragon)
  database: 'pos_warung1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

⚠️ **Jika menggunakan password MySQL**, ubah nilai `password: ''` menjadi password Anda.

---

### 4️⃣ Jalankan Aplikasi

1. **Development Mode**:
   ```bash
   npm run dev
   ```

2. **Tunggu hingga muncul pesan**:
   ```
   ✓ Ready in 2.5s
   ○ Local:   http://localhost:3000
   ```

3. **Buka Browser** dan akses:
   ```
   http://localhost:3000
   ```

---

## 🔐 Login Pertama Kali

Gunakan akun default:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **PENTING**: Setelah login pertama kali, segera ganti password melalui menu **Pengaturan** → **Akun**.

---

## 📖 Cara Penggunaan

### 🏠 Dashboard
- Lihat statistik penjualan hari ini & bulan ini
- Monitor produk dengan stok rendah
- Cek total utang pelanggan
- Transaksi terbaru

### 🛒 Kasir (POS)
1. Pilih produk dari daftar
2. Atur jumlah (quantity)
3. Pilih unit (pack/piece jika tersedia)
4. Pilih mode: **Tunai** atau **Utang**
5. Masukkan nama pelanggan
6. Pilih metode pembayaran (Cash/Transfer/QRIS)
7. Masukkan jumlah bayar
8. Klik **Proses Transaksi**

### 📦 Manajemen Produk
- **Tambah Produk**: Klik tombol "Tambah Produk"
- **Edit**: Klik icon pensil pada produk
- **Hapus**: Klik icon trash
- **Filter**: Pilih kategori atau gunakan search

### 📥 Manajemen Stok
1. Klik menu **Manajemen Stok**
2. Pilih produk yang dibeli
3. Isi nama supplier
4. Isi quantity dan harga beli
5. Pilih tanggal pembelian
6. Klik **Simpan**

📌 Stok otomatis bertambah dan harga beli diupdate!

### 💰 Manajemen Utang
- Lihat daftar utang per pelanggan
- Klik nama pelanggan untuk expand detail
- Klik **Bayar Utang** untuk catat pembayaran
- Gunakan shortcut 25%, 50%, 75%, 100% untuk cepat

### 📊 Laporan
1. **Transaksi/Uang**: Laporan cash flow & utang
2. **Penjualan Barang**: 
   - Klik produk untuk lihat detail tanggal terjual
   - Export Excel dapat 2 sheet (Ringkasan + Detail)
3. **Pembelian Stok**: History pembelian stok

Semua tab bisa di-export ke Excel dengan klik **Export ke Excel**

### ⚙️ Pengaturan
- **Tab General**: Setup QRIS, nomor rekening, backup database
- **Tab Akun**: Ganti username dan password

---

## � Keamanan Setup

### Proteksi Setup Page

Sistem memiliki **double security** untuk mencegah akses tidak sah:

1. **Sebelum Setup**:
   - Semua halaman redirect ke `/setup`
   - Hanya halaman setup yang bisa diakses
   - API routes (kecuali `/api/setup/*`) diblokir

2. **Setelah Setup**:
   - Halaman `/setup` **TIDAK BISA** diakses lagi
   - File marker `.setup-complete` dibuat otomatis
   - Akses ke `/setup` otomatis redirect ke homepage
   - **TIDAK ADA BACKDOOR** - security ketat!

### Emergency Reset (Hanya untuk Development)

Jika perlu reset setup untuk development/testing:

```bash
# Hapus manual file-file ini:
rm .setup-complete
rm .env.local

# Kemudian bisa setup ulang
```

⚠️ **PRODUCTION**: Jangan pernah delete `.setup-complete` di production!

### File Keamanan

File ini **TIDAK BOLEH** masuk Git (sudah di `.gitignore`):
- `.setup-complete` - Marker setup selesai
- `.env.local` - Konfigurasi database & secrets
- `*.sql.backup` - Backup database

---

## �🐛 Troubleshooting

### ❌ Error: "Cannot connect to database"

**Solusi**:
1. Pastikan MySQL sudah running di Laragon/XAMPP
2. Cek konfigurasi di `lib/db.ts`
3. Pastikan database `pos_warung1` sudah dibuat
4. Cek username/password MySQL

### ❌ Error: "Port 3000 is already in use"

**Solusi**:
```bash
# Matikan proses yang menggunakan port 3000
# Atau gunakan port lain:
npm run dev -- -p 3001
```

### ❌ Error saat `npm install`

**Solusi**:
```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

### ❌ Data tidak muncul di Laporan

**Solusi**:
1. Pastikan sudah ada transaksi dalam database
2. Cek filter tanggal (ubah rentang tanggal)
3. Klik tombol **Filter** setelah ubah tanggal

### ❌ Export Excel kosong

**Solusi**:
1. Pastikan ada data pada periode yang dipilih
2. Cek tanggal filter mencakup data yang ada
3. Klik **Filter** terlebih dahulu sebelum export

### ❌ Auto-logout terus menerus

**Solusi**:
- Ini normal jika tidak ada aktivitas selama 15 menit
- Gerakkan mouse atau klik sesuatu untuk reset timer
- Jika terlalu mengganggu, bisa diubah di `app/page.tsx` (cari `INACTIVITY_TIMEOUT`)

---

## 🔒 Keamanan

- ✅ Session timeout 15 menit
- ✅ Password hashing (gunakan bcrypt untuk production)
- ⚠️ Untuk production, tambahkan HTTPS
- ⚠️ Ganti password default segera setelah instalasi

---

## 📁 Struktur Folder

```
next-pos/
├── app/
│   ├── api/           # API routes (backend)
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main app dengan routing
├── components/
│   ├── DashboardPage.tsx
│   ├── KasirPage.tsx
│   ├── ProductsPage.tsx
│   ├── StockManagementPage.tsx
│   ├── DebtsPage.tsx
│   ├── ReportsPage.tsx
│   ├── SettingsPage.tsx
│   └── ...
├── lib/
│   └── db.ts          # Database connection
├── migration*.sql     # Database migrations
├── package.json
└── README.md
```

---

## 🚀 Production Build

Untuk deploy ke production:

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm start
```

Server akan berjalan di `http://localhost:3000`

---

## 🌐 Deploy ke Hosting / VPS

### Option 1: Deploy ke VPS (Recommended untuk aplikasi full-stack)

#### Prerequisites:
- VPS dengan Ubuntu/Debian (misal: DigitalOcean, Vultr, AWS EC2)
- Domain (optional, bisa pakai IP VPS)
- SSH access ke VPS

#### Langkah-langkah:

**1. Setup VPS & Install Dependencies**

```bash
# Login ke VPS via SSH
ssh root@your-vps-ip

# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Secure MySQL installation
sudo mysql_secure_installation

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Web Server)
sudo apt install nginx -y
```

**2. Setup Database di VPS**

```bash
# Login ke MySQL
sudo mysql -u root -p

# Buat database dan user
CREATE DATABASE pos_warung1;
CREATE USER 'posuser'@'localhost' IDENTIFIED BY 'password_aman_123';
GRANT ALL PRIVILEGES ON pos_warung1.* TO 'posuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import database (upload file migration.sql ke VPS dulu)
mysql -u posuser -p pos_warung1 < /path/to/migration.sql
mysql -u posuser -p pos_warung1 < /path/to/migration-users.sql
mysql -u posuser -p pos_warung1 < /path/to/migration-stock-purchases.sql
```

**3. Upload & Setup Aplikasi**

```bash
# Buat folder untuk aplikasi
mkdir -p /var/www/pos-warung
cd /var/www/pos-warung

# Upload code (bisa pakai Git atau FTP)
# Option A: Menggunakan Git
git clone https://your-repo-url.git .

# Option B: Upload manual via SCP dari local
# Dari komputer lokal:
scp -r /path/to/next-pos root@your-vps-ip:/var/www/pos-warung/

# Install dependencies
npm install

# Update konfigurasi database di lib/db.ts
nano lib/db.ts
# Ubah:
# user: 'posuser'
# password: 'password_aman_123'
# database: 'pos_warung1'

# Build aplikasi
npm run build

# Test jalankan
npm start
```

**4. Setup PM2 (Auto-start & Keep-alive)**

```bash
# Jalankan dengan PM2
pm2 start npm --name "pos-warung" -- start

# Auto-start saat reboot
pm2 startup
pm2 save

# Monitoring
pm2 status
pm2 logs pos-warung
pm2 monit
```

**5. Setup Nginx sebagai Reverse Proxy**

```bash
# Buat konfigurasi Nginx
sudo nano /etc/nginx/sites-available/pos-warung

# Paste konfigurasi ini:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Ganti dengan domain Anda atau IP VPS

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pos-warung /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx auto-start
sudo systemctl enable nginx
```

**6. Setup SSL dengan Let's Encrypt (Optional tapi Recommended)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renew (sudah otomatis via cron)
sudo certbot renew --dry-run
```

**7. Setup Firewall**

```bash
# Install UFW
sudo apt install ufw -y

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**Akses Aplikasi:**
- HTTP: `http://your-domain.com` atau `http://your-vps-ip`
- HTTPS: `https://your-domain.com` (jika sudah setup SSL)

---

### Option 2: Deploy ke Vercel (Frontend Only - Tidak Recommended)

⚠️ **Catatan**: Vercel bagus untuk frontend, tapi aplikasi ini membutuhkan MySQL database yang tidak disediakan Vercel. Anda tetap perlu database eksternal.

**Alternative**: Gunakan Vercel + Database hosting terpisah:
- Frontend: Vercel
- Database: PlanetScale, Railway, atau DigitalOcean Managed Database

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

Kemudian update `lib/db.ts` dengan connection string database hosting Anda.

---

### Option 3: Deploy ke Railway (Easiest - All-in-one)

Railway menyediakan hosting untuk aplikasi Next.js + MySQL dalam satu platform.

**Langkah-langkah:**

1. **Buat akun di** [railway.app](https://railway.app)

2. **Create New Project** → **Deploy from GitHub repo**

3. **Tambahkan MySQL Database**:
   - Klik "New" → "Database" → "Add MySQL"
   - Copy connection details

4. **Setup Environment Variables**:
   - Buka Settings → Variables
   - Tambahkan:
     ```
     DATABASE_HOST=mysql.railway.internal
     DATABASE_USER=root
     DATABASE_PASSWORD=[dari railway]
     DATABASE_NAME=railway
     ```

5. **Update `lib/db.ts`** untuk baca dari environment:

```typescript
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'pos_warung1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

6. **Deploy**: Railway akan auto-deploy saat push ke GitHub

---

## � Upload Code ke GitHub

### Langkah 1: Persiapan

**1. Install Git** (jika belum ada):
- Download dari [git-scm.com](https://git-scm.com/downloads)
- Install dengan default settings

**2. Buat akun GitHub**:
- Daftar di [github.com](https://github.com) (gratis)

**3. Buat file `.gitignore`** di root project:

```bash
# Buat file .gitignore
echo "node_modules/" > .gitignore
echo ".next/" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.log" >> .gitignore
echo ".DS_Store" >> .gitignore
```

Atau buat manual dengan isi:
```
node_modules/
.next/
.env
.env.local
*.log
.DS_Store
out/
build/
dist/
```

⚠️ **PENTING**: File `.gitignore` mencegah file sensitif (password, node_modules) ter-upload ke GitHub.

---

### Langkah 2: Inisialisasi Git di Project

Buka Terminal/Command Prompt di folder project:

```bash
# Masuk ke folder project
cd e:\arUnix\web\next-pos

# Inisialisasi git
git init

# Konfigurasi identitas (first time only)
git config --global user.name "Nama Anda"
git config --global user.email "email@anda.com"

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "Initial commit - POS System"
```

---

### Langkah 3: Buat Repository di GitHub

**Via Website:**

1. Login ke [github.com](https://github.com)
2. Klik tombol **"+"** di kanan atas → **"New repository"**
3. Isi detail:
   - **Repository name**: `pos-warung-system` (atau nama lain)
   - **Description**: "Sistem POS untuk Warung/Toko Kecil"
   - **Visibility**: Pilih **Private** (untuk keamanan) atau Public
   - ❌ **JANGAN** centang "Initialize with README" (karena sudah ada)
4. Klik **"Create repository"**

---

### Langkah 4: Push ke GitHub

Setelah repository dibuat, GitHub akan tampilkan instruksi. Gunakan yang ini:

```bash
# Tambahkan remote repository
git remote add origin https://github.com/username-anda/pos-warung-system.git

# Ganti nama branch ke main (jika masih master)
git branch -M main

# Push ke GitHub
git push -u origin main
```

**Jika diminta login:**
- GitHub sudah tidak support password biasa
- Gunakan **Personal Access Token**

**Cara buat Personal Access Token:**
1. GitHub → Settings (klik profile) → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token → Beri nama: "POS Upload"
4. Centang: `repo` (semua)
5. Generate & copy token
6. Gunakan token sebagai password saat push

---

### Langkah 5: Update Code di GitHub (untuk update selanjutnya)

Setiap ada perubahan code:

```bash
# Cek status file yang berubah
git status

# Tambahkan file yang berubah
git add .

# Atau tambah file spesifik
git add components/KasirPage.tsx

# Commit dengan pesan
git commit -m "Deskripsi perubahan, misal: Tambah fitur export Excel"

# Push ke GitHub
git push origin main
```

---

### Langkah 6: Clone di VPS/Komputer Lain

Setelah code di GitHub, untuk download di tempat lain:

**Public repository:**
```bash
git clone https://github.com/username-anda/pos-warung-system.git
cd pos-warung-system
npm install
```

**Private repository:**
```bash
# Perlu login dulu
git clone https://github.com/username-anda/pos-warung-system.git
# Masukkan username & Personal Access Token

cd pos-warung-system
npm install
```

---

## 🚀 Auto-Deploy dengan GitHub Actions

GitHub Actions dapat auto-deploy ke VPS setiap kali ada push baru.

### Setup Auto-Deploy ke VPS:

**1. Generate SSH Key di VPS:**

```bash
# Di VPS, generate SSH key
ssh-keygen -t rsa -b 4096 -C "deploy-key"
# Enter 3x (no passphrase)

# Copy private key
cat ~/.ssh/id_rsa
# Copy semua output (dari -----BEGIN sampai -----END-----)

# Copy public key dan tambahkan ke authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

**2. Tambahkan Secrets di GitHub:**

1. Buka repository di GitHub
2. Settings → Secrets and variables → Actions
3. Klik **"New repository secret"**
4. Tambahkan secrets:
   - **Name**: `VPS_HOST` | **Value**: IP VPS Anda (contoh: `123.45.67.89`)
   - **Name**: `VPS_USERNAME` | **Value**: username SSH (contoh: `root`)
   - **Name**: `VPS_SSH_KEY` | **Value**: Private key dari langkah 1
   - **Name**: `VPS_APP_PATH` | **Value**: `/var/www/pos-warung`

**3. Buat File GitHub Actions:**

Di project, buat folder `.github/workflows` dan file `deploy.yml`:

```bash
mkdir -p .github/workflows
```

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd ${{ secrets.VPS_APP_PATH }}
          git pull origin main
          npm install
          npm run build
          pm2 restart pos-warung
```

**4. Commit & Push:**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add auto-deploy workflow"
git push origin main
```

**5. Test Auto-Deploy:**

Setiap kali push ke branch `main`, GitHub Actions akan otomatis:
1. SSH ke VPS
2. Pull code terbaru
3. Install dependencies
4. Build aplikasi
5. Restart dengan PM2

Monitor di tab **"Actions"** di GitHub repository.

---

## 🔐 Keamanan saat Upload ke GitHub

### ⚠️ JANGAN Upload File Sensitif!

**File yang HARUS di .gitignore:**
- ✅ `node_modules/` (terlalu besar)
- ✅ `.env` dan `.env.local` (berisi password)
- ✅ `.next/` (hasil build)
- ✅ `*.log` (file log)
- ✅ Database backup files (`*.sql`)

**Cara aman simpan credentials:**

**1. Gunakan Environment Variables:**

Buat file `.env.local` (tidak akan ter-upload karena di .gitignore):

```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=password_aman_123
DATABASE_NAME=pos_warung1
```

**2. Update `lib/db.ts`:**

```typescript
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'pos_warung1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

**3. Buat file `.env.example`** (untuk dokumentasi, bisa di-upload):

```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=pos_warung1
```

---

## 📝 Git Workflow Best Practices

### Branching Strategy:

```bash
# Buat branch untuk fitur baru
git checkout -b feature/nama-fitur

# Buat perubahan...
git add .
git commit -m "Tambah fitur X"

# Push branch
git push origin feature/nama-fitur

# Merge ke main via Pull Request di GitHub
```

### Commit Message Tips:

```bash
# ✅ GOOD
git commit -m "Tambah export Excel untuk laporan penjualan"
git commit -m "Fix bug kalkulasi utang"
git commit -m "Update tampilan dashboard"

# ❌ BAD
git commit -m "update"
git commit -m "fix"
git commit -m "changes"
```

### Undo Changes:

```bash
# Undo perubahan sebelum commit
git checkout -- nama-file.tsx

# Undo commit terakhir (keep changes)
git reset --soft HEAD~1

# Undo commit terakhir (discard changes)
git reset --hard HEAD~1

# Revert commit yang sudah di-push
git revert commit-hash
```

---

## �🔒 Keamanan untuk Production

### ⚠️ PENTING - Lakukan ini sebelum production:

1. **Ganti Semua Password Default**
   - Password MySQL
   - Password admin aplikasi
   - Password VPS/SSH

2. **Gunakan HTTPS/SSL**
   ```bash
   # Wajib pakai Let's Encrypt (gratis)
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Setup Firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   ```

4. **Disable Root Login SSH**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Ubah: PermitRootLogin no
   sudo systemctl restart ssh
   ```

5. **Backup Database Otomatis**
   ```bash
   # Buat script backup
   sudo nano /root/backup-pos.sh
   ```

   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/root/backups"
   mkdir -p $BACKUP_DIR
   
   # Backup database
   mysqldump -u posuser -ppassword_aman_123 pos_warung1 > $BACKUP_DIR/pos_backup_$DATE.sql
   
   # Hapus backup lebih dari 7 hari
   find $BACKUP_DIR -name "pos_backup_*.sql" -mtime +7 -delete
   ```

   ```bash
   # Buat executable
   chmod +x /root/backup-pos.sh
   
   # Tambahkan ke crontab (backup setiap hari jam 2 pagi)
   sudo crontab -e
   # Tambahkan: 0 2 * * * /root/backup-pos.sh
   ```

6. **Update Environment Variables**
   - Jangan hardcode password di code
   - Gunakan file `.env` atau environment variables

7. **Enable Fail2Ban** (mencegah brute force attack)
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

---

## 🔧 Maintenance Production

### Monitor Aplikasi

```bash
# Cek status PM2
pm2 status

# Lihat logs real-time
pm2 logs pos-warung

# Monitor resource usage
pm2 monit

# Restart aplikasi
pm2 restart pos-warung
```

### Update Aplikasi

```bash
# Login ke VPS
ssh user@your-vps-ip

# Masuk ke folder aplikasi
cd /var/www/pos-warung

# Pull update dari Git (jika pakai Git)
git pull origin main

# Atau upload file baru via SCP

# Install dependencies baru (jika ada)
npm install

# Build ulang
npm run build

# Restart dengan PM2
pm2 restart pos-warung

# Clear cache jika perlu
pm2 flush pos-warung
```

### Troubleshooting Production

**Aplikasi tidak bisa diakses:**
```bash
# Cek status PM2
pm2 status

# Cek logs error
pm2 logs pos-warung --err

# Cek Nginx
sudo systemctl status nginx
sudo nginx -t

# Cek MySQL
sudo systemctl status mysql
```

**Database error:**
```bash
# Cek koneksi database
mysql -u posuser -p pos_warung1

# Cek logs MySQL
sudo tail -f /var/log/mysql/error.log
```

**Memory/CPU tinggi:**
```bash
# Monitor resource
htop
# atau
pm2 monit

# Restart jika perlu
pm2 restart pos-warung
```

---

## 📞 Support

Jika ada kendala atau pertanyaan:

1. Cek bagian **Troubleshooting** di atas
2. Pastikan semua requirements sudah terpenuhi
3. Cek console browser (F12) untuk melihat error
4. Cek terminal untuk error dari server

---

## 📝 Update & Maintenance

### Backup Database Regular

1. Buka phpMyAdmin
2. Pilih database `pos_warung1`
3. Klik tab "Export"
4. Pilih "Quick" export method
5. Klik "Go"
6. Simpan file .sql

### Update Aplikasi

```bash
# Pull update terbaru (jika menggunakan Git)
git pull

# Install dependencies baru
npm install

# Restart aplikasi
npm run dev
```

---

## ✨ Tips Penggunaan

1. **Backup database** secara berkala (minimal 1 minggu sekali)
2. **Ganti password default** segera setelah instalasi
3. **Catat utang** dengan disiplin untuk tracking yang akurat
4. **Gunakan filter tanggal** di Laporan untuk analisis periode tertentu
5. **Export Excel** untuk arsip laporan bulanan
6. **Cek stok** produk secara berkala melalui Dashboard

---

## 🎯 Roadmap Fitur (Future)

- [ ] Multi-user dengan role permissions
- [ ] Grafik & chart di Dashboard
- [ ] Export PDF untuk invoice
- [ ] Notifikasi stok menipis
- [ ] Integration dengan printer thermal
- [ ] Mobile responsive optimization
- [ ] Dark mode

---

**Dibuat dengan ❤️ untuk membantu UMKM Indonesia**

© 2026 POS System. All rights reserved.
