# True Bread Backend - Production Deployment Guide

## Production Readiness Checklist

### ✅ **Ready for Production:**
- [x] TypeScript backend with proper structure
- [x] Environment-based configuration system
- [x] MySQL database support with SSL
- [x] Email service integration
- [x] CORS configuration
- [x] Rate limiting middleware
- [x] Static file serving
- [x] Error handling middleware
- [x] Health check endpoints
- [x] Security headers
- [x] Graceful shutdown handling
- [x] PM2 process management configuration
- [x] Production build scripts

### 📋 **Pre-Deployment Steps:**

1. **Environment Configuration**
   - Copy `.env.production` and update with your actual values
   - Ensure all required environment variables are set
   - Test database connection

2. **Database Setup**
   - Create MySQL database in cPanel
   - Import your database schema
   - Update database credentials in `.env.production`

3. **Email Configuration**
   - Set up email account in cPanel
   - Update email credentials in `.env.production`

## Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
npm install --production

# Build the application
npm run build:prod

# Test the build locally (optional)
npm run start:prod
```

### 2. Upload to cPanel

1. **Create Node.js Application in cPanel:**
   - Go to "Setup Node.js App"
   - Click "Create Application"
   - Configure:
     - Node.js version: Latest available (16+ recommended)
     - Application mode: Production
     - Application root: `backend` or `api`
     - Application URL: `/api`
     - Application startup file: `dist/server.js`

2. **Upload Files:**
   - Create ZIP of your backend project (exclude `node_modules`)
   - Upload to your Node.js application directory
   - Extract the files

3. **Install Dependencies:**
   - In cPanel Node.js App interface, click "Enter Node.js Environment"
   - Run: `npm install --production`

### 3. Configure Environment

1. **Upload Environment File:**
   - Upload your configured `.env.production` file
   - Rename it to `.env` in the production directory

2. **Set Environment Variables (Alternative):**
   - In cPanel Node.js App, you can set environment variables directly
   - Add all variables from your `.env.production` file

### 4. Database Setup

1. **Create Database:**
   - In cPanel → MySQL Databases
   - Create database: `thetrueb_truebread_prod`
   - Create user: `thetrueb_truebread_user`
   - Assign user to database with all privileges

2. **Import Data:**
   - Use phpMyAdmin or MySQL command line
   - Import your database schema and data

### 5. Start the Application

```bash
# Option 1: Direct start
npm run start:prod

# Option 2: Using PM2 (recommended)
npm run pm2:start

# Check status
npm run pm2:logs
```

## Health Checks

After deployment, verify your application:

1. **Health Check Endpoint:**
   ```
   GET https://thetruebread.com/api/health
   ```

2. **Ping Endpoint:**
   ```
   GET https://thetruebread.com/api/ping
   ```

## Environment Variables Reference

### Required Variables:
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://thetruebread.com
BACKEND_URL=https://thetruebread.com/api

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=thetrueb_truebread_prod
DB_USER=thetrueb_truebread_user
DB_PASSWORD=your_secure_password

# Email
EMAIL_HOST=mail.thetruebread.com
EMAIL_PORT=587
EMAIL_USER=info@thetruebread.com
EMAIL_PASSWORD=your_email_password
```

## Monitoring and Maintenance

### 1. Log Management
```bash
# View PM2 logs
npm run pm2:logs

# Check application status
pm2 status

# Restart application
npm run pm2:restart
```

### 2. Health Monitoring
- Set up monitoring for `/api/health` endpoint
- Monitor database connections
- Check email service status

### 3. Regular Maintenance
- Monitor disk space usage
- Review application logs
- Update dependencies regularly
- Backup database regularly

## Troubleshooting

### Common Issues:

1. **Application Won't Start:**
   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Check database connection
   - Review application logs

2. **Database Connection Issues:**
   - Verify database credentials
   - Check database server status
   - Ensure database exists and user has permissions

3. **Email Not Working:**
   - Verify email credentials
   - Check SMTP settings
   - Test email configuration

4. **CORS Issues:**
   - Update `ALLOWED_ORIGINS` environment variable
   - Ensure frontend domain is included

### Debug Commands:
```bash
# Test database connection
npm run test:connection

# Check application health
curl https://thetruebread.com/api/health

# View detailed logs
npm run pm2:logs --lines 100
```

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use strong passwords for database and email
   - Regularly rotate credentials

2. **Server Security:**
   - Keep Node.js and dependencies updated
   - Enable SSL/HTTPS
   - Configure firewall rules
   - Regular security audits

3. **Application Security:**
   - Rate limiting is enabled
   - Security headers are set
   - Input validation is implemented
   - Error messages don't expose sensitive information

## Performance Optimization

1. **PM2 Configuration:**
   - Adjust instance count based on server resources
   - Configure memory limits
   - Set up log rotation

2. **Database Optimization:**
   - Use connection pooling (already configured)
   - Optimize queries
   - Regular database maintenance

3. **Caching:**
   - Consider implementing Redis for session storage
   - Cache frequently accessed data
   - Use CDN for static assets

## Support

For deployment issues:
1. Check application logs first
2. Verify environment configuration
3. Test individual components (database, email)
4. Contact hosting provider support if needed

---

**Last Updated:** January 2025
**Version:** 1.0.0
