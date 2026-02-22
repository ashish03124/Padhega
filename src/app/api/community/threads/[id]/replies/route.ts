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
        const { text } = await req.json();

        await connectDB();

        const thread = await Thread.findById(id);
        if (!thread) {
            return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
        }

        const newReply = {
            authorId: session.user.id,
            authorName: session.user.name || 'Anonymous',
            text,
            createdAt: new Date(),
        };

        thread.replies.push(newReply as any);
        thread.lastActive = new Date();
        await thread.save();

        const addedReply = thread.replies[thread.replies.length - 1];
        return NextResponse.json(addedReply);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { replyId } = await req.json();

        await connectDB();

        const thread = await Thread.findById(id);
        if (!thread) {
            return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
        }

        const replyIndex = thread.replies.findIndex(r => (r as any)._id.toString() === replyId);
        if (replyIndex === -1) {
            return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
        }

        if (thread.replies[replyIndex].authorId !== (session.user as any).id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        thread.replies.splice(replyIndex, 1);
        await thread.save();

        return NextResponse.json({ message: 'Reply deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
