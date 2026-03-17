import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    image?: string;
    provider: 'credentials' | 'google' | 'github';
    xp: number;
    level: number;
    resetToken?: string;
    resetTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            // Password is optional for OAuth users
            required: false,
        },
        image: {
            type: String,
            required: false,
        },
        provider: {
            type: String,
            enum: ['credentials', 'google', 'github'],
            default: 'credentials',
        },
        xp: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        resetToken: {
            type: String,
            required: false,
        },
        resetTokenExpiry: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Prevent model recompilation in development (Next.js hot reload)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
