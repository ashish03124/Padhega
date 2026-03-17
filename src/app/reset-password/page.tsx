'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/reset-password/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong. Please try again.');
            } else {
                setSuccess(true);
                setTimeout(() => router.push('/'), 3000);
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background, #0a0a0a)',
            padding: '2rem',
            fontFamily: 'Arial, Helvetica, sans-serif',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '2.5rem',
                backdropFilter: 'blur(20px)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img
                        src="/images/logo.png"
                        alt="Padhega"
                        className="dark-logo"
                        style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '1rem', marginInline: 'auto' }}
                    />
                    <img
                        src="/images/logo1.jpg"
                        alt="Padhega"
                        className="light-logo"
                        style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '1rem', marginInline: 'auto' }}
                    />
                    <h1 style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Padhega</h1>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem', fontSize: '1.8rem'
                        }}>
                            ✅
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '0.75rem' }}>Password Reset!</h2>
                        <p style={{ color: '#a3a3a3', fontSize: '0.95rem' }}>
                            Your password has been updated. Redirecting you to the home page...
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 style={{ color: '#fff', fontSize: '1.4rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                            🔑 Set New Password
                        </h2>
                        <p style={{ color: '#a3a3a3', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' }}>
                            Enter your new password below.
                        </p>

                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem',
                                color: '#f87171', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading || !token}
                                        style={{
                                            width: '100%', padding: '0.75rem 3rem 0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px', color: '#fff', fontSize: '1rem',
                                            outline: 'none', boxSizing: 'border-box',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '1rem'
                                        }}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading || !token}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', color: '#fff', fontSize: '1rem',
                                        outline: 'none', boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !token}
                                style={{
                                    width: '100%', padding: '0.85rem',
                                    background: isLoading || !token ? 'rgba(16,185,129,0.5)' : '#10b981',
                                    color: '#fff', border: 'none', borderRadius: '8px',
                                    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                                    transition: 'background 0.2s ease',
                                }}
                            >
                                {isLoading ? 'Updating...' : 'Set New Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                <p style={{ color: '#a3a3a3' }}>Loading...</p>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
