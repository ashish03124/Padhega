import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectToDatabase from '@/app/lib/mongodb';
import Note from '@/app/models/Note';

/**
 * GET: Fetch user's notes
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const notes = await Note.find({ userId: session.user.id })
            .sort({ isPinned: -1, updatedAt: -1 });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('API Error (GET notes):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST: Create a new note
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content, isPinned, tags } = await request.json();

        if (!title || content === undefined) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        await connectToDatabase();
        const newNote = await Note.create({
            userId: session.user.id,
            title,
            content,
            isPinned: isPinned || false,
            tags: tags || [],
        });

        return NextResponse.json(newNote, { status: 201 });
    } catch (error) {
        console.error('API Error (POST notes):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH: Update an existing note
 * DELETE: Delete a note
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, title, content, isPinned, tags } = await request.json();
        if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

        await connectToDatabase();
        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: { title, content, isPinned, tags } },
            { new: true }
        );

        if (!updatedNote) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

        return NextResponse.json(updatedNote);
    } catch (error) {
        console.error('API Error (PATCH notes):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

        await connectToDatabase();
        const deletedNote = await Note.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!deletedNote) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error (DELETE notes):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
