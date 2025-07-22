# True Bread Deployment Guide for cPanel

This guide will help you deploy the True Bread application to your cPanel hosting at thetruebread.com.

## Prerequisites

- cPanel access to thetruebread.com
- Node.js support enabled on your cPanel hosting
- MySQL database created in cPanel

## Deployment Steps

### 1. Build the Angular Frontend

```bash
# In your Angular project directory
ng build --prod
```

This will create a `dist/true-bread` directory with your compiled application.

### 2. Upload Frontend Files

1. Log in to cPanel at https://thetruebread.com:2083/
2. Go to File Manager
3. Navigate to `public_html` directory
4. Upload all files from your local `dist/true-bread` directory
5. Make sure to also upload the `.htaccess` file from the `src` directory

### 3. Set Up Node.js Application for Backend

1. In cPanel, find "Setup Node.js App"
2. Click "Create Application"
3. Configure your application:
   - Node.js version: Choose the latest available
   - Application mode: Production
   - Application root: Create a directory like `nodejs` or `backend`
   - Application URL: `/api`
   - Application startup file: `server.js` or your main file

### 4. Upload Backend Files

1. Create a ZIP file of your backend project (excluding `node_modules`)
2. In File Manager, navigate to the Node.js application directory
3. Upload and extract your ZIP file
4. In cPanel, go to "Setup Node.js App"
5. Find your application and click "Enter Node.js Environment"
6. Run: `npm install --production`
7. Start your application

### 5. Set Up Database

1. In cPanel, go to "MySQL Databases"
2. Note your database name, username, and password
3. Update these credentials in your backend configuration

### 6. Configure Email (if needed)

1. In cPanel, go to "Email Accounts"
2. Create an email account for your application (e.g., info@thetruebread.com)
3. Note the email credentials for your backend configuration

## Troubleshooting

### Frontend Issues

- If you see 404 errors on page refresh, check your `.htaccess` file
- If assets aren't loading, check file paths and permissions

### Backend Issues

- Check Node.js logs in cPanel
- Verify your application is running with `npm start`
- Check database connection settings

## Maintenance

- Regularly back up your database through cPanel
- Keep your Node.js application updated
- Monitor disk space usage in cPanel

## Security Considerations

- Never store sensitive credentials in your code
- Use environment variables for sensitive information
- Keep your cPanel password secure and change it regularly
- Enable SSL for your domain through cPanel

## Contact Support

If you encounter issues with your cPanel hosting, contact your hosting provider's support team.
