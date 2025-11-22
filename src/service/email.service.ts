import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email service
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendVerificationEmail(email: string, verificationToken: string, name: string): Promise<void> {
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${verificationToken}`;
        
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Verify Your Email Address',
            text: `Hello ${name}, Please verify your email by clicking the link: ${verificationUrl}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
                <p style="color: #555; font-size: 16px;">
                    Hello ${name},
                </p>
                <p style="color: #555; font-size: 16px;">
                    Thank you for registering! Please verify your email address by clicking the button below:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #2d89ef; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>
                <p style="color: #555; font-size: 14px;">
                    Or copy and paste this link into your browser:
                </p>
                <p style="color: #2d89ef; font-size: 12px; word-break: break-all;">
                    ${verificationUrl}
                </p>
                <p style="color: #555; font-size: 16px;">
                    If you did not create an account, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #777; font-size: 12px; text-align: center;">
                    This link will expire in 24 hours.
                </p>
            </div>
        `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Verification email sent to ${email}`);
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }

    async sendResetPasswordEmail(email: string, resetToken: string, name: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Reset Your Password',
            text: `Hello ${name}, Please reset your password by clicking the link: ${resetUrl}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
                <p style="color: #555; font-size: 16px;">
                    Hello ${name},
                </p>
                <p style="color: #555; font-size: 16px;">
                    We received a request to reset your password. Click the button below to create a new password:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #555; font-size: 14px;">
                    Or copy and paste this link into your browser:
                </p>
                <p style="color: #e74c3c; font-size: 12px; word-break: break-all;">
                    ${resetUrl}
                </p>
                <p style="color: #555; font-size: 16px;">
                    If you did not request a password reset, please ignore this email. Your password will remain unchanged.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #777; font-size: 12px; text-align: center;">
                    This link will expire in 1 hour. For security reasons, please do not share this link with anyone.
                </p>
            </div>
        `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Reset password email sent to ${email}`);
        } catch (error) {
            console.error('Error sending reset password email:', error);
            throw new Error('Failed to send reset password email');
        }
    }

}
