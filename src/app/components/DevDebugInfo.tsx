"use client";

import { useAuth } from '../context/AuthContext';
import { useSession } from 'next-auth/react';

/**
 * Debug component to show current user info during development
 * Only visible in development mode
 */
export default function DevDebugInfo() {
    const { user } = useAuth();
    const { data: session, status } = useSession();

    // Only show in development
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#0f0',
            padding: '10px 15px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
            maxWidth: '300px',
            border: '1px solid #0f0'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0ff' }}>
                🔧 DEV DEBUG INFO
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>AuthContext User:</strong>
            </div>
            {user ? (
                <div style={{ marginLeft: '10px', fontSize: '11px' }}>
                    <div>Name: {user.name}</div>
                    <div>Email: {user.email}</div>
                </div>
            ) : (
                <div style={{ marginLeft: '10px', color: '#f00' }}>Not logged in</div>
            )}

            <div style={{ marginTop: '8px', marginBottom: '4px' }}>
                <strong>NextAuth Session:</strong>
            </div>
            <div style={{ marginLeft: '10px', fontSize: '11px' }}>
                <div>Status: {status}</div>
                {session?.user ? (
                    <>
                        <div>Name: {session.user.name}</div>
                        <div>Email: {session.user.email}</div>
                    </>
                ) : (
                    <div style={{ color: '#f00' }}>No session</div>
                )}
            </div>
        </div>
    );
}
