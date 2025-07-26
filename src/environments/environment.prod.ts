export const environment = {
  production: true,
  apiUrl: '/api',
  baseUrl: 'https://thetruebread.com',
  email: {
    host: 'mail.thetruebread.com', // Use your cPanel mail server
    port: 465,
    secure: true, // Use SSL
    user: 'info@thetruebread.com', // Update with your actual email
    password: '', // This should be set on the server, not in the code
  },
  database: {
    host: 'localhost', // Usually localhost for cPanel databases
    port: 3306, // MySQL default port on cPanel
    name: 'thetrueb_truebread_prod', // Your production database name
    user: 'thetrueb_truebread_user', // Your database username
    password: '', // This should be set on the server, not in the code
  },
  social: {
    facebook: 'https://facebook.com/truebread',
    twitter: 'https://twitter.com/truebread',
    instagram: 'https://instagram.com/truebread'
  },
  googleAnalytics: {
    measurementId: 'G-XXXXXXXXXX' // Replace with your actual GA4 Measurement ID
  }
};
