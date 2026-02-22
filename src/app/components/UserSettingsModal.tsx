"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, User } from '../context/AuthContext';
import { useSession } from 'next-auth/react';

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'profile' | 'settings';
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
    isOpen,
    onClose,
    initialTab = 'profile'
}) => {
    const { user, status } = useAuth();
    const { update: updateSession } = useSession();
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(initialTab);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Sync form with user
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setImage(user.image || null);
        }
        setMessage(null);
    }, [isOpen, initialTab, user]);

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (e.g., limit to 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, image: image || undefined }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
                setIsLoading(false);
                return;
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Tell NextAuth to update session context, which syncs with JWT update trigger
            if (updateSession) {
                await updateSession({ name, email, image });
            } else {
                setTimeout(() => window.location.reload(), 1500);
            }

        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-container settings-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="settings-modal-layout">
                    {/* Sidebar Tabs */}
                    <div className="settings-sidebar">
                        <h3>Account</h3>
                        <button
                            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('profile'); setMessage(null); }}
                        >
                            <i className="fas fa-user"></i> Profile
                        </button>
                        <button
                            className={`settings-tab ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('settings'); setMessage(null); }}
                        >
                            <i className="fas fa-cog"></i> Platform Settings
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="settings-content">
                        {activeTab === 'profile' && (
                            <div className="settings-panel fade-in">
                                <h2>Public Profile</h2>
                                <p className="settings-desc">Manage your personal information.</p>

                                {message && (
                                    <div className={message.type === 'error' ? 'auth-error-message' : 'auth-success-message'} style={{ marginBottom: '1rem' }}>
                                        <i className={`fas fa-${message.type === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
                                        {message.text}
                                    </div>
                                )}

                                <div className="profile-edit-avatar">
                                    <div
                                        className="avatar-btn large-avatar editable-avatar"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {image ? (
                                            <img src={image} alt="Profile" className="avatar-img" />
                                        ) : (
                                            <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                                        )}
                                        <div className="avatar-edit-overlay">
                                            <i className="fas fa-camera"></i>
                                        </div>
                                    </div>
                                    <div className="avatar-edit-info">
                                        <span className="avatar-label">Profile Image</span>
                                        <span className="avatar-sub">Click to upload (Max 2MB)</span>
                                        {image && (
                                            <button
                                                type="button"
                                                className="remove-avatar-btn"
                                                onClick={() => setImage(null)}
                                            >
                                                Remove Image
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageUpload}
                                    />
                                </div>

                                <form onSubmit={handleSaveProfile} className="auth-form">
                                    <div className="auth-input-group">
                                        <label>Full Name</label>
                                        <div className="auth-input-wrapper">
                                            <i className="fas fa-user auth-input-icon"></i>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="auth-input"
                                                required
                                                disabled={isLoading || status === 'loading'}
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-input-group">
                                        <label>Email Address</label>
                                        <div className="auth-input-wrapper">
                                            <i className="fas fa-envelope auth-input-icon"></i>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="auth-input"
                                                required
                                                disabled={isLoading || status === 'loading'}
                                            />
                                        </div>
                                    </div>

                                    <div className="settings-actions">
                                        <button type="submit" className="auth-submit-btn settings-save-btn" disabled={isLoading}>
                                            {isLoading ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="settings-panel fade-in">
                                <h2>Platform Settings</h2>
                                <p className="settings-desc">Manage your workspace preferences.</p>

                                <div className="settings-section">
                                    <h4>Appearance</h4>
                                    <div className="setting-row">
                                        <div className="setting-info">
                                            <span className="setting-title">Theme</span>
                                            <span className="setting-sub">Switch between light and dark mode</span>
                                        </div>
                                        {/* Toggling theme from here directly uses a similar approach as Header */}
                                        <button className="settings-toggle-btn" onClick={() => {
                                            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                                            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                                            document.documentElement.setAttribute('data-theme', newTheme);
                                            localStorage.setItem('theme', newTheme);
                                            // Force re-render trick on this component to update button text
                                            setMessage({ type: 'success', text: `Theme changed to ${newTheme}!` });
                                        }}>
                                            <i className={`fas fa-${document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon'}`}></i> Toggle Theme
                                        </button>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h4>Notifications</h4>
                                    <div className="setting-row">
                                        <div className="setting-info">
                                            <span className="setting-title">Study Reminders</span>
                                            <span className="setting-sub">Get alerted when it's time to study</span>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <div className="setting-row">
                                        <div className="setting-info">
                                            <span className="setting-title">Productivity Digests</span>
                                            <span className="setting-sub">Weekly summaries of your study stats</span>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsModal;
