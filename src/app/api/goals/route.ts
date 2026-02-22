import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectToDatabase from '@/app/lib/mongodb';
import Goal from '@/app/models/Goal';

/**
 * GET: Fetch user's goals
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const goals = await Goal.find({ userId: session.user.id });

        return NextResponse.json(goals);
    } catch (error) {
        console.error('API Error (GET goals):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST: Create a new goal
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, targetValue, unit, timeFrame, deadline } = await request.json();

        if (!name || targetValue === undefined || !unit || !timeFrame) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();
        const newGoal = await Goal.create({
            userId: session.user.id,
            name,
            targetValue,
            currentValue: 0,
            unit,
            timeFrame,
            deadline: deadline ? new Date(deadline) : undefined,
            isActive: true,
        });

        return NextResponse.json(newGoal, { status: 201 });
    } catch (error) {
        console.error('API Error (POST goals):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH: Update goal progress or metadata
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, currentValue, targetValue, isActive, deadline } = await request.json();
        if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (currentValue !== undefined) updateData.currentValue = currentValue;
        if (targetValue !== undefined) updateData.targetValue = targetValue;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

        await connectToDatabase();
        const updatedGoal = await Goal.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: updateData },
            { new: true }
        );

        if (!updatedGoal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

        return NextResponse.json(updatedGoal);
    } catch (error: any) {
        console.error('API Error (PATCH goals):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE: Remove a goal
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });

        await connectToDatabase();
        const deletedGoal = await Goal.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!deletedGoal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error (DELETE goals):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
