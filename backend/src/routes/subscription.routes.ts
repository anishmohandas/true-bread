
import express from 'express';
import { Pool } from 'pg';
import { validateEmail, getEmailValidationError } from '../utils/validators';
import { subscriptionLimiter, unsubscribeLimiter } from '../middleware/rateLimiter';
import { config } from '../config';

const router = express.Router();

// Configure pool with environment variables
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

// Add error handling for pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Subscribe
router.post('/subscribers', subscriptionLimiter, async (req, res) => {
    const { email, name } = req.body;
    
    const validationError = getEmailValidationError(email);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO subscribers (email, name, subscription_date, is_active) VALUES ($1, $2, NOW(), true) RETURNING *',
            [email, name]
        );
        
        const subscriber = {
            id: result.rows[0].id,
            email: result.rows[0].email,
            name: result.rows[0].name,
            subscriptionDate: result.rows[0].subscription_date,
            isActive: result.rows[0].is_active
        };
        
        res.status(201).json(subscriber);
    } catch (error: any) {
        console.error('Subscription error:', error);
        if (error.code === '23505') { // unique violation
            res.status(409).json({ error: 'Email already subscribed' });
        } else if (error.code === '42P01') { // relation does not exist
            res.status(500).json({ error: 'Database table not found' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

// Add middleware to ensure proper character encoding
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Unsubscribe
router.delete('/subscribers/unsubscribe/:email', unsubscribeLimiter, async (req, res) => {
    const { email } = req.params;

    try {
        const result = await pool.query(
            'UPDATE subscribers SET is_active = false WHERE email = $1',
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        res.status(200).send();
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;




