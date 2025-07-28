"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const validators_1 = require("../utils/validators");
const rateLimiter_1 = require("../middleware/rateLimiter");
const email_service_1 = require("../services/email.service");
const router = express_1.default.Router();
const emailService = new email_service_1.EmailService();
// Subscribe
router.post('/subscribers', rateLimiter_1.subscriptionLimiter, async (req, res) => {
    const { email, name } = req.body;
    const validationError = (0, validators_1.getEmailValidationError)(email);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }
    try {
        const [result] = await db_1.pool.query('INSERT INTO subscribers (email, name, subscription_date, is_active) VALUES (?, ?, NOW(), true)', [email, name]);
        // Get the inserted record
        const [rows] = await db_1.pool.query('SELECT * FROM subscribers WHERE id = ?', [result.insertId]);
        const subscriberRow = rows[0];
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
        }
        catch (emailError) {
            console.error(`Failed to send welcome email to ${email}:`, emailError);
            // Continue with successful subscription response even if email fails
        }
        res.status(201).json(subscriber);
    }
    catch (error) {
        console.error('Subscription error:', error);
        if (error.code === 'ER_DUP_ENTRY') { // MySQL unique violation
            res.status(409).json({ error: 'Email already subscribed' });
        }
        else if (error.code === 'ER_NO_SUCH_TABLE') { // MySQL table does not exist
            res.status(500).json({ error: 'Database table not found' });
        }
        else {
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
router.delete('/subscribers/unsubscribe/:email', rateLimiter_1.unsubscribeLimiter, async (req, res) => {
    const { email } = req.params;
    try {
        const [result] = await db_1.pool.query('UPDATE subscribers SET is_active = false WHERE email = ?', [email]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }
        res.status(200).send();
    }
    catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
