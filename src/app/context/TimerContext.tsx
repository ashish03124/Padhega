"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTimerLogger } from '../hooks/useActivityLogger';
import { useAuth } from './AuthContext';
import { showToast } from '../components/Toast';

export type TimerMode = 'pomodoro' | 'short-break' | 'long-break';

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

interface TimerContextType {
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

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Timer Effect
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
                logTimerComplete('General', 'study', duration);
              };

              persistSession();
              sessionStartTime.current = null;
            }

            const label = timerMode === 'pomodoro' ? '🍅 Work session complete! Time for a break.' : '☕ Break over! Ready to focus?';
            showToast(label, timerMode === 'pomodoro' ? 'success' : 'info', 6000);

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
  }, [isTimerRunning, timerSeconds, timerMinutes, timerMode, status, logTimerComplete]);

  const formatTime = (): string => {
    const mins = String(timerMinutes).padStart(2, '0');
    const secs = String(timerSeconds).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleTimerModeChange = (mode: TimerMode, minutes: number) => {
    setTimerMode(mode);
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const handleStartPauseTimer = () => {
    if (!isTimerRunning) {
      if (sessionStartTime.current === null) {
        sessionStartTime.current = Date.now();
        initialDuration.current = timerMinutes + (timerSeconds / 60);
        if (timerMode === 'pomodoro') {
          logTimerStart('General', 'study');
        }
      } else {
        if (timerMode === 'pomodoro') {
          logTimerResume();
        }
      }
    } else {
      if (timerMode === 'pomodoro') {
        const elapsed = initialDuration.current - (timerMinutes + timerSeconds / 60);
        logTimerPause(elapsed);
      }
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    sessionStartTime.current = null;
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

  return (
    <TimerContext.Provider value={{
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
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};
