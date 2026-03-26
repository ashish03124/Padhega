import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { room, username } = await req.json();

    if (!room || !username) {
      return NextResponse.json(
        { error: 'Missing room or username' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    console.log('=== LiveKit Token Debug ===');
    console.log('Room:', room);
    console.log('Username:', username);
    console.log('Has API Key:', !!apiKey);
    console.log('Has API Secret:', !!apiSecret);
    console.log('Has WS URL:', !!wsUrl);

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error('CRITICAL: Missing LiveKit environment variables!');
      return NextResponse.json(
        { error: 'LiveKit configuration missing on server' },
        { status: 500 }
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
    });

    at.addGrant({ 
      roomJoin: true, 
      room: room,
      canPublish: true,
      canSubscribe: true,
    });

    console.log('Token generation successful');
    return NextResponse.json({ token: await at.toJwt() });
  } catch (error: any) {
    console.error('LIVEKIT SERVER ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Failed to generate token: ' + error.message },
      { status: 500 }
    );
  }
}
