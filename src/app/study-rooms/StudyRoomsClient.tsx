"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyRooms } from '../hooks/useStudyRooms';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';
import { CreateRoomData } from '../lib/studyRoomTypes';
import './study-rooms.css';

export default function StudyRoomsClient() {
    const router = useRouter();
    const { rooms, createRoom, joinRoom, getPublicRooms, isLoading } = useStudyRooms();
    const { user, setShowAuthModal } = useAuth();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'public' | 'my-rooms'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreateRoom = async (data: CreateRoomData) => {
        const newRoom = await createRoom(data);
        if (newRoom) {
            router.push(`/study-rooms/${newRoom.id}`);
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        const success = await joinRoom(roomId);
        if (success) {
            router.push(`/study-rooms/${roomId}`);
        }
    };

    const handleCreateClick = () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        setShowCreateModal(true);
    };

    // Filter and search rooms
    const filteredRooms = rooms.filter(room => {
        // Filter by type
        if (filter === 'public' && room.privacy !== 'public') return false;
        if (filter === 'my-rooms' && room.createdBy.email !== user?.email) return false;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                room.name.toLowerCase().includes(query) ||
                room.subject?.toLowerCase().includes(query) ||
                room.description?.toLowerCase().includes(query)
            );
        }

        return room.status === 'active';
    });

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading study rooms...</p>
            </div>
        );
    }

    return (
        <main className="study-rooms-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-users"></i> Study Rooms
                    </h1>
                    <p className="subtitle">Join or create a collaborative study session</p>
                </div>
                <button className="btn btn-primary create-room-btn" onClick={handleCreateClick}>
                    <i className="fas fa-plus-circle"></i> Create Room
                </button>
            </div>

            <div className="controls-section">
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search rooms by name, subject, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <i className="fas fa-th"></i> All Rooms
                    </button>
                    <button
                        className={`filter-tab ${filter === 'public' ? 'active' : ''}`}
                        onClick={() => setFilter('public')}
                    >
                        <i className="fas fa-globe"></i> Public
                    </button>
                    {user && (
                        <button
                            className={`filter-tab ${filter === 'my-rooms' ? 'active' : ''}`}
                            onClick={() => setFilter('my-rooms')}
                        >
                            <i className="fas fa-user"></i> My Rooms
                        </button>
                    )}
                </div>
            </div>

            <div className="stats-banner">
                <div className="stat-item">
                    <i className="fas fa-door-open"></i>
                    <div>
                        <span className="stat-value">{filteredRooms.length}</span>
                        <span className="stat-label">Active Rooms</span>
                    </div>
                </div>
                <div className="stat-item">
                    <i className="fas fa-users"></i>
                    <div>
                        <span className="stat-value">
                            {filteredRooms.reduce((sum, room) => sum + room.currentParticipantCount, 0)}
                        </span>
                        <span className="stat-label">Students Online</span>
                    </div>
                </div>
                <div className="stat-item">
                    <i className="fas fa-graduation-cap"></i>
                    <div>
                        <span className="stat-value">
                            {new Set(filteredRooms.map(r => r.subject).filter(Boolean)).size}
                        </span>
                        <span className="stat-label">Subjects</span>
                    </div>
                </div>
            </div>

            {filteredRooms.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <h3>No rooms found</h3>
                    <p>
                        {searchQuery
                            ? 'Try a different search term'
                            : 'Be the first to create a study room!'}
                    </p>
                    <button className="btn btn-primary" onClick={handleCreateClick}>
                        <i className="fas fa-plus"></i> Create Room
                    </button>
                </div>
            ) : (
                <div className="rooms-grid">
                    {filteredRooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onJoin={handleJoinRoom}
                        />
                    ))}
                </div>
            )}

            <CreateRoomModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateRoom}
            />
        </main>
    );
}
