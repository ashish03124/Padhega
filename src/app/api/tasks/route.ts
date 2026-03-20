import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectToDatabase from '@/app/lib/mongodb';
import Task from '@/app/models/Task';

/**
 * GET: Fetch user's tasks
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const tasks = await Task.find({ userId: session.user.id })
            .sort({ isCompleted: 1, createdAt: -1 });

        return NextResponse.json(tasks);
    } catch (error: unknown) {
        console.error('API Error (GET tasks):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST: Create a new task
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, category, priority, dueDate } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Task text is required' }, { status: 400 });
        }

        await connectToDatabase();
        const newTask = await Task.create({
            userId: session.user.id,
            text,
            isCompleted: false,
            priority: priority || 'medium',
            category: category || 'General',
            dueDate: dueDate ? new Date(dueDate) : undefined,
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error: unknown) {
        console.error('API Error (POST tasks):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH: Update task completion status or text
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, text, isCompleted, category, priority, dueDate } = await request.json();
        if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

        const updateData: any = {};
        if (text !== undefined) updateData.text = text;
        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted;
            updateData.completedAt = isCompleted ? new Date() : null;
        }
        if (category !== undefined) updateData.category = category;
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

        await connectToDatabase();
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: updateData },
            { new: true }
        );

        if (!updatedTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        return NextResponse.json(updatedTask);
    } catch (error: unknown) {
        console.error('API Error (PATCH tasks):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE: Delete a task
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

        await connectToDatabase();
        const deletedTask = await Task.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!deletedTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('API Error (DELETE tasks):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
