import nodemailer from 'nodemailer';
import { pool } from '../db';
import ejs from 'ejs';
import path from 'path';
import { config } from '../config';
import { AppConfig } from '../types/config.types';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: AppConfig;

  constructor() {
    this.config = config;
    
    // Log email configuration (without sensitive data)
    console.log('Email Service Configuration:');
    console.log('- Host:', this.config.email.host);
    console.log('- Port:', this.config.email.port);
    console.log('- Secure:', this.config.email.secure);
    console.log('- User:', this.config.email.user ? '***configured***' : 'NOT SET');
    console.log('- Password:', this.config.email.password ? '***configured***' : 'NOT SET');
    
    if (!this.config.email.user || !this.config.email.password) {
      console.warn('⚠️  WARNING: Email credentials not properly configured. Emails will not be sent.');
    }
    
    this.transporter = nodemailer.createTransport({
      host: this.config.email.host,
      port: this.config.email.port,
      secure: this.config.email.secure,
      auth: {
        user: this.config.email.user,
        pass: this.config.email.password,
      }
    });
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.ejs`);
    const baseTemplate = path.join(__dirname, '../templates/emails/base.ejs');
    
    try {
      const content = await ejs.renderFile(templatePath, {
        ...data,
        baseUrl: this.config.baseUrl
      });

      return ejs.renderFile(baseTemplate, {
        content,
        baseUrl: this.config.baseUrl,
        unsubscribeUrl: `${this.config.baseUrl}/unsubscribe/${data.email}`,
      });
    } catch (error: any) {
      throw new Error(`Template rendering failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async sendWelcomeEmail(email: string) {
    try {
      console.log(`📧 Attempting to send welcome email to: ${email}`);
      
      // Check if email credentials are configured
      if (!this.config.email.user || !this.config.email.password) {
        throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
      }
      
      // Get latest issue for the welcome email
      const [rows] = await pool.query(
        'SELECT * FROM publications ORDER BY publish_date DESC LIMIT 1'
      );
      const latestIssue = (rows as any[])[0];
      console.log('📖 Latest issue found:', latestIssue ? latestIssue.title : 'No issues found');

      const html = await this.renderTemplate('welcome', {
        email,
        latestIssue,
        backendUrl: this.config.backendUrl
      });
      console.log('📝 Email template rendered successfully');

      const mailOptions = {
        from: `"True Bread Magazine" <${this.config.email.user}>`,
        to: email,
        subject: 'Welcome to True Bread Magazine!',
        html
      };
      
      console.log('📤 Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw error;
    }
  }

  async sendMonthlyNewsletter() {
    try {
      // Get active subscribers
      const [subscriberRows] = await pool.query(
        'SELECT email FROM subscribers WHERE is_active = true'
      );
      const subscribers = subscriberRows as any[];

      // Get latest issue with highlights (MySQL syntax)
      const [issueRows] = await pool.query(`
        SELECT 
          p.*,
          GROUP_CONCAT(h.title) as highlights
        FROM publications p
        LEFT JOIN publication_highlights h ON h.publication_id = p.id
        WHERE p.id = (
          SELECT id FROM publications 
          ORDER BY publish_date DESC 
          LIMIT 1
        )
        GROUP BY p.id
      `);
      const latestIssue = (issueRows as any[])[0];

      // Render template once since it's the same for all subscribers
      const baseHtml = await this.renderTemplate('newsletter', {
        issue: latestIssue
      });

      // Send emails in batches to avoid overwhelming the email server
      const batchSize = 50;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        const emailPromises = batch.map(subscriber => 
          this.transporter.sendMail({
            from: `"True Bread Magazine" <${this.config.email.user}>`,
            to: subscriber.email,
            subject: `True Bread Magazine - ${latestIssue.title} Now Available!`,
            html: baseHtml.replace('${email}', subscriber.email) // Replace placeholder with actual email
          })
        );

        await Promise.all(emailPromises);
        
        // Add a small delay between batches
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error sending monthly newsletter:', error);
      throw error;
    }
  }

  async sendContactEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    try {
      const html = await this.renderTemplate('contact', {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        date: new Date().toLocaleString()
      });

      await this.transporter.sendMail({
        from: `"${data.name}" <${data.email}>`,
        to: process.env.CONTACT_EMAIL || '"True Bread Magazine" <truebreadmedia@gmail.com>',
        subject: `Contact Form: ${data.subject}`,
        html,
        replyTo: data.email
      });
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw error;
    }
  }
}



