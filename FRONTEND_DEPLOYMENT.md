# True Bread Frontend - Hostinger VPS Deployment Guide

## Prerequisites

- Backend already deployed and running
- Node.js installed on your VPS
- Nginx configured (from backend deployment)
- SSH access to your VPS

## Step 1: Prepare Frontend for Production

### 1.1 Update Environment Configuration

First, update your production environment file:

```bash
# On your local machine, edit src/environments/environment.prod.ts
```

Update it with your production API URL:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://thetruebread.com/api',  // or http://thetruebread.com/api if no SSL yet
  baseUrl: 'https://thetruebread.com',
  googleAnalytics: {
    measurementId: 'G-BS1FZGWPN8' // if you have Google Analytics
  }
};
```

### 1.2 Build Frontend for Production

On your local machine:
```bash
# Navigate to your project root
cd /path/to/your/true-bread-project

# Install dependencies if not already done
npm install

# Build for production
ng build --configuration production

# This creates a 'dist' folder with your built frontend
```

## Step 2: Deploy Frontend to VPS

### 2.1 Create Frontend Directory on VPS

```bash
# SSH into your VPS
ssh root@your-server-ip

# Create frontend directory
sudo mkdir -p /var/www/truebread-frontend
sudo chown $USER:$USER /var/www/truebread-frontend
```

### 2.2 Upload Frontend Files

**Option A: Using SCP (from your local machine)**

```bash
# From your local machine, upload the built files
scp -r ./dist/true-bread/* root@your-server-ip:/var/www/truebread-frontend/

# Or if you have a different user
scp -r ./dist/true-bread/* your-username@your-server-ip:/var/www/truebread-frontend/
```

**Option B: Using Git (on VPS)**

```bash
# On your VPS
cd /var/www/truebread-frontend

# Clone the repository
git clone https://github.com/your-username/true-bread.git temp-repo

# Install Node.js dependencies
cd temp-repo
npm install

# Build the frontend
ng build --configuration production

# Move built files to frontend directory
mv dist/true-bread/* /var/www/truebread-frontend/
cd /var/www/truebread-frontend
rm -rf temp-repo

# Verify files are there
ls -la
# Should see: index.html, main.js, styles.css, assets/, etc.
```

### 2.3 Set Proper Permissions

```bash
# Set proper ownership and permissions
sudo chown -R www-data:www-data /var/www/truebread-frontend
sudo chmod -R 755 /var/www/truebread-frontend
```

## Step 3: Update Nginx Configuration

### 3.1 Update Nginx Config for Frontend

```bash
sudo nano /etc/nginx/sites-available/truebread
```

Update your configuration to serve the frontend:

```nginx
server {
    listen 80;
    server_name thetruebread.com www.thetruebread.com;

    # Serve frontend files
    location / {
        root /var/www/truebread-frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes - forwards to your Node.js backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Let's Encrypt verification (keep this for SSL setup)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 3.2 Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

## Step 4: Test Frontend Deployment

### 4.1 Test Frontend Access

```bash
# Test from your server
curl -I http://thetruebread.com/
curl -I http://www.thetruebread.com/

# Should return 200 OK and show HTML content
```

### 4.2 Test API Connection

```bash
# Test if frontend can reach API
curl -I http://thetruebread.com/api/health
curl -I http://www.thetruebread.com/api/health
```

### 4.3 Access from Browser

Open your browser and go to:
- `http://thetruebread.com`
- `http://www.thetruebread.com`

You should see your True Bread website loading!

## Step 5: Frontend Update Script

Create a script for easy frontend updates:

```bash
nano /home/$USER/update-frontend.sh
```

```bash
#!/bin/bash
FRONTEND_DIR="/var/www/truebread-frontend"
BACKUP_DIR="/home/$USER/frontend-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting frontend update..."

# Create backup
mkdir -p $BACKUP_DIR
cp -r $FRONTEND_DIR $BACKUP_DIR/frontend_backup_$DATE

# Navigate to temp directory
cd /tmp

# Clone latest code
git clone https://github.com/your-username/true-bread.git temp-frontend-update
cd temp-frontend-update

# Install dependencies and build
npm install
ng build --configuration production

# Replace frontend files
sudo rm -rf $FRONTEND_DIR/*
sudo cp -r dist/true-bread/* $FRONTEND_DIR/

# Set permissions
sudo chown -R www-data:www-data $FRONTEND_DIR
sudo chmod -R 755 $FRONTEND_DIR

# Clean up
cd /
rm -rf /tmp/temp-frontend-update

echo "Frontend update completed!"
echo "Backup saved to: $BACKUP_DIR/frontend_backup_$DATE"
```

```bash
chmod +x /home/$USER/update-frontend.sh
```

## Step 6: SSL Configuration (After You Get Certificate)

Once you get your SSL certificate working, update your Nginx config:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name thetruebread.com www.thetruebread.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name thetruebread.com www.thetruebread.com;

    ssl_certificate /etc/letsencrypt/live/thetruebread.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thetruebread.com/privkey.pem;

    # Your existing location blocks...
    location / {
        root /var/www/truebread-frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        # ... rest of proxy config
    }

    # ... rest of your configuration
}
```

## Troubleshooting

### Common Issues:

1. **404 errors on page refresh:**
   - Make sure `try_files $uri $uri/ /index.html;` is in your Nginx config

2. **API calls failing:**
   - Check if backend is running: `pm2 status`
   - Verify API URL in environment.prod.ts

3. **Static files not loading:**
   - Check file permissions: `ls -la /var/www/truebread-frontend`
   - Verify Nginx config for static file serving

4. **CORS errors:**
   - Make sure your backend allows your domain in CORS settings

### Useful Commands:

```bash
# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check frontend files
ls -la /var/www/truebread-frontend

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Test specific routes
curl -I http://thetruebread.com/
curl -I http://thetruebread.com/api/health
```

---

**Your frontend should now be deployed and accessible at http://thetruebread.com!**

Once you get the SSL certificate working, update the Nginx config to use HTTPS and your site will be fully production-ready.
