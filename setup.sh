#!/bin/bash

# POS System - Setup Installer untuk Linux/Mac
# Jalankan dengan: bash setup.sh atau ./setup.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "================================================================"
echo ""
echo "          POS SYSTEM - SETUP INSTALLER (UNIX)"
echo ""
echo "              Instalasi Otomatis untuk Warung"
echo ""
echo "================================================================"
echo -e "${NC}"
echo ""
echo "Mempersiapkan instalasi..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js tidak terdeteksi!${NC}"
    echo ""
    echo "Install Node.js terlebih dahulu:"
    echo "  - macOS: brew install node"
    echo "  - Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  - Download: https://nodejs.org/"
    echo ""
    exit 1
fi

echo -e "${GREEN}[OK] Node.js terdeteksi${NC}"
node --version
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm tidak terdeteksi!${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] npm terdeteksi${NC}"
npm --version
echo ""

# Check MySQL (optional)
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}[OK] MySQL terdeteksi${NC}"
else
    echo -e "${YELLOW}[WARNING] MySQL tidak terdeteksi di PATH${NC}"
    echo -e "${YELLOW}Pastikan MySQL sudah running!${NC}"
fi
echo ""

# Confirmation
echo "================================================================"
echo ""
echo "Setup akan:"
echo "  1. Install dependencies (npm install)"
echo "  2. Konfigurasi database"
echo "  3. Setup database otomatis"
echo "  4. Membuat file konfigurasi"
echo ""
read -p "Lanjutkan instalasi? (Y/n): " CONTINUE

if [[ $CONTINUE =~ ^[Nn]$ ]]; then
    echo ""
    echo "Instalasi dibatalkan."
    exit 0
fi

echo ""
echo "================================================================"
echo "STEP 1: Install Dependencies"
echo "================================================================"
echo ""

npm install

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}"
    echo ""
    echo "[WARNING] npm install gagal!"
    echo "Coba jalankan manual: npm install"
    echo -e "${NC}"
fi

echo ""
echo "================================================================"
echo "STEP 2: Setup Interaktif"
echo "================================================================"
echo ""
echo "Menjalankan setup wizard..."
echo ""

node setup.js

if [ $? -ne 0 ]; then
    echo -e "${RED}"
    echo ""
    echo "[ERROR] Setup gagal!"
    echo -e "${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}"
echo "================================================================"
echo ""
echo "[SUCCESS] Setup selesai!"
echo ""
echo -e "${NC}"
echo "Jalankan aplikasi dengan: npm run dev"
echo "Buka browser: http://localhost:3000"
echo ""
echo "Login dengan:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo -e "${RED}PENTING: Ganti password setelah login pertama!${NC}"
echo ""
echo "================================================================"
echo ""
