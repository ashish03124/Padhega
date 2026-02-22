"use client";

import React from 'react';
import { StudyRoom } from '../lib/studyRoomTypes';
import Link from 'next/link';

interface RoomCardProps {
    room: StudyRoom;
    onJoin?: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin }) => {
    const occupancyPercentage = (room.currentParticipantCount / room.maxParticipants) * 100;
    const isNearlyFull = occupancyPercentage >= 80;
    const isFull = room.currentParticipantCount >= room.maxParticipants;

    const getPrivacyIcon = () => {
        switch (room.privacy) {
            case 'public':
                return '🌐';
            case 'private':
                return '🔒';
            case 'password':
                return '🔐';
            default:
                return '🌐';
        }
    };

    const handleJoinClick = () => {
        if (onJoin) {
            onJoin(room.id);
        }
    };

    return (
        <div className="room-card">
            <div className="room-header">
                <div className="room-title">
                    <h3>{room.name}</h3>
                    <span className="privacy-badge" aria-label={`Privacy: ${room.privacy}`}>
                        {getPrivacyIcon()}
                    </span>
                </div>
                {room.subject && (
                    <span className="subject-tag">{room.subject}</span>
                )}
            </div>

            {room.description && (
                <p className="room-description">{room.description}</p>
            )}

            <div className="room-info">
                <div className="info-item">
                    <i className="fas fa-user"></i>
                    <span>{room.createdBy.name}</span>
                </div>
                <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>{getTimeAgo(room.createdAt)}</span>
                </div>
            </div>

            <div className="room-occupancy">
                <div className="occupancy-bar">
                    <div
                        className={`occupancy-fill ${isNearlyFull ? 'nearly-full' : ''} ${isFull ? 'full' : ''}`}
                        style={{ width: `${occupancyPercentage}%` }}
                    ></div>
                </div>
                <span className="occupancy-text">
                    {room.currentParticipantCount} / {room.maxParticipants} participants
                </span>
            </div>

            <div className="room-actions">
                {isFull ? (
                    <button className="btn btn-secondary" disabled>
                        <i className="fas fa-ban"></i> Room Full
                    </button>
                ) : (
                    <Link href={`/study-rooms/${room.id}`} className="btn btn-primary">
                        <i className="fas fa-door-open"></i> Join Room
                    </Link>
                )}
            </div>
        </div>
    );
};

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
}

export default RoomCard;
