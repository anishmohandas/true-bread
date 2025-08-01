# True Bread - Deployment Instructions for Recent Changes

## Overview
This document provides step-by-step instructions for deploying recent changes to both the frontend and backend of the True Bread application on your Hostinger VPS.

## Prerequisites
- SSH access to your VPS
- Git access to your repository
- Properly configured environment files
- Database access and credentials

## Backend Deployment

### 1. Connect to Your VPS
```bash
ssh root@your-server-ip
```

### 2. Navigate to Backend Directory
```bash
cd /var/www/truebread-backend
```

### 3. Pull Latest Changes
```bash
# If using git
git pull origin main  # or your branch name

# Alternative: Upload updated files via SCP
# From your local machine:
# scp -r ./backend/* root@your-server-ip:/var/www/truebread-backend/
```

### 4. Install Dependencies and Build
```bash
# Install dependencies
npm install

# Build the application
npm run build:prod
```

### 5. Update Environment Configuration (if needed)
```bash
# Check and update environment variables if needed
nano .env

# Make sure database credentials and other settings are correct
```

### 6. Restart the Application
```bash
# Restart with PM2
npm run pm2:restart

# Or using PM2 directly
pm2 restart true-bread-backend

# Check status
pm2 status
pm2 logs true-bread-backend
```

### 7. Verify Backend Deployment
```bash
# Test health endpoint
curl -I http://localhost:3000/api/health

# Check PM2 logs for any errors
pm2 logs true-bread-backend --lines 20
```

## Frontend Deployment

### 1. Build the Updated Frontend
```bash
# On your local machine, navigate to project root
cd /path/to/your/true-bread-project

# Pull latest changes
git pull origin main  # or your branch name

# Install dependencies
npm install

# Build for production
ng build --configuration production
```

### 2. Upload Frontend Files
```bash
# From your local machine, upload the built files
scp -r ./dist/true-bread/* root@your-server-ip:/var/www/truebread-frontend/
```

### 3. Set Proper Permissions
```bash
# SSH into your VPS
ssh root@your-server-ip

# Set proper ownership and permissions
sudo chown -R www-data:www-data /var/www/truebread-frontend
sudo chmod -R 755 /var/www/truebread-frontend
```

### 4. Verify Frontend Deployment
```bash
# Test frontend access
curl -I http://thetruebread.com/

# Test API connection through frontend
curl -I http://thetruebread.com/api/health
```

## Nginx Configuration Update (if needed)

If you've made changes that require Nginx configuration updates:

```bash
sudo nano /etc/nginx/sites-available/truebread
```

Make sure your configuration includes:

```nginx
server {
    listen 80;
    server_name thetruebread.com www.thetruebread.com;

    # Serve frontend files
    location / {
        root /var/www/truebread-frontend;
        try_files $uri $uri/ /index.html;
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
}
```

Then reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Testing the Deployment

### 1. Check Backend Health
```bash
curl -I http://localhost:3000/api/health
curl -I http://thetruebread.com/api/health
```

### 2. Check Frontend Access
```bash
curl -I http://thetruebread.com/
```

### 3. Browser Testing
- Visit `http://thetruebread.com` in your browser
- Test the featured articles component to ensure it loads correctly
- Check that the "Unable to load featured articles" error is resolved

## Automated Deployment Script

For future deployments, you can use the provided deployment script from the documentation or create your own:

```bash
# Create/update the deployment script
nano ~/scripts/deploy.sh
```

The script should:
1. Backup current deployment
2. Pull latest changes
3. Build both frontend and backend
4. Upload files to appropriate directories
5. Restart services
6. Verify deployment with health checks

## Troubleshooting Common Issues

### 1. Database Connection Issues
- Check if DB_HOST is set to `127.0.0.1` instead of `localhost` to avoid IPv6 issues
- Verify database credentials in `.env` file

### 2. API Not Responding
- Check if backend is running: `pm2 status`
- Check logs: `pm2 logs true-bread-backend`

### 3. Frontend Not Loading
- Check file permissions: `ls -la /var/www/truebread-frontend`
- Verify Nginx configuration for static file serving

### 4. Featured Articles Component Issues
- Check browser console for JavaScript errors
- Verify API endpoint `/api/articles/featured` is accessible
- Check database for featured articles with `is_featured = true`

## Rollback Procedure

If issues occur after deployment:

### 1. Rollback Backend
```bash
# Stop current process
pm2 stop true-bread-backend

# Revert to previous version (if using git)
git reset --hard HEAD~1

# Or restore from backup
# cp -r /path/to/backup/backend/* /var/www/truebread-backend/

# Rebuild and restart
npm run build:prod
pm2 start true-bread-backend
```

### 2. Rollback Frontend
```bash
# Restore frontend from backup
sudo cp -r /path/to/frontend/backup/* /var/www/truebread-frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/truebread-frontend
sudo chmod -R 755 /var/www/truebread-frontend/

# Reload Nginx
sudo systemctl reload nginx
```

## Monitoring and Maintenance

### 1. Regular Health Checks
```bash
# Check application status
pm2 status

# View logs
pm2 logs true-bread-backend

# Test endpoints
curl -I http://thetruebread.com/api/health
```

### 2. Log Management
```bash
# View detailed logs
pm2 logs true-bread-backend --lines 50

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Security Considerations

1. Regularly update dependencies:
   ```bash
   npm audit fix
   ```

2. Monitor logs for suspicious activity

3. Keep SSL certificates up to date

4. Regular database backups

Your recent changes should now be deployed successfully to your Hostinger VPS!
