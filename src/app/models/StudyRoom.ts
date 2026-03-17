import mongoose, { Schema, Model } from 'mongoose';

export interface IStudyRoom {
    _id: mongoose.Types.ObjectId;
    roomId: string;
    name: string;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
    subject?: string;
    privacy: 'public' | 'private';
    dailyRoomUrl?: string;
    maxParticipants: number;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdAt: Date;
    endedAt?: Date;
}

const StudyRoomSchema = new Schema<IStudyRoom>(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        subject: {
            type: String,
            required: false,
            trim: true,
        },
        privacy: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },
        dailyRoomUrl: {
            type: String,
            required: false,
        },
        maxParticipants: {
            type: Number,
            default: 20,
            min: 2,
            max: 100,
        },
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
        endedAt: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Index for fetching active public rooms
StudyRoomSchema.index({ isActive: 1, privacy: 1 });

const StudyRoom: Model<IStudyRoom> =
    mongoose.models.StudyRoom || mongoose.model<IStudyRoom>('StudyRoom', StudyRoomSchema);

export default StudyRoom;
