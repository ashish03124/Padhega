import React from 'react';
import YouTube from 'react-youtube';
import './music-styles.css';
import './minimal-visualizer.css';

const AMBIENT_SOUNDS = [
    {
        id: 'rain',
        title: 'Rain & Thunder',
        icon: 'fa-cloud-showers-heavy',
        url: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav',
        thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300&auto=format&fit=crop&q=60',
        author: 'Mixkit Ambient'
    },
    {
        id: 'waves',
        title: 'Ocean Waves',
        icon: 'fa-water',
        url: 'https://assets.mixkit.co/active_storage/sfx/2508/2508-84.wav',
        thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&auto=format&fit=crop&q=60',
        author: 'Mixkit Ambient'
    },
    {
        id: 'birds',
        title: 'Forest Birds',
        icon: 'fa-tree',
        url: 'https://assets.mixkit.co/active_storage/sfx/2438/2438-84.wav',
        thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&auto=format&fit=crop&q=60',
        author: 'Mixkit Ambient'
    },
    {
        id: 'fire',
        title: 'Campfire Crackle',
        icon: 'fa-fire',
        url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-84.wav',
        thumbnail: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=300&auto=format&fit=crop&q=60',
        author: 'Mixkit Ambient'
    },
    {
        id: 'noise',
        title: 'White Noise',
        icon: 'fa-volume-mute',
        url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
        author: 'Mixkit Ambient'
    }
];

interface MusicSectionProps {
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
    showVideo: boolean;
    currentTime: number;
    duration: number;
    thumbnail: string;
    queue: any[];
    currentQueueIndex: number;
    isShuffled: boolean;
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
    selectMusicTrack: (video: any, queueList?: any[]) => void;
    handleNextTrack: () => void;
    handlePrevTrack: () => void;
    handleShuffle: () => void;
    handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formatTime: (seconds: number) => string;
    youtubeOpts: any;
    handleLocalFileSelect: (file: File) => void;
}

const MusicSection: React.FC<MusicSectionProps> = ({
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
    showVideo,
    currentTime,
    duration,
    thumbnail,
    queue,
    currentQueueIndex,
    isShuffled,
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
    selectMusicTrack,
    handleNextTrack,
    handlePrevTrack,
    handleShuffle,
    handleSeek,
    formatTime,
    youtubeOpts,
    handleLocalFileSelect,
}) => {
    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <section className="music-box">
            <div className="section-header">
                <h2><i className="fas fa-music"></i> Focus Music</h2>
                <div
                    className="music-settings"
                    onClick={() => setShowMusicSettingsModal(true)}
                >
                    <i className="fas fa-sliders-h"></i>
                </div>
            </div>

            <div className="music-source-selector">
                <button
                    className={`source-btn ${musicSource === 'youtube' ? 'active' : ''}`}
                    onClick={() => handleMusicSourceChange('youtube')}
                >
                    <i className="fab fa-youtube"></i> YouTube
                </button>
                <button
                    className={`source-btn ${musicSource === 'local' ? 'active' : ''}`}
                    onClick={() => handleMusicSourceChange('local')}
                >
                    <i className="fas fa-file-audio"></i> Local & Ambient
                </button>
            </div>

            {musicSource === 'youtube' && (
                <div className="music-search-container">
                    <div className="music-input-group">
                        <div className="music-input-container">
                            <input
                                type="text"
                                placeholder="Search music or paste YouTube link..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleMusicSearch()}
                            />
                            <button className="btn btn-primary" onClick={handleMusicSearch} disabled={isSearchingMusic}>
                                <i className={`fas fa-${isSearchingMusic ? 'spinner fa-spin' : 'search'}`}></i>
                            </button>
                        </div>
                    </div>

                    {musicSearchResults.length > 0 && (
                        <div className="music-results glass-card">
                            <div className="results-header">
                                <span>Search Results ({musicSearchResults.length} tracks)</span>
                                <button onClick={() => handleMusicSourceChange('youtube')} className="close-results">&times;</button>
                            </div>
                            <div className="results-list">
                                {musicSearchResults.map((video, index) => (
                                    <div
                                        key={index}
                                        className={`result-item ${queue.length > 0 && queue[currentQueueIndex]?.videoId === video.videoId ? 'result-item-active' : ''}`}
                                        onClick={() => selectMusicTrack(video, musicSearchResults)}
                                    >
                                        <img src={video.thumbnail} alt={video.title} />
                                        <div className="result-info">
                                            <div className="result-title">{video.title}</div>
                                            <div className="result-meta">{video.author} • {video.duration}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {musicSource === 'local' && (
                <div className="local-music-container">
                    <div className="file-upload-zone glass-card">
                        <i className="fas fa-cloud-upload-alt upload-icon"></i>
                        <div className="upload-text">
                            <h4>Upload Focus Files</h4>
                            <p>Select any audio file (.mp3, .wav, .m4a) to play in the background</p>
                        </div>
                        <input
                            type="file"
                            accept="audio/*"
                            id="local-audio-file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleLocalFileSelect(file);
                                }
                            }}
                            className="local-audio-input"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="local-audio-file" className="btn btn-primary upload-btn">
                            <i className="fas fa-folder-open"></i> Browse Files
                        </label>
                    </div>

                    <div className="ambient-sounds-section">
                        <h4>Built-in Ambient Sounds</h4>
                        <p className="subtitle">Plays loopable, mobile background-compatible focus sounds</p>
                        <div className="ambient-grid">
                            {AMBIENT_SOUNDS.map((sound) => {
                                const isCurrent = videoId === `ambient-${sound.id}`;
                                return (
                                    <div
                                        key={sound.id}
                                        className={`ambient-card ${isCurrent ? 'active' : ''}`}
                                        onClick={() => {
                                            const track = {
                                                videoId: `ambient-${sound.id}`,
                                                title: sound.title,
                                                url: sound.url,
                                                thumbnail: sound.thumbnail,
                                                isAmbient: true,
                                                author: sound.author
                                            };
                                            const allTracks = AMBIENT_SOUNDS.map(s => ({
                                                videoId: `ambient-${s.id}`,
                                                title: s.title,
                                                url: s.url,
                                                thumbnail: s.thumbnail,
                                                isAmbient: true,
                                                author: s.author
                                            }));
                                            selectMusicTrack(track, allTracks);
                                        }}
                                    >
                                        <div className="ambient-icon-wrapper">
                                            <i className={`fas ${sound.icon}`}></i>
                                        </div>
                                        <span className="ambient-title">{sound.title}</span>
                                        {isCurrent && isPlaying && (
                                            <div className="ambient-playing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {musicSource === 'youtube' && !videoId && !isSearchingMusic && musicSearchResults.length === 0 && (
                <div className="music-suggestions-container">
                    <p>Or try some focus sounds:</p>
                    <div className="suggestion-tags">
                        {['Lofi Study', 'Ambient Focus', 'Deep Work', 'Nature Sounds', 'Rainy Night', 'Classical Focus'].map((tag) => (
                            <button
                                key={tag}
                                className="suggestion-tag"
                                onClick={() => {
                                    setSearchQuery(tag);
                                    setTimeout(() => handleMusicSearch(), 100);
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* YouTube IFrame Player - hidden by default, shown when showVideo is true */}
            {musicSource === 'youtube' && videoId && (
                <div className={`youtube-player-wrapper ${showVideo ? 'yt-visible' : 'yt-hidden'}`}>
                    <YouTube
                        key={videoId}
                        videoId={videoId}
                        opts={youtubeOpts}
                        onReady={onYouTubeReady}
                        onStateChange={onYouTubeStateChange}
                        className="youtube-iframe"
                    />
                </div>
            )}

            {/* Album Art & Visualizer - shown only when video is hidden */}
            {(!showVideo || musicSource === 'local') && (
                <div className="album-art-container">
                    {thumbnail ? (
                        <img src={thumbnail} alt="Album Art" className="album-art-image" />
                    ) : (
                        <div className="album-art-placeholder empty-state">
                            <div className="placeholder-icon">
                                <i className="fas fa-headphones-alt"></i>
                            </div>
                            <p>Your focus soundtrack awaits</p>
                        </div>
                    )}

                    {/* Waveform / Equalizer Overlay */}
                    <div className={`waveform-overlay ${isPlaying ? 'playing' : 'idle'}`}>
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`eq-bar eq-bar-${i + 1}`}
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            <div className="spotify-controls-container">
                {/* Now Playing Info + Watch Video button */}
                <div className="track-info">
                    <div className="track-title-row">
                        <div className="track-title" title={nowPlaying}>
                            {videoId ? nowPlaying : "Ready to focus?"}
                        </div>
                        {musicSource === 'youtube' && videoId && (
                            <button
                                className={`watch-video-btn ${showVideo ? 'active' : ''}`}
                                onClick={() => setShowVideo(!showVideo)}
                                title={showVideo ? 'Hide video' : 'Watch video'}
                            >
                                <i className={`fas fa-${showVideo ? 'eye-slash' : 'film'}`}></i>
                                <span>{showVideo ? 'Hide' : 'Watch'}</span>
                            </button>
                        )}
                    </div>
                    <div className="track-artist">
                        {videoId
                            ? (musicSource === 'youtube' ? 'YouTube Music' : 'Local Audio')
                            : "Search for focus music to get started"}
                    </div>
                </div>

                {/* Main Player Controls */}
                <div className="player-transport">
                    <button
                        className={`transport-btn shuffle-btn ${isShuffled ? 'active' : ''}`}
                        onClick={handleShuffle}
                        disabled={queue.length < 2}
                        title={isShuffled ? 'Shuffle On' : 'Shuffle Off'}
                    >
                        <i className="fas fa-random"></i>
                    </button>
                    <button
                        className="transport-btn"
                        onClick={handlePrevTrack}
                        disabled={queue.length === 0}
                        title="Previous track (or restart if > 3s played)"
                    >
                        <i className="fas fa-step-backward"></i>
                    </button>
                    <button className="play-pause-btn" onClick={handlePlayPauseMusic} disabled={!videoId}>
                        <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                    </button>
                    <button
                        className="transport-btn"
                        onClick={handleNextTrack}
                        disabled={queue.length === 0}
                        title="Next track"
                    >
                        <i className="fas fa-step-forward"></i>
                    </button>
                    {queue.length > 0 && (
                        <span className="queue-indicator" title={`Queue: ${currentQueueIndex + 1} / ${queue.length}`}>
                            {currentQueueIndex + 1}/{queue.length}
                        </span>
                    )}
                </div>

                {/* Progress Bar */}
                <div className={`duration-container ${!videoId ? 'disabled-control' : ''}`}>
                    <span className="time-display">{formatTime(currentTime)}</span>
                    <div className="progress-bar-wrapper">
                        <input
                            type="range"
                            className="progress-bar-spotify"
                            min="0"
                            max={duration || 100}
                            value={currentTime ?? 0}
                            onChange={handleSeek}
                            disabled={!videoId}
                            style={{
                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${progressPercentage}%, rgba(255,255,255,0.1) ${progressPercentage}%, rgba(255,255,255,0.1) 100%)`
                            }}
                        />
                    </div>
                    <span className="time-display">{formatTime(duration)}</span>
                </div>

                {/* Volume Control */}
                <div className={`volume-control-spotify ${!videoId ? 'disabled-control' : ''}`}>
                    <i className="fas fa-volume-up"></i>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="volume-slider-spotify"
                        style={{
                            background: `linear-gradient(to right, #10b981 0%, #10b981 ${volume}%, rgba(255,255,255,0.1) ${volume}%, rgba(255,255,255,0.1) 100%)`
                        }}
                    />
                </div>
            </div>

            {showMusicSettingsModal && (
                <div className="music-modal" onClick={() => setShowMusicSettingsModal(false)}>
                    <div className="music-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Music Settings</h3>
                        <div className="form-group">
                            <label>Default Volume</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={handleVolumeChange}
                            />
                        </div>
                        <div className="form-buttons">
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowMusicSettingsModal(false)}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default MusicSection;
