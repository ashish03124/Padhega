import mongoose, { Schema, Model } from 'mongoose';

export interface IGoal {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    targetValue: number;
    currentValue: number;
    unit: 'hours' | 'minutes' | 'days' | 'percentage';
    timeFrame: 'daily' | 'weekly' | 'monthly';
    deadline?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        targetValue: {
            type: Number,
            required: true,
            min: 0,
        },
        currentValue: {
            type: Number,
            default: 0,
            min: 0,
        },
        unit: {
            type: String,
            enum: ['hours', 'minutes', 'days', 'percentage'],
            required: true,
        },
        timeFrame: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: true,
        },
        deadline: {
            type: Date,
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fetching active goals by user
GoalSchema.index({ userId: 1, isActive: 1 });

const Goal: Model<IGoal> =
    mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);

export default Goal;
