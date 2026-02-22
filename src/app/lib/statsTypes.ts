// TypeScript types for stats page data models

export interface StudySession {
    id: string;
    date: string; // ISO date string
    duration: number; // in minutes
    subject: string;
    type: 'focus' | 'study' | 'review';
    timestamp: number; // Unix timestamp
    notes?: string;
}

export interface Goal {
    id: string;
    name: string;
    targetValue: number;
    currentValue: number;
    unit: 'hours' | 'minutes' | 'days' | 'percentage';
    timeFrame: 'daily' | 'weekly' | 'monthly';
    createdAt: number;
    deadline?: number;
}

export interface StatsMetrics {
    todayHours: number;
    weekHours: number;
    monthHours: number;
    totalHours: number;
    currentStreak: number;
    longestStreak: number;
    focusScore: number;
    efficiency: number;
    retention: number;
    xp?: number;
    level?: number;
}

export interface ActivityLog {
    id: string;
    timestamp: number;
    activity: string;
    subject: string;
    duration: number;
    icon: string;
}

export interface SubjectData {
    name: string;
    hours: number;
    percentage: number;
    color: string;
}

export interface DailyData {
    date: string;
    hours: number;
    sessions: number;
    subjects: string[];
}

export interface WeeklyData {
    weekNumber: number;
    hours: number;
    averageDaily: number;
    daysActive: number;
}
