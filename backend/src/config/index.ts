import dotenv from 'dotenv';
import { AppConfig } from '../types/config.types';

dotenv.config();

export const config: AppConfig = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME || 'truebread_dev',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' 
            ? { rejectUnauthorized: false }
            : undefined
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true' || parseInt(process.env.EMAIL_PORT || '587') === 465,
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || ''
    },
    baseUrl: process.env.BASE_URL || 'http://localhost:4200',
    backendUrl: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || '3000'}`,
    port: parseInt(process.env.PORT || '3000')
};
