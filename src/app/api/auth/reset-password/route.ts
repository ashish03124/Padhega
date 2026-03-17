import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';

/**
 * POST: Request a password reset
 * Validates the email exists and returns a response.
 * NOTE: Actual email delivery requires configuring an email service
 * (e.g., Resend, SendGrid, or Nodemailer with SMTP).
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if a user with this email exists
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { error: 'No account found with this email address' },
                { status: 404 }
            );
        }

        // Check if the user signed up via OAuth (no password to reset)
        if (user.provider !== 'credentials') {
            return NextResponse.json(
                { error: `This account uses ${user.provider} sign-in. Please use that provider to log in.` },
                { status: 400 }
            );
        }

        // TODO: Integrate an email service to send a real reset link.
        // For now, we validate the email and return success.
        // A production implementation would:
        // 1. Generate a secure reset token (e.g., crypto.randomBytes)
        // 2. Store the token + expiry in the database
        // 3. Send an email with a reset link containing the token

        return NextResponse.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'An error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
