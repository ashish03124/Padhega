import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, email, image } = await request.json();

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if the new email is already taken by another user
        if (email !== session.user.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email is already in use by another account' },
                    { status: 409 }
                );
            }
        }

        const updateData: any = {
            name: name.trim(),
            email: email.toLowerCase().trim()
        };

        if (image !== undefined) {
            updateData.image = image;
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                image: updatedUser.image,
            }
        });

    } catch (error: unknown) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
