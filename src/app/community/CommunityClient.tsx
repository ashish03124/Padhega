"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './community.css';

const CommunityClient: React.FC = () => {
    const { user, setShowAuthModal } = useAuth();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [displayedThreads, setDisplayedThreads] = useState(4);
    const [activeEventFilter] = useState('all');
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [selectedThread, setSelectedThread] = useState<any | null>(null);
    const [showThreadModal, setShowThreadModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All Topics');

    // Community Data
    const communityData = {
        memberCount: 12453,
        activeThreads: 1287,
        dailyPosts: 523,
        solvedQuestions: 8124,

        features: [
            {
                icon: "fas fa-comments",
                title: "Discussion Forums",
                description: "Ask questions and get answers from both peers and experts in various subjects."
            },
            {
                icon: "fas fa-user-graduate",
                title: "Study Groups",
                description: "Form or join study groups with learners who share your academic goals."
            },
            {
                icon: "fas fa-chalkboard-teacher",
                title: "Expert Sessions",
                description: "Participate in live Q&A sessions with educators and industry professionals."
            },
            {
                icon: "fas fa-trophy",
                title: "Learning Challenges",
                description: "Compete with peers in weekly challenges and climb the leaderboard."
            }
        ],

        categories: [
            { name: "Mathematics", icon: "fas fa-calculator" },
            { name: "Science", icon: "fas fa-atom" },
            { name: "Programming", icon: "fas fa-code" },
            { name: "Languages", icon: "fas fa-language" },
            { name: "General", icon: "fas fa-comments" }
        ],
        threads: [
            {
                id: 1,
                title: "How to approach calculus problems effectively?",
                category: "Mathematics",
                author: "Alex Thompson",
                replies: 2,
                views: 342,
                lastActive: "2 hours ago",
                repliesList: [
                    { author: "Professor White", text: "Start by identifying the variables and the rate of change.", date: "1 hour ago" },
                    { author: "MathWizard", text: "U-substitution is your best friend!", date: "45 mins ago" }
                ]
            },
            {
                id: 2,
                title: "Best resources for learning Python in 2024",
                category: "Programming",
                author: "Sarah Chen",
                replies: 0,
                views: 891,
                lastActive: "5 hours ago",
                repliesList: []
            },
            {
                id: 3,
                title: "Understanding quantum physics basics",
                category: "Science",
                author: "Michael Johnson",
                replies: 0,
                views: 256,
                lastActive: "1 day ago",
                repliesList: []
            },
            {
                id: 4,
                title: "Tips for memorizing Spanish vocabulary",
                category: "Languages",
                author: "Emma Garcia",
                replies: 0,
                views: 478,
                lastActive: "3 hours ago",
                repliesList: []
            }
        ],

        events: [
            {
                id: 1,
                type: "workshop",
                title: "Advanced React Patterns Workshop",
                description: "Learn advanced React patterns including hooks, context, and performance optimization.",
                date: "15 Mar",
                time: "3:00 PM IST",
                speaker: "John Doe",
                rsvpCount: 234
            },
            {
                id: 2,
                type: "qna",
                title: "Math Q&A with Dr. Smith",
                description: "Ask your toughest calculus and algebra questions to an experienced professor.",
                date: "18 Mar",
                time: "5:00 PM IST",
                speaker: "Dr. Jane Smith",
                rsvpCount: 156
            },
            {
                id: 3,
                type: "study",
                title: "IELTS Study Session",
                description: "Group study session for IELTS preparation with practice tests and discussions.",
                date: "20 Mar",
                time: "7:00 PM IST",
                speaker: "Community Led",
                rsvpCount: 89
            },
            {
                id: 4,
                type: "workshop",
                title: "Data Science Fundamentals",
                description: "Introduction to data science, machine learning basics, and practical applications.",
                date: "22 Mar",
                time: "4:00 PM IST",
                speaker: "Maria Rodriguez",
                rsvpCount: 312
            },
            {
                id: 5,
                type: "qna",
                title: "Career Guidance in Tech",
                description: "Industry professionals share insights about tech careers and answer your questions.",
                date: "25 Mar",
                time: "6:00 PM IST",
                speaker: "Tech Panel",
                rsvpCount: 445
            }
        ],

        testimonials: [
            {
                text: "This community helped me ace my exams! The discussion forums are incredibly active and everyone is so helpful.",
                author: "Rahul Sharma",
                role: "Computer Science Student",
                avatar: "https://i.pravatar.cc/150?img=12"
            },
            {
                text: "I found my perfect study group here. We meet weekly and it's made learning so much more enjoyable and effective.",
                author: "Ananya Gupta",
                role: "Medical Student",
                avatar: "https://i.pravatar.cc/150?img=5"
            },
            {
                text: "The expert sessions are gold! I got my programming doubts cleared directly from industry professionals.",
                author: "Vikram Singh",
                role: "Web Developer",
                avatar: "https://i.pravatar.cc/150?img=33"
            },
            {
                text: "Best learning community I've ever been part of. The challenges keep me motivated and competitive.",
                author: "Sneha Reddy",
                role: "Data Science Enthusiast",
                avatar: "https://i.pravatar.cc/150?img=9"
            }
        ]
    };

    const [localThreads, setLocalThreads] = useState<any[]>([]);
    const [localEvents, setLocalEvents] = useState(communityData.events.map(e => ({ ...e, isRsvped: false })));

    // Derived category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { 'All Topics': localThreads.length };
        communityData.categories.forEach(cat => {
            counts[cat.name] = localThreads.filter(t => t.category === cat.name).length;
        });
        return counts;
    }, [localThreads, communityData.categories]);

    // Filtered discussions
    const filteredThreads = useMemo(() => {
        if (activeCategory === 'All Topics') return localThreads;
        return localThreads.filter(t => t.category === activeCategory);
    }, [localThreads, activeCategory]);

    // Fetch threads on mount
    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const res = await fetch('/api/community/threads');
                const data = await res.json();
                setLocalThreads(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch threads:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchThreads();
    }, []);

    const showTestimonial = useCallback((index: number) => {
        let newIndex = index;
        if (index < 0) newIndex = communityData.testimonials.length - 1;
        if (index >= communityData.testimonials.length) newIndex = 0;
        setCurrentTestimonial(newIndex);
    }, [communityData.testimonials.length]);

    const handleNewThread = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check authentication
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        const form = e.target as HTMLFormElement;
        const title = (form[0] as HTMLInputElement).value;
        const category = (form[1] as HTMLSelectElement).value;
        const text = (form[2] as HTMLTextAreaElement).value;

        try {
            const res = await fetch('/api/community/threads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, category, text }),
            });

            if (res.ok) {
                const newThread = await res.json();
                setLocalThreads([newThread, ...localThreads]);
                setShowNewThreadModal(false);
                form.reset();
            }
        } catch (error: unknown) {
            console.error('Failed to create thread:', error);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedThread) {
            setShowAuthModal(true);
            return;
        }

        const form = e.target as HTMLFormElement;
        const text = (form[0] as HTMLTextAreaElement).value;

        if (!text.trim()) return;

        try {
            const res = await fetch(`/api/community/threads/${selectedThread._id}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (res.ok) {
                const newReply = await res.json();
                const updatedThread = {
                    ...selectedThread,
                    replies: [...(selectedThread.replies || []), newReply],
                    lastActive: new Date().toISOString(),
                };

                setSelectedThread(updatedThread);
                setLocalThreads(prev => prev.map(t => t._id === updatedThread._id ? updatedThread : t));
                form.reset();
            }
        } catch (error: unknown) {
            console.error('Failed to post reply:', error);
        }
    };

    const handleDeleteThread = async (threadId: string) => {
        if (!confirm('Are you sure you want to delete this thread?')) return;

        try {
            const res = await fetch(`/api/community/threads/${threadId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setLocalThreads(prev => prev.filter(t => t._id !== threadId));
                if (selectedThread && selectedThread._id === threadId) {
                    setShowThreadModal(false);
                    setSelectedThread(null);
                }
            }
        } catch (error) {
            console.error('Failed to delete thread:', error);
        }
    };

    const handleDeleteReply = async (threadId: string, replyId: string) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;

        try {
            const res = await fetch(`/api/community/threads/${threadId}/replies`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ replyId }),
            });

            if (res.ok) {
                setLocalThreads(prev => prev.map(t => {
                    if (t._id === threadId) {
                        const updatedReplies = t.replies.filter((r: any) => r._id !== replyId);
                        const updatedThread = { ...t, replies: updatedReplies };
                        if (selectedThread && selectedThread._id === threadId) {
                            setSelectedThread(updatedThread);
                        }
                        return updatedThread;
                    }
                    return t;
                }));
            }
        } catch (error) {
            console.error('Failed to delete reply:', error);
        }
    };

    const handleUpvote = async (threadId: string) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        try {
            const res = await fetch(`/api/community/threads/${threadId}/upvote`, {
                method: 'POST',
            });

            if (res.ok) {
                const { upvotes } = await res.json();
                setLocalThreads(prev => prev.map(t => {
                    if (t._id === threadId) {
                        const updatedThread = { ...t, upvotes };
                        if (selectedThread && selectedThread._id === threadId) {
                            setSelectedThread(updatedThread);
                        }
                        return updatedThread;
                    }
                    return t;
                }));
            }
        } catch (error) {
            console.error('Failed to toggle upvote:', error);
        }
    };

    const handleOpenThread = (thread: any) => {
        setSelectedThread(thread);
        setShowThreadModal(true);
    };

    // toggleRSVP removed as it was unused

    const filteredEvents = activeEventFilter === 'all'
        ? localEvents
        : localEvents.filter(event => event.type === activeEventFilter);

    useEffect(() => {
        const interval = setInterval(() => {
            showTestimonial(currentTestimonial + 1);
        }, 5000);
        return () => clearInterval(interval);
    }, [currentTestimonial, showTestimonial]);

    return (
        <>
            <div className="community-page-wrapper">
                {/* Animated Backgrounds */}
                <div className="ambient-glow"></div>
                <div className="ambient-glow-2"></div>
                <div id="particles-js"></div>

                <main className="community-container">

                    {/* Hero Section */}
                    <section className="hero-section animate-entry">
                        <div className="hero-text">
                            {/* <div className="stats-pill">
                                <i className="fas fa-users"></i> {formatNumber(communityData.memberCount)}+ Active Learners
                            </div> */}
                            <h1>Learn.<br /><span className="text-gradient-primary">Grow.</span><br />Together.</h1>
                            <p>Connect with a thriving community of students and experts. Ask questions, share knowledge, and level up your skills.</p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {user ? (
                                    <button className="neon-button" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                                        Go to Discussions <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                                    </button>
                                ) : (
                                    <button className="neon-button" onClick={() => setShowAuthModal(true)}>
                                        Join Discussion <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                                    </button>
                                )}
                                <button className="secondary-btn" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                                    Explore Topics
                                </button>
                            </div>
                        </div>

                        <div className="hero-visual">
                            {/* 3D Floating Cards representing community activity */}
                            <div className="hero-card-float float-1">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem' }}>
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sarah posted</div>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>&quot;How do I start with Machine Learning?&quot;</div>
                            </div>

                            <div className="hero-card-float float-2">
                                <div style={{ color: '#10b981', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    New Solution <span style={{ fontSize: '1.2rem' }}>🚀</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>Optimization algorithm explanations...</div>
                            </div>

                            <div className="hero-card-float float-3">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-medal" style={{ color: '#F59E0B', fontSize: '1.2rem' }}></i>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Weekly Challenge</div>
                                        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>342 Participants</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="features-grid">
                        {communityData.features.map((feature, idx) => (
                            <div key={idx} className="glass-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="feature-icon-wrapper">
                                    <i className={feature.icon}></i>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </section>

                    {/* Forum */}
                    <section className="forum-container">
                        <div className="forum-sidebar">
                            <h3 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Topics</h3>
                            <button
                                className="neon-button"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                onClick={() => {
                                    if (!user) {
                                        setShowAuthModal(true);
                                    } else {
                                        setShowNewThreadModal(true);
                                    }
                                }}
                            >
                                + New Thread
                            </button>

                            <div className="glass-card" style={{ padding: '0.5rem' }}>
                                <div
                                    className={`category-pill ${activeCategory === 'All Topics' ? 'active' : ''}`}
                                    onClick={() => setActiveCategory('All Topics')}
                                >
                                    <i className="fas fa-th-large" style={{ width: '24px' }}></i>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>All Topics</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{categoryCounts['All Topics']} threads</div>
                                    </div>
                                </div>
                                {communityData.categories.map((cat, idx) => (
                                    <div
                                        key={idx}
                                        className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.name)}
                                    >
                                        <i className={cat.icon} style={{ width: '24px' }}></i>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{cat.name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{categoryCounts[cat.name] || 0} threads</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="forum-feed">
                            <h3 className="text-gradient section-title">
                                {activeCategory === 'All Topics' ? 'Recent Discussions' : `${activeCategory} Discussions`}
                            </h3>
                            {isLoading ? (
                                <div className="loading-container">
                                    <span className="loader"></span>
                                    <p>Loading discussions...</p>
                                </div>
                            ) : filteredThreads.length === 0 ? (
                                <div className="no-threads">
                                    <i className="fas fa-comments" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}></i>
                                    <p>No discussions in {activeCategory} yet. Be the first to start one!</p>
                                </div>
                            ) : (
                                filteredThreads.slice(0, displayedThreads).map(thread => (
                                    <div key={thread._id} className="thread-card clickable" onClick={() => handleOpenThread(thread)}>
                                        <div className="thread-content-wrapper">
                                            <div
                                                className={`upvote-container ${thread.upvotes?.includes((user as any)?.id) ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUpvote(thread._id);
                                                }}
                                            >
                                                <i className="fas fa-caret-up upvote-icon"></i>
                                                <span className="upvote-count">{thread.upvotes?.length || 0}</span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="thread-title">{thread.title}</div>
                                                <div className="thread-meta">
                                                    <span className="thread-category-label">{thread.category}</span>
                                                    <span>•</span>
                                                    <span>Posted by {thread.authorName}</span>
                                                    <span>•</span>
                                                    <span>{new Date(thread.lastActive).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="thread-stats">
                                            <div className="replies-count">{thread.replies?.length || 0}</div>
                                            <div className="replies-label">Replies</div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {displayedThreads < filteredThreads.length && (
                                <button
                                    className="secondary-btn"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    onClick={() => setDisplayedThreads(prev => prev + 5)}
                                >
                                    Load More Discussions
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section className="community-section">
                        <h2 className="text-gradient section-large-title">Member Stories</h2>

                        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', top: '2rem', left: '2rem', fontSize: '4rem', opacity: 0.1, color: 'var(--neon-purple)' }}>&quot;</div>

                            <div style={{ zIndex: 2 }}>
                                <p className="testimonial-text">
                                    &quot;{communityData.testimonials[currentTestimonial].text}&quot;
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 700 }} className="testimonial-author">{communityData.testimonials[currentTestimonial].author}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{communityData.testimonials[currentTestimonial].role}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ position: 'absolute', bottom: '1rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                {communityData.testimonials.map((_, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => showTestimonial(idx)}
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '0',
                                            background: idx === currentTestimonial ? 'var(--neon-purple)' : 'rgba(255,255,255,0.2)',
                                            cursor: 'pointer',
                                            transition: '0.3s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                </main>

                {/* New Thread Modal */}
                {showNewThreadModal && (
                    <div className="modal-overlay">
                        <div className="glass-modal">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Start Discussion</h2>
                                <button
                                    onClick={() => setShowNewThreadModal(false)}
                                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleNewThread}>
                                <div className="form-group"><input className="glass-input" placeholder="Thread Title" required /></div>
                                <div className="form-group">
                                    <select className="glass-input">
                                        {communityData.categories.map(c => <option key={c.name} value={c.name} style={{ color: 'black' }}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><textarea className="glass-input" rows={4} placeholder="What's on your mind?" required></textarea></div>
                                <button type="submit" className="neon-button" style={{ width: '100%' }}>
                                    Post Thread
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Thread Detail Modal */}
                {showThreadModal && selectedThread && (
                    <div className="modal-overlay" onClick={() => setShowThreadModal(false)}>
                        <div className="glass-modal thread-detail-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="thread-meta-badge">{selectedThread.category}</div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {(user as any)?.id === selectedThread.authorId && (
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteThread(selectedThread._id)}
                                            title="Delete Thread"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowThreadModal(false)}
                                        className="close-modal-btn"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>

                            <div className="thread-detail-content">
                                <div className="thread-main-content">
                                    <h2 className="thread-detail-title">{selectedThread.title}</h2>
                                    <div className="thread-author-info">
                                        <div className="author-avatar">{selectedThread.authorName[0]}</div>
                                        <div className="author-details">
                                            <div className="author-name">{selectedThread.authorName}</div>
                                            <div className="post-date">Posted {new Date(selectedThread.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="thread-text">
                                        {selectedThread.text}
                                    </div>

                                    <div className="thread-footer">
                                        <div
                                            className={`upvote-container ${selectedThread.upvotes?.includes((user as any)?.id) ? 'active' : ''}`}
                                            onClick={() => handleUpvote(selectedThread._id)}
                                            style={{ flexDirection: 'row', gap: '0.5rem', padding: '0.5rem 1rem' }}
                                        >
                                            <i className="fas fa-caret-up upvote-icon"></i>
                                            <span className="upvote-count">{selectedThread.upvotes?.length || 0} Upvotes</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="replies-section">
                                    <h3>Replies ({selectedThread.replies?.length || 0})</h3>
                                    <div className="replies-list">
                                        {selectedThread.replies && selectedThread.replies.length > 0 ? (
                                            selectedThread.replies.map((reply: any, idx: number) => (
                                                <div key={reply._id || idx} className="reply-card">
                                                    <div className="reply-header">
                                                        <span className="reply-author">{reply.authorName}</span>
                                                        <span className="reply-date">{new Date(reply.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div className="reply-text">{reply.text}</div>
                                                    {(user as any)?.id === reply.authorId && (
                                                        <div className="reply-actions">
                                                            <button
                                                                className="delete-btn"
                                                                onClick={() => handleDeleteReply(selectedThread._id, reply._id)}
                                                                title="Delete Reply"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-replies">No replies yet. Be the first to join the conversation!</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="reply-form-container">
                                {user ? (
                                    <form onSubmit={handleReply} className="reply-form">
                                        <textarea
                                            placeholder="Write your reply..."
                                            className="glass-input reply-input"
                                            required
                                        ></textarea>
                                        <button type="submit" className="neon-button reply-submit-btn">
                                            Post Reply
                                        </button>
                                    </form>
                                ) : (
                                    <div className="login-to-reply">
                                        <p>Please log in to join the discussion.</p>
                                        <button className="neon-button" onClick={() => setShowAuthModal(true)}>
                                            Login to Reply
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CommunityClient;
