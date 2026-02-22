"use client";

import { useState, useRef, useEffect } from 'react';

interface UseMusicPlayerReturn {
    musicSource: 'youtube' | 'local';
    youtubeUrl: string;
    videoId: string;
    nowPlaying: string;
    volume: number;
    isPlaying: boolean;
    musicSearchResults: any[];
    isSearchingMusic: boolean;
    searchQuery: string;
    showMusicSettingsModal: boolean;
    currentTime: number;
    duration: number;
    thumbnail: string;
    youtubePlayerRef: React.MutableRefObject<any>;
    setYoutubeUrl: (url: string) => void;
    setSearchQuery: (query: string) => void;
    setShowMusicSettingsModal: (show: boolean) => void;
    handleMusicSourceChange: (source: 'youtube' | 'local') => void;
    handleLoadMusic: () => void;
    onYouTubeReady: (event: any) => void;
    onYouTubeStateChange: (event: any) => void;
    handlePlayPauseMusic: () => void;
    handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleMusicSearch: () => Promise<void>;
    debouncedSearch: () => void;
    selectMusicTrack: (video: any) => void;
    extractVideoId: (url: string) => string;
    handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formatTime: (seconds: number) => string;
    youtubeOpts: any;
}

export const useMusicPlayer = (): UseMusicPlayerReturn => {
    const [musicSource, setMusicSource] = useState<'youtube' | 'local'>('youtube');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    const [nowPlaying, setNowPlaying] = useState('Not playing');
    const [volume, setVolume] = useState(50);
    const [isPlaying, setIsPlaying] = useState(false);
    const [thumbnail, setThumbnail] = useState('');
    const [musicSearchResults, setMusicSearchResults] = useState<any[]>([]);
    const [isSearchingMusic, setIsSearchingMusic] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMusicSettingsModal, setShowMusicSettingsModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const youtubePlayerRef = useRef<any>(null);
    const progressIntervalRef = useRef<any>(null);

    // Extract video ID from various YouTube URL formats
    const extractVideoId = (url: string): string => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : '';
    };

    const handleLoadMusic = () => {
        const id = extractVideoId(youtubeUrl);
        if (id) {
            setVideoId(id);
            setNowPlaying('Loading...');
        } else {
            alert('Invalid YouTube URL');
        }
    };

    const onYouTubeReady = (event: any) => {
        youtubePlayerRef.current = event.target;
        youtubePlayerRef.current.setVolume(volume);
        const videoDuration = youtubePlayerRef.current.getDuration();
        setDuration(videoDuration);
    };

    const onYouTubeStateChange = (event: any) => {
        if (event.data === 1) { // Playing
            setIsPlaying(true);
            setNowPlaying(youtubePlayerRef.current?.getVideoData()?.title || 'Playing...');
            // Start progress tracking
            startProgressTracking();
        } else if (event.data === 2) { // Paused
            setIsPlaying(false);
            stopProgressTracking();
        } else if (event.data === 0) { // Ended
            setIsPlaying(false);
            stopProgressTracking();
            setCurrentTime(0);
        }
    };

    const startProgressTracking = () => {
        stopProgressTracking();
        progressIntervalRef.current = setInterval(() => {
            if (youtubePlayerRef.current) {
                const time = youtubePlayerRef.current.getCurrentTime();
                setCurrentTime(time);
            }
        }, 100);
    };

    const stopProgressTracking = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    };

    const handlePlayPauseMusic = () => {
        if (youtubePlayerRef.current) {
            if (isPlaying) {
                youtubePlayerRef.current.pauseVideo();
            } else {
                youtubePlayerRef.current.playVideo();
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (youtubePlayerRef.current) {
            youtubePlayerRef.current.setVolume(newVolume);
        }
    };

    const handleMusicSourceChange = (source: 'youtube' | 'local') => {
        setMusicSource(source);
        setMusicSearchResults([]);
    };

    // Abort controller for cancelling previous searches
    const abortControllerRef = useRef<AbortController | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMusicSearch = async () => {
        if (!searchQuery.trim()) return;

        // Cancel previous search if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setIsSearchingMusic(true);
        setMusicSearchResults([]); // Clear previous results

        // Set timeout warning after 15 seconds
        const timeoutWarning = setTimeout(() => {
            console.log('⏳ Music search is taking longer than expected...');
        }, 15000);

        try {
            const response = await fetch(
                `/api/music/search?q=${encodeURIComponent(searchQuery)}`,
                { signal: abortControllerRef.current.signal }
            );

            clearTimeout(timeoutWarning);

            const data = await response.json();

            if (!response.ok) {
                // Log timeout errors instead of showing aggressive alerts
                if (response.status === 504) {
                    console.warn('⚠️ Search timed out. Try a simpler search term.');
                    setMusicSearchResults([]);
                    return;
                }
                throw new Error(data.error || 'Failed to search music');
            }

            if (data.videos) {
                setMusicSearchResults(data.videos);
            }
        } catch (error: any) {
            clearTimeout(timeoutWarning);

            // Don't show error if request was aborted (user started new search)
            if (error.name === 'AbortError') {
                console.log('Search cancelled');
                return;
            }

            console.error('Error searching music:', error);
            // Only alert for non-timeout errors
            if (error.message !== 'Search timeout') {
                alert(error.message || 'Failed to search music. Please try again.');
            }
        } finally {
            setIsSearchingMusic(false);
        }
    };

    // Debounced search function
    const debouncedSearch = () => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleMusicSearch();
        }, 500); // 500ms debounce
    };

    const selectMusicTrack = (video: any) => {
        setVideoId(video.videoId);
        setYoutubeUrl(video.url);
        setNowPlaying('Loading...');
        setThumbnail(video.thumbnail || '');
        setMusicSearchResults([]);
        setCurrentTime(0);
        setDuration(0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (youtubePlayerRef.current) {
            youtubePlayerRef.current.seekTo(newTime, true);
        }
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds) || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopProgressTracking();
            // Cleanup abort controller
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            // Cleanup search timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // YouTube player options
    const youtubeOpts = {
        height: '0',
        width: '0',
        playerVars: {
            autoplay: 0,
            controls: 0,
        },
    };

    return {
        musicSource,
        youtubeUrl,
        videoId,
        nowPlaying,
        volume,
        isPlaying,
        musicSearchResults,
        isSearchingMusic,
        searchQuery,
        showMusicSettingsModal,
        youtubePlayerRef,
        setYoutubeUrl,
        setSearchQuery,
        setShowMusicSettingsModal,
        handleMusicSourceChange,
        handleLoadMusic,
        onYouTubeReady,
        onYouTubeStateChange,
        handlePlayPauseMusic,
        handleVolumeChange,
        handleMusicSearch,
        debouncedSearch,
        selectMusicTrack,
        extractVideoId,
        youtubeOpts,
        currentTime,
        duration,
        thumbnail,
        handleSeek,
        formatTime,
    };
};
