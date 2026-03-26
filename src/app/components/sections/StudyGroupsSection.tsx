"use client";
import React from 'react';
import { useStudyRooms } from '../../hooks/useStudyRooms';
import { useRouter } from 'next/navigation';
import './study-rooms.css';

const StudyGroupsSection: React.FC = () => {
    const { rooms, isLoading, joinRoom } = useStudyRooms();
    const router = useRouter();

    const handleJoin = async (id: string) => {
        const success = await joinRoom(id);
        if (success) {
            router.push(`/study-rooms/${id}`);
        }
    };

    const handleCreate = () => {
        router.push('/study-rooms');
    };

    return (
        <section className="groups-box" id="community">
            <div className="section-header">
                <h2><i className="fas fa-users"></i> Live Study Rooms</h2>
                <button className="btn btn-primary" onClick={handleCreate}>
                    <i className="fas fa-plus"></i> Create
                </button>
            </div>

            <div className="group-list">
                {isLoading ? (
                    <div className="loading-state">
                        <i className="fas fa-spinner fa-spin"></i> Loading rooms...
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="empty-state">
                        <p>No active rooms. Create one!</p>
                    </div>
                ) : (
                    rooms.slice(0, 8).map(room => {
                        const subjectInitial = (room.subject && room.subject.length > 0)
                            ? room.subject[0].toUpperCase()
                            : 'G';

                        return (
                            <div key={room.id} className="study-room-card">
                                <div className="card-header-flex">
                                    <div className="room-avatar-container">
                                        <div className="room-avatar" style={{
                                            background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                                        }}>
                                            {subjectInitial}
                                        </div>
                                        <div className="live-badge">Live</div>
                                    </div>
                                    <div className="member-count">
                                        <i className="fas fa-user-friends"></i>
                                        {room.currentParticipantCount}/{room.maxParticipants}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="room-details">
                                        <div className="room-subject">{room.subject}</div>
                                        <div className="room-name" title={room.name}>{room.name}</div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="room-join-btn"
                                        onClick={() => handleJoin(room.id)}
                                        disabled={room.currentParticipantCount >= room.maxParticipants}
                                    >
                                        <span>Join Room</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default StudyGroupsSection;
