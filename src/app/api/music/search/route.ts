import { NextResponse } from 'next/server';
const yts = require('yt-search');

// Add timeout wrapper for the search
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Search timeout')), timeoutMs)
        ),
    ]);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        // Increased to 20-second timeout for slower connections
        const r: any = await withTimeout(yts(query), 20000);
        const videos = r.videos.slice(0, 10).map((video: any) => ({
            title: video.title,
            url: video.url,
            videoId: video.videoId,
            duration: video.timestamp,
            thumbnail: video.thumbnail,
            author: video.author.name,
        }));

        // Cache results for 5 minutes
        return NextResponse.json(
            { videos },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (error: any) {
        console.error('YouTube Search Error:', error);

        // Specific timeout error message
        if (error.message === 'Search timeout') {
            return NextResponse.json(
                { error: 'Search is taking too long. Please try again or use a different search term.' },
                { status: 504 }
            );
        }

        return NextResponse.json({ error: 'Failed to search music' }, { status: 500 });
    }
}
