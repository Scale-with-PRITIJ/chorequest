import nodemailer from 'nodemailer';
import logger from './logger';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendInviteEmail(toEmail: string, inviterName: string, familyName: string) {
    const inviteLink = `${process.env.APP_URL || 'http://localhost:3000'}?inviteEmail=${encodeURIComponent(toEmail)}`;

    const mailOptions = {
      from: `"ChoreQuest" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Quest Awaits! You've been invited to join ${inviterName}'s family on ChoreQuest`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded-lg">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0; font-size: 28px;">ChoreQuest</h1>
            <p style="color: #6b7280; margin-top: 5px;">Turn Chores into Adventures</p>
          </div>
          
          <div style="background-color: #fffaf8; padding: 30px; border-radius: 12px; border: 1px solid #ffedd5;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
              <strong>${inviterName}</strong> has invited you to join the <strong>${familyName}</strong> team on ChoreQuest.
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
              Together, you can manage daily quests, reward your kids with treasures, and watch your family's virtual pets grow!
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${inviteLink}" 
                 style="background-color: #f97316; color: white; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">
                Accept Your Quest
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              If you don't have an account yet, you'll be able to create one after clicking the button.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>© 2026 ChoreQuest. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending invite email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
