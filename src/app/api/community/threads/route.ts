import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectDB from '@/app/lib/mongodb';
import Thread from '@/app/models/Thread';

export async function GET() {
    try {
        await connectDB();
        const threads = await Thread.find({}).sort({ lastActive: -1 });
        return NextResponse.json(threads);
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, category, text } = await req.json();

        await connectDB();
        const newThread = await Thread.create({
            title,
            category,
            text,
            authorId: session.user.id,
            authorName: session.user.name || 'Anonymous',
            replies: [],
            upvotes: [],
            views: 0,
            lastActive: new Date(),
        });

        return NextResponse.json(newThread, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
