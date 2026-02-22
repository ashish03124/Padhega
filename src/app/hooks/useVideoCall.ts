"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import DailyIframe, { DailyCall, DailyEvent, DailyEventObject } from '@daily-co/daily-js';

export interface Participant {
    user_id: string;
    user_name: string;
    local: boolean;
    audio: boolean;
    video: boolean;
    screen: boolean;
}

export interface ChatMessage {
    id: string;
    fromId: string;
    fromName: string;
    message: string;
    timestamp: number;
}

export const useVideoCall = (roomUrl?: string) => {
    const [callObject, setCallObject] = useState<DailyCall | null>(null);
    const [participants, setParticipants] = useState<Record<string, Participant>>({});
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [callState, setCallState] = useState<'idle' | 'joining' | 'joined' | 'left' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const callRef = useRef<DailyCall | null>(null);

    // Initialize Daily.co call object
    useEffect(() => {
        if (!roomUrl) return;

        const initCall = async () => {
            try {
                // Create Daily call object
                const newCallObject = DailyIframe.createCallObject({
                    url: roomUrl,
                });

                callRef.current = newCallObject;
                setCallObject(newCallObject);

                // Set up event listeners
                newCallObject
                    .on('joined-meeting', handleJoinedMeeting)
                    .on('participant-joined', handleParticipantUpdate)
                    .on('participant-updated', handleParticipantUpdate)
                    .on('participant-left', handleParticipantLeft)
                    .on('app-message', handleChatMessage)
                    .on('error', handleError)
                    .on('left-meeting', handleLeftMeeting);

            } catch (err) {
                console.error('Error initializing call:', err);
                setError('Failed to initialize video call');
                setCallState('error');
            }
        };

        initCall();

        return () => {
            if (callRef.current) {
                callRef.current.destroy();
            }
        };
    }, [roomUrl]);

    const handleJoinedMeeting = useCallback(() => {
        setCallState('joined');
        updateParticipants();
    }, []);

    const handleParticipantUpdate = useCallback(() => {
        updateParticipants();
    }, []);

    const handleParticipantLeft = useCallback((event: DailyEventObject) => {
        setParticipants((prev) => {
            const updated = { ...prev };
            if (event.participant) {
                delete updated[event.participant.session_id];
            }
            return updated;
        });
    }, []);

    const handleChatMessage = useCallback((event: any) => {
        if (event.data?.type === 'chat') {
            const newMessage: ChatMessage = {
                id: `${Date.now()}-${Math.random()}`,
                fromId: event.fromId,
                fromName: event.data.fromName || 'Anonymous',
                message: event.data.message,
                timestamp: Date.now(),
            };
            setChatMessages((prev) => [...prev, newMessage]);
        }
    }, []);

    const handleError = useCallback((event: DailyEventObject) => {
        console.error('Daily.co error:', event);
        setError(event.errorMsg || 'An error occurred');
        setCallState('error');
    }, []);

    const handleLeftMeeting = useCallback(() => {
        setCallState('left');
        setParticipants({});
    }, []);

    const updateParticipants = () => {
        if (!callRef.current) return;

        const participantsObj = callRef.current.participants();
        const participantsList: Record<string, Participant> = {};

        Object.entries(participantsObj).forEach(([id, p]: [string, any]) => {
            participantsList[id] = {
                user_id: p.user_id || id,
                user_name: p.user_name || 'Guest',
                local: p.local,
                audio: p.audio,
                video: p.video !== false,
                screen: p.screen || false,
            };
        });

        setParticipants(participantsList);
    };

    // Join the call
    const joinCall = useCallback(async (token?: string) => {
        if (!callRef.current) {
            setError('Call object not initialized');
            return;
        }

        setCallState('joining');
        try {
            await callRef.current.join({ token });
        } catch (err) {
            console.error('Error joining call:', err);
            setError('Failed to join call');
            setCallState('error');
        }
    }, []);

    // Leave the call
    const leaveCall = useCallback(async () => {
        if (!callRef.current) return;

        try {
            await callRef.current.leave();
            setCallState('left');
        } catch (err) {
            console.error('Error leaving call:', err);
        }
    }, []);

    // Toggle camera
    const toggleCamera = useCallback(async () => {
        if (!callRef.current) return;

        try {
            const newState = !isCameraOn;
            await callRef.current.setLocalVideo(newState);
            setIsCameraOn(newState);
        } catch (err) {
            console.error('Error toggling camera:', err);
        }
    }, [isCameraOn]);

    // Toggle microphone
    const toggleMic = useCallback(async () => {
        if (!callRef.current) return;

        try {
            const newState = !isMicOn;
            await callRef.current.setLocalAudio(newState);
            setIsMicOn(newState);
        } catch (err) {
            console.error('Error toggling mic:', err);
        }
    }, [isMicOn]);

    // Toggle screen share
    const toggleScreenShare = useCallback(async () => {
        if (!callRef.current) return;

        try {
            if (isScreenSharing) {
                await callRef.current.stopScreenShare();
            } else {
                await callRef.current.startScreenShare();
            }
            setIsScreenSharing(!isScreenSharing);
        } catch (err) {
            console.error('Error toggling screen share:', err);
        }
    }, [isScreenSharing]);

    // Send chat message
    const sendChatMessage = useCallback((message: string, userName: string) => {
        if (!callRef.current) return;

        callRef.current.sendAppMessage({
            type: 'chat',
            message,
            fromName: userName,
        }, '*');

        // Add our own message to the list
        const newMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            fromId: 'local',
            fromName: userName,
            message,
            timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, newMessage]);
    }, []);

    return {
        callObject,
        participants,
        isCameraOn,
        isMicOn,
        isScreenSharing,
        chatMessages,
        callState,
        error,
        joinCall,
        leaveCall,
        toggleCamera,
        toggleMic,
        toggleScreenShare,
        sendChatMessage,
    };
};
