import mongoose, { Schema, Model } from 'mongoose';

export interface ITask {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    text: string;
    isCompleted: boolean;
    priority: 'high' | 'medium' | 'low';
    category?: string;
    dueDate?: Date;
    createdAt: Date;
    completedAt?: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ['high', 'medium', 'low'],
            default: 'medium',
        },
        category: {
            type: String,
            required: false,
            trim: true,
        },
        dueDate: {
            type: Date,
            required: false,
        },
        completedAt: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Index for fetching incomplete tasks by user, sorted by due date
TaskSchema.index({ userId: 1, isCompleted: 1, dueDate: 1 });

const Task: Model<ITask> =
    mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
