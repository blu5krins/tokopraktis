# Supabase Deployment Guide

## Prerequisites

1. [Supabase](https://supabase.com) account (free tier available)
2. [Vercel](https://vercel.com) account (optional, can use any hosting)

## Option 1: Vercel + Supabase (Recommended)

### Step 1: Setup Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and region
   - Set database password (save this!)
   - Wait for project to finish provisioning

2. **Get Connection String**
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Copy the "Connection pooling" URI (Transaction mode)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres`

3. **Import Database Schema**
   
   **Option A: Using Supabase SQL Editor (Easiest)**
   - Go to SQL Editor in Supabase dashboard
   - Click "New Query"
   - Copy and paste content from these files **in order**:
     1. `migration-00-schema-postgres.sql`
     2. `migration-01-users-postgres.sql`
     3. `migration-02-transactions-postgres.sql`
     4. `migration-settings-postgres.sql`
     5. `migration-stock-purchases-postgres.sql`
     6. `migration-unit-pricing-postgres.sql`
   - Click "Run" after each file

   **Option B: Using CLI**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < migration-00-schema-postgres.sql
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < migration-01-users-postgres.sql
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < migration-02-transactions-postgres.sql
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < migration-settings-postgres.sql
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < migration-stock-purchases-postgres.sql
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < migration-unit-pricing-postgres.sql
   ```

### Step 2: Deploy to Vercel

1. **Push Branch to GitHub**
   ```bash
   git push origin supabase-postgres
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - **Select branch: `supabase-postgres`**
   - Click "Import"

3. **Configure Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access your app!

5. **Login**
   - Default credentials:
     - Username: `admin`
     - Password: `admin123`
   - **Change password immediately!**

### Troubleshooting

**Connection errors:**
- Ensure you're using the "Connection pooling" URI (port 6543)
- Add `?pgbouncer=true` at the end of DATABASE_URL
- Check Supabase project status (Settings → Database)
- Verify password is correct

**Build errors:**
- Check build logs in Vercel dashboard
- Ensure all migration files were imported successfully
- Try rebuilding: Deployments → three dots → Redeploy

## Option 2: Supabase + Render/Railway

### Using Render

1. **Setup Supabase** (same as above)

2. **Deploy to Render**
   - Create new Web Service
   - Connect repository
   - Select branch: `supabase-postgres`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   NODE_ENV=production
   PORT=3000
   ```

### Using Railway

1. **Setup Supabase** (same as above)

2. **Deploy to Railway**
   - Create new project
   - Connect GitHub repo
   - Select branch: `supabase-postgres`

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   NODE_ENV=production
   ```

## Option 3: Full Supabase Stack (Auth + Database)

For advanced users who want to use Supabase Auth:

```typescript
// lib/db.ts - Alternative using Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default supabase
```

Requires rewriting all API routes to use Supabase client instead of raw PostgreSQL.

## Local Development

1. **Install PostgreSQL**
   ```bash
   # Windows (with chocolatey)
   choco install postgresql
   
   # macOS
   brew install postgresql
   
   # Linux
   sudo apt-get install postgresql
   ```

2. **Create Database**
   ```bash
   psql -U postgres
   CREATE DATABASE pos_warung;
   \q
   ```

3. **Import Schema**
   ```bash
   psql -U postgres -d pos_warung < migration-00-schema-postgres.sql
   psql -U postgres -d pos_warung < migration-01-users-postgres.sql
   psql -U postgres -d pos_warung < migration-02-transactions-postgres.sql
   psql -U postgres -d pos_warung < migration-settings-postgres.sql
   psql -U postgres -d pos_warung < migration-stock-purchases-postgres.sql
   psql -U postgres -d pos_warung < migration-unit-pricing-postgres.sql
   ```

4. **Environment Variables**
   Create `.env.local`:
   ```
   DATABASE_HOST=localhost
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=pos_warung
   DATABASE_PORT=5432
   NODE_ENV=development
   ```

5. **Run Development Server**
   ```bash
   npm install
   npm run dev
   ```

## Free Tier Limits

**Supabase Free Tier:**
- 500MB database storage
- 2GB bandwidth/month
- 50,000 monthly active users
- Unlimited API requests
- Paused after 7 days inactivity (resumes automatically on access)

**Alternative: Neon**
- 512MB storage (forever)
- No time limit
- Auto-suspend when idle
- Good for production

**Alternative: ElephantSQL**
- 20MB free tier (very limited)
- Good for testing only

## Comparison: Database Providers

| Provider | Free Storage | Bandwidth | Best For |
|----------|-------------|-----------|----------|
| **Supabase** | 500MB | 2GB/mo | Full-stack apps |
| **Neon** | 512MB | 10GB/mo | Production apps |
| **ElephantSQL** | 20MB | 5 connections | Testing only |
| **Railway** | 512MB + $5 credit | Unlimited | Simple setup |

## Migration from MySQL Version

Already using the MySQL version (main branch)?

1. **Export MySQL Data**
   ```bash
   mysqldump -u root -p pos_warung > backup.sql
   ```

2. **Convert to PostgreSQL**
   - Install [pgloader](https://github.com/dimitri/pgloader)
   - Create conversion file:
     ```
     LOAD DATABASE
       FROM mysql://root:password@localhost/pos_warung
       INTO postgresql://postgres:password@localhost/pos_warung;
     ```
   - Run: `pgloader migration.load`

3. **Or Manual Migration**
   - Export data as CSV from MySQL
   - Import CSV to PostgreSQL using COPY command

## Support

For deployment issues:
1. Check Supabase project logs
2. Verify all migration files imported successfully
3. Test connection string with psql
4. Review Vercel/Render build logs

---

**Need help?** Open an issue on GitHub
