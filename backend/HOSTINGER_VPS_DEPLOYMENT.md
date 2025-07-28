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
Option A: Using Git (Recommended)
```bash
git clone https://github.com/your-username/true-bread.git .
cd backend
```

Option B: Using SCP/SFTP
```bash
# From your local machine
scp -r ./backend/* user@your-server-ip:/var/www/truebread-backend/
```

### 3.3 Install Dependencies
```bash
cd /var/www/truebread-backend
npm install --production
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
DB_HOST=localhost
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

### 5.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/truebread
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # API routes
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

    # Frontend (if serving from same server)
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

### 6.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6.3 Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

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
```bash
nano /home/$USER/health-check.sh
```

```bash
#!/bin/bash
HEALTH_URL="https://yourdomain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Health check failed with status: $RESPONSE"
    pm2 restart true-bread-backend
    echo "Application restarted at $(date)" >> /var/log/truebread-restart.log
fi
```

```bash
chmod +x /home/$USER/health-check.sh
# Add to crontab to run every 5 minutes
crontab -e
# Add: */5 * * * * /home/$USER/health-check.sh
```

## Step 9: Backup Strategy

### 9.1 Database Backup Script
```bash
nano /home/$USER/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u truebread_user -p'your_secure_password' truebread_prod > $BACKUP_DIR/truebread_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "truebread_*.sql" -mtime +7 -delete
```

```bash
chmod +x /home/$USER/backup-db.sh
# Add to crontab for daily backup at 2 AM
crontab -e
# Add: 0 2 * * * /home/$USER/backup-db.sh
```

## Step 10: Deployment Script

Create an automated deployment script:
```bash
nano /home/$USER/deploy.sh
```

```bash
#!/bin/bash
APP_DIR="/var/www/truebread-backend"
BACKUP_DIR="/home/$USER/app-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting deployment..."

# Create backup
mkdir -p $BACKUP_DIR
cp -r $APP_DIR $BACKUP_DIR/backup_$DATE

# Navigate to app directory
cd $APP_DIR

# Pull latest changes (if using Git)
git pull origin main

# Install dependencies
npm install --production

# Build application
npm run build:prod

# Restart application
pm2 restart true-bread-backend

# Check health
sleep 5
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/api/health)

if [ $HEALTH_CHECK -eq 200 ]; then
    echo "Deployment successful! Health check passed."
else
    echo "Deployment failed! Rolling back..."
    pm2 stop true-bread-backend
    rm -rf $APP_DIR
    cp -r $BACKUP_DIR/backup_$DATE $APP_DIR
    pm2 start true-bread-backend
    echo "Rollback completed."
fi
```

```bash
chmod +x /home/$USER/deploy.sh
```

## Troubleshooting

### Common Issues:

1. **Port 3000 already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 PID
   ```

2. **Permission issues:**
   ```bash
   sudo chown -R $USER:$USER /var/www/truebread-backend
   ```

3. **Database connection failed:**
   ```bash
   mysql -u truebread_user -p -h localhost truebread_prod
   ```

4. **PM2 not starting on boot:**
   ```bash
   pm2 startup
   pm2 save
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
