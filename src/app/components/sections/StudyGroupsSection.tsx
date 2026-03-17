"use client";
import React from 'react';
import { useStudyRooms } from '../../hooks/useStudyRooms';
import { useRouter } from 'next/navigation';

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
                    rooms.slice(0, 5).map(room => {
                        const subjectInitial = (room.subject && room.subject.length > 0)
                            ? room.subject[0].toUpperCase()
                            : 'G';

                        return (
                            <div key={room.id} className="group-item">
                                <div className="group-avatar" style={{
                                    background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    {subjectInitial}
                                </div>
                                <div className="group-info">
                                    <div className="group-name">{room.name}</div>
                                    <div className="group-members">
                                        {room.currentParticipantCount}/{room.maxParticipants} members • {room.subject}
                                    </div>
                                </div>
                                <button
                                    className="join-btn"
                                    onClick={() => handleJoin(room.id)}
                                    disabled={room.currentParticipantCount >= room.maxParticipants}
                                >
                                    Join
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default StudyGroupsSection;
