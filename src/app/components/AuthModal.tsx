"use client";

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useAuth, validateEmail, validatePassword } from '../context/AuthContext';
import './auth-styles.css';

const AuthModal: React.FC = () => {
    const {
        showAuthModal,
        setShowAuthModal,
        authMode,
        setAuthMode,
        login,
        signup,
        sendPasswordReset,
        isLoading,
        error,
    } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [emailValid, setEmailValid] = useState<boolean | null>(null);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
    const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

    // Validate email in real-time
    useEffect(() => {
        if (email) {
            setEmailValid(validateEmail(email));
        } else {
            setEmailValid(null);
        }
    }, [email]);

    // Check password strength in real-time
    useEffect(() => {
        if (password && authMode === 'signup') {
            const validation = validatePassword(password);
            setPasswordStrength(validation.strength);
        }
    }, [password, authMode]);

    if (!showAuthModal) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (authMode === 'forgot') {
            const success = await sendPasswordReset(email);
            if (success) {
                setResetSent(true);
                setTimeout(() => {
                    setResetSent(false);
                    setAuthMode('login');
                }, 3000);
            }
        } else if (authMode === 'login') {
            // Use NextAuth for credentials login
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.ok) {
                handleClose();
            }
        } else {
            await signup(name, email, password);
        }
    };

    const handleClose = () => {
        setShowAuthModal(false);
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setRememberMe(false);
        setResetSent(false);
        setEmailValid(null);
    };

    const handleSocialAuth = async (e: React.MouseEvent, provider: 'google' | 'github') => {
        e.preventDefault();
        e.stopPropagation();

        if (oauthLoading) return; // Prevent multiple clicks

        setOauthLoading(provider);
        try {
            // Use NextAuth signIn for OAuth providers
            await signIn(provider, {
                callbackUrl: '/',
                redirect: true,
            });
        } catch (error) {
            console.error(`OAuth error with ${provider}:`, error);
            setOauthLoading(null);
        }
    };

    return (
        <div
            className="auth-modal-overlay"
            onClick={handleClose}
        >
            <div
                className="auth-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="auth-modal-close"
                    onClick={handleClose}
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="auth-modal-header">
                    <h2>
                        {authMode === 'login' && '👋 Welcome Back'}
                        {authMode === 'signup' && '🎓 Join Padhega'}
                        {authMode === 'forgot' && '🔒 Reset Password'}
                    </h2>
                    <p>
                        {authMode === 'login' && 'Enter your details to continue your learning journey'}
                        {authMode === 'signup' && 'Start your productive study journey today'}
                        {authMode === 'forgot' && 'Enter your email to receive reset instructions'}
                    </p>
                </div>

                {error && (
                    <div className="auth-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                {resetSent && (
                    <div className="auth-success-message">
                        <i className="fas fa-check-circle"></i>
                        Password reset email sent! Check your inbox.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {authMode === 'signup' && (
                        <div className="auth-input-group">
                            <label>Full Name</label>
                            <div className="auth-input-wrapper">
                                <i className="fas fa-user auth-input-icon"></i>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="auth-input"
                                    disabled={isLoading || !!oauthLoading}
                                />
                            </div>
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <i className="fas fa-envelope auth-input-icon"></i>
                            <input
                                type="email"
                                placeholder="hello@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`auth-input ${emailValid === true ? 'valid' : emailValid === false ? 'invalid' : ''}`}
                                disabled={isLoading || !!oauthLoading}
                            />
                            {emailValid === true && (
                                <i className="fas fa-check-circle auth-validation-icon valid"></i>
                            )}
                            {emailValid === false && (
                                <i className="fas fa-times-circle auth-validation-icon invalid"></i>
                            )}
                        </div>
                    </div>

                    {authMode !== 'forgot' && (
                        <div className="auth-input-group">
                            <label>Password</label>
                            <div className="auth-input-wrapper">
                                <i className="fas fa-lock auth-input-icon"></i>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input"
                                    disabled={isLoading || !!oauthLoading}
                                />
                                <button
                                    type="button"
                                    className="auth-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading || !!oauthLoading}
                                >
                                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                                </button>
                            </div>
                            {authMode === 'signup' && password && (
                                <div className="password-strength-meter">
                                    <div className={`strength-bar strength-${passwordStrength}`}>
                                        <div className="strength-fill"></div>
                                    </div>
                                    <span className={`strength-text strength-${passwordStrength}`}>
                                        {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {authMode === 'login' && (
                        <div className="auth-options">
                            <label className="remember-me-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading || !!oauthLoading}
                                />
                                <span>Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="forgot-password-link"
                                onClick={() => setAuthMode('forgot')}
                                disabled={isLoading || !!oauthLoading}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={isLoading || !!oauthLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>
                                    {authMode === 'login' && 'Signing In...'}
                                    {authMode === 'signup' && 'Creating Account...'}
                                    {authMode === 'forgot' && 'Sending Email...'}
                                </span>
                            </>
                        ) : (
                            <>
                                <span>
                                    {authMode === 'login' && 'Sign In'}
                                    {authMode === 'signup' && 'Create Account'}
                                    {authMode === 'forgot' && 'Send Reset Link'}
                                </span>
                                <i className="fas fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>

                {authMode !== 'forgot' && (
                    <>
                        <div className="auth-divider">
                            <span>Or continue with</span>
                        </div>

                        <div className="social-auth-buttons">
                            <button
                                type="button"
                                className="social-btn google-btn"
                                onClick={(e) => handleSocialAuth(e, 'google')}
                                disabled={isLoading || !!oauthLoading}
                            >
                                {oauthLoading === 'google' ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                Google
                            </button>
                            <button
                                type="button"
                                className="social-btn github-btn"
                                onClick={(e) => handleSocialAuth(e, 'github')}
                                disabled={isLoading || !!oauthLoading}
                            >
                                {oauthLoading === 'github' ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fab fa-github"></i>
                                )}
                                GitHub
                            </button>
                        </div>
                    </>
                )}

                <div className="auth-footer">
                    {authMode === 'login' && (
                        <>
                            Don't have an account?{' '}
                            <button onClick={() => setAuthMode('signup')} disabled={isLoading || !!oauthLoading}>
                                Sign Up
                            </button>
                        </>
                    )}
                    {authMode === 'signup' && (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => setAuthMode('login')} disabled={isLoading || !!oauthLoading}>
                                Log In
                            </button>
                        </>
                    )}
                    {authMode === 'forgot' && (
                        <>
                            Remember your password?{' '}
                            <button onClick={() => setAuthMode('login')} disabled={isLoading || !!oauthLoading}>
                                Back to Login
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AuthModal;
