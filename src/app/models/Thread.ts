import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IReply {
    _id?: mongoose.Types.ObjectId;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: Date;
}

export interface IThread extends Document {
    title: string;
    category: string;
    authorId: string;
    authorName: string;
    text: string;
    replies: IReply[];
    upvotes: string[]; // Array of user IDs
    views: number;
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReplySchema = new Schema<IReply>({
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ThreadSchema = new Schema<IThread>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        authorId: {
            type: String,
            required: true,
        },
        authorName: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: [true, 'Content is required'],
        },
        replies: [ReplySchema],
        upvotes: {
            type: [String],
            default: [],
        },
        views: {
            type: Number,
            default: 0,
        },
        lastActive: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Thread: Model<IThread> = mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema);

export default Thread;
