import mongoose, { Schema, Model } from 'mongoose';

export interface IStudySession {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    date: Date;
    duration: number; // in minutes
    subject: string;
    type: 'focus' | 'study' | 'review';
    notes?: string;
    createdAt: Date;
}

const StudySessionSchema = new Schema<IStudySession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['focus', 'study', 'review'],
            required: true,
        },
        notes: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound index for efficient user + date queries
StudySessionSchema.index({ userId: 1, date: -1 });

const StudySession: Model<IStudySession> =
    mongoose.models.StudySession || mongoose.model<IStudySession>('StudySession', StudySessionSchema);

export default StudySession;
