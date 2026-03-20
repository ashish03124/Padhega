import { NextResponse } from 'next/server';
import yts from 'yt-search';

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
        // Lowered to 8-second timeout to stay within Vercel Hobby plan limits (10s)
        const r: any = await withTimeout(yts(query), 8000);
        
        // Ensure we have results and videos array
        if (!r || !Array.isArray(r.videos)) {
            return NextResponse.json({ videos: [] });
        }

        const videos = r.videos.slice(0, 15).map((video: any) => ({
            title: video.title || 'Unknown Title',
            url: video.url || '',
            videoId: video.videoId || '',
            duration: video.timestamp || '0:00',
            thumbnail: video.thumbnail || '',
            author: video.author?.name || 'Unknown Author',
        })).filter((v: any) => v.videoId && v.url);

        // Cache results for 5 minutes
        return NextResponse.json(
            { videos },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (error: unknown) {
        console.error('YouTube Search Error:', error);

        // Specific timeout error message
        if (error instanceof Error && error.message === 'Search timeout') {
            return NextResponse.json(
                { error: 'Search is taking too long. Please try again or use a different search term.' },
                { status: 504 }
            );
        }

        return NextResponse.json({ error: 'Failed to search music' }, { status: 500 });
    }
}
