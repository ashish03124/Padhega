"use client";

import { useState, useCallback } from 'react';

export interface ChatMessage {
    id: string;
    fromId: string;
    fromName: string;
    message: string;
    timestamp: number;
}

export const useVideoCall = () => {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Fetches a LiveKit access token from our local API
     */
    const getToken = useCallback(async (room: string, username: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const resp = await fetch('/api/livekit/get-token', {
                method: 'POST',
                body: JSON.stringify({ room, username }),
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await resp.json();
            
            if (data.token) {
                setToken(data.token);
                return data.token;
            } else {
                throw new Error(data.error || 'Failed to get token');
            }
        } catch (e: any) {
            setError(e.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearToken = useCallback(() => {
        setToken(null);
    }, []);

    return {
        token,
        error,
        isLoading,
        getToken,
        clearToken
    };
};
