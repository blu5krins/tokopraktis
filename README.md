# 🛒 TokoPraktis - Point of Sale System

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
   cd tokopraktis
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
tokopraktis/
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
