"use client";

import React, { useState, useEffect } from 'react';

interface PasswordPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
    roomName: string;
    error?: string | null;
}

export default function PasswordPromptModal({
    isOpen,
    onClose,
    onSubmit,
    roomName,
    error: propError
}: PasswordPromptModalProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (propError) {
            setError(propError);
        } else {
            setError(null);
        }
    }, [propError]);

    // Reset state on open/close
    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setShowPassword(false);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError('Password is required');
            return;
        }
        onSubmit(password);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close modal">
                    <i className="fas fa-times"></i>
                </button>
                
                <div className="modal-header">
                    <h2><i className="fas fa-lock text-yellow-500"></i> Password Required</h2>
                    <p className="subtitle">Enter password to join room: <strong>{roomName}</strong></p>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="room-password">Room Password</label>
                        <div className="password-input-wrapper" style={{ position: 'relative' }}>
                            <input
                                id="room-password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(null);
                                }}
                                placeholder="Enter password..."
                                autoFocus
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                        </div>
                        {error && (
                            <span className="error-text" style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </span>
                        )}
                    </div>

                    <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            <i className="fas fa-door-open"></i> Join Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
