import { Router } from 'express';
import { EmailService } from '../services/email.service';

const router = Router();
const emailService = new EmailService();

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('📧 Attempting to send contact email:', { name, email, subject });
    
    await emailService.sendContactEmail({ name, email, subject, message });
    
    console.log('✅ Contact email sent successfully');
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('❌ Error in contact email route:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error message if possible
    const errorMessage = error.message || 'Failed to send email';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
