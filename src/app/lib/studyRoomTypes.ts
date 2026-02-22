// Type definitions for Study Rooms feature

export type RoomPrivacy = 'public' | 'private' | 'password';
export type RoomStatus = 'active' | 'ended';

export interface StudyRoom {
    id: string;
    _id?: string;
    name: string;
    description: string;
    subject: string;
    createdBy: {
        id: string;
        name: string;
        email?: string;
    };
    createdAt: Date;
    privacy: RoomPrivacy;
    password?: string;
    maxParticipants: number;
    currentParticipantCount: number;
    participants: Participant[];
    status: RoomStatus;
    dailyRoomUrl?: string; // For Daily.co integration
}

export interface Participant {
    userId: string;
    userName?: string;
    userEmail?: string;
    joinedAt?: Date;
    isHost?: boolean;
    isMuted?: boolean;
    isCameraOn?: boolean;
    isScreenSharing?: boolean;
}

export interface CreateRoomData {
    name: string;
    description?: string;
    subject?: string;
    privacy: RoomPrivacy;
    password?: string;
    maxParticipants: number;
}
