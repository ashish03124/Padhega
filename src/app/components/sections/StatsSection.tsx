import React from 'react';

const StatsSection: React.FC = () => {
    return (
        <section className="stats-box">
            <div className="section-header">
                <h2><i className="fas fa-chart-pie"></i> Today's Stats</h2>
                <div className="date">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">3.5</div>
                    <div className="stat-label">Hours Studied</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">7</div>
                    <div className="stat-label">Pomodoros</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">85%</div>
                    <div className="stat-label">Efficiency</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">5</div>
                    <div className="stat-label">Tasks Done</div>
                </div>
            </div>
            <div className="progress-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <div className="progress-text">
                    <span>Daily Goal</span>
                    <span>65% Complete</span>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
