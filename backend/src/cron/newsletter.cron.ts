import cron from 'node-cron';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

// Run on the 1st of every month at 9:00 AM
cron.schedule('0 9 1 * *', async () => {
  try {
    await emailService.sendMonthlyNewsletter();
    console.log('Monthly newsletter sent successfully');
  } catch (error) {
    console.error('Failed to send monthly newsletter:', error);
  }
});