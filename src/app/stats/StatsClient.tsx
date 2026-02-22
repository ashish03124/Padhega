"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './stats.css';
import { useStatsData } from '../hooks/useStatsData';
import AddGoalModal from '../components/AddGoalModal';
import ActivityHistoryModal from '../components/ActivityHistoryModal';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StatsClient: React.FC = () => {
    const {
        metrics,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        getActivityLog,
        getSubjectBreakdown,
        getDailyData,
        getActivityMap,
    } = useStatsData();

    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Time Chart Data (Last 7 Days)
    const dailyData = useMemo(() => getDailyData(7), [getDailyData]);
    const timeChartData = useMemo(() => ({
        labels: dailyData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }),
        datasets: [
            {
                label: 'Study Hours',
                data: dailyData.map(d => Math.round(d.hours * 10) / 10),
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                tension: 0.4,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    }), [dailyData]);

    // Subject Chart Data
    const subjectData = useMemo(() => getSubjectBreakdown(), [getSubjectBreakdown]);
    const subjectChartData = useMemo(() => ({
        labels: subjectData.length > 0 ? subjectData.map(s => s.name) : ['No Data'],
        datasets: [
            {
                data: subjectData.length > 0 ? subjectData.map(s => s.hours) : [1],
                backgroundColor: subjectData.length > 0
                    ? subjectData.map(s => s.color)
                    : ['rgba(200, 200, 200, 0.2)'],
                borderWidth: 0,
                hoverOffset: 15,
            },
        ],
    }), [subjectData]);

    // Productivity Chart Data
    const productivityChartData = useMemo(() => ({
        labels: dailyData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }),
        datasets: [
            {
                label: 'Sessions Count',
                data: dailyData.map(d => d.sessions),
                backgroundColor: 'rgba(168, 85, 247, 0.6)',
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: 2,
                borderRadius: 0,
            },
        ],
    }), [dailyData]);

    // Peer Comparison Chart Data (Simulated relative to user's average)
    const averageHours = useMemo(() => {
        if (dailyData.length === 0) return 0;
        const total = dailyData.reduce((sum, d) => sum + d.hours, 0);
        return Math.round((total / dailyData.length) * 10) / 10;
    }, [dailyData]);

    const peerComparisonData = useMemo(() => ({
        labels: ['You', 'Class Average', 'Top Performer'],
        datasets: [
            {
                label: 'Daily Average (hours)',
                data: [averageHours, 2.5, 4.5],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(74, 124, 63, 0.8)',
                ],
                borderRadius: 0,
            },
        ],
    }), [averageHours]);

    // Weekly Progress Chart Data
    const weeklyProgressData = useMemo(() => ({
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Hours Studied',
                data: [15, 18, 20, metrics.weekHours],
                fill: true,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderColor: 'rgba(34, 197, 94, 1)',
                tension: 0.4,
            },
        ],
    }), [metrics.weekHours]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    // Generate Heatmap Data (7 rows x 12 columns)
    const heatmapData = useMemo(() => {
        const activityMap = getActivityMap();
        const columns = 14; // Number of weeks to show
        const rows = 7; // Days of week
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Helper for local YYYY-MM-DD
        const getLocalDateString = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const todayStr = getLocalDateString(today);
        const cells = [];
        // Start from the most recent Sunday
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (today.getDay() === 0 ? 0 : today.getDay()));
        startDate.setDate(startDate.getDate() - (columns - 1) * 7);

        for (let c = 0; c < columns; c++) {
            const week = [];
            for (let r = 0; r < rows; r++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (c * 7) + r);
                const dateStr = getLocalDateString(currentDate);
                const count = activityMap[dateStr] || 0;

                // Level based on activity intensity
                let level = 0;
                if (count > 0 && count <= 2) level = 1;
                else if (count > 2 && count <= 5) level = 2;
                else if (count > 5 && count <= 10) level = 3;
                else if (count > 10) level = 4;

                week.push({
                    date: dateStr,
                    count,
                    level,
                    isToday: dateStr === todayStr,
                    isFuture: currentDate > today
                });
            }
            cells.push(week);
        }
        return cells;
    }, [getActivityMap]);

    return (
        <div className="stats-page">
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <main className="stats-container">
                <section className="stats-hero">
                    <div className="hero-content">
                        <h1>Your Learning Analytics</h1>
                        <p>Track your progress, identify patterns, and optimize your study habits</p>
                    </div>
                    <div className="time-range-selector">
                        <button
                            className={`time-range-btn ${timeRange === 'week' ? 'active' : ''}`}
                            onClick={() => setTimeRange('week')}
                        >
                            Week
                        </button>
                        <button
                            className={`time-range-btn ${timeRange === 'month' ? 'active' : ''}`}
                            onClick={() => setTimeRange('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`time-range-btn ${timeRange === 'year' ? 'active' : ''}`}
                            onClick={() => setTimeRange('year')}
                        >
                            Year
                        </button>
                    </div>
                </section>

                {/* Quick Stats Overview */}
                <section className="quick-stats">
                    <div className="stat-pill">
                        <div className="stat-pill-icon"><i className="fas fa-star" style={{ color: '#F59E0B' }}></i></div>
                        <div className="stat-pill-content">
                            <span className="stat-pill-value">Lvl {metrics.level}</span>
                            <span className="stat-pill-label">{metrics.xp} XP</span>
                        </div>
                    </div>
                    <div className="stat-pill">
                        <div className="stat-pill-icon"><i className="fas fa-fire" style={{ color: '#EF4444' }}></i></div>
                        <div className="stat-pill-content">
                            <span className="stat-pill-value">{metrics.currentStreak} days</span>
                            <span className="stat-pill-label">Current Streak</span>
                        </div>
                    </div>
                    <div className="stat-pill">
                        <div className="stat-pill-icon"><i className="fas fa-stopwatch" style={{ color: '#10b981' }}></i></div>
                        <div className="stat-pill-content">
                            <span className="stat-pill-value">{metrics.todayHours}h</span>
                            <span className="stat-pill-label">Today</span>
                        </div>
                    </div>
                    <div className="stat-pill">
                        <div className="stat-pill-icon"><i className="fas fa-chart-bar" style={{ color: '#10B981' }}></i></div>
                        <div className="stat-pill-content">
                            <span className="stat-pill-value">{metrics.focusScore}%</span>
                            <span className="stat-pill-label">Focus Score</span>
                        </div>
                    </div>
                </section>

                <div className="stats-grid">
                    {/* Streak Section */}
                    <div className="stat-card streak-card">
                        <div className="card-header">
                            <h2>
                                <span className="card-icon"><i className="fas fa-fire" style={{ color: '#EF4444' }}></i></span>
                                Current Streak
                            </h2>
                            <div className="streak-badge">{metrics.currentStreak} days</div>
                        </div>
                        <div className="streak-display">
                            <div className="heatmap-container">
                                <div className="heatmap-labels">
                                    <span>Mon</span>
                                    <span>Wed</span>
                                    <span>Fri</span>
                                </div>
                                <div className="heatmap-grid">
                                    {heatmapData.map((week, wIndex) => (
                                        <div key={wIndex} className="heatmap-column">
                                            {week.map((day, dIndex) => (
                                                <div
                                                    key={`${wIndex}-${dIndex}`}
                                                    className={`heatmap-cell level-${day.level} ${day.isToday ? 'today' : ''} ${day.isFuture ? 'future' : ''}`}
                                                    title={`${day.date}: ${day.count} activities`}
                                                ></div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="heatmap-legend">
                                <span>Less</span>
                                <div className="heatmap-cell level-0"></div>
                                <div className="heatmap-cell level-1"></div>
                                <div className="heatmap-cell level-2"></div>
                                <div className="heatmap-cell level-3"></div>
                                <div className="heatmap-cell level-4"></div>
                                <span>More</span>
                            </div>
                        </div>
                        <div className="streak-message">
                            {metrics.currentStreak > 5 ? (
                                <>Keep going! You're on fire! <i className="fas fa-fire" style={{ color: '#EF4444' }}></i></>
                            ) : (
                                <>You're doing great! Keep it up! <i className="fas fa-dumbbell" style={{ color: '#305229' }}></i></>
                            )}
                        </div>
                    </div>

                    {/* Time Tracking Section */}
                    <div className="stat-card time-card">
                        <div className="card-header">
                            <h2>
                                <span className="card-icon"><i className="fas fa-stopwatch" style={{ color: '#10b981' }}></i></span>
                                Study Time
                            </h2>
                        </div>
                        <div className="time-stats">
                            <div className="time-metric">
                                <span className="time-value">{metrics.todayHours}</span>
                                <span className="time-label">hours today</span>
                            </div>
                            <div className="time-metric">
                                <span className="time-value">{metrics.weekHours}</span>
                                <span className="time-label">this week</span>
                            </div>
                            <div className="time-metric">
                                <span className="time-value">{metrics.totalHours}</span>
                                <span className="time-label">total hours</span>
                            </div>
                        </div>
                        <div className="chart-container">
                            <Line data={timeChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Productivity Section */}
                    <div className="stat-card productivity-card">
                        <div className="card-header">
                            <h2>
                                <span className="card-icon"><i className="fas fa-bolt" style={{ color: '#F59E0B' }}></i></span>
                                Productivity
                            </h2>
                        </div>
                        <div className="productivity-metrics">
                            <div className="metric-circle">
                                <div className="metric-value">{metrics.focusScore}%</div>
                                <div className="metric-label">Focus</div>
                            </div>
                            <div className="metric-circle">
                                <div className="metric-value">{metrics.efficiency}%</div>
                                <div className="metric-label">Efficiency</div>
                            </div>
                            <div className="metric-circle">
                                <div className="metric-value">{metrics.retention}%</div>
                                <div className="metric-label">Retention</div>
                            </div>
                        </div>
                        <div className="chart-container">
                            <Bar data={productivityChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Goals Section */}
                    <div className="stat-card goals-card">
                        <div className="card-header">
                            <h2>
                                <span className="card-icon"><i className="fas fa-bullseye" style={{ color: '#EF4444' }}></i></span>
                                Goals Progress
                            </h2>
                        </div>
                        <div className="goals-list">
                            {goals.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '2rem',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.95rem'
                                }}>
                                    No goals yet. Click "Add New Goal" to get started! <i className="fas fa-bullseye" style={{ color: '#EF4444' }}></i>
                                </div>
                            ) : (
                                goals.map((goal) => {
                                    // Calculate progress based on goal timeframe
                                    let currentProgress = 0;
                                    if (goal.timeFrame === 'daily') {
                                        currentProgress = goal.unit === 'hours' ? metrics.todayHours : metrics.todayHours * 60;
                                    } else if (goal.timeFrame === 'weekly') {
                                        currentProgress = goal.unit === 'hours' ? metrics.weekHours : metrics.weekHours * 60;
                                    } else if (goal.timeFrame === 'monthly') {
                                        currentProgress = goal.unit === 'hours' ? metrics.monthHours : metrics.monthHours * 60;
                                    }

                                    const progressPercentage = Math.min((currentProgress / goal.targetValue) * 100, 100);

                                    return (
                                        <div key={goal.id} className="goal-item">
                                            <div className="goal-header">
                                                <span className="goal-name">{goal.name}</span>
                                                <span className="goal-progress">
                                                    {Math.round(currentProgress * 10) / 10}/{goal.targetValue} {goal.unit}
                                                </span>
                                            </div>
                                            <div className="goal-bar">
                                                <div
                                                    className="goal-progress-bar"
                                                    style={{ width: `${Math.round(progressPercentage)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <button className="add-goal-btn" onClick={() => setShowGoalModal(true)}>
                            <span className="btn-icon">+</span>
                            Add New Goal
                        </button>
                    </div>

                    {/* Activity Timeline */}
                    <div className="stat-card timeline-card">
                        <div className="card-header">
                            <h2>
                                <span className="card-icon"><i className="fas fa-calendar-alt" style={{ color: '#305229' }}></i></span>
                                Recent Activity
                            </h2>
                        </div>
                        <div className="timeline">
                            {getActivityLog().length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                                    No recent activity recorded yet.
                                </div>
                            ) : (
                                getActivityLog().map((activity) => (
                                    <div key={activity.id} className="timeline-item">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-time">
                                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="timeline-activity">
                                                <span className={`activity-icon ${activity.subject.toLowerCase()}`}>
                                                    {activity.icon}
                                                </span>
                                                <span>{activity.activity} {activity.duration > 0 ? `(${activity.duration} mins)` : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="view-all-btn" onClick={() => setShowHistoryModal(true)}>View Full History →</button>
                    </div>
                </div>

                {/* Comparative Analytics */}
                <section className="comparison-section">
                    <div className="section-header">
                        <h2>Comparative Analytics</h2>
                        <p>See how you stack up against your peers</p>
                    </div>
                    <div className="comparison-grid">
                        <div className="stat-card comparison-card">
                            <h3>Daily Average vs Peers</h3>
                            <div className="chart-container">
                                <Bar data={peerComparisonData} options={chartOptions} />
                            </div>
                        </div>
                        <div className="stat-card comparison-card">
                            <h3>Your Weekly Progress</h3>
                            <div className="chart-container">
                                <Line data={weeklyProgressData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Study Recommendations */}
                <section className="recommendations-section">
                    <div className="section-header">
                        <h2>Personalized Recommendations</h2>
                        <p>Tips to improve your study habits</p>
                    </div>
                    <div className="recommendations-grid">
                        <div className="stat-card recommendation-card">
                            <div className="recommendation-icon"><i className="fas fa-brain" style={{ color: '#4a7c3f' }}></i></div>
                            <h3>Focus Improvement</h3>
                            <p>
                                {metrics.focusScore < 70
                                    ? "Your focus score is a bit low. Try the Pomodoro technique (25 min study, 5 min break) to build mental stamina."
                                    : "Great focus! Your consistency is helping you stay productive. Keep utilizing your deep work sessions."}
                            </p>
                        </div>
                        <div className="stat-card recommendation-card">
                            <div className="recommendation-icon"><i className="fas fa-balance-scale" style={{ color: '#10B981' }}></i></div>
                            <h3>Subject Balance</h3>
                            <p>
                                {subjectData.length > 1
                                    ? `You're spending most of your time on ${subjectData[0].name}. Don't forget to review ${subjectData[subjectData.length - 1].name} to maintain balance.`
                                    : "Start logging sessions for different subjects to see a detailed breakdown of your study balance."}
                            </p>
                        </div>
                        <div className="stat-card recommendation-card">
                            <div className="recommendation-icon"><i className="fas fa-clock" style={{ color: '#F59E0B' }}></i></div>
                            <h3>Optimal Study Time</h3>
                            <p>
                                {metrics.todayHours > 0
                                    ? "You've been active today! Research shows that consistent daily effort is better for long-term retention than cramming."
                                    : "Haven't started yet? Even a 15-minute quick review session can help keep your learning momentum alive."}
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modals */}
            <AddGoalModal
                isOpen={showGoalModal}
                onClose={() => setShowGoalModal(false)}
                onSave={(goal) => {
                    addGoal(goal);
                    setShowGoalModal(false);
                }}
            />
            <ActivityHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                activities={getActivityLog()}
            />
        </div>
    );
};

export default StatsClient;
