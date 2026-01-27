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
- **Database:** MySQL or PostgreSQL (multi-branch support)
- **UI:** Tailwind CSS + Lucide Icons
- **Notifications:** SweetAlert2

## 📦 Available Branches

- **`main`** - MySQL version with web installer (for VPS/Railway/Render)
- **`vercel-serverless`** - MySQL + PlanetScale (serverless Vercel deployment)
- **`supabase-postgres`** - PostgreSQL + Supabase (with web installer for VPS/Railway)
- **`supabase-postgres-serverless`** - PostgreSQL + Supabase (serverless for Vercel) ⭐

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
   -- MySQL (main branch)
   DROP DATABASE pos_warung;
   CREATE DATABASE pos_warung;
   
   -- PostgreSQL (supabase-postgres branch)
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```

3. Refresh browser and run installer again

## 📝 Environment Variables

**For MySQL (main / vercel-serverless branches):**
```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=pos_warung
NODE_ENV=development
PORT=3000
```

**For PostgreSQL (supabase-postgres branch):**
```env
# Option 1: Connection string (Supabase/Neon)
DATABASE_URL=postgresql://user:password@host:5432/database

# Option 2: Individual variables (local)
DATABASE_HOST=localhost
DATABASE_USER=postgres
DATABASE_PASSWORD=
DATABASE_NAME=pos_warung
DATABASE_PORT=5432
NODE_ENV=development
```

## ☁️ Deployment

### Quick Comparison:

| Platform | Branch | Database | Free Tier | Setup | Web Installer |
|----------|--------|----------|-----------|-------|---------------|
| **Supabase + Vercel** | `supabase-postgres-serverless` | PostgreSQL | ✅ 500MB | ⭐ Easy | ❌ Manual |
| **Supabase + Railway** | `supabase-postgres` | PostgreSQL | ✅ 500MB | ⭐⭐ Medium | ✅ Yes |
| **Railway** | `main` | MySQL | ✅ $5/mo | ⭐⭐ Medium | ✅ Yes |
| **Vercel + PlanetScale** | `vercel-serverless` | MySQL | ❌ $39/mo | ⭐⭐⭐ Hard | ❌ Manual |
| **VPS** | `main` | MySQL | ❌ Paid | ⭐⭐⭐ Hard | ✅ Yes |

### Deployment Guides:

- **Supabase (FREE):** [DEPLOYMENT-SUPABASE.md](DEPLOYMENT-SUPABASE.md)
- **Railway/Render/VPS:** [DEPLOYMENT.md](DEPLOYMENT.md)

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for small businesses**
