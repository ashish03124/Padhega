import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { roomName, userName, isOwner } = await request.json();

        const apiKey = process.env.DAILY_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Daily.co API key not configured' },
                { status: 500 }
            );
        }

        // Create a meeting token for the user
        const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                properties: {
                    room_name: roomName,
                    user_name: userName,
                    is_owner: isOwner || false,
                    enable_recording: 'cloud',
                    start_video_off: false,
                    start_audio_off: false,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Daily.co token error:', error);
            return NextResponse.json(
                { error: 'Failed to create meeting token', details: error },
                { status: response.status }
            );
        }

        const tokenData = await response.json();

        return NextResponse.json({
            token: tokenData.token,
        });
    } catch (error) {
        console.error('Error creating meeting token:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
