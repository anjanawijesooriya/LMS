# LMS Platform — Deployment Guide

This guide covers deploying the LMS platform to production. The app has a Node/Express backend and a React frontend — they can be deployed together on one server or separately.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Option A — Monorepo on a VPS (Recommended)](#option-a--monorepo-on-a-vps-recommended)
4. [Option B — Separate Services (Frontend on Vercel / Backend on Render)](#option-b--separate-services)
5. [Environment Variables (Production)](#environment-variables-production)
6. [MongoDB Atlas Setup](#mongodb-atlas-setup)
7. [Cloudinary Setup](#cloudinary-setup)
8. [Gmail App Password Setup](#gmail-app-password-setup)
9. [Google Drive Backup Setup](#google-drive-backup-setup)
10. [Nginx Reverse Proxy](#nginx-reverse-proxy)
11. [SSL with Let's Encrypt](#ssl-with-lets-encrypt)
12. [PM2 Process Manager](#pm2-process-manager)
13. [Post-Deployment Checks](#post-deployment-checks)
14. [Updating the App](#updating-the-app)
15. [Rollback](#rollback)

---

## Architecture Overview

```
Internet
   │
   ▼
Nginx (port 80 / 443)
   ├── /api/*  →  Node/Express (port 8071)  →  MongoDB Atlas
   ├── /classes, /courses, /payments, /upload  →  Node/Express
   └── /*      →  React build (static files)
```

The React frontend is a static build served by Nginx. The backend runs as a Node process managed by PM2.

---

## Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] Cloudinary account created
- [ ] Gmail App Password generated
- [ ] Domain name pointed to your server IP (A record)
- [ ] `.env` variables ready for production
- [ ] Google Drive backup configured (optional but recommended)
- [ ] Server running Ubuntu 20.04+ or similar Linux distro

---

## Option A — Monorepo on a VPS (Recommended)

Best for full control. Uses a single VPS (e.g., DigitalOcean, Hetzner, AWS EC2).

### 1. Connect to your server

```bash
ssh root@your-server-ip
```

### 2. Install Node.js (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v   # should print v20.x.x
```

### 3. Install Git and clone the repo

```bash
apt update && apt install -y git
git clone https://github.com/your-username/lms.git /var/www/lms
cd /var/www/lms
```

### 4. Install dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### 5. Build the React frontend

```bash
cd frontend
npm run build
cd ..
```

This creates `frontend/build/` — a static folder Nginx will serve.

### 6. Create the production `.env`

```bash
nano /var/www/lms/.env
```

Paste all production environment variables (see [Environment Variables](#environment-variables-production)).

### 7. Install and configure PM2

```bash
npm install -g pm2
pm2 start server.js --name lms-backend
pm2 save
pm2 startup   # follow the printed command to enable on reboot
```

### 8. Install and configure Nginx

```bash
apt install -y nginx
```

Create a site config:

```bash
nano /etc/nginx/sites-available/lms
```

Paste the Nginx config (see [Nginx Reverse Proxy](#nginx-reverse-proxy)).

```bash
ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
nginx -t        # test config
systemctl reload nginx
```

### 9. Add SSL

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Option B — Separate Services

Deploy the frontend and backend independently. Good for managed hosting without a VPS.

### Frontend — Vercel

1. Push `frontend/` to a GitHub repo (or use the full monorepo)
2. Import the project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `build`
6. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.com`
7. Update `axiosInstance.js` to use `process.env.REACT_APP_API_URL` as the base URL

### Backend — Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `.` (project root)
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `node server.js`
6. Add all environment variables from `.env` in the Render dashboard
7. Set `CLIENT_URL` to your Vercel frontend URL (for CORS)

### Backend — Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set start command: `node server.js`
3. Add environment variables
4. Railway auto-assigns a public URL — use that as your API base URL in the frontend

---

## Environment Variables (Production)

Set these on your server's `.env` or in your hosting provider's environment settings.

```env
# Node
NODE_ENV=production

# MongoDB Atlas
MONGODB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/lms?retryWrites=true&w=majority

# JWT
JWT_SECRET=use_a_long_random_string_at_least_64_chars
JWT_EXPIRE=24h

# Frontend URL — used for CORS and password reset email links
CLIENT_URL=https://yourdomain.com

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx   # 16-char App Password

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_APIKEY=your_api_key
CLOUDINARY_APISECRET=your_api_secret

# Rate Limiting
AUTH_RATE_LIMIT=20
API_RATE_LIMIT=200

# Admin alert email
ADMIN_EMAIL=admin@yourdomain.com

# Google Drive Backup (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=
BACKUP_ENCRYPTION_KEY=use_a_random_32_char_key
```

**Important:** Never commit `.env` to Git. It is already in `.gitignore`.

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster (or paid for production)
3. **Database Access** → Add a database user with a strong password
4. **Network Access** → Add your server's IP address (or `0.0.0.0/0` to allow all — less secure)
5. **Connect** → Drivers → Copy the connection string
6. Replace `<password>` in the string and set it as `MONGODB_URL` in `.env`

---

## Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. Dashboard → Copy **Cloud Name**, **API Key**, **API Secret**
3. Set them as `CLOUDINARY_NAME`, `CLOUDINARY_APIKEY`, `CLOUDINARY_APISECRET` in `.env`
4. No extra config needed — the app streams uploads directly to Cloudinary

---

## Gmail App Password Setup

Google blocks direct password login for apps. Use an App Password:

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** if not already on
3. Search "App Passwords" → Generate one for "Mail" / "Other"
4. Copy the 16-character password
5. Set `EMAIL_PASSWORD=xxxx xxxx xxxx xxxx` in `.env` (spaces are optional)

---

## Google Drive Backup Setup

See `BACKUP_SETUP.md` for the full guide. Summary:

1. Create a Google Cloud project and enable the Drive API
2. Create OAuth2 credentials (Desktop app type)
3. Run the one-time token script on your local machine:
   ```bash
   node BACKEND/scripts/getDriveToken.js
   ```
4. Follow the browser prompt, paste the auth code
5. Copy the refresh token to your server's `.env`
6. Create a folder in Google Drive, copy the folder ID to `GOOGLE_DRIVE_FOLDER_ID`

---

## Nginx Reverse Proxy

Place this in `/etc/nginx/sites-available/lms`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve React static build
    root /var/www/lms/frontend/build;
    index index.html;

    # API requests → Node backend
    location ~ ^/(api|classes|courses|payments|upload) {
        proxy_pass http://localhost:8071;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # React Router — serve index.html for all other routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Increase upload size limit (for payment slip images)
    client_max_body_size 10M;
}
```

After adding SSL via Certbot, it will automatically add the HTTPS server block.

---

## SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your actual domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically — verify it
certbot renew --dry-run
```

Certbot modifies the Nginx config to redirect HTTP → HTTPS and adds the certificate paths.

---

## PM2 Process Manager

PM2 keeps the Node server running and restarts it if it crashes.

```bash
# Start the app
pm2 start server.js --name lms-backend

# View logs
pm2 logs lms-backend

# View status
pm2 status

# Restart after code update
pm2 restart lms-backend

# Stop
pm2 stop lms-backend

# Enable auto-start on server reboot
pm2 save
pm2 startup   # run the command it prints
```

### PM2 Ecosystem File (optional)

Create `ecosystem.config.js` at project root for reproducible restarts:

```js
module.exports = {
  apps: [{
    name: 'lms-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

```bash
pm2 start ecosystem.config.js --env production
```

---

## Post-Deployment Checks

After deploying, verify each of these:

- [ ] `https://yourdomain.com` loads the React app
- [ ] `https://yourdomain.com/api/auth/login` returns JSON (not HTML)
- [ ] Login works and JWT is returned
- [ ] Image upload works (profile photo or payment slip)
- [ ] Password reset email arrives
- [ ] Admin dashboard loads and data fetches correctly
- [ ] PM2 shows the process as `online`: `pm2 status`
- [ ] Nginx is running: `systemctl status nginx`
- [ ] MongoDB connection is healthy: check PM2 logs for "MongoDB Connected"
- [ ] SSL certificate is valid (green padlock in browser)

---

## Updating the App

When you push new code, follow these steps on the server:

```bash
cd /var/www/lms

# Pull latest changes
git pull origin main

# Install any new backend dependencies
npm install

# Rebuild frontend if any frontend files changed
cd frontend
npm install
npm run build
cd ..

# Restart backend
pm2 restart lms-backend

# Reload Nginx if config changed (usually not needed)
nginx -t && systemctl reload nginx
```

---

## Rollback

If something breaks after an update:

```bash
cd /var/www/lms

# Find the last working commit
git log --oneline -10

# Roll back to a specific commit
git checkout <commit-hash>

# Rebuild frontend
cd frontend && npm run build && cd ..

# Restart
pm2 restart lms-backend
```

To return to the latest:
```bash
git checkout main
git pull
```

---

*Last updated: 2026-06-23*
