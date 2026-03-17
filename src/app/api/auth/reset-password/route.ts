import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';

const resend = new Resend(process.env.RESEND_API_KEY || 'temp_key_placeholder');

export async function POST(request: NextRequest) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not defined in .env.local');
            return NextResponse.json(
                { error: 'Email service not configured. Please contact support.' },
                { status: 500 }
            );
        }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to avoid revealing whether an email is registered
        if (!user) {
            return NextResponse.json({ success: true });
        }

        if (user.provider !== 'credentials') {
            return NextResponse.json(
                { error: `This account uses ${user.provider} sign-in. Please log in with that provider.` },
                { status: 400 }
            );
        }

        // Generate a secure random token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save the hashed token to the DB
        await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { resetToken: hashedToken, resetTokenExpiry: expiry }
        );

        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;

        // Send the reset email via Resend
        const { error: resendError } = await resend.emails.send({
            from: 'Padhega <onboarding@resend.dev>',
            to: [email],
            subject: '🔑 Reset Your Padhega Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ededed; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                    <h1 style="color: #10b981; margin-bottom: 8px;">Padhega</h1>
                    <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 16px;">Reset Your Password</h2>
                    <p style="color: #a3a3a3; line-height: 1.6;">
                        Hi ${user.name},<br/><br/>
                        We received a request to reset your password. Click the button below to set a new password.
                        This link will expire in <strong style="color: #10b981;">1 hour</strong>.
                    </p>
                    <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Reset Password
                    </a>
                    <p style="color: #737373; font-size: 14px;">
                        If you didn't request a password reset, you can safely ignore this email.<br/>
                        This link will expire in 1 hour.
                    </p>
                    <hr style="border-color: rgba(255,255,255,0.1); margin: 24px 0;" />
                    <p style="color: #737373; font-size: 12px;">
                        Or copy this link: <span style="color: #10b981;">${resetUrl}</span>
                    </p>
                </div>
            `,
        });

        if (resendError) {
            console.error('Resend error:', resendError);
            return NextResponse.json(
                { error: resendError.message || 'Failed to send email. Please try again later.' },
                { status: resendError.name === 'validation_error' ? 400 : 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
    }
}
