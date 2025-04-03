import dotenv from 'dotenv';
import { AppConfig } from '../types/config.types';

dotenv.config();

export const config: AppConfig = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'truebread_dev',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' 
            ? { rejectUnauthorized: false }
            : undefined,
        client_encoding: 'UTF8'
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || ''
    },
    baseUrl: process.env.BASE_URL || 'http://localhost:4200',
    port: parseInt(process.env.PORT || '3000')
};



