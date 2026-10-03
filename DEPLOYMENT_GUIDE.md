# Finlyzer VPS CI/CD Deployment Guide

This guide details how your application is automatically built on GitHub Actions and deployed to your VPS with zero VPS build overhead, fast rollouts, and **automated fail-safe rollback**.

---

## 🏗️ Architecture & Fail-Safe Strategy

```
[ Git Push (main) ]
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. GitHub Actions Cloud Runner (Build Stage)                │
│    - Runs `npm ci`                                          │
│    - Runs `npm run lint`                                    │
│    - Runs `npm run build` (Next.js Standalone Build)        │
│    - Multi-stage Docker packaging                          │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
   [Build Fails]                     [Build Passes]
        │                                 │
        ▼                                 ▼
⛔ Workflow STOPS IMMEDIATELY!      Pushes image to GHCR (ghcr.io)
VPS is NEVER touched.                     │
Previous version on VPS remains live!     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. VPS Deployment via SSH                                   │
│    - Pulls new pre-built image (zero build load on VPS CPU) │
│    - Restarts container with `docker compose up -d`         │
│    - Executes automated Health Check against `/api/health`   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
 [Health Check Fails]              [Health Check Passes]
        │                                 │
        ▼                                 ▼
🔄 AUTOMATIC ROLLBACK               ✅ Deployment Complete!
Rolls back to previous container     Prunes old images.
image and sends failure alert.
```

---

## 🔑 Step 1: Configure GitHub Secrets

Go to your GitHub Repository:
`Settings` ➔ `Secrets and variables` ➔ `Actions` ➔ `New repository secret`

Add the following 4 secrets:

| Secret Name   | Description                             | Example                                   |
| :------------ | :-------------------------------------- | :---------------------------------------- |
| `VPS_HOST`    | IP address or domain of your VPS        | `194.163.150.22`                          |
| `VPS_USER`    | SSH user (typically `root` or `ubuntu`) | `root`                                    |
| `VPS_SSH_KEY` | Private SSH Key (OpenSSH format)        | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `VPS_PORT`    | SSH Port (default: 22)                  | `22`                                      |

> [!TIP]
> **Generating a dedicated Deploy SSH Key on your local machine:**
>
> ```bash
> ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
> ```
>
> - Add the **Public Key** (`~/.ssh/github_deploy.pub`) to your VPS: `~/.ssh/authorized_keys`
> - Add the **Private Key** (`~/.ssh/github_deploy`) content as the GitHub Secret `VPS_SSH_KEY`.

---

## 🖥️ Step 2: One-Time VPS Setup

Run these commands on your VPS (Ubuntu/Debian) to prepare Docker and the deploy directory:

### 1. Install Docker & Docker Compose Plugin

```bash
# Update and install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker is running
docker --version
docker compose version
```

### 2. Create the Deployment Directory & Environment File

```bash
sudo mkdir -p /var/www/finlyzer
cd /var/www/finlyzer

# Create your production .env file
sudo nano .env
```

Paste your production environment variables into `/var/www/finlyzer/.env`:

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
```

---

## 🌐 Step 3: Nginx & SSL Setup (Reverse Proxy to Port 3000)

To serve `https://finlyzers.com` with automatic SSL certificates:

### 1. Install Nginx and Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/finlyzer`:

```nginx
server {
    server_name finlyzers.com www.finlyzers.com;

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

    # Increase upload size for PDF / Statement uploads (e.g. 50MB)
    client_max_body_size 50M;
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/finlyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Generate Free SSL Certificate

```bash
sudo certbot --nginx -d finlyzers.com -d www.finlyzers.com
```

---

## 🚀 Step 4: How Deployment Works

Every time you push code to `main`:

```bash
git add .
git commit -m "feat: updates"
git push origin main
```

1. GitHub Actions runs `.github/workflows/deploy.yml`.
2. All compilation, linting, and Docker packaging executes on GitHub's free runners.
3. If successful, GitHub connects to your VPS and restarts the container safely.
4. The workflow verifies `/api/health`. If it fails, it rolls back automatically and notifies you in GitHub Actions!
