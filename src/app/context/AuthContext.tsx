"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

// User type definition matches NextAuth session user
export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    provider?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    showAuthModal: boolean;
    setShowAuthModal: (show: boolean) => void;
    authMode: 'login' | 'signup' | 'forgot';
    setAuthMode: (mode: 'login' | 'signup' | 'forgot') => void;
    isLoading: boolean;
    error: string | null;
    status: 'authenticated' | 'loading' | 'unauthenticated';
    sendPasswordReset: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get NextAuth session
    const { data: session, status } = useSession();

    // Sync user state with NextAuth session
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setUser(session.user as User);
        } else if (status === 'unauthenticated') {
            setUser(null);
        }
    }, [session, status]);

    const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
                return false;
            }

            setShowAuthModal(false);
            setIsLoading(false);
            return true;
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
            return false;
        }
    };

    const signup = async (name: string, email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // Call our new signup API
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Signup failed');
                setIsLoading(false);
                return false;
            }

            // After successful signup, log the user in automatically
            return await login(email, password, true);
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        await signOut({ redirect: false });
        setUser(null);
    };

    const sendPasswordReset = async (email: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send reset email');
                setIsLoading(false);
                return false;
            }

            setIsLoading(false);
            return true;
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            showAuthModal,
            setShowAuthModal,
            authMode,
            setAuthMode,
            isLoading,
            error,
            status,
            sendPasswordReset,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Validation Utilities
export const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return { isValid: hasLength, strength };
};
