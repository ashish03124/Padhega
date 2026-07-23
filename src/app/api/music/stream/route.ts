import { NextRequest, NextResponse } from 'next/server';
import YTDlpWrap from 'yt-dlp-wrap';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Cache direct GoogleVideo URLs in memory to serve range requests instantly (< 10ms)
const urlCache = new Map<string, { url: string; expiresAt: number }>();

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
        
        if (process.platform !== 'win32') {
            fs.chmodSync(binaryPath, '755');
        }
    }

    return binaryPath;
}

async function getDirectAudioUrl(videoId: string): Promise<string> {
    const cached = urlCache.get(videoId);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.url;
    }

    const binaryPath = await ensureBinary();
    const ytDlpWrap = new YTDlpWrap(binaryPath);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Extract direct stream URL for format 140 (audio/mp4 m4a, 128k) or best m4a audio
    const stdout = await ytDlpWrap.execPromise([
        videoUrl,
        '-g',
        '-f', '140/m4a/bestaudio[ext=m4a]/ba'
    ]);

    const directUrl = stdout.trim().split('\n')[0];
    if (!directUrl || !directUrl.startsWith('http')) {
        throw new Error('Could not resolve direct audio URL');
    }

    // Cache direct URL for 3 hours (YouTube links expire after ~6 hours)
    urlCache.set(videoId, {
        url: directUrl,
        expiresAt: Date.now() + 3 * 60 * 60 * 1000
    });

    return directUrl;
}

function buildResponse(upstreamRes: Response): NextResponse {
    const responseHeaders = new Headers();

    const contentType = upstreamRes.headers.get('content-type') || 'audio/mp4';
    const contentLength = upstreamRes.headers.get('content-length');
    const contentRange = upstreamRes.headers.get('content-range');
    const acceptRanges = upstreamRes.headers.get('accept-ranges') || 'bytes';

    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', acceptRanges);
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    return new NextResponse(upstreamRes.body, {
        status: upstreamRes.status,
        headers: responseHeaders,
    });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId || videoId.length < 5) {
        return NextResponse.json({ error: 'Valid Video ID is required' }, { status: 400 });
    }

    try {
        const directUrl = await getDirectAudioUrl(videoId);
        const clientRange = request.headers.get('range');

        const headers: Record<string, string> = {
            'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        };

        if (clientRange) {
            headers['Range'] = clientRange;
        }

        let upstreamRes = await fetch(directUrl, { headers });

        if (!upstreamRes.ok && upstreamRes.status !== 206) {
            // If cached URL expired early, purge cache and retry once
            urlCache.delete(videoId);
            const freshUrl = await getDirectAudioUrl(videoId);
            upstreamRes = await fetch(freshUrl, { headers });
        }

        return buildResponse(upstreamRes);

    } catch (error: any) {
        console.error('[Stream API] Error streaming videoId:', videoId, error?.message);
        return NextResponse.json(
            { error: error?.message || 'Failed to stream audio' },
            { status: 500 }
        );
    }
}
