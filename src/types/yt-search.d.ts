declare module 'yt-search' {
    interface VideoSearchResult {
        videoId: string;
        title: string;
        description: string;
        thumbnail: string;
        author: {
            name: string;
        };
        views: number;
        duration: {
            timestamp: string;
        };
    }

    interface SearchResult {
        videos: VideoSearchResult[];
    }

    function search(query: string): Promise<SearchResult>;

    export default search;
}
