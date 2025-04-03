export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  baseUrl: 'http://localhost:4200',
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'truebreadmedia@gmail.com',
    password: 'your_development_password', // Use a development-specific password
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'truebread_dev',
    user: 'postgres',
    password: 'December@2025', // Use a development-specific password
  },
  social: {
    facebook: 'https://facebook.com/truebread',
    twitter: 'https://twitter.com/truebread',
    instagram: 'https://instagram.com/truebread'
  }
};



