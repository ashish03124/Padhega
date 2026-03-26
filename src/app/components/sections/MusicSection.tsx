import React from 'react';
import YouTube from 'react-youtube';
import './music-styles.css';
import './minimal-visualizer.css';

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
    currentTime: number;
    duration: number;
    thumbnail: string;
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
    selectMusicTrack: (video: any) => void;
    handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formatTime: (seconds: number) => string;
    youtubeOpts: any;
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
    currentTime,
    duration,
    thumbnail,
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
    selectMusicTrack,
    handleSeek,
    formatTime,
    youtubeOpts,
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
                    <i className="fas fa-file-audio"></i> Local
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
                                <span>Search Results</span>
                                <button onClick={() => handleMusicSourceChange('youtube')} className="close-results">&times;</button>
                            </div>
                            <div className="results-list">
                                {musicSearchResults.map((video, index) => (
                                    <div key={index} className="result-item" onClick={() => selectMusicTrack(video)}>
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
                <div className="music-input-container">
                    <input type="file" accept="audio/*" />
                    <button className="btn btn-primary">
                        <i className="fas fa-play"></i> Play
                    </button>
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

            {/* Hidden YouTube Player */}
            {videoId && (
                <div style={{ display: 'none' }}>
                    <YouTube
                        videoId={videoId}
                        opts={youtubeOpts}
                        onReady={onYouTubeReady}
                        onStateChange={onYouTubeStateChange}
                    />
                </div>
            )}

            {/* Album Art & Visualizer */}
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

            <div className="spotify-controls-container">
                {/* Now Playing Info */}
                <div className="track-info">
                    <div className="track-title" title={nowPlaying}>
                        {videoId ? nowPlaying : "Ready to focus?"}
                    </div>
                    <div className="track-artist">
                        {videoId 
                            ? (musicSource === 'youtube' ? 'YouTube Music' : 'Local Audio')
                            : "Search for focus music to get started"}
                    </div>
                </div>

                {/* Main Player Controls */}
                <div className="player-transport">
                    <button className="transport-btn" disabled={!videoId}>
                        <i className="fas fa-step-backward"></i>
                    </button>
                    <button className="play-pause-btn" onClick={handlePlayPauseMusic} disabled={!videoId}>
                        <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                    </button>
                    <button className="transport-btn" disabled={!videoId}>
                        <i className="fas fa-step-forward"></i>
                    </button>
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
                            value={currentTime}
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
