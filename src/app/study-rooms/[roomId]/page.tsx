"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStudyRooms } from '../../hooks/useStudyRooms';
import { useVideoCall } from '../../hooks/useVideoCall';
import { useAuth } from '../../context/AuthContext';
import dynamic from 'next/dynamic';
import CallControls from '../../components/CallControls';
import ChatPanel from '../../components/ChatPanel';
import './room.css';

const VideoCall = dynamic(() => import('../../components/VideoCall'), {
    ssr: false,
    loading: () => (
        <div className="video-loading" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '400px',
            color: 'var(--text-secondary)'
        }}>
            <div className="spinner" style={{ marginBottom: '1rem' }}></div>
            <p>Initializing video connection...</p>
        </div>
    ),
});

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params?.roomId as string;

    const { rooms, joinRoom, getRoomById } = useStudyRooms();
    const { user, setShowAuthModal } = useAuth();

    const [room, setRoom] = useState(rooms.find(r => r.id === roomId));
    const [roomUrl, setRoomUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [directPassword, setDirectPassword] = useState('');

    const isParticipant = room?.participants?.some((p: any) => p.userId === user?.id) || false;
    const isCreator = room?.createdBy?.id === user?.id || false;

    const {
        token,
        error: callError,
        isLoading: isJoining,
        getToken,
    } = useVideoCall();

    useEffect(() => {
        const fetchRoomData = async () => {
            const currentRoom = await getRoomById(roomId);

            if (!currentRoom) {
                setError('Room not found');
                return;
            }

            setRoom(currentRoom);
        };

        fetchRoomData();
    }, [roomId, getRoomById]);

    const handleJoinRoom = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!room) {
            setError('Room not found');
            return;
        }

        try {
            // Join the study room (local state)
            const joined = await joinRoom(roomId, directPassword);
            if (!joined) {
                setError('Incorrect room password');
                return;
            }

            // Get LiveKit access token
            await getToken(roomId, user.name || 'Guest');
        } catch (err: any) {
            console.error('Error joining room:', err);
            setError(err.message || 'Failed to join video call');
        }
    };

    const handleLeaveRoom = async () => {
        router.push('/study-rooms');
    };

    if (error && !room) {
        return (
            <main className="room-page">
                <div className="error-container">
                    <i className="fas fa-exclamation-circle"></i>
                    <h2>Room Not Found</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => router.push('/study-rooms')}>
                        <i className="fas fa-arrow-left"></i> Back to Rooms
                    </button>
                </div>
            </main>
        );
    }

    if (!room) {
        return (
            <main className="room-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading room...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="room-page">
            <div className="room-header-bar">
                <div className="room-info-compact">
                    <h2>{room.name}</h2>
                    {room.subject && <span className="subject-badge">{room.subject}</span>}
                </div>
                <div className="participant-count">
                    <i className="fas fa-users"></i>
                    <span>Room Active</span>
                </div>
            </div>

            {!token && (
                <div className="join-call-screen">
                    <div className="room-details">
                        <h1>{room.name}</h1>
                        {room.description && <p className="room-description">{room.description}</p>}

                        <div className="room-meta">
                            {room.subject && (
                                <div className="meta-item">
                                    <i className="fas fa-graduation-cap"></i>
                                    <span>{room.subject}</span>
                                </div>
                            )}
                            <div className="meta-item">
                                <i className="fas fa-user"></i>
                                <span>Hosted by {room.createdBy.name}</span>
                            </div>
                            <div className="meta-item">
                                <i className="fas fa-users"></i>
                                <span>{room.currentParticipantCount} / {room.maxParticipants} participants</span>
                            </div>
                        </div>

                        {room.privacy === 'password' && !isParticipant && !isCreator && (
                            <div className="form-group room-password-input-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label htmlFor="direct-room-password" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <i className="fas fa-lock"></i> Room Password
                                </label>
                                <input
                                    id="direct-room-password"
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter room password..."
                                    value={directPassword}
                                    style={{ background: 'var(--glass-bg)', color: '#fff', border: '1px solid var(--glass-border)' }}
                                    onChange={(e) => {
                                        setDirectPassword(e.target.value);
                                        setError(null);
                                    }}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-triangle"></i>
                                {error}
                            </div>
                        )}

                        {callError && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-triangle"></i>
                                {callError}
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-lg join-call-btn"
                            onClick={handleJoinRoom}
                            disabled={isJoining}
                        >
                            {isJoining ? (
                                <>
                                    <div className="spinner-small"></div> Joining...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-video"></i> Join Study Room
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {token && (
                <div className="video-call-layout">
                    <div className="video-main">
                        <VideoCall 
                            key={token}
                            token={token} 
                            onLeave={handleLeaveRoom} 
                            onRetry={handleJoinRoom} 
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

