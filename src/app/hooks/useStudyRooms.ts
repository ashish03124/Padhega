"use client";

import { useState, useEffect, useCallback } from 'react';
import { StudyRoom, CreateRoomData, Participant, RoomPrivacy } from '../lib/studyRoomTypes';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

const STORAGE_KEY = 'study_rooms';

export const useStudyRooms = () => {
    const [rooms, setRooms] = useState<StudyRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, status } = useAuth();

    // Fetch rooms on mount/auth
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch('/api/rooms');
                const data = await response.json();

                if (Array.isArray(data)) {
                    // Map MongoDB model to local StudyRoom interface
                    const mappedRooms: StudyRoom[] = data.map((r: any) => ({
                        id: r.roomId,
                        _id: r._id,
                        name: r.name,
                        description: r.description || '',
                        subject: r.subject || 'General',
                        createdBy: {
                            id: r.createdBy?._id || r.createdBy,
                            name: r.createdBy?.name || 'Host',
                            email: r.createdBy?.email || r.createdByEmail || '',
                        },
                        createdAt: new Date(r.createdAt),
                        privacy: r.privacy as RoomPrivacy,
                        maxParticipants: r.maxParticipants,
                        currentParticipantCount: r.participants.length,
                        participants: r.participants.map((pId: string) => ({ userId: pId } as any)),
                        status: r.isActive ? 'active' : 'ended',
                    }));
                    setRooms(mappedRooms);
                }
            } catch (err) {
                console.error("Error fetching rooms:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, [status]);

    const createRoom = useCallback(async (roomData: CreateRoomData): Promise<StudyRoom | null> => {
        if (status !== 'authenticated') {
            showToast('Please sign in to create a room', 'warning');
            return null;
        }

        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: `room_${Date.now()}`,
                    ...roomData,
                }),
            });

            if (response.ok) {
                const r = await response.json();
                const newRoom: StudyRoom = {
                    id: r.roomId,
                    _id: r._id,
                    name: r.name,
                    description: r.description || '',
                    subject: r.subject || 'General',
                    createdBy: {
                        id: user?.id || '',
                        name: user?.name || '',
                        email: user?.email || '',
                    },
                    createdAt: new Date(r.createdAt),
                    privacy: r.privacy,
                    maxParticipants: r.maxParticipants,
                    currentParticipantCount: 1,
                    participants: [{ userId: user?.id || '' } as any],
                    status: 'active',
                };
                setRooms(prev => [newRoom, ...prev]);
                return newRoom;
            }
            return null;
        } catch (err) {
            console.error("Error creating room:", err);
            return null;
        }
    }, [user, status]);

    const deleteRoom = useCallback(async (roomId: string) => {
        if (status !== 'authenticated') return;

        try {
            const response = await fetch(`/api/rooms?id=${roomId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setRooms(prev => prev.filter(r => r.id !== roomId && r._id !== roomId));
            }
        } catch (err) {
            console.error("Error deleting room:", err);
        }
    }, [status]);

    const joinRoom = useCallback(async (roomId: string, password?: string): Promise<boolean> => {
        if (status !== 'authenticated') {
            showToast('Please sign in to join a room', 'warning');
            return false;
        }

        try {
            const response = await fetch('/api/rooms', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: roomId,
                    action: 'join',
                }),
            });

            if (response.ok) {
                const updatedRoom = await response.json();
                setRooms(prev => prev.map(r =>
                    (r.id === roomId || r._id === roomId) ? {
                        ...r,
                        currentParticipantCount: updatedRoom.participants.length,
                        participants: updatedRoom.participants.map((p: any) => ({
                            userId: p._id || p,
                            name: p.name,
                            image: p.image
                        } as any)),
                    } : r
                ));
                return true;
            }
            return false;
        } catch (err) {
            console.error("Error joining room:", err);
            return false;
        }
    }, [status]);

    const leaveRoom = useCallback(async (roomId: string) => {
        if (status !== 'authenticated') return;

        try {
            const response = await fetch('/api/rooms', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: roomId,
                    action: 'leave',
                }),
            });

            if (response.ok) {
                const updatedRoom = await response.json();
                setRooms(prev => prev.map(r =>
                    (r.id === roomId || r._id === roomId) ? {
                        ...r,
                        currentParticipantCount: updatedRoom.participants.length,
                        participants: updatedRoom.participants.map((p: any) => ({
                            userId: p._id || p,
                            name: p.name,
                            image: p.image
                        } as any)),
                    } : r
                ));
            }
        } catch (err) {
            console.error("Error leaving room:", err);
        }
    }, [status]);

    const getRoomById = useCallback(async (roomId: string): Promise<StudyRoom | null> => {
        // First check if we already have it in the rooms list
        const existing = rooms.find(r => r.id === roomId || r._id === roomId);
        if (existing) return existing;

        try {
            const response = await fetch(`/api/rooms?id=${roomId}`);
            if (response.ok) {
                const data = await response.json();
                // API returns array if using query params
                const r = Array.isArray(data) ? data[0] : data;

                if (!r) return null;

                return {
                    id: r.roomId,
                    _id: r._id,
                    name: r.name,
                    description: r.description || '',
                    subject: r.subject || 'General',
                    createdBy: {
                        id: r.createdBy?._id || r.createdBy,
                        name: r.createdBy?.name || 'Host',
                        email: r.createdBy?.email || '',
                    },
                    createdAt: new Date(r.createdAt),
                    privacy: r.privacy,
                    maxParticipants: r.maxParticipants,
                    currentParticipantCount: r.participants.length,
                    participants: r.participants.map((p: any) => ({
                        userId: p._id || p,
                        name: p.name,
                        image: p.image
                    } as any)),
                    status: r.isActive ? 'active' : 'ended',
                    dailyRoomUrl: r.dailyRoomUrl,
                };
            }
            return null;
        } catch (err) {
            console.error("Error fetching room details:", err);
            return null;
        }
    }, [rooms]);

    const getActiveRooms = useCallback(() => {
        return rooms.filter(room => room.status === 'active');
    }, [rooms]);

    const getPublicRooms = useCallback(() => {
        return rooms.filter(room => room.privacy === 'public' && room.status === 'active');
    }, [rooms]);

    return {
        rooms,
        isLoading,
        createRoom,
        deleteRoom,
        joinRoom,
        leaveRoom,
        getActiveRooms,
        getPublicRooms,
        getRoomById,
    };
};
