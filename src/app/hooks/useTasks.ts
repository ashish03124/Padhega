"use client";

import { useState, useEffect } from 'react';
import { useTaskLogger } from './useActivityLogger';
import { useAuth } from '../context/AuthContext';

interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    category: string;
    createdAt: Date;
    completedAt?: Date;
    xpValue: number;
}

interface UseTasksReturn {
    tasks: Task[];
    newTask: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    filterCategory: string;
    filterPriority: string;
    totalXP: number;
    level: number;
    setNewTask: (task: string) => void;
    setPriority: (priority: 'high' | 'medium' | 'low') => void;
    setCategory: (category: string) => void;
    setFilterCategory: (category: string) => void;
    setFilterPriority: (priority: string) => void;
    addTask: () => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    completedCount: number;
    totalCount: number;
    filteredTasks: Task[];
}

const CATEGORIES = [
    { id: 'study', name: 'Study', icon: 'fas fa-book-reader', color: '#8B5CF6' },
    { id: 'assignment', name: 'Assignment', icon: 'fas fa-file-alt', color: '#3B82F6' },
    { id: 'lab', name: 'Lab Work', icon: 'fas fa-vial', color: '#EC4899' },
    { id: 'reading', name: 'Reading', icon: 'fas fa-book-open', color: '#6366F1' },
    { id: 'exam', name: 'Exam Prep', icon: 'fas fa-bullseye', color: '#F59E0B' },
    { id: 'practice', name: 'Practice', icon: 'fas fa-pencil-alt', color: '#10B981' },
];

const XP_VALUES = {
    low: 10,
    medium: 30,
    high: 50,
};

const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    return 5;
};

export const useTasks = (): UseTasksReturn => {
    const { status } = useAuth(); // Added useAuth hook
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [category, setCategory] = useState('study');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [totalXP, setTotalXP] = useState(0);

    // Activity logger for tracking task actions
    const { logTaskCreated, logTaskCompleted, logTaskDeleted } = useTaskLogger();

    // Fetch tasks and XP on mount/auth
    useEffect(() => {
        const fetchData = async () => {
            if (status !== 'authenticated') return;

            try {
                // Fetch tasks
                const taskRes = await fetch('/api/tasks');
                const taskData = await taskRes.json();

                if (Array.isArray(taskData)) {
                    const mappedTasks: Task[] = taskData.map((t: any) => ({
                        id: t._id,
                        text: t.text,
                        completed: t.isCompleted,
                        priority: t.priority || 'medium',
                        category: t.category || 'study',
                        createdAt: new Date(t.createdAt),
                        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
                        xpValue: XP_VALUES[t.priority as 'high' | 'medium' | 'low'] || 30,
                    }));
                    setTasks(mappedTasks);
                }

                // Fetch XP
                const xpRes = await fetch('/api/user/xp');
                const xpData = await xpRes.json();
                if (xpData.xp !== undefined) {
                    setTotalXP(xpData.xp);
                }
            } catch (err) {
                console.error("Error fetching tasks/XP:", err);
            }
        };

        fetchData();
    }, [status]);

    const updateRemoteXP = async (xpChange: number) => {
        if (status !== 'authenticated') return;
        try {
            await fetch('/api/user/xp', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xpChange }),
            });
        } catch (err) {
            console.error("Error updating XP:", err);
        }
    };

    const addTask = async () => {
        if (newTask.trim() && status === 'authenticated') {
            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: newTask.trim(),
                        category,
                        priority,
                    }),
                });

                if (response.ok) {
                    const t = await response.json();
                    const newTaskObj: Task = {
                        id: t._id,
                        text: t.text,
                        completed: t.isCompleted,
                        priority: t.priority || priority,
                        category: t.category || category,
                        createdAt: new Date(t.createdAt),
                        xpValue: XP_VALUES[priority],
                    };
                    setTasks([...tasks, newTaskObj]);
                    setNewTask('');
                    setPriority('medium');
                    logTaskCreated(`${newTaskObj.id}`, t.text);
                }
            } catch (err) {
                console.error("Error adding task:", err);
            }
        }
    };

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task || status !== 'authenticated') return;

        const nowCompleted = !task.completed;

        try {
            const response = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    isCompleted: nowCompleted,
                }),
            });

            if (response.ok) {
                setTasks(tasks.map(t => {
                    if (t.id === id) {
                        if (nowCompleted) {
                            setTotalXP(prev => prev + t.xpValue);
                            updateRemoteXP(t.xpValue);
                            logTaskCompleted(`${t.id}`, t.text);
                        } else {
                            setTotalXP(prev => Math.max(0, prev - t.xpValue));
                            updateRemoteXP(-t.xpValue);
                        }
                        return {
                            ...t,
                            completed: nowCompleted,
                            completedAt: nowCompleted ? new Date() : undefined,
                        };
                    }
                    return t;
                }));
            }
        } catch (err) {
            console.error("Error toggling task:", err);
        }
    };

    const deleteTask = async (id: string) => {
        if (status !== 'authenticated') return;

        try {
            const response = await fetch(`/api/tasks?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const taskToDelete = tasks.find(t => t.id === id);
                if (taskToDelete) {
                    if (taskToDelete.completed) {
                        setTotalXP(prev => Math.max(0, prev - taskToDelete.xpValue));
                        updateRemoteXP(-taskToDelete.xpValue);
                    }
                    logTaskDeleted(`${id}`);
                }
                setTasks(tasks.filter(t => t.id !== id));
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const categoryMatch = filterCategory === 'all' || task.category === filterCategory;
        const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
        return categoryMatch && priorityMatch;
    });

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const level = calculateLevel(totalXP);

    return {
        tasks,
        newTask,
        priority,
        category,
        filterCategory,
        filterPriority,
        totalXP,
        level,
        setNewTask,
        setPriority,
        setCategory,
        setFilterCategory,
        setFilterPriority,
        addTask,
        toggleTask,
        deleteTask,
        completedCount,
        totalCount,
        filteredTasks,
    };
};

export { CATEGORIES };
