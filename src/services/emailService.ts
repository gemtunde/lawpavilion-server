import nodemailer from "nodemailer";
import config from "../config/env";

const transporter = nodemailer.createTransport({
  service: config.email.service,
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
});

export const sendEmailVerification = async (
  email: string,
  token: string,
  firstName: string
) => {
  try {
    const verificationUrl = `${config.app.baseUrl}/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: " Verify Your Email - Law Pavilion",
      html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">Welcome to Law Pavilion, ${firstName}!</h2>
        <p>Thank you for registering with Law Pavilion. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If you didn't create an account with Law Pavilion, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Law Pavilion Team
        </p>
      </div>
    `,
    });
  } catch (error) {
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  firstName: string
) => {
  try {
    const resetUrl = `${config.app.baseUrl}/auth/reset-password/${token}`;

    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: "Password Reset - Law Pavilion",
      html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password for your Law Pavilions account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 30 minutes.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Law Pavilion Team
        </p>
      </div>
    `,
    });
  } catch (error) {
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: "Welcome - Law Pavilion",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Law Pavilion!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Law Pavilion!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Congratulations! Your email has been verified and your account is now active.</p>
            
            <h3>What's Next?</h3>
            <div class="feature">
              <h4>📚 Explore Law Pavilion</h4>
              <p>Access our comprehensive library of legal documents, templates, and research tools.</p>
            </div>
            <div class="feature">
              <h4>⚖️ Case Management</h4>
              <p>Organize your cases, track deadlines, and manage client communications efficiently.</p>
            </div>
            <div class="feature">
              <h4>📊 Analytics Dashboard</h4>
              <p>Monitor your practice performance with detailed analytics and insights.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>
            
            <p>If you have any questions or need assistance, our support team is here to help.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Law Pavilion. All rights reserved.</p>
            <p>Need help? Contact us at support@lawpavilion.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });
  } catch (error) {
    throw error;
  }
};
