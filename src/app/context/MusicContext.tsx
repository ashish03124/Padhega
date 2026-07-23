"use client";
 
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { showToast } from '../components/Toast';

interface MusicContextType {
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
    queue: any[];
    currentQueueIndex: number;
    isShuffled: boolean;
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
    selectMusicTrack: (video: any, queueList?: any[]) => void;
    handleNextTrack: () => void;
    handlePrevTrack: () => void;
    handleShuffle: () => void;
    extractVideoId: (url: string) => string;
    handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formatTime: (seconds: number) => string;
    youtubeOpts: any;
    handleLocalFileSelect: (file: File) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

    // Queue state for next/previous navigation
    const [queue, setQueue] = useState<any[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
    const [isShuffled, setIsShuffled] = useState(false);

    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const localFileUrlRef = useRef<string | null>(null);
    const dummyYoutubePlayerRef = useRef<any>(null);

    // Keep a ref to queue/index so callbacks can read latest values
    const queueRef = useRef<any[]>([]);
    const currentQueueIndexRef = useRef(-1);
    const isShuffledRef = useRef(false);

    // Extract video ID from various YouTube URL formats
    const extractVideoId = (url: string): string => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : '';
    };

    const handleLoadMusic = () => {
        const id = extractVideoId(youtubeUrl);
        if (id) {
            const track = {
                videoId: id,
                title: 'Loading YouTube Track...',
                url: `/api/music/stream?id=${id}`,
                thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            };
            setMusicSource('youtube');
            selectMusicTrack(track, [track]);
        } else {
            showToast('Invalid YouTube URL', 'warning');
        }
    };

    const onYouTubeReady = () => {};
    const onYouTubeStateChange = () => {};

    const handleAudioTimeUpdate = () => {
        if (localAudioRef.current) {
            setCurrentTime(localAudioRef.current.currentTime);
        }
    };

    const handleAudioDurationChange = () => {
        if (localAudioRef.current) {
            setDuration(localAudioRef.current.duration || 0);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (localAudioRef.current && localAudioRef.current.loop) {
            localAudioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Error looping audio:", err));
        } else {
            handleNextTrack();
        }
    };

    const handleAudioError = (e: any) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        if (musicSource === 'youtube') {
            showToast("Failed to stream YouTube audio. Attempting next track...", "error");
            setTimeout(() => {
                handleNextTrack();
            }, 3000);
        } else {
            showToast("Failed to play audio file.", "error");
        }
    };

    const handlePlayPauseMusic = () => {
        if (localAudioRef.current) {
            if (isPlaying) {
                localAudioRef.current.pause();
                setIsPlaying(false);
            } else {
                localAudioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(err => {
                        console.error("Error playing audio:", err);
                        setIsPlaying(false);
                    });
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (localAudioRef.current) {
            localAudioRef.current.volume = newVolume / 100;
        }
    };

    const handleMusicSourceChange = (source: 'youtube' | 'local') => {
        setMusicSource(source);
        setMusicSearchResults([]);
        
        if (localAudioRef.current) {
            localAudioRef.current.pause();
        }
        setIsPlaying(false);
        setVideoId('');
        setNowPlaying('Not playing');
        setThumbnail('');
        setCurrentTime(0);
        setDuration(0);
    };

    // Abort controller for cancelling previous searches
    const abortControllerRef = useRef<AbortController | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMusicSearch = async () => {
        if (!searchQuery.trim()) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsSearchingMusic(true);
        setMusicSearchResults([]);

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

            if (error.name === 'AbortError') {
                console.log('Search cancelled');
                return;
            }

            console.error('Error searching music:', error);
            if (error.message !== 'Search timeout') {
                showToast(error.message || 'Failed to search music. Please try again.', 'error');
            }
        } finally {
            setIsSearchingMusic(false);
        }
    };

    const debouncedSearch = () => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleMusicSearch();
        }, 500);
    };

    const selectMusicTrack = (video: any, queueList?: any[]) => {
        const newQueue = queueList && queueList.length > 0 ? queueList : queue;
        const idx = newQueue.findIndex((v) => v.videoId === video.videoId);
        const resolvedIdx = idx >= 0 ? idx : 0;

        queueRef.current = newQueue;
        currentQueueIndexRef.current = resolvedIdx;
        setQueue(newQueue);
        setCurrentQueueIndex(resolvedIdx);

        const isLocalOrAmbient = video.isLocal || video.isAmbient;
        setMusicSource(isLocalOrAmbient ? 'local' : 'youtube');

        const resolvedUrl = isLocalOrAmbient ? video.url : `/api/music/stream?id=${video.videoId}`;

        if (localAudioRef.current) {
            localAudioRef.current.pause();
            localAudioRef.current.src = resolvedUrl;
            localAudioRef.current.load();
            localAudioRef.current.loop = !!video.isAmbient;
            localAudioRef.current.volume = volume / 100;
            
            localAudioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch((err) => {
                    console.error("Failed to play native audio:", err);
                    setIsPlaying(false);
                });
        }

        setVideoId(video.videoId);
        setYoutubeUrl(video.url);
        setNowPlaying(video.title || 'Loading...');
        setThumbnail(video.thumbnail || '');
        setMusicSearchResults([]);
        setCurrentTime(0);
        setDuration(0);
    };

    const handleLocalFileSelect = (file: File) => {
        if (localFileUrlRef.current) {
            URL.revokeObjectURL(localFileUrlRef.current);
        }

        const url = URL.createObjectURL(file);
        localFileUrlRef.current = url;

        const track = {
            videoId: 'local-file-' + Date.now(),
            title: file.name,
            url: url,
            thumbnail: '',
            isLocal: true
        };

        setMusicSource('local');
        selectMusicTrack(track, [track]);
    };

    const handleNextTrack = () => {
        const q = queueRef.current;
        if (q.length === 0) return;
        let nextIdx: number;
        if (isShuffledRef.current) {
            nextIdx = Math.floor(Math.random() * q.length);
        } else {
            nextIdx = (currentQueueIndexRef.current + 1) % q.length;
        }
        const nextTrack = q[nextIdx];
        selectMusicTrack(nextTrack, q);
    };

    const handlePrevTrack = () => {
        const q = queueRef.current;
        if (q.length === 0) return;
        
        if (localAudioRef.current && localAudioRef.current.currentTime > 3) {
            localAudioRef.current.currentTime = 0;
            setCurrentTime(0);
            return;
        }
        
        const prevIdx = (currentQueueIndexRef.current - 1 + q.length) % q.length;
        const prevTrack = q[prevIdx];
        selectMusicTrack(prevTrack, q);
    };

    const handleShuffle = () => {
        const next = !isShuffledRef.current;
        isShuffledRef.current = next;
        setIsShuffled(next);
        showToast(next ? '🔀 Shuffle on' : '🔁 Shuffle off', 'info', 2000);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (localAudioRef.current) {
            localAudioRef.current.currentTime = newTime;
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
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (localFileUrlRef.current) {
                URL.revokeObjectURL(localFileUrlRef.current);
            }
        };
    }, []);

    // Media Session API for lock screen / background playback controls
    useEffect(() => {
        if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
            try {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: videoId ? nowPlaying : 'Ready to Focus',
                    artist: musicSource === 'youtube' ? 'YouTube Focus Music' : 'Local & Ambient Audio',
                    album: 'Padhega Study Companion',
                    artwork: [
                        {
                            src: thumbnail || 'https://padhega.vercel.app/images/logo.png',
                            sizes: '512x512',
                            type: 'image/png'
                        }
                    ]
                });

                navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
            } catch (error) {
                console.error('Error updating Media Session metadata:', error);
            }
        }
    }, [nowPlaying, thumbnail, isPlaying, musicSource, videoId]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('play', () => {
                    if (localAudioRef.current) {
                        localAudioRef.current.play()
                            .then(() => setIsPlaying(true))
                            .catch(err => console.error("Media Session play error:", err));
                    }
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    if (localAudioRef.current) {
                        localAudioRef.current.pause();
                        setIsPlaying(false);
                    }
                });
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    handlePrevTrack();
                });
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    handleNextTrack();
                });
                navigator.mediaSession.setActionHandler('seekto', (details) => {
                    if (details.seekTime !== undefined) {
                        if (localAudioRef.current) {
                            localAudioRef.current.currentTime = details.seekTime;
                            setCurrentTime(details.seekTime);
                        }
                    }
                });
            } catch (error) {
                console.error('Error setting Media Session action handlers:', error);
            }
        }
    }, [videoId, queue, currentQueueIndex, isShuffled, musicSource]);

    const youtubeOpts = {};

    const musicContextValue: MusicContextType = {
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
        currentTime,
        duration,
        thumbnail,
        queue,
        currentQueueIndex,
        isShuffled,
        youtubePlayerRef: dummyYoutubePlayerRef,
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
        handleNextTrack,
        handlePrevTrack,
        handleShuffle,
        extractVideoId,
        youtubeOpts,
        handleSeek,
        formatTime,
        handleLocalFileSelect,
    };

    return (
        <MusicContext.Provider value={musicContextValue}>
            {children}
            {/* Unified Native HTML5 Audio element for all playback (YouTube & Local) */}
            <audio
                ref={localAudioRef}
                style={{ display: 'none' }}
                onTimeUpdate={handleAudioTimeUpdate}
                onDurationChange={handleAudioDurationChange}
                onEnded={handleAudioEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={handleAudioError}
            />
        </MusicContext.Provider>
    );
};

export const useMusicContext = () => {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error('useMusicContext must be used within a MusicProvider');
    }
    return context;
};
