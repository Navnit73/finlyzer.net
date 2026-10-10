# Finlyzers VPS CI/CD Deployment Guide (PM2 Standalone)

This setup uses **GitHub Actions** to build, test, and bundle your Next.js standalone application in the cloud, then transfers only the pre-built bundle to your VPS where **PM2** runs it.

**Zero building happens on the VPS**, saving CPU and RAM.

---

## 🏗️ Architecture & Fail-Safe Strategyy

```
[ Git Push to main ]
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. GitHub Actions Cloud Runner (Build Stage)                │
│    - Runs `npm ci`                                          │
│    - Runs `npm run lint` & `npx tsc --noEmit`               │
│    - Runs `npm run build` (Next.js Standalone Build)        │
│    - Packages `release.tar.gz` (standalone + static assets) │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
   [Build Fails]                     [Build Passes]
        │                                 │
        ▼                                 ▼
⛔ Workflow STOPS IMMEDIATELY!      Uploads `release.tar.gz` to VPS
VPS is NEVER touched.                     │
Previous version on VPS remains live!     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. VPS Deployment via SSH (Zero Build Load)                 │
│    - Extracts to `/var/www/finlyzers/releases/release-<sha>`│
│    - Switches `/var/www/finlyzers/current` symlink          │
│    - Reloads PM2 (`pm2 reload finlyzers`)                   │
│    - Runs Automated Health Check on `/api/health`           │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
 [Health Check Fails]              [Health Check Passes]
        │                                 │
        ▼                                 ▼
🔄 AUTOMATIC ROLLBACK               ✅ Deployment Complete!
Reverts symlink to previous          Keeps latest 5 releases.
working release and reloads PM2.
```

---

## 🔑 Step 1: Configure GitHub Secrets

Go to your GitHub Repository:
`Settings` ➔ `Secrets and variables` ➔ `Actions` ➔ `New repository secret`

Add these 4 secrets:

| Secret Name   | Description                             | Example                                   |
| :------------ | :-------------------------------------- | :---------------------------------------- |
| `VPS_HOST`    | IP address or domain of your VPS        | `194.163.150.22`                          |
| `VPS_USER`    | SSH user (e.g. `root` or `ubuntu`)      | `root`                                    |
| `VPS_SSH_KEY` | Private SSH Key (OpenSSH format)        | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `VPS_PORT`    | SSH Port (default: 22)                  | `22`                                      |

---

## 🖥️ Step 2: One-Time VPS Setup (Node.js + PM2)

Run these commands on your VPS (Ubuntu/Debian):

### 1. Install Node.js 20 & PM2
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Enable PM2 to auto-start on server boot
pm2 startup
```

### 2. Create the App Directory & `.env`
```bash
sudo mkdir -p /var/www/finlyzers/releases
cd /var/www/finlyzers

# Create your production environment file
sudo nano .env
```

Paste your production environment variables into `/var/www/finlyzers/.env`:
```env
PORT=3000
NODE_ENV=production

# OCR Backend API (FastAPI)
OCR_API_BASE_URL=http://your-ocr-ip:8000/api/v1
OCR_API_KEY=your_production_ocr_key

# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/finlyzer

# NextAuth / Google OAuth
NEXTAUTH_URL=https://finlyzers.com
NEXTAUTH_SECRET=your_long_random_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay (use rzp_live_* keys in production)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_random_webhook_secret
RAZORPAY_CURRENCY=USD

# Resend (purchase receipts + low-credit alerts); domain must be verified in Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Finlyzers <billing@finlyzers.com>
```

> **Razorpay webhook:** in Dashboard → Webhooks add `https://finlyzers.com/api/razorpay/webhook`, use the same secret as `RAZORPAY_WEBHOOK_SECRET`, and subscribe to `payment.captured`, `order.paid` and `payment.failed`. These variables are read at runtime from `.env`, so restart the app after changing them.

---

## 🌐 Step 3: Nginx & SSL Setup (Reverse Proxy to Port 3000)

### 1. Install Nginx and Certbot
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx
Create `/etc/nginx/sites-available/finlyzers`:
```nginx
# One canonical host for SEO: send www to the apex (the app also redirects www, see next.config.ts).
server {
    server_name www.finlyzers.com;
    return 301 https://finlyzers.com$request_uri;
}

server {
    server_name finlyzers.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Support up to 50MB statement uploads
    client_max_body_size 50M;
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/finlyzers /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Generate Free SSL Certificate
```bash
sudo certbot --nginx -d finlyzers.com -d www.finlyzers.com
```
When certbot asks, choose **Redirect** so all HTTP traffic is sent to HTTPS.

---

## 🚀 Step 4: How Deployment Works

Every time you push code:
```bash
git add .
git commit -m "feat: new updates"
git push origin main
```

1. GitHub Actions runs linting, type checks, and standalone compilation in GitHub's cloud.
2. If build fails, GitHub Actions stops immediately and your live server is not touched.
3. If build succeeds, it sends `release.tar.gz` to your VPS, switches the symlink `/var/www/finlyzers/current`, and reloads PM2.
4. If health check fails on VPS, it automatically reverts to the previous release.
