import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectDB from '@/app/lib/mongodb';
import Thread from '@/app/models/Thread';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const userId = (session.user as any).id;

        await connectDB();

        const thread = await Thread.findById(id);
        if (!thread) {
            return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
        }

        const upvoteIndex = thread.upvotes.indexOf(userId);
        if (upvoteIndex === -1) {
            // Add upvote
            thread.upvotes.push(userId);
        } else {
            // Remove upvote
            thread.upvotes.splice(upvoteIndex, 1);
        }

        await thread.save();

        return NextResponse.json({ upvotes: thread.upvotes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
