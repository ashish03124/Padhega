import { NextResponse } from 'next/server';

interface VideoResult {
    title: string;
    url: string;
    videoId: string;
    duration: string;
    thumbnail: string;
    author: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json(
            { error: 'Query parameter "q" is required' },
            { status: 400 }
        );
    }

    try {
        // Use YouTube's internal search endpoint (no API key needed)
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: AbortSignal.timeout(8000), // 8s timeout for Vercel
        });

        if (!response.ok) {
            return NextResponse.json({ videos: [] });
        }

        const html = await response.text();

        // Extract the ytInitialData JSON from the page
        const dataMatch = html.match(
            /var ytInitialData\s*=\s*({.+?});\s*<\/script>/
        );

        if (!dataMatch || !dataMatch[1]) {
            return NextResponse.json({ videos: [] });
        }

        let ytData: any;
        try {
            ytData = JSON.parse(dataMatch[1]);
        } catch {
            return NextResponse.json({ videos: [] });
        }

        // Navigate the YouTube data structure to find video results
        const contents =
            ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents
                ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer
                ?.contents;

        if (!Array.isArray(contents)) {
            return NextResponse.json({ videos: [] });
        }

        const videos: VideoResult[] = [];

        for (const item of contents) {
            const renderer = item?.videoRenderer;
            if (!renderer || !renderer.videoId) continue;

            const title =
                renderer.title?.runs?.[0]?.text || 'Unknown Title';
            const videoId = renderer.videoId;
            const author =
                renderer.ownerText?.runs?.[0]?.text || 'Unknown';
            const duration =
                renderer.lengthText?.simpleText || '0:00';
            const thumbnail =
                renderer.thumbnail?.thumbnails?.pop()?.url || '';

            videos.push({
                title,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                videoId,
                duration,
                thumbnail,
                author,
            });

            if (videos.length >= 15) break;
        }

        return NextResponse.json(
            { videos },
            {
                headers: {
                    'Cache-Control':
                        'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (error: unknown) {
        console.error('YouTube Search Error:', error);

        if (
            error instanceof DOMException &&
            error.name === 'TimeoutError'
        ) {
            return NextResponse.json(
                {
                    error: 'Search is taking too long. Please try again.',
                },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to search music' },
            { status: 500 }
        );
    }
}
