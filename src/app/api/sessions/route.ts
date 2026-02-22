import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectToDatabase from '@/app/lib/mongodb';
import StudySession from '@/app/models/StudySession';
import mongoose from 'mongoose';

/**
 * GET: Fetch user's study sessions
 * Query params: startDate, endDate (ISO strings)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        await connectToDatabase();

        const query: any = { userId: session.user.id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const sessions = await StudySession.find(query).sort({ date: -1 });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('API Error (GET sessions):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST: Record a new study session
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { duration, subject, type, notes, date } = body;

        if (!duration || !subject || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();

        const newSession = await StudySession.create({
            userId: session.user.id,
            duration,
            subject,
            type,
            notes,
            date: date ? new Date(date) : new Date(),
        });

        return NextResponse.json(newSession, { status: 201 });
    } catch (error) {
        console.error('API Error (POST sessions):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
