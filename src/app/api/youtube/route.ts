import { NextRequest, NextResponse } from 'next/server';

interface VideoResult {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    author: string;
    views: string;
    duration: string;
}

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        // Use YouTube's internal search page (no API key or external deps needed)
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            return NextResponse.json({ videos: [] });
        }

        const html = await response.text();

        // Extract ytInitialData JSON from the page
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

        // Navigate YouTube data structure to find video results
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

            videos.push({
                id: renderer.videoId,
                title: renderer.title?.runs?.[0]?.text || 'Unknown Title',
                description:
                    renderer.detailedMetadataSnippets?.[0]?.snippetText?.runs
                        ?.map((r: any) => r.text)
                        .join('') ||
                    renderer.descriptionSnippet?.runs
                        ?.map((r: any) => r.text)
                        .join('') ||
                    '',
                thumbnail: renderer.thumbnail?.thumbnails?.pop()?.url || '',
                author: renderer.ownerText?.runs?.[0]?.text || 'Unknown',
                views: renderer.viewCountText?.simpleText || '0 views',
                duration: renderer.lengthText?.simpleText || '0:00',
            });

            if (videos.length >= 10) break;
        }

        return NextResponse.json({ videos });
    } catch (error: unknown) {
        console.error('YouTube Search API Error:', error);

        if (
            error instanceof DOMException &&
            error.name === 'TimeoutError'
        ) {
            return NextResponse.json(
                { error: 'Search timed out. Please try again.' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to search videos',
            },
            { status: 500 }
        );
    }
}
