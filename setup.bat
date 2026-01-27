@echo off
SETLOCAL EnableDelayedExpansion

:: POS System - Setup Installer untuk Windows
:: Jalankan sebagai Administrator untuk hasil terbaik

color 0A
title POS System - Setup Installer

echo.
echo ================================================================
echo.
echo          POS SYSTEM - SETUP INSTALLER (WINDOWS)
echo.
echo              Instalasi Otomatis untuk Warung
echo.
echo ================================================================
echo.
echo Mempersiapkan instalasi...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js tidak terdeteksi!
    echo.
    echo Download Node.js dari: https://nodejs.org/
    echo Install Node.js terlebih dahulu, lalu jalankan setup ini lagi.
    echo.
    pause
    exit /b 1
)

:: Check Node version
echo [OK] Node.js terdeteksi
node --version
echo.

:: Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] npm tidak terdeteksi!
    echo.
    pause
    exit /b 1
)

echo [OK] npm terdeteksi
npm --version
echo.

:: Check if MySQL is running (optional)
where mysql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] MySQL terdeteksi
) else (
    color 0E
    echo [WARNING] MySQL tidak terdeteksi di PATH
    echo Pastikan Laragon atau XAMPP sudah running!
)
echo.

:: Confirmation
echo ================================================================
echo.
echo Setup akan:
echo   1. Install dependencies (npm install)
echo   2. Konfigurasi database
echo   3. Setup database otomatis
echo   4. Membuat file konfigurasi
echo.
set /p CONTINUE="Lanjutkan instalasi? (Y/n): "
if /i "!CONTINUE!"=="n" (
    echo.
    echo Instalasi dibatalkan.
    pause
    exit /b 0
)

echo.
echo ================================================================
echo STEP 1: Install Dependencies
echo ================================================================
echo.

npm install

if %ERRORLEVEL% NEQ 0 (
    color 0E
    echo.
    echo [WARNING] npm install gagal!
    echo Coba jalankan manual: npm install
    echo.
)

echo.
echo ================================================================
echo STEP 2: Setup Interaktif
echo ================================================================
echo.
echo Menjalankan setup wizard...
echo.

node setup.js

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Setup gagal!
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================================
echo.
echo [SUCCESS] Setup selesai!
echo.
echo Jalankan aplikasi dengan: npm run dev
echo Buka browser: http://localhost:3000
echo.
echo Login dengan:
echo   Username: admin
echo   Password: admin123
echo.
echo PENTING: Ganti password setelah login pertama!
echo.
echo ================================================================
echo.
pause
