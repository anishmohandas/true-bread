
import express from 'express';
import { pool } from '../db';
import { validateEmail, getEmailValidationError } from '../utils/validators';
import { subscriptionLimiter, unsubscribeLimiter } from '../middleware/rateLimiter';
import { EmailService } from '../services/email.service';

const router = express.Router();
const emailService = new EmailService();

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
        const [result] = await pool.query(
            'INSERT INTO subscribers (email, name, subscription_date, is_active) VALUES (?, ?, NOW(), true)',
            [email, name]
        );
        
        // Get the inserted record
        const [rows] = await pool.query(
            'SELECT * FROM subscribers WHERE id = ?',
            [(result as any).insertId]
        );
        
        const subscriberRow = (rows as any[])[0];
        const subscriber = {
            id: subscriberRow.id,
            email: subscriberRow.email,
            name: subscriberRow.name,
            subscriptionDate: subscriberRow.subscription_date,
            isActive: subscriberRow.is_active
        };
        
        // Send welcome email (don't let email failures break the subscription process)
        try {
            await emailService.sendWelcomeEmail(email);
            console.log(`Welcome email sent successfully to: ${email}`);
        } catch (emailError) {
            console.error(`Failed to send welcome email to ${email}:`, emailError);
            // Continue with successful subscription response even if email fails
        }
        
        res.status(201).json(subscriber);
    } catch (error: any) {
        console.error('Subscription error:', error);
        if (error.code === 'ER_DUP_ENTRY') { // MySQL unique violation
            res.status(409).json({ error: 'Email already subscribed' });
        } else if (error.code === 'ER_NO_SUCH_TABLE') { // MySQL table does not exist
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
        const [result] = await pool.query(
            'UPDATE subscribers SET is_active = false WHERE email = ?',
            [email]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        res.status(200).send();
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;




