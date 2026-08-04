"use client";

import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { useMusicContext } from '../context/MusicContext';
import { usePathname } from 'next/navigation';

interface Coords {
    top: number;
    left: number;
    width: number;
    height: number;
    isFloating: boolean;
}

const PersistentPlayer: React.FC = () => {
    const pathname = usePathname();
    const {
        musicSource,
        videoId,
        showVideo,
        isPlaying,
        nowPlaying,
        youtubeOpts,
        onYouTubeReady,
        onYouTubeStateChange,
        handlePlayPauseMusic,
        setShowVideo,
        youtubePlayerRef
    } = useMusicContext();

    const [coords, setCoords] = useState<Coords>({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        isFloating: true
    });

    // Track positioning
    useEffect(() => {
        if (musicSource !== 'youtube' || !videoId) return;

        const updatePosition = () => {
            const placeholder = document.getElementById('youtube-placeholder');
            if (placeholder) {
                const rect = placeholder.getBoundingClientRect();
                setCoords({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    isFloating: false
                });
            } else {
                // Position in bottom-right corner as a floating PiP
                // Width 320px, Height 180px + 38px (header) = 218px
                const pad = 24;
                const w = 320;
                const h = 218;
                setCoords({
                    top: window.innerHeight - h - pad,
                    left: window.innerWidth - w - pad,
                    width: w,
                    height: h,
                    isFloating: true
                });
            }
        };

        // Run initially
        updatePosition();

        // Listen to scroll and resize
        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition, { passive: true });

        // High frequency animation frame sync to prevent stutter during layout shifts/transitions
        let frameId: number;
        const tick = () => {
            updatePosition();
            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
            cancelAnimationFrame(frameId);
        };
    }, [musicSource, videoId, showVideo, pathname]);

    // Handle closing/dismissing from PiP
    const handleClosePiP = () => {
        if (youtubePlayerRef.current && youtubePlayerRef.current.pauseVideo) {
            youtubePlayerRef.current.pauseVideo();
        }
        setShowVideo(false);
    };

    if (musicSource !== 'youtube' || !videoId) return null;

    const isHidden = !showVideo;

    // Apply inline style depending on active mode (hidden vs visible / floating vs bento)
    const style: React.CSSProperties = isHidden
        ? {
              position: 'fixed',
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none',
              left: '-9999px',
              top: '-9999px',
              zIndex: -1,
          }
        : {
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              height: `${coords.height}px`,
              zIndex: coords.isFloating ? 1000 : 50,
              // Disable transition on top/left in bento mode to prevent scrolling lag
              transition: coords.isFloating 
                ? 'top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.3s ease, height 0.3s ease'
                : 'width 0.3s ease, height 0.3s ease',
              borderRadius: '12px',
              overflow: 'hidden',
          };

    return (
        <div className={`persistent-youtube-container ${coords.isFloating && !isHidden ? 'floating' : ''}`} style={style}>
            {coords.isFloating && !isHidden && (
                <div className="floating-player-header">
                    <span className="floating-player-title" title={nowPlaying}>
                        {nowPlaying}
                    </span>
                    <div className="floating-player-actions">
                        <button onClick={() => setShowVideo(false)} title="Minimize video (keep playing audio)">
                            <i className="fas fa-eye-slash"></i>
                        </button>
                        <button onClick={handlePlayPauseMusic} title={isPlaying ? 'Pause' : 'Play'}>
                            <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                        </button>
                        <button className="btn-close" onClick={handleClosePiP} title="Close player">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            )}
            <div className="persistent-player-body">
                <YouTube
                    videoId={videoId}
                    opts={youtubeOpts}
                    onReady={onYouTubeReady}
                    onStateChange={onYouTubeStateChange}
                    className="youtube-iframe"
                />
            </div>
        </div>
    );
};

export default PersistentPlayer;
