// Centralized activity logger for cross-page data sharing
// Allows Timer, Notes, Tasks to emit events that Stats can consume

import { useCallback, useEffect } from 'react';

export type ActivityType =
    | 'timer_started'
    | 'timer_paused'
    | 'timer_resumed'
    | 'timer_completed'
    | 'note_created'
    | 'note_updated'
    | 'note_deleted'
    | 'task_created'
    | 'task_completed'
    | 'task_deleted';

export interface ActivityEvent {
    type: ActivityType;
    timestamp: number;
    data: any;
}

// Custom event name for cross-component communication
const ACTIVITY_EVENT = 'padhega_activity';

/**
 * Activity Logger Hook
 * Provides methods to log activities and listen to activity events
 */
export const useActivityLogger = () => {

    /**
     * Log an activity event
     */
    const logActivity = useCallback((type: ActivityType, data: any = {}) => {
        const event: ActivityEvent = {
            type,
            timestamp: Date.now(),
            data,
        };

        // Dispatch custom event for other components to listen
        const customEvent = new CustomEvent(ACTIVITY_EVENT, {
            detail: event
        });
        window.dispatchEvent(customEvent);

        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Activity] ${type}:`, data);
        }
    }, []);

    /**
     * Subscribe to activity events
     */
    const subscribeToActivities = useCallback((
        callback: (event: ActivityEvent) => void,
        filter?: ActivityType[]
    ) => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent<ActivityEvent>;
            const activityEvent = customEvent.detail;

            // Filter by type if provided
            if (filter && !filter.includes(activityEvent.type)) {
                return;
            }

            callback(activityEvent);
        };

        window.addEventListener(ACTIVITY_EVENT, handler);

        // Return cleanup function
        return () => {
            window.removeEventListener(ACTIVITY_EVENT, handler);
        };
    }, []);

    return {
        logActivity,
        subscribeToActivities,
    };
};

/**
 * Hook specifically for logging timer activities
 */
export const useTimerLogger = () => {
    const { logActivity } = useActivityLogger();

    const logTimerStart = useCallback((subject: string, type: string) => {
        logActivity('timer_started', { subject, type });
    }, [logActivity]);

    const logTimerPause = useCallback((elapsedMinutes: number) => {
        logActivity('timer_paused', { elapsedMinutes });
    }, [logActivity]);

    const logTimerResume = useCallback(() => {
        logActivity('timer_resumed', {});
    }, [logActivity]);

    const logTimerComplete = useCallback((
        subject: string,
        type: string,
        duration: number
    ) => {
        logActivity('timer_completed', {
            subject,
            type,
            duration, // in minutes
            date: new Date().toISOString(),
        });
    }, [logActivity]);

    return {
        logTimerStart,
        logTimerPause,
        logTimerResume,
        logTimerComplete,
    };
};

/**
 * Hook specifically for logging note activities
 */
export const useNoteLogger = () => {
    const { logActivity } = useActivityLogger();

    const logNoteCreated = useCallback((noteId: string, subject?: string) => {
        logActivity('note_created', { noteId, subject });
    }, [logActivity]);

    const logNoteUpdated = useCallback((noteId: string) => {
        logActivity('note_updated', { noteId });
    }, [logActivity]);

    const logNoteDeleted = useCallback((noteId: string) => {
        logActivity('note_deleted', { noteId });
    }, [logActivity]);

    return {
        logNoteCreated,
        logNoteUpdated,
        logNoteDeleted,
    };
};

/**
 * Hook specifically for logging task activities
 */
export const useTaskLogger = () => {
    const { logActivity } = useActivityLogger();

    const logTaskCreated = useCallback((taskId: string, text: string) => {
        logActivity('task_created', { taskId, text });
    }, [logActivity]);

    const logTaskCompleted = useCallback((taskId: string, text: string) => {
        logActivity('task_completed', { taskId, text });
    }, [logActivity]);

    const logTaskDeleted = useCallback((taskId: string) => {
        logActivity('task_deleted', { taskId });
    }, [logActivity]);

    return {
        logTaskCreated,
        logTaskCompleted,
        logTaskDeleted,
    };
};
