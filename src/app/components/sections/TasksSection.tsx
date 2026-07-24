import React, { useState } from 'react';
import './tasks-styles.css';
import { CATEGORIES, SubTask, Task } from '../../../app/hooks/useTasks';

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
    addTask: (dueDate?: Date, subtasks?: SubTask[]) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    toggleSubTask: (taskId: string, subTaskId: string) => void;
    addSubTask: (taskId: string, text: string) => void;
    deleteSubTask: (taskId: string, subTaskId: string) => void;
    updateTaskDueDate: (taskId: string, dueDate: Date | null) => void;
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
    toggleSubTask,
    addSubTask,
    deleteSubTask,
    updateTaskDueDate,
    completedCount,
    totalCount,
    filteredTasks,
}) => {
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [inputDueDate, setInputDueDate] = useState('');
    const showInputOptions = isFocused || newTask.length > 0 || inputDueDate.length > 0;

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

    const handleAddTask = () => {
        if (!newTask.trim()) return;
        addTask(inputDueDate ? new Date(inputDueDate) : undefined);
        setInputDueDate('');
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
                                <i className={cat.icon}></i> {cat.name}
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
                            handleAddTask();
                        }
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <button
                    className="btn btn-primary"
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                    onClick={() => {
                        handleAddTask();
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

                    <div className="input-date-selector">
                        <label onMouseDown={(e) => e.preventDefault()}>
                            <i className="far fa-calendar-alt"></i> Due Date:
                        </label>
                        <input
                            type="date"
                            className="input-due-date"
                            value={inputDueDate}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => setInputDueDate(e.target.value)}
                        />
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
                        const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
                        const formattedDueDate = task.dueDate 
                            ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
                            : '';
                        
                        return (
                            <li
                                key={task.id}
                                className={`task-item ${deletingTaskId === task.id ? 'deleting' : ''} ${expandedTaskId === task.id ? 'expanded' : ''}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="task-item-main">
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
                                            {formattedDueDate && (
                                                <span className={`due-date-badge ${isOverdue ? 'overdue' : ''}`}>
                                                    <i className="far fa-calendar-alt"></i> {formattedDueDate}
                                                    {isOverdue && ' (Overdue)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="task-item-actions">
                                        <button 
                                            className={`expand-subtasks-btn ${expandedTaskId === task.id ? 'active' : ''}`}
                                            onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                            title="Toggle Sub-tasks"
                                        >
                                            <i className={`fas fa-${expandedTaskId === task.id ? 'chevron-up' : 'chevron-down'}`}></i>
                                            <span>Sub-tasks ({task.subtasks?.length || 0})</span>
                                        </button>
                                        <i
                                            className="fas fa-trash task-delete"
                                            onClick={() => handleDeleteTask(task.id)}
                                        ></i>
                                    </div>
                                </div>

                                {expandedTaskId === task.id && (
                                    <div className="task-expanded-panel">
                                        {/* Due Date Editor */}
                                        <div className="inline-due-date-editor">
                                            <label><i className="far fa-calendar-alt"></i> Edit Due Date: </label>
                                            <input
                                                type="date"
                                                className="inline-date-input"
                                                value={task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : ''}
                                                onChange={(e) => {
                                                    const dateVal = e.target.value;
                                                    updateTaskDueDate(task.id, dateVal ? new Date(dateVal) : null);
                                                }}
                                            />
                                        </div>

                                        {/* Sub-tasks Section */}
                                        <div className="subtasks-wrapper">
                                            <h4>Sub-tasks Checklist</h4>
                                            {task.subtasks && task.subtasks.length > 0 ? (
                                                <ul className="subtask-list">
                                                    {task.subtasks.map(st => (
                                                        <li key={st.id} className="subtask-item">
                                                            <input
                                                                type="checkbox"
                                                                className="subtask-checkbox"
                                                                checked={st.isCompleted}
                                                                onChange={() => toggleSubTask(task.id, st.id)}
                                                            />
                                                            <span className={`subtask-text ${st.isCompleted ? 'completed' : ''}`}>
                                                                {st.text}
                                                            </span>
                                                            <i
                                                                className="fas fa-times delete-subtask-btn"
                                                                onClick={() => deleteSubTask(task.id, st.id)}
                                                            ></i>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="no-subtasks">No sub-tasks yet. Break your task down!</p>
                                            )}

                                            {/* Add Sub-task form */}
                                            <div className="add-subtask-form">
                                                <input
                                                    type="text"
                                                    placeholder="Add a sub-task..."
                                                    className="subtask-input-field"
                                                    id={`subtask-input-${task.id}`}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const target = e.target as HTMLInputElement;
                                                            if (target.value.trim()) {
                                                                addSubTask(task.id, target.value.trim());
                                                                target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    className="btn-add-subtask"
                                                    onClick={() => {
                                                        const inputEl = document.getElementById(`subtask-input-${task.id}`) as HTMLInputElement;
                                                        if (inputEl && inputEl.value.trim()) {
                                                            addSubTask(task.id, inputEl.value.trim());
                                                            inputEl.value = '';
                                                        }
                                                    }}
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })
                )}
            </ul>
        </section>
    );
};

export default TasksSection;
