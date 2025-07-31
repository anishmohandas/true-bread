const dotenv = require('dotenv');
dotenv.config();

console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
