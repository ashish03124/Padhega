"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStudyRooms } from '../../hooks/useStudyRooms';
import { useVideoCall } from '../../hooks/useVideoCall';
import { useAuth } from '../../context/AuthContext';
import VideoCall from '../../components/VideoCall';
import CallControls from '../../components/CallControls';
import ChatPanel from '../../components/ChatPanel';
import './room.css';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params?.roomId as string;

    const { rooms, joinRoom, getRoomById } = useStudyRooms();
    const { user, setShowAuthModal } = useAuth();

    const [room, setRoom] = useState(rooms.find(r => r.id === roomId));
    const [roomUrl, setRoomUrl] = useState<string>('');
    const [isJoining, setIsJoining] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        callObject,
        participants,
        isCameraOn,
        isMicOn,
        isScreenSharing,
        chatMessages,
        callState,
        error: callError,
        joinCall,
        leaveCall,
        toggleCamera,
        toggleMic,
        toggleScreenShare,
        sendChatMessage,
    } = useVideoCall(roomUrl);

    useEffect(() => {
        const fetchRoomData = async () => {
            const currentRoom = await getRoomById(roomId);

            if (!currentRoom) {
                setError('Room not found');
                return;
            }

            setRoom(currentRoom);

            // If room has Daily.co URL, use it
            if (currentRoom.dailyRoomUrl) {
                setRoomUrl(currentRoom.dailyRoomUrl);
            } else {
                // Create a Daily.co room
                createDailyRoom(currentRoom.name, currentRoom.privacy);
            }
        };

        fetchRoomData();
    }, [roomId, getRoomById]);

    const createDailyRoom = async (roomName: string, privacy: string) => {
        try {
            const response = await fetch('/api/daily/create-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName: `${roomId}`,
                    privacy: privacy,
                }),
            });

            if (!response.ok) {
                const data = await response.json();

                // Log detailed error information
                console.error('=== Client-side API Error ===');
                console.error('Response status:', response.status);
                console.error('Error data:', data);
                console.error('Error message:', data.error);
                console.error('Error details:', data.details);
                console.error('============================');

                throw new Error(data.error || 'Failed to create video room');
            }

            const data = await response.json();
            setRoomUrl(data.url);

            // Update room with Daily URL (in real app, save to database)
            if (room) {
                room.dailyRoomUrl = data.url;
            }
        } catch (err: any) {
            console.error('Error creating Daily room:', err);
            setError(err.message || 'Failed to initialize video room');
        }
    };

    const handleJoinRoom = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!room) {
            setError('Room not found');
            return;
        }

        setIsJoining(true);

        try {
            // Join the study room (local state)
            const joined = joinRoom(roomId);
            if (!joined) {
                setIsJoining(false);
                return;
            }

            // Get Daily.co meeting token
            const response = await fetch('/api/daily/create-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName: roomId,
                    userName: user.name || 'Guest',
                    isOwner: room.createdBy.email === user.email,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get meeting token');
            }

            const { token } = await response.json();

            // Join the Daily.co call
            await joinCall(token);
        } catch (err: any) {
            console.error('Error joining room:', err);
            setError(err.message || 'Failed to join video call');
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveRoom = async () => {
        await leaveCall();
        router.push('/study-rooms');
    };

    const handleSendMessage = (message: string) => {
        if (user) {
            sendChatMessage(message, user.name || 'Guest');
        }
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
                    <span>{Object.keys(participants).length} participant{Object.keys(participants).length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {callState === 'idle' && (
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
                            disabled={isJoining || !roomUrl}
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

            {(callState === 'joining' || callState === 'joined') && (
                <div className="video-call-layout">
                    <div className="video-main">
                        <VideoCall callObject={callObject} participants={participants} />
                        <CallControls
                            isCameraOn={isCameraOn}
                            isMicOn={isMicOn}
                            isScreenSharing={isScreenSharing}
                            onToggleCamera={toggleCamera}
                            onToggleMic={toggleMic}
                            onToggleScreenShare={toggleScreenShare}
                            onLeaveCall={handleLeaveRoom}
                        />
                    </div>

                    <ChatPanel
                        messages={chatMessages}
                        userName={user?.name || 'Guest'}
                        onSendMessage={handleSendMessage}
                        isOpen={isChatOpen}
                        onToggle={() => setIsChatOpen(!isChatOpen)}
                    />
                </div>
            )}

            {callState === 'left' && (
                <div className="call-ended-screen">
                    <i className="fas fa-phone-slash"></i>
                    <h2>You left the study room</h2>
                    <button className="btn btn-primary" onClick={() => router.push('/study-rooms')}>
                        <i className="fas fa-arrow-left"></i> Back to Rooms
                    </button>
                </div>
            )}
        </main>
    );
}
