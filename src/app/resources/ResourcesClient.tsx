"use client";

import React, { useState } from 'react';
import './resources.css';

const TRENDING_TOPICS = [
    { title: 'Quantum Physics', icon: 'fas fa-atom' },
    { title: 'Python for Beginners', icon: 'fab fa-python' },
    { title: 'Modern History', icon: 'fas fa-globe-americas' },
    { title: 'Organic Chemistry', icon: 'fas fa-flask' },
    { title: 'Web Development', icon: 'fas fa-laptop-code' }
];

interface PinnedResource {
    id: string;
    title: string;
    type: 'guide' | 'video';
    query: string;
    timestamp: number;
}

const ResourcesClient: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'guide' | 'videos'>('guide');
    const [loading, setLoading] = useState(false);
    const [aiContent, setAiContent] = useState<string | null>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [pinnedResources, setPinnedResources] = useState<PinnedResource[]>([]);

    // Initialize pinned resources from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem('pinnedResources');
        if (saved) {
            try {
                setPinnedResources(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load pinned resources", e);
            }
        }
    }, []);

    // Save to localStorage whenever pinnedResources changes
    React.useEffect(() => {
        localStorage.setItem('pinnedResources', JSON.stringify(pinnedResources));
    }, [pinnedResources]);

    const handleSearch = async (e?: React.FormEvent, forcedQuery?: string) => {
        if (e) e.preventDefault();
        const queryToUse = forcedQuery || searchQuery;
        if (!queryToUse.trim()) return;

        if (forcedQuery) setSearchQuery(forcedQuery);

        setLoading(true);
        setSearched(true);
        setAiContent(null);
        setVideos([]);

        try {
            // Parallel execution: Fetch AI Guide AND YouTube Videos
            const [aiRes, ytRes] = await Promise.all([
                fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: searchQuery, type: 'resource' }),
                }),
                fetch('/api/youtube', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: searchQuery + ' tutorial' }),
                })
            ]);

            const aiData = await aiRes.json();
            const ytData = await ytRes.json();

            setAiContent(aiData.text || "Failed to generate guide.");
            setVideos(ytData.videos || []);

        } catch (error) {
            console.error("Search failed", error);
            setAiContent("An error occurred while fetching resources. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const togglePin = (resource: PinnedResource) => {
        setPinnedResources(prev => {
            const exists = prev.some(p => p.id === resource.id && p.type === resource.type);
            if (exists) {
                return prev.filter(p => !(p.id === resource.id && p.type === resource.type));
            }
            return [resource, ...prev];
        });
    };

    // Custom Markdown Parser to make content "Eye Catching"
    const renderContent = (text: string) => {
        if (!text) return null;

        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let inCodeBlock = false;
        let codeBlockContent: string[] = [];
        let codeLanguage = '';

        lines.forEach((line, index) => {
            const key = `line-${index}`;

            // Handle Code Blocks
            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    // End of code block
                    inCodeBlock = false;
                    elements.push(
                        <div key={`code-${index}`} className="ai-code-block">
                            <div className="code-header">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                                {codeLanguage && <span className="code-lang">{codeLanguage}</span>}
                            </div>
                            <pre>
                                <code>{codeBlockContent.join('\n')}</code>
                            </pre>
                        </div>
                    );
                    codeBlockContent = [];
                    codeLanguage = '';
                } else {
                    // Start of code block
                    inCodeBlock = true;
                    codeLanguage = line.trim().replace('```', '');
                }
                return; // Skip the ``` line itself
            }

            if (inCodeBlock) {
                codeBlockContent.push(line);
                return;
            }

            // Cleanup standard markdown patterns for display
            const cleanLine = line.replace(/^\#+\s/, '').replace(/^[\*\-]\s/, '');

            // 1. Headers (H1 - H3) -> Gradient Text
            if (line.startsWith('# ')) {
                elements.push(<h1 key={key} className="ai-h1">{cleanLine}</h1>);
            }
            else if (line.startsWith('## ')) {
                elements.push(<h2 key={key} className="ai-h2">{cleanLine}</h2>);
            }
            else if (line.startsWith('### ')) {
                elements.push(<h3 key={key} className="ai-h3">{cleanLine}</h3>);
            }
            // 2. Bold/Key Concepts -> Highlighted Card
            else if (line.includes('**Key Concepts:**') || line.includes('**Important:**')) {
                const content = line.replace(/\*\*/g, '').replace('Key Concepts:', '').replace('Important:', '').trim();
                elements.push(
                    <div key={key} className="ai-highlight-card">
                        <div className="highlight-icon">
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="highlight-content">
                            <h4>{line.includes('Key Concepts') ? 'Key Concepts' : 'Important Insight'}</h4>
                            {content && <p>{content}</p>}
                        </div>
                    </div>
                );
            }
            // 3. Bullet Points -> Stylized List Items
            else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                // Parse bold inside list items
                const content = line.replace(/^[\s]*[\*\-]\s/, '');
                const parts = content.split('**');

                elements.push(
                    <div key={key} className="ai-list-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>
                            {parts.map((part, i) =>
                                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                            )}
                        </span>
                    </div>
                );
            }
            // 4. Separators -> Glass Divider
            else if (line.trim() === '---') {
                elements.push(<hr key={key} className="ai-divider" />);
            }
            // 5. Normal Paragraphs
            else if (line.trim().length > 0 && !line.trim().startsWith('```')) {
                const parts = line.split('**');
                elements.push(
                    <p key={key} className="ai-p">
                        {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                    </p>
                );
            }
        });

        return elements;
    };


    return (
        <>
            <div className="resources-page">
                <div className="background-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>

                <main className="resources-container">
                    <section className="resources-hero">
                        <h1>What do you want to learn?</h1>
                        <p>Search for any topic to get an instant AI study guide and curated video tutorials.</p>

                        <div className="trending-container">
                            {TRENDING_TOPICS.map(topic => (
                                <button
                                    key={topic.title}
                                    className="trending-chip"
                                    onClick={() => handleSearch(undefined, topic.title)}
                                >
                                    <span><i className={topic.icon}></i></span> {topic.title}
                                </button>
                            ))}
                        </div>
                    </section>

                    <form className="search-container" onSubmit={handleSearch}>
                        <div className="search-input-wrapper">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="E.g., Quantum Physics, Python Basics, World War II..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="search-btn" disabled={loading}>
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>

                    {searched && (
                        <>
                            <div className="tabs-nav">
                                <button
                                    className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('guide')}
                                >
                                    <i className="fas fa-book-open"></i> Study Guide
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('videos')}
                                >
                                    <i className="fas fa-play-circle"></i> Video Tutorials
                                </button>
                            </div>

                            <div className="content-area">
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="spinner"></div>
                                        <p>Curating your learning path...</p>
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'guide' && (
                                            <div className="ai-content-wrapper">
                                                <div className="pin-action-wrapper">
                                                    <button
                                                        className={`pin-btn ${pinnedResources.some(p => p.id === searchQuery && p.type === 'guide') ? 'pinned' : ''}`}
                                                        onClick={() => togglePin({
                                                            id: searchQuery,
                                                            title: searchQuery,
                                                            type: 'guide',
                                                            query: searchQuery,
                                                            timestamp: Date.now()
                                                        })}
                                                        title="Save this guide"
                                                    >
                                                        <i className={`fas fa-${pinnedResources.some(p => p.id === searchQuery && p.type === 'guide') ? 'check' : 'bookmark'}`}></i>
                                                    </button>
                                                </div>
                                                {renderContent(aiContent || '')}
                                            </div>
                                        )}

                                        {activeTab === 'videos' && (
                                            <div className="video-grid">
                                                {videos.map((video) => (
                                                    <div
                                                        key={video.id}
                                                        className="video-card"
                                                        onClick={() => setSelectedVideo(video.id)}
                                                    >
                                                        <div className="pin-action-wrapper">
                                                            <button
                                                                className={`pin-btn ${pinnedResources.some(p => p.id === video.id) ? 'pinned' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    togglePin({
                                                                        id: video.id,
                                                                        title: video.title,
                                                                        type: 'video',
                                                                        query: searchQuery,
                                                                        timestamp: Date.now()
                                                                    });
                                                                }}
                                                            >
                                                                <i className={`fas fa-${pinnedResources.some(p => p.id === video.id) ? 'check' : 'bookmark'}`}></i>
                                                            </button>
                                                        </div>
                                                        <div className="video-thumbnail">
                                                            <img src={video.thumbnail} alt={video.title} />
                                                            <div className="play-icon">
                                                                <i className="fas fa-play"></i>
                                                            </div>
                                                        </div>
                                                        <div className="video-info">
                                                            <h3>{video.title}</h3>
                                                            <div className="video-meta">
                                                                <span className="video-author">{video.author}</span>
                                                                <span>{video.duration}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {videos.length === 0 && (
                                                    <div className="empty-state">
                                                        <i className="fas fa-video-slash"></i>
                                                        <p>No videos found for this topic.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {!searched && (
                        <div className="empty-state">
                            <i className="fas fa-lightbulb"></i>
                            <p>Start by searching for a topic above!</p>
                        </div>
                    )}

                    {/* Saved Resources Section */}
                    {pinnedResources.length > 0 && (
                        <div className="saved-section">
                            <div className="saved-header">
                                <div className="saved-header-title">
                                    <i className="fas fa-bookmark"></i>
                                    <h2>Your Library</h2>
                                </div>
                                <button className="clear-saved-btn" onClick={() => setPinnedResources([])}>
                                    Clear All
                                </button>
                            </div>
                            <div className="saved-grid">
                                {pinnedResources.map(resource => (
                                    <div
                                        key={`${resource.id}-${resource.type}`}
                                        className="saved-item"
                                        onClick={() => {
                                            if (resource.type === 'video') {
                                                setSelectedVideo(resource.id);
                                            } else {
                                                handleSearch(undefined, resource.query);
                                                setActiveTab('guide');
                                            }
                                        }}
                                    >
                                        <div className="saved-item-icon">
                                            <i className={`fas fa-${resource.type === 'video' ? 'play' : 'book'}`}></i>
                                        </div>
                                        <div className="saved-item-content">
                                            <h3>{resource.title}</h3>
                                            <p>{resource.type === 'video' ? 'Video Lesson' : 'Study Guide'}</p>
                                        </div>
                                        <button
                                            className="remove-saved-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPinnedResources(prev => prev.filter(p => !(p.id === resource.id && p.type === resource.type)));
                                            }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                {/* Video Modal */}
                {selectedVideo && (
                    <div className="video-modal-overlay" onClick={() => setSelectedVideo(null)}>
                        <div className="video-modal-content" onClick={e => e.stopPropagation()}>
                            <button className="close-video-btn" onClick={() => setSelectedVideo(null)}>
                                <i className="fas fa-times"></i>
                            </button>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ResourcesClient;
