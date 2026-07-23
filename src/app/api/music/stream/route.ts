import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
        return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    try {
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}&bpctr=9999999999&has_verified=1`;
        const response = await fetch(watchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch YouTube watch page');
        }

        const html = await response.text();
        const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/) ||
                      html.match(/window\[['"]ytInitialPlayerResponse['"]\]\s*=\s*({.+?});/) ||
                      html.match(/window\.ytInitialPlayerResponse\s*=\s*({.+?});/);
                      
        if (!match) {
            throw new Error('Could not extract YouTube player data');
        }

        const playerData = JSON.parse(match[1]);
        
        // If the playabilityStatus is not OK, return the status reason
        const playabilityStatus = playerData?.playabilityStatus;
        if (playabilityStatus && playabilityStatus.status !== 'OK') {
            throw new Error(`Video is not playable: ${playabilityStatus.reason || playabilityStatus.status}`);
        }

        const adaptiveFormats = playerData?.streamingData?.adaptiveFormats || [];
        const audioFormats = adaptiveFormats.filter((format: any) => 
            format.mimeType && format.mimeType.startsWith('audio/')
        );

        if (audioFormats.length === 0) {
            throw new Error('No audio tracks found for this video');
        }

        // Find itag 140 (AAC audio, 128kbps) or fallback to first audio format
        let selectedFormat = audioFormats.find((f: any) => f.itag === 140) || audioFormats[0];
        let streamUrl = selectedFormat.url;

        if (!streamUrl && selectedFormat.signatureCipher) {
            const params = new URLSearchParams(selectedFormat.signatureCipher);
            const cipherUrl = params.get('url');
            const sig = params.get('s') || params.get('sig');
            const sp = params.get('sp') || 'sig';
            if (cipherUrl && sig) {
                streamUrl = `${cipherUrl}&${sp}=${encodeURIComponent(sig)}`;
            } else {
                streamUrl = cipherUrl;
            }
        }

        if (!streamUrl) {
            throw new Error('Direct audio stream URL is restricted or unavailable');
        }

        // Proxy the stream
        const streamResponse = await fetch(streamUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            }
        });

        if (!streamResponse.ok) {
            throw new Error('Failed to stream audio from YouTube servers');
        }

        const contentType = streamResponse.headers.get('Content-Type') || 'audio/mp4';
        
        return new NextResponse(streamResponse.body, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'public, max-age=3600',
            }
        });

    } catch (error: any) {
        console.error('Streaming error for video ID:', videoId, error);
        return NextResponse.json({ error: error.message || 'Streaming failed' }, { status: 500 });
    }
}
