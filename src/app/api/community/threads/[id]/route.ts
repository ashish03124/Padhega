import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectDB from '@/app/lib/mongodb';
import Thread from '@/app/models/Thread';

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
        await connectDB();

        const thread = await Thread.findById(id);
        if (!thread) {
            return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
        }

        if (thread.authorId !== (session.user as any).id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await Thread.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Thread deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
