# True Bread Backend - Hostinger VPS Deployment Guide

## Prerequisites

- Hostinger VPS with Ubuntu/CentOS
- SSH access to your VPS
- Domain name pointing to your VPS IP
- Root or sudo access

## Step 1: Server Setup

### 1.1 Connect to Your VPS
```bash
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

### 1.2 Update System
```bash
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# or
sudo yum update -y  # CentOS
```

### 1.3 Install Node.js (Latest LTS)
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.4 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 1.5 Install MySQL
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 1.6 Install Nginx (Reverse Proxy)
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 2: Database Setup

### 2.1 Create Database and User
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE truebread_prod;
CREATE USER 'truebread_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON truebread_prod.* TO 'truebread_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 Import Your Database
```bash
# Upload your SQL file to the server first
mysql -u truebread_user -p truebread_prod < /path/to/your/database.sql
```

## Step 3: Deploy Application

### 3.1 Create Application Directory
```bash
sudo mkdir -p /var/www/truebread-backend
sudo chown $USER:$USER /var/www/truebread-backend
cd /var/www/truebread-backend
```

### 3.2 Upload Your Code

**⚠️ IMPORTANT: If you already cloned the full repository, clean it up first:**
```bash
# If you already have files in /var/www/truebread-backend, clean them up
cd /var/www/truebread-backend
rm -rf * .*  2>/dev/null || true
```

Option A: Using Git (Recommended)
```bash
# You should be in /var/www/truebread-backend directory
cd /var/www/truebread-backend

# Clone the entire repository into a temporary directory
git clone https://github.com/your-username/true-bread.git temp-repo

# First, let's check what's in the repository
ls -la temp-repo/

# If there's a backend directory, move its contents:
if [ -d "temp-repo/backend" ]; then
    mv temp-repo/backend/* .
    mv temp-repo/backend/.* . 2>/dev/null || true
else
    # If backend files are in the root, move them directly
    mv temp-repo/* .
    mv temp-repo/.* . 2>/dev/null || true
fi

# Clean up temporary directory
rm -rf temp-repo

# Verify you're in the right location (should see package.json, src/, etc.)
ls -la
```

Option B: Using SCP/SFTP
```bash
# From your local machine, upload only the backend folder contents
scp -r ./backend/* user@your-server-ip:/var/www/truebread-backend/
scp -r ./backend/.* user@your-server-ip:/var/www/truebread-backend/ 2>/dev/null || true
```

### 3.3 Install Dependencies
```bash
# Make sure you're in the backend directory (/var/www/truebread-backend)
cd /var/www/truebread-backend

# Install all dependencies first (including devDependencies needed for build)
npm install

# After building, we can clean up dev dependencies if needed
```

### 3.4 Configure Environment
```bash
# Copy and edit the production environment file
cp .env.production .env
nano .env
```

Update `.env` with your VPS details:
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com/api
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=truebread_prod
DB_USER=truebread_user
DB_PASSWORD=your_secure_password

# Email (use your email provider)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

CONTACT_EMAIL=contact@yourdomain.com
```

### 3.5 Build Application
```bash
npm run build:prod
```

### 3.6 Test Application
```bash
npm run start:prod
# Test in another terminal: curl http://localhost:3000/api/health
# Press Ctrl+C to stop
```

## Step 4: Configure PM2

### 4.1 Start with PM2
```bash
npm run pm2:start
```

### 4.2 Save PM2 Configuration
```bash
pm2 save
pm2 startup
# Follow the instructions shown
```

### 4.3 Monitor Application
```bash
pm2 status
pm2 logs true-bread-backend
pm2 monit
```

## Step 5: Configure Nginx Reverse Proxy

**What is this step?** Nginx will act as a reverse proxy, forwarding requests from your domain (thetruebread.com) to your Node.js backend running on port 3000. This allows users to access your API through your domain instead of directly accessing port 3000.

### 5.1 Create Nginx Configuration File

**Step-by-step explanation:**

1. **Create a new Nginx site configuration file:**
```bash
sudo nano /etc/nginx/sites-available/truebread
```
This command opens a text editor (nano) to create a new configuration file for your site.

2. **Copy and paste this configuration into the file:**
```nginx
server {
    listen 80;
    server_name thetruebread.com www.thetruebread.com;

    # API routes - forwards /api requests to your Node.js backend
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

    # Frontend (if serving from same server) - optional
    location / {
        root /var/www/truebread-frontend;
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

3. **Save and exit the file:**
   - Press `Ctrl + X`
   - Press `Y` to confirm
   - Press `Enter` to save

**What this configuration does:**
- **`listen 80`**: Nginx listens on port 80 (HTTP)
- **`server_name`**: Replace with your actual domain (thetruebread.com)
- **`location /api`**: Any request to yourdomain.com/api/* gets forwarded to localhost:3000
- **`location /health`**: Health check endpoint for monitoring
- **`location /`**: Serves your frontend files (if you have them on the same server)
- **Security headers**: Adds security headers to all responses

### 5.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/truebread /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: SSL Certificate (Let's Encrypt)

### 6.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Pre-SSL Verification (Important!)

**Before requesting SSL certificate, verify your setup:**

1. **Check if your domain points to your server:**
```bash
# Test domain resolution
nslookup thetruebread.com
nslookup www.thetruebread.com

# Should show your server's IP address
```

2. **Test HTTP access (port 80):**
```bash
# Test from your server
curl -I http://thetruebread.com/api/health
curl -I http://www.thetruebread.com/api/health

# Should return HTTP 200 OK
```

3. **Check Nginx configuration:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

4. **Ensure your backend is running:**
```bash
pm2 status
# Should show true-bread-backend as "online"
```

### 6.3 Obtain SSL Certificate

**Option A: Standard method (try this first):**
```bash
sudo certbot --nginx -d thetruebread.com -d www.thetruebread.com
```

**Option B: If Option A fails with 500 errors (like you experienced):**

1. **Temporarily modify Nginx config for SSL verification:**
```bash
sudo nano /etc/nginx/sites-available/truebread
```

Add this temporary location block inside the server block:
```nginx
server {
    listen 80;
    server_name thetruebread.com www.thetruebread.com;

    # Temporary: Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }

    # Your existing API routes...
    location /api {
        proxy_pass http://localhost:3000;
        # ... rest of your config
    }
    
    # ... rest of your existing configuration
}
```

2. **Create the verification directory:**
```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html
```

3. **Reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

4. **Try SSL certificate again:**
```bash
sudo certbot --nginx -d thetruebread.com -d www.thetruebread.com
```

**Option C: Manual verification (if both above fail):**
```bash
# Use webroot method
sudo certbot certonly --webroot -w /var/www/html -d thetruebread.com -d www.thetruebread.com
```

### 6.4 Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 6.5 SSL Troubleshooting

**If you get "unauthorized" or "500" errors:**

1. **Check domain DNS:**
   - Ensure thetruebread.com and www.thetruebread.com point to your server IP
   - Wait for DNS propagation (can take up to 24 hours)

2. **Check firewall:**
```bash
sudo ufw status
# Should allow 'Nginx Full' or ports 80 and 443
```

3. **Test domain accessibility:**
```bash
# From another computer/phone, try:
# http://thetruebread.com/api/health
# Should be accessible from internet
```

4. **Check Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

5. **Verify backend is responding:**
```bash
curl -I http://localhost:3000/api/health
# Should return 200 OK
```

**Common fixes:**
- Restart Nginx: `sudo systemctl restart nginx`
- Restart backend: `pm2 restart true-bread-backend`
- Check if port 80 is blocked by hosting provider
- Verify domain DNS settings in your domain registrar

## Step 7: Firewall Configuration

### 7.1 Configure UFW
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Step 8: Monitoring and Maintenance

### 8.1 Log Management
```bash
# View application logs
pm2 logs true-bread-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u nginx
```

### 8.2 Health Monitoring
Set up a monitoring script:

**First, create the script directory and file:**
```bash
# Create directory if it doesn't exist
mkdir -p ~/scripts

# Create the health check script
nano ~/scripts/health-check.sh
```

```bash
#!/bin/bash
HEALTH_URL="https://thetruebread.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Health check failed with status: $RESPONSE"
    pm2 restart true-bread-backend
    echo "Application restarted at $(date)" >> /var/log/truebread-restart.log
fi
```

**Make it executable and add to crontab:**
```bash
chmod +x ~/scripts/health-check.sh

# Add to crontab to run every 5 minutes
crontab -e
# Add this line (replace with your actual home path):
# */5 * * * * /root/scripts/health-check.sh

# Alternative: Use full path based on your user
# If you're root: */5 * * * * /root/scripts/health-check.sh
# If you're another user: */5 * * * * /home/yourusername/scripts/health-check.sh
```

**✅ Yes, `*/5 * * * * /root/scripts/health-check.sh` is correct!**

**Crontab format explanation:**
```
*/5 * * * * /root/scripts/health-check.sh
 │  │ │ │ │  └── Command to execute
 │  │ │ │ └───── Day of week (0-7, Sunday = 0 or 7)
 │  │ │ └────────── Month (1-12)
 │  │ └─────────────── Day of month (1-31)
 │  └──────────────────── Hour (0-23)
 └───────────────────────── Minute (0-59, */5 = every 5 minutes)
```

This will run the health check script every 5 minutes, 24/7.

**To find your correct home directory path:**
```bash
echo $HOME
pwd
whoami
```

**📝 Nano Editor Tips:**

If you get "cutbuffer empty" when trying to paste in nano:

1. **Copy text properly in nano:**
   - Use `Ctrl + K` to cut/copy lines in nano
   - Use `Ctrl + U` to paste in nano

2. **Paste from external clipboard:**
   - **Windows/PuTTY:** Right-click to paste
   - **Mac Terminal:** `Cmd + V`
   - **Linux Terminal:** `Ctrl + Shift + V` or middle mouse button

3. **Alternative: Create file with echo:**
   ```bash
   # Instead of using nano, create the file directly:
   cat > ~/scripts/health-check.sh << 'EOF'
   #!/bin/bash
   HEALTH_URL="https://thetruebread.com/api/health"
   RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

   if [ $RESPONSE -ne 200 ]; then
       echo "Health check failed with status: $RESPONSE"
       pm2 restart true-bread-backend
       echo "Application restarted at $(date)" >> /var/log/truebread-restart.log
   fi
   EOF
   ```

4. **Or use vim instead of nano:**
   ```bash
   vim ~/scripts/health-check.sh
   # Press 'i' to enter insert mode
   # Paste your content
   # Press 'Esc' then type ':wq' to save and exit
   ```

## Step 9: Backup Strategy

### 9.1 Database Backup Script
```bash
# Create the backup script
nano ~/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u truebread_user -p'your_secure_password' truebread_prod > $BACKUP_DIR/truebread_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "truebread_*.sql" -mtime +7 -delete
```

```bash
chmod +x ~/scripts/backup-db.sh

# Add to crontab for daily backup at 2 AM
crontab -e
# Add this line (adjust path based on your user):
# 0 2 * * * /root/scripts/backup-db.sh
```

## Step 10: Deployment Script

Create an automated deployment script:
```bash
# Create the deployment script
nano ~/scripts/deploy.sh
```

```bash
#!/bin/bash
APP_DIR="/var/www/truebread-backend"
BACKUP_DIR="$HOME/app-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting deployment..."

# Create backup
mkdir -p $BACKUP_DIR
cp -r $APP_DIR $BACKUP_DIR/backup_$DATE

# Navigate to app directory
cd $APP_DIR

# Pull latest changes from the temp repo and update backend files
git clone https://github.com/anishmohandas/true-bread.git temp-update

# Check if backend directory exists and copy accordingly
if [ -d "temp-update/backend" ]; then
    cp -r temp-update/backend/* .
    cp -r temp-update/backend/.* . 2>/dev/null || true
else
    cp -r temp-update/* .
    cp -r temp-update/.* . 2>/dev/null || true
fi

rm -rf temp-update

# Install dependencies (including devDependencies needed for build)
npm install

# Build application
npm run build:prod

# Restart application
pm2 restart true-bread-backend

# Check health
sleep 5
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://thetruebread.com/api/health)

if [ $HEALTH_CHECK -eq 200 ]; then
    echo "Deployment successful! Health check passed."
else
    echo "Deployment failed! Rolling back..."
    pm2 stop true-bread-backend
    rm -rf $APP_DIR/*
    rm -rf $APP_DIR/.*
    cp -r $BACKUP_DIR/backup_$DATE/* $APP_DIR/
    cp -r $BACKUP_DIR/backup_$DATE/.* $APP_DIR/ 2>/dev/null || true
    cd $APP_DIR
    pm2 start true-bread-backend
    echo "Rollback completed."
fi
```

```bash
chmod +x ~/scripts/deploy.sh
```

## Troubleshooting

### Common Issues:

1. **503 Service Unavailable Error (Database Connection Issue):**
   
   **Problem:** The most common issue is IPv6 vs IPv4 connection problems where Node.js tries to connect to MySQL using `localhost` which resolves to IPv6 (`::1:3306`), but MySQL only listens on IPv4 (`127.0.0.1:3306`).
   
   **Symptoms:**
   - `/api/ping` endpoint works (200 OK)
   - `/api/health` endpoint fails (503 Service Unavailable)
   - Error in logs: `connect ECONNREFUSED ::1:3306`
   
   **Solution:**
   ```bash
   # Test the issue first
   cd /var/www/truebread-backend
   node -e "
   require('dotenv').config();
   const mysql = require('mysql2/promise');
   console.log('Testing with localhost:', process.env.DB_HOST);
   const pool = mysql.createPool({
     host: process.env.DB_HOST || 'localhost',
     port: process.env.DB_PORT || 3306,
     database: process.env.DB_NAME,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD
   });
   pool.getConnection().then(conn => {
     console.log('✅ Connected successfully');
     conn.release();
   }).catch(err => {
     console.error('❌ Connection failed:', err.message);
   });
   "
   
   # If you see ECONNREFUSED ::1:3306, fix it by updating .env:
   cp .env .env.backup
   sed -i 's/DB_HOST=localhost/DB_HOST=127.0.0.1/g' .env
   
   # Verify the change
   grep DB_HOST .env
   
   # Restart PM2 process
   pm2 restart true-bread-backend
   
   # Test the fix
   curl -v http://localhost:3000/api/health
   curl -I http://thetruebread.com/api/health
   ```

2. **Port 3000 already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 PID
   ```

3. **Permission issues:**
   ```bash
   sudo chown -R $USER:$USER /var/www/truebread-backend
   ```

4. **Database connection failed:**
   ```bash
   # Test with IPv4 explicitly
   mysql -u truebread_user -p -h 127.0.0.1 truebread_prod
   ```

5. **PM2 not starting on boot:**
   ```bash
   pm2 startup
   pm2 save
   ```

### Diagnostic Commands:

**Check Backend Service Status:**
```bash
# Check PM2 processes
pm2 list
pm2 logs true-bread-backend --lines 20

# Test endpoints
curl -v http://localhost:3000/api/ping    # Should work
curl -v http://localhost:3000/api/health  # May fail if DB issue
curl -I http://thetruebread.com/api/health # Public endpoint
```

**Database Connection Diagnostics:**
```bash
# Check MySQL service
sudo systemctl status mysql

# Test database connection manually
cd /var/www/truebread-backend
node -e "
require('dotenv').config();
const mysql = require('mysql2/promise');
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
pool.getConnection().then(conn => {
  console.log('✅ Database connected successfully');
  conn.release();
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  console.error('Error code:', err.code);
});
"
```

**Environment Variables Check:**
```bash
cd /var/www/truebread-backend
echo "NODE_ENV: $NODE_ENV"
echo "DB_HOST from env file:"
grep DB_HOST .env
```

### Useful Commands:
```bash
# Check application status
pm2 status
pm2 logs true-bread-backend

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check MySQL status
sudo systemctl status mysql

# Monitor system resources
htop
df -h
free -h
```

## Security Best Practices

1. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm audit fix
   ```

2. **Fail2Ban (Optional):**
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

3. **Change Default SSH Port:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change Port 22 to Port 2222
   sudo systemctl restart ssh
   ```

4. **Regular Backups:**
   - Database backups (automated)
   - Application code backups
   - Configuration backups

---

**Your backend is now deployed on Hostinger VPS!**

Access your API at: `https://yourdomain.com/api/health`

For support, check the logs and monitoring tools mentioned above.
