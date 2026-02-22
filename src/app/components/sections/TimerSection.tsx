import React from 'react';
import type { TimerMode } from '../../hooks/useTimer';

interface TimerSectionProps {
    timerMode: TimerMode;
    timerMinutes: number;
    timerSeconds: number;
    isTimerRunning: boolean;
    showSettingsModal: boolean;
    timerSettings: {
        pomodoro: number;
        shortBreak: number;
        longBreak: number;
    };
    formatTime: () => string;
    handleTimerModeChange: (mode: TimerMode, minutes: number) => void;
    handleStartPauseTimer: () => void;
    handleResetTimer: () => void;
    handleSaveTimerSettings: (pomodoro: number, shortBreak: number, longBreak: number) => void;
    setShowSettingsModal: (show: boolean) => void;
}

const TimerSection: React.FC<TimerSectionProps> = ({
    timerMode,
    timerMinutes,
    timerSeconds,
    isTimerRunning,
    showSettingsModal,
    timerSettings,
    formatTime,
    handleTimerModeChange,
    handleStartPauseTimer,
    handleResetTimer,
    handleSaveTimerSettings,
    setShowSettingsModal,
}) => {
    // Calculate total seconds for the current mode
    const getTotalSeconds = () => {
        if (timerMode === 'pomodoro') return timerSettings.pomodoro * 60;
        if (timerMode === 'short-break') return timerSettings.shortBreak * 60;
        return timerSettings.longBreak * 60;
    };

    const totalSeconds = getTotalSeconds();
    const currentSeconds = timerMinutes * 60 + timerSeconds;
    const progressPercentage = totalSeconds > 0 ? currentSeconds / totalSeconds : 1;

    // SVG Circle Calculations
    const circleRadius = 120;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset = circleCircumference - (progressPercentage * circleCircumference);

    return (
        <section className={`timer-box mode-${timerMode}`}>
            <div className="section-header">
                <h2><i className="fas fa-clock"></i> Study Timer</h2>
                <div className="timer-settings" onClick={() => setShowSettingsModal(!showSettingsModal)}>
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                </div>
            </div>
            <div className={`timer-mode active-${timerMode}`}>
                <button
                    className={`mode-btn ${timerMode === 'pomodoro' ? 'active' : ''}`}
                    onClick={() => handleTimerModeChange('pomodoro', timerSettings.pomodoro)}
                >
                    Pomodoro
                </button>
                <button
                    className={`mode-btn ${timerMode === 'short-break' ? 'active' : ''}`}
                    onClick={() => handleTimerModeChange('short-break', timerSettings.shortBreak)}
                >
                    Short Break
                </button>
                <button
                    className={`mode-btn ${timerMode === 'long-break' ? 'active' : ''}`}
                    onClick={() => handleTimerModeChange('long-break', timerSettings.longBreak)}
                >
                    Long Break
                </button>
            </div>

            <div className="timer-container-wrapper">
                <div className={`timer-display ${isTimerRunning ? 'running' : ''}`}>
                    <div className="timer-glow-bg"></div>
                    <svg className="timer-svg" viewBox="0 0 280 280">
                        <defs>
                            <linearGradient id="gradient-pomodoro" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#305229" />
                            </linearGradient>
                            <linearGradient id="gradient-short-break" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#14b8a6" />
                                <stop offset="100%" stopColor="#305229" />
                            </linearGradient>
                            <linearGradient id="gradient-long-break" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#305229" />
                            </linearGradient>
                        </defs>
                        <circle
                            className="timer-circle-bg"
                            cx="140"
                            cy="140"
                            r={circleRadius}
                        />
                        <circle
                            className="timer-circle-progress"
                            cx="140"
                            cy="140"
                            r={circleRadius}
                            style={{
                                strokeDasharray: circleCircumference,
                                strokeDashoffset: strokeDashoffset,
                                stroke: `url(#gradient-${timerMode})`
                            }}
                        />
                    </svg>
                    <div className="timer-content">
                        <div className="timer" aria-live="polite">
                            {formatTime()}
                        </div>
                    </div>
                </div>

                <div className="timer-controls">
                    <button className={`btn-fab ${isTimerRunning ? 'btn-pause' : 'btn-start'}`} onClick={handleStartPauseTimer}>
                        <i className={`fas fa-${isTimerRunning ? 'pause' : 'play'}`}></i>
                    </button>
                    <button className="btn-fab-secondary" onClick={handleResetTimer} title="Reset Timer">
                        <i className="fas fa-redo"></i>
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="timermodal" onClick={() => setShowSettingsModal(false)}>
                    <div className="timermodal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Timer Settings</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleSaveTimerSettings(
                                parseInt(formData.get('pomodoro') as string),
                                parseInt(formData.get('shortBreak') as string),
                                parseInt(formData.get('longBreak') as string)
                            );
                        }}>
                            <div className="form-group">
                                <label>Pomodoro (minutes)</label>
                                <input
                                    name="pomodoro"
                                    type="number"
                                    min="1"
                                    max="120"
                                    defaultValue={timerSettings.pomodoro}
                                />
                            </div>
                            <div className="form-group">
                                <label>Short Break (minutes)</label>
                                <input
                                    name="shortBreak"
                                    type="number"
                                    min="1"
                                    max="30"
                                    defaultValue={timerSettings.shortBreak}
                                />
                            </div>
                            <div className="form-group">
                                <label>Long Break (minutes)</label>
                                <input
                                    name="longBreak"
                                    type="number"
                                    min="1"
                                    max="60"
                                    defaultValue={timerSettings.longBreak}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TimerSection;
