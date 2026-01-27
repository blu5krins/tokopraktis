# Deployment Guide

## Branch Overview

- **`main`** - Full version with web installer, local MySQL, file system markers
  - Best for: VPS, dedicated servers, Render, Railway
  - Features: Web setup wizard, auto-install, local database
  
- **`vercel-serverless`** - Serverless optimized, external database required
  - Best for: Vercel, Netlify, serverless platforms
  - Features: PlanetScale support, no file system dependencies, manual setup

## Vercel + PlanetScale (Serverless)

### 1. Prepare PlanetScale Database

1. Create account at [planetscale.com](https://planetscale.com)
2. Create new database: `tokopraktis`
3. Create branch: `main`
4. Connect to database console
5. Import schema:
   - Copy content from `migration-00-schema.sql` → Execute
   - Copy content from `migration-01-users.sql` → Execute
   - Copy content from `migration-02-transactions.sql` → Execute
   - Copy content from `migration-payment-method.sql` → Execute
   - Copy content from `migration-settings.sql` → Execute
   - Copy content from `migration-stock-purchases.sql` → Execute
   - Copy content from `migration-unit-pricing.sql` → Execute

6. Create password for Vercel:
   ```bash
   pscale password create tokopraktis main vercel-connection
   ```
   
7. Copy the connection string (starts with `mysql://`)

### 2. Deploy to Vercel

1. Push this branch to GitHub:
   ```bash
   git push origin vercel-serverless
   ```

2. Import project in Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - **Select branch: `vercel-serverless`**
   - Click "Import"

3. Configure environment variables:
   ```
   DATABASE_URL=mysql://user:pass@host/database?ssl={"rejectUnauthorized":true}
   NODE_ENV=production
   ```

4. Deploy!

5. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
   - **Change password immediately!**

### Troubleshooting

**Connection errors:**
- Ensure DATABASE_URL includes `?ssl={"rejectUnauthorized":true}`
- Check PlanetScale connection is active
- Verify database branch is promoted (not in development mode)

**Setup page shows:**
- This is normal for serverless - the installer is disabled
- Direct access to `/setup` will still work but installation won't persist
- Use manual database import instead

## Render (Full Version)

Use the `main` branch for Render deployment.

### 1. Prepare Database

1. Create MySQL database in Render dashboard
2. Note the Internal Database URL

### 2. Deploy

1. Create new Web Service in Render
2. Connect your repository
3. **Select branch: `main`**
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   
5. Add environment variables:
   ```
   DATABASE_HOST=<render-mysql-host>
   DATABASE_USER=<username>
   DATABASE_PASSWORD=<password>
   DATABASE_NAME=<database-name>
   NODE_ENV=production
   PORT=3000
   ```

6. Deploy and access `/setup` for web installer

## Railway (Full Version)

Use the `main` branch for Railway deployment.

### 1. Deploy

1. Create new project in Railway
2. Add MySQL plugin from marketplace
3. Add GitHub repo:
   - Connect repository
   - **Select branch: `main`**
   - Railway auto-detects Next.js

4. Environment variables (auto-configured from MySQL plugin):
   ```
   DATABASE_HOST=${{MYSQL.MYSQLHOST}}
   DATABASE_USER=${{MYSQL.MYSQLUSER}}
   DATABASE_PASSWORD=${{MYSQL.MYSQLPASSWORD}}
   DATABASE_NAME=${{MYSQL.MYSQLDATABASE}}
   NODE_ENV=production
   ```

5. Access your app at provided URL
6. Complete web installer at `/setup`

## VPS / Dedicated Server (Full Version)

Use the `main` branch for VPS deployment.

### 1. Requirements

- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- MySQL 5.7+ or MariaDB
- Nginx (recommended)

### 2. Setup

```bash
# Clone repository
git clone <your-repo-url>
cd tokopraktis

# Install dependencies
npm install

# Create database
mysql -u root -p
CREATE DATABASE pos_warung;
exit

# Build application
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "tokopraktis" -- start
pm2 save
pm2 startup
```

### 3. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 5. Access & Setup

- Navigate to `http://yourdomain.com`
- Complete web installer
- Login and change default password

## Comparison

| Feature | Vercel (Serverless) | Render/Railway | VPS |
|---------|-------------------|----------------|-----|
| Web Installer | ❌ Manual setup | ✅ Full wizard | ✅ Full wizard |
| Database | 🔸 External (PlanetScale) | ✅ Included | ✅ Local |
| File System | ❌ Ephemeral | ✅ Persistent | ✅ Persistent |
| Setup Complexity | 🔴 High | 🟡 Medium | 🔴 High |
| Cost (Free Tier) | ✅ Generous | 🟡 Limited | ❌ Paid |
| Auto Scaling | ✅ Automatic | 🟡 Manual | ❌ Fixed |
| Best For | Low traffic, global CDN | Small business | Full control |

## Recommendations

- **Just testing/hobby?** → Vercel (free, fast, global)
- **Small business?** → Railway or Render (easier MySQL)
- **Production/commercial?** → VPS (full control, backup)
- **High traffic?** → VPS with load balancer

## Support

For deployment issues:
1. Check environment variables
2. Verify database connection
3. Review build logs
4. Test locally first with `npm run build && npm start`

---

**Need help?** Open an issue on GitHub
