import { NextRequest, NextResponse } from 'next/server';
import YTDlpWrap from 'yt-dlp-wrap';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Helper to get and ensure the yt-dlp binary is downloaded and ready
async function ensureBinary(): Promise<string> {
    const binDir = path.join(process.cwd(), 'bin');
    if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, { recursive: true });
    }

    const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const binaryPath = path.join(binDir, binaryName);

    if (!fs.existsSync(binaryPath)) {
        console.log(`[Stream API] Binary not found. Downloading yt-dlp to ${binaryPath}...`);
        await YTDlpWrap.downloadFromGithub(binaryPath);
        console.log('[Stream API] yt-dlp download complete.');
        
        // Ensure executable permissions on Linux/macOS
        if (process.platform !== 'win32') {
            fs.chmodSync(binaryPath, '755');
        }
    }

    return binaryPath;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId || videoId.length < 5) {
        return NextResponse.json({ error: 'Valid Video ID is required' }, { status: 400 });
    }

    try {
        const binaryPath = await ensureBinary();
        const ytDlpWrap = new YTDlpWrap(binaryPath);
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        console.log(`[Stream API] Starting yt-dlp stream for video: ${videoId}`);
        
        // Stream best audio, prioritizing m4a format for iOS Safari compatibility
        const ytDlpStream = ytDlpWrap.execStream([
            videoUrl,
            '-f', 'ba[ext=m4a]/ba',
            '-o', '-'
        ]);

        const webStream = new ReadableStream({
            start(controller) {
                ytDlpStream.on('data', (chunk: Buffer) => {
                    controller.enqueue(chunk);
                });
                ytDlpStream.on('end', () => {
                    controller.close();
                });
                ytDlpStream.on('error', (err: Error) => {
                    console.error('[Stream API] yt-dlp stream process error:', err);
                    controller.error(err);
                });
            },
            cancel() {
                console.log('[Stream API] client cancelled/closed stream. Killing yt-dlp process.');
                ytDlpStream.destroy();
            }
        });

        // Set Content-Type. Native player will sniff container from payload anyway.
        return new NextResponse(webStream, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mp4',
                'Cache-Control': 'no-cache',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('[Stream API] Failed to stream videoId:', videoId, error?.message);
        return NextResponse.json(
            { error: error?.message || 'Failed to stream audio' },
            { status: 500 }
        );
    }
}
