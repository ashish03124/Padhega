"use client";

import { useState, useEffect, useRef } from 'react';
import { useTimerLogger } from './useActivityLogger';
import { useAuth } from '../context/AuthContext';

export type TimerMode = 'pomodoro' | 'short-break' | 'long-break';

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
  const { status } = useAuth();
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Activity logger for tracking sessions
  const { logTimerStart, logTimerPause, logTimerResume, logTimerComplete } = useTimerLogger();

  // Track session start time and initial duration
  const sessionStartTime = useRef<number | null>(null);
  const initialDuration = useRef<number>(25);

  const timerSettingsRef = useRef<TimerSettings>({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  });

  // Timer Effect - This is what makes the timer work
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            // Timer finished
            setIsTimerRunning(false);

            // Log completed session to Stats
            if (timerMode === 'pomodoro' && sessionStartTime.current) {
              const duration = initialDuration.current;

              // Persist to backend if authenticated
              const persistSession = async () => {
                if (status === 'authenticated') {
                  try {
                    await fetch('/api/sessions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        subject: 'General',
                        type: 'study',
                        duration,
                        date: new Date().toISOString()
                      }),
                    });
                  } catch (err) {
                    console.error("Error persisting session:", err);
                  }
                }

                // Still log event for local UI updates
                logTimerComplete('General', 'study', duration);
              };

              persistSession();
              sessionStartTime.current = null;
            }

            // Play notification sound or show alert
            alert(`${timerMode === 'pomodoro' ? 'Work' : 'Break'} session completed!`);

            // Auto-switch to break/work
            if (timerMode === 'pomodoro') {
              handleTimerModeChange('short-break', timerSettingsRef.current.shortBreak);
            } else {
              handleTimerModeChange('pomodoro', timerSettingsRef.current.pomodoro);
            }
          } else {
            setTimerMinutes(prev => prev - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(prev => prev - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, timerMinutes, timerMode]);

  // Format time for display
  const formatTime = (): string => {
    const mins = String(timerMinutes).padStart(2, '0');
    const secs = String(timerSeconds).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Timer functions
  const handleTimerModeChange = (mode: TimerMode, minutes: number) => {
    setTimerMode(mode);
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const handleStartPauseTimer = () => {
    if (!isTimerRunning) {
      // Starting timer
      if (sessionStartTime.current === null) {
        // New session
        sessionStartTime.current = Date.now();
        initialDuration.current = timerMinutes + (timerSeconds / 60);
        if (timerMode === 'pomodoro') {
          logTimerStart('General', 'study');
        }
      } else {
        // Resuming
        if (timerMode === 'pomodoro') {
          logTimerResume();
        }
      }
    } else {
      // Pausing timer
      if (timerMode === 'pomodoro') {
        const elapsed = initialDuration.current - (timerMinutes + timerSeconds / 60);
        logTimerPause(elapsed);
      }
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    sessionStartTime.current = null; // Reset session tracking
    setTimerMinutes(timerMode === 'pomodoro' ? timerSettingsRef.current.pomodoro :
      timerMode === 'short-break' ? timerSettingsRef.current.shortBreak :
        timerSettingsRef.current.longBreak);
    setTimerSeconds(0);
  };

  const handleSaveTimerSettings = (pomodoro: number, shortBreak: number, longBreak: number) => {
    timerSettingsRef.current = { pomodoro, shortBreak, longBreak };
    if (timerMode === 'pomodoro') {
      setTimerMinutes(pomodoro);
    } else if (timerMode === 'short-break') {
      setTimerMinutes(shortBreak);
    } else {
      setTimerMinutes(longBreak);
    }
    setTimerSeconds(0);
    setShowSettingsModal(false);
  };

  return {
    timerMode,
    timerMinutes,
    timerSeconds,
    isTimerRunning,
    showSettingsModal,
    timerSettings: timerSettingsRef.current,
    formatTime,
    handleTimerModeChange,
    handleStartPauseTimer,
    handleResetTimer,
    handleSaveTimerSettings,
    setShowSettingsModal,
  };
};
