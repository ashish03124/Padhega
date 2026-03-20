import { NextRequest, NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        const results = await ytSearch(query);

        // Filter and map to a clean format
        const videos = results.videos.slice(0, 10).map((video: any) => ({
            id: video.videoId,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            author: video.author.name,
            views: video.views,
            duration: video.duration.timestamp,
        }));

        return NextResponse.json({ videos });

    } catch (error: unknown) {
        console.error('YouTube Search API Error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to search videos' },
            { status: 500 }
        );
    }
}
