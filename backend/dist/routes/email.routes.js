"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_service_1 = require("../services/email.service");
const router = (0, express_1.Router)();
const emailService = new email_service_1.EmailService();
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        await emailService.sendContactEmail({ name, email, subject, message });
        res.status(200).json({ message: 'Email sent successfully' });
    }
    catch (error) {
        console.error('Error in contact email route:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});
exports.default = router;
