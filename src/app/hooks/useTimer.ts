"use client";

import { useTimerContext, TimerMode } from '../context/TimerContext';

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

interface UseTimerReturn {
  timerMode: TimerMode;
  timerMinutes: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  showSettingsModal: boolean;
  timerSettings: TimerSettings;
  formatTime: () => string;
  handleTimerModeChange: (mode: TimerMode, minutes: number) => void;
  handleStartPauseTimer: () => void;
  handleResetTimer: () => void;
  handleSaveTimerSettings: (pomodoro: number, shortBreak: number, longBreak: number) => void;
  setShowSettingsModal: (show: boolean) => void;
}

export const useTimer = (): UseTimerReturn => {
  const context = useTimerContext();
  
  return {
    ...context
  };
};

export type { TimerMode };
