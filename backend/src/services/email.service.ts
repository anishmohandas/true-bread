import nodemailer from 'nodemailer';
import { Pool } from 'pg';
import ejs from 'ejs';
import path from 'path';
import { config } from '../config';
import { AppConfig } from '../types/config.types';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private pool: Pool;
  private config: AppConfig;

  constructor() {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: this.config.email.host,
      port: this.config.email.port,
      secure: this.config.email.secure,
      auth: {
        user: this.config.email.user,
        pass: this.config.email.password,
      }
    });
    this.pool = new Pool(this.config.database);
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
      // Get latest issue for the welcome email
      const { rows: [latestIssue] } = await this.pool.query(
        'SELECT * FROM publications ORDER BY publish_date DESC LIMIT 1'
      );

      const html = await this.renderTemplate('welcome', {
        email,
        latestIssue
      });

      await this.transporter.sendMail({
        from: '"True Bread Magazine" <noreply@truebread.com>',
        to: email,
        subject: 'Welcome to True Bread Magazine!',
        html
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendMonthlyNewsletter() {
    try {
      // Get active subscribers
      const { rows: subscribers } = await this.pool.query(
        'SELECT email FROM subscribers WHERE is_active = true'
      );

      // Get latest issue
      const { rows: [latestIssue] } = await this.pool.query(`
        SELECT 
          p.*,
          array_agg(h.title) as highlights
        FROM publications p
        LEFT JOIN publication_highlights h ON h.publication_id = p.id
        WHERE p.id = (
          SELECT id FROM publications 
          ORDER BY publish_date DESC 
          LIMIT 1
        )
        GROUP BY p.id
      `);

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
            from: '"True Bread Magazine" <noreply@truebread.com>',
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
        to: '"True Bread Magazine" <truebreadmedia@gmail.com>',
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



