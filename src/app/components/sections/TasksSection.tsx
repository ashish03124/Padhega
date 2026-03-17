import React, { useState } from 'react';
import './tasks-styles.css';
import { CATEGORIES } from '../../../app/hooks/useTasks';

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

interface TasksSectionProps {
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

const TasksSection: React.FC<TasksSectionProps> = ({
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
}) => {
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [showInputOptions, setShowInputOptions] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Progress Ring SVG calculation
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

    const handleDeleteTask = (id: string) => {
        setDeletingTaskId(id);
        setTimeout(() => {
            deleteTask(id);
            setDeletingTaskId(null);
        }, 300);
    };

    const getCategoryData = (categoryId: string) => {
        return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
    };

    return (
        <section className="tasks-box" id="stats">
            {/* Header */}
            <div className="section-header">
                <h2><i className="fas fa-tasks"></i> Study Tasks</h2>
                <div className="task-stats">
                    <div className="xp-display">
                        <div className="level-badge">L{level}</div>
                        <span className="xp-text">{totalXP} XP</span>
                    </div>
                </div>
            </div>

            {/* Progress Ring */}
            <div className="progress-ring-container">
                <div className="progress-ring">
                    <svg width="120" height="120">
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="rgba(48, 82, 41, 0.2)"
                            strokeWidth="8"
                        />
                        <circle
                            className="progress-ring-circle"
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#305229" />
                                <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="progress-ring-text">
                        <div className="progress-percentage">{Math.round(completionPercentage)}%</div>
                        <div className="progress-label">{completedCount}/{totalCount}</div>
                    </div>
                </div>
            </div>

            {/* Filter Toggle Button */}
            {tasks.length > 0 && (
                <button
                    className="filter-toggle-btn"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <i className="fas fa-filter"></i> {showFilters ? 'Hide' : 'Show'} Filters
                </button>
            )}

            {/* Filters (collapsible) */}
            {showFilters && (
                <>
                    <div className="task-filters">
                        <button
                            className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('all')}
                        >
                            All
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`filter-btn ${filterCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setFilterCategory(cat.id)}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Priority Filters */}
                    <div className="task-filters">
                        <button
                            className={`filter-btn ${filterPriority === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterPriority('all')}
                        >
                            All Priorities
                        </button>
                        <button
                            className={`filter-btn ${filterPriority === 'high' ? 'active' : ''}`}
                            onClick={() => setFilterPriority('high')}
                        >
                            <i className="fas fa-circle" style={{ color: '#EF4444' }}></i> High
                        </button>
                        <button
                            className={`filter-btn ${filterPriority === 'medium' ? 'active' : ''}`}
                            onClick={() => setFilterPriority('medium')}
                        >
                            <i className="fas fa-circle" style={{ color: '#F59E0B' }}></i> Medium
                        </button>
                        <button
                            className={`filter-btn ${filterPriority === 'low' ? 'active' : ''}`}
                            onClick={() => setFilterPriority('low')}
                        >
                            <i className="fas fa-circle" style={{ color: '#10B981' }}></i> Low
                        </button>
                    </div>
                </>
            )}

            {/* Task Input */}
            <div className="task-input-group">
                <input
                    type="text"
                    className="task-input"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            addTask();
                            setShowInputOptions(false);
                        }
                    }}
                    onFocus={() => setShowInputOptions(true)}
                    onBlur={() => setShowInputOptions(false)}
                />
                <button
                    className="btn btn-primary"
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                    onClick={() => {
                        addTask();
                        setShowInputOptions(false);
                    }}
                >
                    <i className="fas fa-plus"></i> Add
                </button>
            </div>

            {/* Priority and Category Selectors (shown when input focused) */}
            {showInputOptions && (
                <div className="input-options-container">
                    <div className="priority-selector">
                        <button
                            className={`priority-btn ${priority === 'high' ? 'active high' : ''}`}
                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                            onClick={() => setPriority('high')}
                        >
                            <i className="fas fa-circle" style={{ color: '#EF4444' }}></i> High
                        </button>
                        <button
                            className={`priority-btn ${priority === 'medium' ? 'active medium' : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setPriority('medium')}
                        >
                            <i className="fas fa-circle" style={{ color: '#F59E0B' }}></i> Medium
                        </button>
                        <button
                            className={`priority-btn ${priority === 'low' ? 'active low' : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setPriority('low')}
                        >
                            <i className="fas fa-circle" style={{ color: '#10B981' }}></i> Low
                        </button>
                    </div>

                    <div className="category-selector">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-btn ${category === cat.id ? 'active' : ''}`}
                                style={{
                                    borderColor: category === cat.id ? cat.color : undefined,
                                    color: category === cat.id ? cat.color : undefined,
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setCategory(cat.id)}
                            >
                                <span><i className={cat.icon}></i></span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Task List */}
            <ul className="task-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-check-circle"></i>
                        <p>No tasks yet. Add one to get started!</p>
                    </div>
                ) : (
                    filteredTasks.map((task, index) => {
                        const categoryData = getCategoryData(task.category);
                        return (
                            <li
                                key={task.id}
                                className={`task-item ${deletingTaskId === task.id ? 'deleting' : ''}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <input
                                    type="checkbox"
                                    className="task-checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                />
                                <div className="task-content">
                                    <span className={`task-text ${task.completed ? 'task-completed' : ''}`}>
                                        {task.text}
                                    </span>
                                    <div className="task-meta">
                                        <span className={`priority-badge ${task.priority}`}>
                                            {task.priority === 'high' && <i className="fas fa-circle" style={{ color: '#EF4444' }}></i>}
                                            {task.priority === 'medium' && <i className="fas fa-circle" style={{ color: '#F59E0B' }}></i>}
                                            {task.priority === 'low' && <i className="fas fa-circle" style={{ color: '#10B981' }}></i>}
                                            {' '}{task.priority}
                                        </span>
                                        <span
                                            className="category-pill"
                                            style={{
                                                backgroundColor: `${categoryData.color}20`,
                                                borderColor: categoryData.color,
                                                color: categoryData.color,
                                            }}
                                        >
                                            <i className={categoryData.icon}></i> {categoryData.name}
                                        </span>
                                        <span className="xp-badge">+{task.xpValue} XP</span>
                                    </div>
                                </div>
                                <i
                                    className="fas fa-trash task-delete"
                                    onClick={() => handleDeleteTask(task.id)}
                                ></i>
                            </li>
                        );
                    })
                )}
            </ul>
        </section>
    );
};

export default TasksSection;
