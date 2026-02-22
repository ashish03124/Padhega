import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';

const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    return 5;
};

/**
 * GET: Fetch current user's XP and Level
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectToDatabase();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            xp: user.xp || 0,
            level: user.level || 1
        });
    } catch (error) {
        console.error('API Error (GET XP):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH: Update user's XP (and naturally recalculate level)
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { xpChange } = await request.json();

        if (xpChange === undefined) {
            return NextResponse.json({ error: 'xpChange is required' }, { status: 400 });
        }

        const userId = (session.user as any).id;
        await connectToDatabase();

        // Find user to get current XP
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const newXp = Math.max(0, (user.xp || 0) + xpChange);
        const newLevel = calculateLevel(newXp);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    xp: newXp,
                    level: newLevel
                }
            },
            { new: true }
        );

        return NextResponse.json({
            xp: updatedUser?.xp,
            level: updatedUser?.level
        });
    } catch (error) {
        console.error('API Error (PATCH XP):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
