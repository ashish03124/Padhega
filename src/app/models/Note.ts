import mongoose, { Schema, Model } from 'mongoose';

export interface INote {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    isPinned: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient user queries with pinned notes first
NoteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

const Note: Model<INote> =
    mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
