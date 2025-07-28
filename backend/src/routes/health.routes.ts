import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { config } from '../config';

const router = Router();

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
    try {
        // Check database connection
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        // Check if all required environment variables are set
        const requiredEnvVars = [
            'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
            'EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASSWORD'
        ];

        const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            database: {
                status: 'connected',
                host: config.database.host,
                database: config.database.database
            },
            email: {
                status: config.email.user && config.email.password ? 'configured' : 'not configured',
                host: config.email.host
            },
            configuration: {
                missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : null
            }
        };

        res.status(200).json(healthStatus);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: process.env.NODE_ENV === 'production' 
                ? 'Service temporarily unavailable' 
                : (error as Error).message
        });
    }
});

// Simple ping endpoint
router.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ 
        message: 'pong',
        timestamp: new Date().toISOString()
    });
});

export default router;
