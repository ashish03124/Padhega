import { useState, useEffect, useCallback } from 'react';
import {
    StudySession,
    Goal,
    StatsMetrics,
    ActivityLog,
    SubjectData,
    DailyData,
} from '../lib/statsTypes';
import { useActivityLogger } from './useActivityLogger';
import { useAuth } from '../context/AuthContext';

// Helper to get robust YYYY-MM-DD in LOCAL time
const formatDateLocal = (dateInput: string | number | Date) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const useStatsData = () => {
    const { status } = useAuth();
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [metrics, setMetrics] = useState<StatsMetrics>({
        todayHours: 0,
        weekHours: 0,
        monthHours: 0,
        totalHours: 0,
        currentStreak: 0,
        longestStreak: 0,
        focusScore: 0,
        efficiency: 0,
        retention: 0,
        xp: 0,
        level: 1,
    });
    const [extraActivities, setExtraActivities] = useState<ActivityLog[]>([]);
    const [fetchedActivities, setFetchedActivities] = useState<ActivityLog[]>([]);

    const fetchData = useCallback(async () => {
        if (status !== 'authenticated') return;

        try {
            // Fetch sessions with cache busting
            const sessionsRes = await fetch(`/api/sessions?t=${Date.now()}`);
            const sessionsData = await sessionsRes.json();

            if (Array.isArray(sessionsData)) {
                setSessions(sessionsData.map((s: any) => ({
                    id: s._id,
                    subject: s.subject,
                    type: s.type,
                    duration: s.duration,
                    date: s.date,
                    timestamp: new Date(s.date).getTime(),
                })));
            }

            // Fetch goals
            const goalsRes = await fetch(`/api/goals?t=${Date.now()}`);
            const goalsData = await goalsRes.json();

            if (Array.isArray(goalsData)) {
                setGoals(goalsData.map((g: any) => ({
                    id: g._id,
                    name: g.name,
                    targetValue: g.targetValue,
                    currentValue: g.currentValue,
                    unit: g.unit,
                    timeFrame: g.timeFrame,
                    deadline: g.deadline,
                    isActive: g.isActive,
                    createdAt: new Date(g.createdAt).getTime(),
                })));
            }

            // Fetch other activities (tasks and notes) to populate history
            const tasksRes = await fetch(`/api/tasks?t=${Date.now()}`);
            const tasksData = await tasksRes.json();
            const notesRes = await fetch(`/api/notes?t=${Date.now()}`);
            const notesData = await notesRes.json();

            const otherActivities: ActivityLog[] = [];

            if (Array.isArray(tasksData)) {
                tasksData.filter((t: any) => t.isCompleted).forEach((t: any) => {
                    otherActivities.push({
                        id: `task-${t._id}`,
                        timestamp: new Date(t.completedAt || t.updatedAt).getTime(),
                        activity: `Completed task: ${t.text}`,
                        subject: 'Task',
                        duration: 0,
                        icon: '✅'
                    });
                });
            }

            if (Array.isArray(notesData)) {
                notesData.forEach((n: any) => {
                    otherActivities.push({
                        id: `note-${n._id}`,
                        timestamp: new Date(n.createdAt).getTime(),
                        activity: `Created note: ${n.title}`,
                        subject: 'Note',
                        duration: 0,
                        icon: '📝'
                    });
                });
            }

            setFetchedActivities(otherActivities);

            // Fetch current User XP/Level
            const xpRes = await fetch(`/api/user/xp?t=${Date.now()}`);
            const xpData = await xpRes.json();
            if (xpData.xp !== undefined) {
                setMetrics(prev => ({
                    ...prev,
                    xp: xpData.xp,
                    level: xpData.level
                }));
            }
        } catch (err) {
            console.error("Error fetching stats data:", err);
        }
    }, [status]);

    // Load data from API on mount/auth
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Activity logger for cross-page data sharing
    const { subscribeToActivities } = useActivityLogger();


    // Calculate metrics whenever sessions or other activities change
    useEffect(() => {
        const now = Date.now();
        const todayStr = formatDateLocal(now);
        const weekAgoDate = formatDateLocal(now - 7 * 24 * 60 * 60 * 1000);
        const monthAgoDate = formatDateLocal(now - 30 * 24 * 60 * 60 * 1000);

        if (!todayStr) return;

        const todayHours = sessions
            .filter((s) => formatDateLocal(s.date) === todayStr)
            .reduce((sum, s) => sum + s.duration, 0) / 60;

        const weekHours = sessions
            .filter((s) => {
                const ds = formatDateLocal(s.date);
                return ds && weekAgoDate && ds >= weekAgoDate;
            })
            .reduce((sum, s) => sum + s.duration, 0) / 60;

        const monthHours = sessions
            .filter((s) => {
                const ds = formatDateLocal(s.date);
                return ds && monthAgoDate && ds >= monthAgoDate;
            })
            .reduce((sum, s) => sum + s.duration, 0) / 60;

        const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;

        // Calculate streak based on ALL activities (sessions, tasks, notes)
        const allDates = new Set<string>();

        sessions.forEach(s => {
            const d = formatDateLocal(s.date);
            if (d) allDates.add(d);
        });

        fetchedActivities.forEach(a => {
            const d = formatDateLocal(a.timestamp);
            if (d) allDates.add(d);
        });

        extraActivities.forEach(a => {
            const d = formatDateLocal(a.timestamp);
            if (d) allDates.add(d);
        });

        const sortedDates = Array.from(allDates).sort();

        const { currentStreak, longestStreak } = calculateStreakFromDates(sortedDates);
        const focusScore = calculateFocusScore(sessions);
        const efficiency = calculateEfficiency(sessions);
        const retention = 85;

        setMetrics(prev => ({
            ...prev,
            todayHours: Math.round(todayHours * 10) / 10,
            weekHours: Math.round(weekHours * 10) / 10,
            monthHours: Math.round(monthHours * 10) / 10,
            totalHours: Math.round(totalHours * 10) / 10,
            currentStreak,
            longestStreak,
            focusScore,
            efficiency,
            retention,
        }));
    }, [sessions, fetchedActivities, extraActivities]);

    const addSession = useCallback(async (session: Omit<StudySession, 'id'>) => {
        if (status !== 'authenticated') return;

        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(session),
            });

            if (response.ok) {
                const s = await response.json();
                const newSession: StudySession = {
                    ...session,
                    id: s._id,
                    timestamp: new Date(s.date).getTime(),
                };
                setSessions((prev) => [...prev, newSession]);
            }
        } catch (err) {
            console.error("Error adding session:", err);
        }
    }, [status]);

    // Subscribe to multiple activity events
    useEffect(() => {
        const unsubscribe = subscribeToActivities((event) => {
            if (event.type === 'timer_completed') {
                // Refetch sessions to get the newly persisted one from backend
                // This prevents double-saving and double-counting
                fetchData();
            } else if (event.type === 'task_completed') {
                const { text } = event.data;
                setExtraActivities(prev => [{
                    id: `task-${Date.now()}`,
                    timestamp: event.timestamp,
                    activity: `Completed task: ${text}`,
                    subject: 'Task',
                    duration: 0,
                    icon: '✅'
                }, ...prev].slice(0, 20));
            } else if (event.type === 'note_created') {
                setExtraActivities(prev => [{
                    id: `note-${Date.now()}`,
                    timestamp: event.timestamp,
                    activity: `Created new study note`,
                    subject: 'Note',
                    duration: 0,
                    icon: '📝'
                }, ...prev].slice(0, 20));
            }
        });

        return unsubscribe;
    }, [subscribeToActivities, fetchData]);

    const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) => {
        if (status !== 'authenticated') return;

        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goal),
            });

            if (response.ok) {
                const g = await response.json();
                const newGoal: Goal = {
                    ...goal,
                    id: g._id,
                    createdAt: new Date(g.createdAt).getTime(),
                    currentValue: 0,
                };
                setGoals((prev) => [...prev, newGoal]);
            }
        } catch (err) {
            console.error("Error adding goal:", err);
        }
    }, [status]);

    const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
        if (status !== 'authenticated') return;

        try {
            const response = await fetch('/api/goals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });

            if (response.ok) {
                setGoals((prev) =>
                    prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
                );
            }
        } catch (err) {
            console.error("Error updating goal:", err);
        }
    }, [status]);

    const deleteGoal = useCallback(async (id: string) => {
        if (status !== 'authenticated') return;

        try {
            const response = await fetch(`/api/goals?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setGoals((prev) => prev.filter((goal) => goal.id !== id));
            }
        } catch (err) {
            console.error("Error deleting goal:", err);
        }
    }, [status]);

    const getActivityLog = useCallback((): ActivityLog[] => {
        const sessionActivities: ActivityLog[] = sessions.map((session) => ({
            id: session.id,
            timestamp: session.timestamp,
            activity: `Completed ${session.subject} ${session.type}`,
            subject: session.subject,
            duration: session.duration,
            icon: session.subject.charAt(0).toUpperCase() || 'S',
        }));

        const merged = [...sessionActivities, ...extraActivities, ...fetchedActivities];

        // Remove duplicates (by ID) if any
        const seen = new Set();
        const unique = merged.filter(a => {
            if (seen.has(a.id)) return false;
            seen.add(a.id);
            return true;
        });

        return unique
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 15);
    }, [sessions, extraActivities, fetchedActivities]);

    const getSubjectBreakdown = useCallback((): SubjectData[] => {
        const subjectMap = new Map<string, number>();
        let totalMinutes = 0;

        sessions.forEach((session) => {
            const current = subjectMap.get(session.subject) || 0;
            subjectMap.set(session.subject, current + session.duration);
            totalMinutes += session.duration;
        });

        const colors = [
            'rgba(99, 102, 241, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(34, 197, 94, 0.8)',
        ];

        return Array.from(subjectMap.entries())
            .map(([name, minutes], index) => ({
                name,
                hours: Math.round((minutes / 60) * 10) / 10,
                percentage: Math.round((minutes / totalMinutes) * 100),
                color: colors[index % colors.length],
            }))
            .sort((a, b) => b.hours - a.hours);
    }, [sessions]);

    const getDailyData = useCallback((days: number = 7): DailyData[] => {
        const dailyMap = new Map<string, DailyData>();
        const now = Date.now();
        const startDateStr = formatDateLocal(now - (days - 1) * 24 * 60 * 60 * 1000);

        if (!startDateStr) return [];

        sessions
            .filter((s) => {
                const ds = formatDateLocal(s.date);
                return ds && ds >= startDateStr;
            })
            .forEach((session) => {
                const date = formatDateLocal(session.date);
                if (!date) return;
                const existing = dailyMap.get(date);

                if (existing) {
                    existing.hours += session.duration / 60;
                    existing.sessions += 1;
                    if (!existing.subjects.includes(session.subject)) {
                        existing.subjects.push(session.subject);
                    }
                } else {
                    dailyMap.set(date, {
                        date,
                        hours: session.duration / 60,
                        sessions: 1,
                        subjects: [session.subject],
                    });
                }
            });

        return Array.from(dailyMap.values()).sort((a, b) =>
            a.date.localeCompare(b.date)
        );
    }, [sessions]);

    const getActivityMap = useCallback((): Record<string, number> => {
        const map: Record<string, number> = {};

        // Helper to increment count for a date string
        const increment = (date: string) => {
            map[date] = (map[date] || 0) + 1;
        };

        // Track sessions
        sessions.forEach(s => {
            const d = formatDateLocal(s.date);
            if (d) increment(d);
        });

        // Track fetched (historical) activities
        fetchedActivities.forEach(a => {
            const d = formatDateLocal(a.timestamp);
            if (d) increment(d);
        });

        // Track extra (live session) activities
        extraActivities.forEach(a => {
            const d = formatDateLocal(a.timestamp);
            if (d) increment(d);
        });

        return map;
    }, [sessions, fetchedActivities, extraActivities]);

    return {
        sessions,
        goals,
        metrics,
        addSession,
        addGoal,
        updateGoal,
        deleteGoal,
        getActivityLog,
        getSubjectBreakdown,
        getDailyData,
        getActivityMap,
    };
};

// Helper function to calculate streak from a sorted list of YYYY-MM-DD strings
function calculateStreakFromDates(dates: string[]): {
    currentStreak: number;
    longestStreak: number;
} {
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const now = new Date();
    const today = formatDateLocal(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = formatDateLocal(yesterdayDate);

    if (!today || !yesterday) return { currentStreak: 0, longestStreak: 0 };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Calculate current streak (must include today or yesterday)
    if (dates.includes(today) || dates.includes(yesterday)) {
        currentStreak = 1;
        let checkDate = dates.includes(today)
            ? new Date(today)
            : new Date(yesterday);

        for (let i = dates.length - 2; i >= 0; i--) {
            const prevDate = new Date(dates[i]);
            const diff = Math.floor(
                (checkDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diff === 1) {
                currentStreak++;
                checkDate = prevDate;
            } else if (diff > 1) {
                break;
            }
        }
    }

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diff = Math.floor(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { currentStreak, longestStreak };
}

// Calculate focus score based on completion rate
function calculateFocusScore(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    // Consider sessions over 20 minutes as "focused"
    const focusedSessions = sessions.filter((s) => s.duration >= 20).length;
    const score = (focusedSessions / sessions.length) * 100;

    return Math.round(score);
}

// Calculate efficiency based on average session length
function calculateEfficiency(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    const avgDuration =
        sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

    // Optimal session length is around 45-50 minutes
    const optimalDuration = 47.5;
    const efficiency = Math.min((avgDuration / optimalDuration) * 100, 100);

    return Math.round(efficiency);
}
