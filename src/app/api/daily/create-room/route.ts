import { NextRequest, NextResponse } from 'next/server';

import connectToDatabase from '@/app/lib/mongodb';
import StudyRoom from '@/app/models/StudyRoom';

export async function POST(request: NextRequest) {
    try {
        const { roomName, privacy } = await request.json();

        const apiKey = process.env.DAILY_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Daily.co API key not configured. Please add DAILY_API_KEY to your .env.local file.' },
                { status: 500 }
            );
        }

        // Create a Daily.co room
        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                name: roomName,
                privacy: privacy === 'public' ? 'public' : 'private',
                properties: {
                    enable_chat: true,
                    enable_screenshare: true,
                    max_participants: 20,
                    // Removed enable_recording as it may cause issues on free plans
                    // exp: removed as it's optional and can cause validation errors
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();

            // Detailed logging to diagnose the issue
            console.error('=== Daily.co API Error Details ===');
            console.error('Status:', response.status);
            console.error('Error object:', JSON.stringify(error, null, 2));
            console.error('Error type:', error.error);
            console.error('Error info:', error.info);
            console.error('Error message:', error.message);
            console.error('================================');

            // If room already exists, fetch the existing room
            // Daily.co can return various error structures for existing rooms
            const isRoomExistsError = (
                (response.status === 400 || response.status === 409) && (
                    error.error === 'invalid-request-error' ||
                    error.error === 'room-already-exists' ||
                    (typeof error.info === 'string' && error.info.includes('already exists')) ||
                    (typeof error.message === 'string' && error.message.includes('already exists'))
                )
            );

            if (isRoomExistsError) {
                console.log('Room already exists, attempting to fetch existing room...');
                try {
                    const getResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                        },
                    });

                    if (getResponse.ok) {
                        const existingRoomData = await getResponse.json();
                        console.log('✓ Using existing Daily.co room:', existingRoomData.name);

                        // Update database with existing room URL if missing
                        await connectToDatabase();
                        await StudyRoom.findOneAndUpdate(
                            { roomId: roomName },
                            { $set: { dailyRoomUrl: existingRoomData.url, isActive: true } }
                        );

                        return NextResponse.json({
                            url: existingRoomData.url,
                            name: existingRoomData.name,
                            config: existingRoomData.config,
                        });
                    } else {
                        const getError = await getResponse.json();
                        console.error('Failed to fetch existing room:', getError);
                    }
                } catch (fetchError) {
                    console.error('Error fetching existing room:', fetchError);
                }
            }

            return NextResponse.json(
                { error: 'Failed to create video room', details: error },
                { status: response.status }
            );
        }

        const roomData = await response.json();

        // Update database with new room URL
        await connectToDatabase();
        await StudyRoom.findOneAndUpdate(
            { roomId: roomName },
            { $set: { dailyRoomUrl: roomData.url, isActive: true } }
        );

        return NextResponse.json({
            url: roomData.url,
            name: roomData.name,
            config: roomData.config,
        });
    } catch (error) {
        console.error('Error creating Daily.co room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
