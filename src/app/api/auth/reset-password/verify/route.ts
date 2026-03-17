import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // Hash the incoming token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        await connectToDatabase();

        // Find user with a valid (not expired) token
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: new Date() }, // must not be expired
        });

        if (!user) {
            return NextResponse.json(
                { error: 'This reset link is invalid or has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password and clear reset token fields
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            $unset: { resetToken: '', resetTokenExpiry: '' },
        });

        return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Verify reset token error:', error);
        return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
    }
}
