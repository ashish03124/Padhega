import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectToDatabase from '@/app/lib/mongodb';
import StudyRoom from '@/app/models/StudyRoom';

/**
 * GET: Fetch active study rooms
 * Filter: public rooms OR user's own rooms
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const mineOnly = searchParams.get('mine') === 'true';

        await connectToDatabase();

        const query: any = { isActive: true };

        if (mineOnly) {
            if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            query.createdBy = session.user.id;
        } else {
            // Public rooms or user's rooms
            query.$or = [
                { privacy: 'public' },
                ...(session?.user ? [{ createdBy: session.user.id }] : [])
            ];
        }

        const rooms = await StudyRoom.find(query)
            .populate('createdBy', 'name email image')
            .populate('participants', 'name email image')
            .sort({ createdAt: -1 });
        return NextResponse.json(rooms);
    } catch (error: unknown) {
        console.error('API Error (GET rooms):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST: Create/Register a study room in DB
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { roomId, name, description, subject, privacy, dailyRoomUrl, maxParticipants } = body;

        if (!roomId || !name) {
            return NextResponse.json({ error: 'Room ID and Name are required' }, { status: 400 });
        }

        await connectToDatabase();

        // Use updateOne with upsert to handle re-creation of rooms with same ID
        const room = await StudyRoom.findOneAndUpdate(
            { roomId },
            {
                $set: {
                    name,
                    description,
                    subject,
                    privacy: privacy || 'public',
                    dailyRoomUrl,
                    maxParticipants: maxParticipants || 20,
                    createdBy: session.user.id,
                    isActive: true,
                },
                $setOnInsert: {
                    participants: [session.user.id],
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(room, { status: 201 });
    } catch (error: unknown) {
        console.error('API Error (POST rooms):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH: Join/Leave room or update status
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, action, isActive } = await request.json();
        if (!id) return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });

        await connectToDatabase();

        let update: any = {};
        if (action === 'join') {
            update = { $addToSet: { participants: session.user.id } };
        } else if (action === 'leave') {
            update = { $pull: { participants: session.user.id } };
        }

        if (isActive !== undefined) {
            update.$set = { ...update.$set, isActive };
            if (!isActive) update.$set.endedAt = new Date();
        }

        const room = await StudyRoom.findOneAndUpdate(
            { $or: [{ _id: id }, { roomId: id }] },
            update,
            { new: true }
        ).populate('createdBy', 'name email image')
            .populate('participants', 'name email image');

        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

        return NextResponse.json(room);
    } catch (error: unknown) {
        console.error('API Error (PATCH rooms):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
