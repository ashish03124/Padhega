import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId || !ytdl.validateID(videoId)) {
        return NextResponse.json({ error: 'Valid Video ID is required' }, { status: 400 });
    }

    try {
        // Get video info to extract audio format details
        const info = await ytdl.getInfo(videoId, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                }
            }
        });

        // Pick the best audio-only format (prefer m4a/aac, 128kbps)
        const format = ytdl.chooseFormat(info.formats, {
            quality: 'highestaudio',
            filter: 'audioonly',
        });

        if (!format) {
            return NextResponse.json({ error: 'No audio format available' }, { status: 500 });
        }

        // Create a streaming response by piping ytdl stream to web ReadableStream
        const ytdlStream = ytdl.downloadFromInfo(info, { format });

        const webStream = new ReadableStream({
            start(controller) {
                ytdlStream.on('data', (chunk: Buffer) => {
                    controller.enqueue(chunk);
                });
                ytdlStream.on('end', () => {
                    controller.close();
                });
                ytdlStream.on('error', (err: Error) => {
                    console.error('ytdl stream error:', err);
                    controller.error(err);
                });
            },
            cancel() {
                ytdlStream.destroy();
            }
        });

        return new NextResponse(webStream, {
            status: 200,
            headers: {
                'Content-Type': format.mimeType || 'audio/mp4',
                'Cache-Control': 'no-cache',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('Stream route error for videoId:', videoId, error?.message);
        return NextResponse.json(
            { error: error?.message || 'Failed to stream audio' },
            { status: 500 }
        );
    }
}
