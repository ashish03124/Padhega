"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
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
    showVideo: boolean;
    youtubePlayerRef: React.MutableRefObject<any>;
    setYoutubeUrl: (url: string) => void;
    setSearchQuery: (query: string) => void;
    setShowMusicSettingsModal: (show: boolean) => void;
    setShowVideo: (show: boolean) => void;
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
    audioAnalyser: AnalyserNode | null;
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
    const [showVideo, setShowVideo] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Queue state
    const [queue, setQueue] = useState<any[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
    const [isShuffled, setIsShuffled] = useState(false);

    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const youtubePlayerRef = useRef<any>(null);
    const localFileUrlRef = useRef<string | null>(null);

    const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

    const initAudioAnalyser = () => {
        if (typeof window === 'undefined') return;
        if (audioAnalyser) return;
        if (!localAudioRef.current) return;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const analyserNode = ctx.createAnalyser();
            analyserNode.fftSize = 128; // Gives 64 frequency bins, perfect for 5 equalizer bars

            if (!sourceNodeRef.current) {
                sourceNodeRef.current = ctx.createMediaElementSource(localAudioRef.current);
            }

            sourceNodeRef.current.connect(analyserNode);
            analyserNode.connect(ctx.destination);

            audioContextRef.current = ctx;
            setAudioAnalyser(analyserNode);
        } catch (e) {
            console.error('Failed to initialize Web Audio API Analyser:', e);
        }
    };

    const resumeAudioContext = async () => {
        initAudioAnalyser();
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            try {
                await audioContextRef.current.resume();
            } catch (e) {
                console.error('Failed to resume AudioContext:', e);
            }
        }
    };

    const queueRef = useRef<any[]>([]);
    const currentQueueIndexRef = useRef(-1);
    const isShuffledRef = useRef(false);

    const extractVideoId = (url: string): string => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : '';
    };

    const youtubeOpts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
    };

    const onYouTubeReady = (event: any) => {
        youtubePlayerRef.current = event.target;
        event.target.setVolume(volume);
        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const onYouTubeStateChange = (event: any) => {
        // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 0 = ENDED
        if (event.data === 1) {
            setIsPlaying(true);
        } else if (event.data === 2) {
            setIsPlaying(false);
        } else if (event.data === 0) {
            setIsPlaying(false);
            handleNextTrack();
        }
    };

    const handleLoadMusic = () => {
        const id = extractVideoId(youtubeUrl);
        if (id) {
            const track = {
                videoId: id,
                title: 'Loaded YouTube Track',
                url: youtubeUrl,
                thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            };
            setMusicSource('youtube');
            selectMusicTrack(track, [track]);
        } else {
            showToast('Invalid YouTube URL', 'warning');
        }
    };

    const handleAudioTimeUpdate = () => {
        if (musicSource === 'local' && localAudioRef.current) {
            setCurrentTime(localAudioRef.current.currentTime);
        }
    };

    const handleAudioDurationChange = () => {
        if (musicSource === 'local' && localAudioRef.current) {
            setDuration(localAudioRef.current.duration || 0);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (localAudioRef.current && localAudioRef.current.loop) {
            localAudioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Loop error:", err));
        } else {
            handleNextTrack();
        }
    };

    // YouTube player progress tracking timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && musicSource === 'youtube' && youtubePlayerRef.current) {
            interval = setInterval(() => {
                try {
                    if (youtubePlayerRef.current.getCurrentTime && youtubePlayerRef.current.getDuration) {
                        const cur = youtubePlayerRef.current.getCurrentTime() || 0;
                        const dur = youtubePlayerRef.current.getDuration() || 0;
                        setCurrentTime(cur);
                        setDuration(dur);
                    }
                } catch (e) {
                    // Ignore transient errors
                }
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying, musicSource]);

    const handlePlayPauseMusic = () => {
        if (musicSource === 'youtube') {
            if (youtubePlayerRef.current) {
                if (isPlaying) {
                    youtubePlayerRef.current.pauseVideo();
                    setIsPlaying(false);
                } else {
                    youtubePlayerRef.current.playVideo();
                    setIsPlaying(true);
                }
            } else if (videoId) {
                setIsPlaying(true);
            }
        } else {
            if (localAudioRef.current) {
                if (isPlaying) {
                    localAudioRef.current.pause();
                    setIsPlaying(false);
                } else {
                    resumeAudioContext();
                    localAudioRef.current.play()
                        .then(() => setIsPlaying(true))
                        .catch(err => {
                            console.error("Error playing audio:", err);
                            setIsPlaying(false);
                        });
                }
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (youtubePlayerRef.current && youtubePlayerRef.current.setVolume) {
            youtubePlayerRef.current.setVolume(newVolume);
        }
        if (localAudioRef.current) {
            localAudioRef.current.volume = newVolume / 100;
        }
    };

    const handleMusicSourceChange = (source: 'youtube' | 'local') => {
        setMusicSource(source);
        setMusicSearchResults([]);
        
        if (youtubePlayerRef.current && youtubePlayerRef.current.pauseVideo) {
            youtubePlayerRef.current.pauseVideo();
        }
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

        try {
            const response = await fetch(
                `/api/music/search?q=${encodeURIComponent(searchQuery)}`,
                { signal: abortControllerRef.current.signal }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to search music');
            }

            if (data.videos) {
                setMusicSearchResults(data.videos);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error('Error searching music:', error);
            showToast(error.message || 'Failed to search music.', 'error');
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
        const isYT = !isLocalOrAmbient;

        setMusicSource(isYT ? 'youtube' : 'local');
        setVideoId(isYT ? video.videoId : '');
        setYoutubeUrl(video.url || '');
        setNowPlaying(video.title || 'Loading...');
        setThumbnail(video.thumbnail || '');
        setMusicSearchResults([]);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(true);

        if (isYT) {
            if (localAudioRef.current) {
                localAudioRef.current.pause();
            }
            if (youtubePlayerRef.current && youtubePlayerRef.current.loadVideoById) {
                youtubePlayerRef.current.loadVideoById(video.videoId);
            }
        } else {
            if (youtubePlayerRef.current && youtubePlayerRef.current.pauseVideo) {
                youtubePlayerRef.current.pauseVideo();
            }
            if (localAudioRef.current) {
                localAudioRef.current.pause();
                localAudioRef.current.src = video.url;
                localAudioRef.current.loop = !!video.isAmbient;
                localAudioRef.current.volume = volume / 100;
                resumeAudioContext();
                localAudioRef.current.play().catch(err => console.error("Error playing audio:", err));
            }
        }
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
        
        if (currentTime > 3) {
            handleSeek({ target: { value: '0' } } as any);
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
        if (musicSource === 'youtube' && youtubePlayerRef.current && youtubePlayerRef.current.seekTo) {
            youtubePlayerRef.current.seekTo(newTime, true);
        } else if (musicSource === 'local' && localAudioRef.current) {
            localAudioRef.current.currentTime = newTime;
        }
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds) || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(err => console.error("Error closing AudioContext:", err));
            }
        };
    }, []);

    // Media Session API for lock screen controls
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
                console.error('Media Session error:', error);
            }
        }
    }, [nowPlaying, thumbnail, isPlaying, musicSource, videoId]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('play', () => {
                    handlePlayPauseMusic();
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    handlePlayPauseMusic();
                });
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    handlePrevTrack();
                });
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    handleNextTrack();
                });
            } catch (error) {
                console.error('Media Session handlers error:', error);
            }
        }
    }, [videoId, queue, currentQueueIndex, isShuffled, musicSource, isPlaying]);

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
        showVideo,
        youtubePlayerRef,
        setYoutubeUrl,
        setSearchQuery,
        setShowMusicSettingsModal,
        setShowVideo,
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
        audioAnalyser,
    };

    return (
        <MusicContext.Provider value={musicContextValue}>
            {children}
            <audio
                ref={localAudioRef}
                playsInline
                preload="auto"
                style={{ display: 'none' }}
                onTimeUpdate={handleAudioTimeUpdate}
                onDurationChange={handleAudioDurationChange}
                onEnded={handleAudioEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
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
