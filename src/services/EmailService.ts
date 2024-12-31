import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import generateEmailTemplate from './generateEmailTemplate';

dotenv.config();

class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },

    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' // Verify certificates only in production.
    }
    
  });

  public async sendEmail(to: string, subject: string, code: string): Promise<void> {
    const htmlContent = generateEmailTemplate(code);

    try {
        await this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            html: htmlContent,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed'); // Throw an error so it can be caught by the middleware
    }
}


}

export default EmailService;
