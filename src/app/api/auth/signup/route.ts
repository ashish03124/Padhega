import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';

// Email validation
const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Password validation
const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return {
            valid: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        };
    }

    return { valid: true };
};

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.message },
                { status: 400 }
            );
        }

        // Connect to database
        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            provider: 'credentials',
        });

        // Return success (don't send password back)
        return NextResponse.json({
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        }, { status: 201 });

    } catch (error: unknown) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}
