"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTimerLogger } from '../hooks/useActivityLogger';
import { useAuth } from './AuthContext';
import { showToast } from '../components/Toast';
import { addAppNotification } from '../lib/notificationBus';

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
  enableNotifications: boolean;
  enableSound: boolean;
  formatTime: () => string;
  handleTimerModeChange: (mode: TimerMode, minutes: number) => void;
  handleStartPauseTimer: () => void;
  handleResetTimer: () => void;
  handleSaveTimerSettings: (
    pomodoro: number,
    shortBreak: number,
    longBreak: number,
    enableNotifications: boolean,
    enableSound: boolean
  ) => void;
  setShowSettingsModal: (show: boolean) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [enableSound, setEnableSound] = useState(true);

  const isLoadedRef = useRef(false);

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

  // Synthesize a pleasant chime sound programmatically
  const playTimerSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // First chime (A5 - 880Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.3);
      
      // Second chime (C6 - 1046.5Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (err) {
      console.error('Error playing notification sound:', err);
    }
  }, []);

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/images/logo.png',
        tag: 'padhega-timer'
      });
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported in this browser.', 'warning');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Desktop notifications enabled!', 'success');
        return true;
      } else {
        showToast('Notification permission denied.', 'warning');
        return false;
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedState = localStorage.getItem('padhega_timer_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const {
          timerMode: savedMode,
          timerMinutes: savedMinutes,
          timerSeconds: savedSeconds,
          isTimerRunning: savedRunning,
          timerSettings: savedSettings,
          lastUpdatedTimestamp: savedTimestamp,
          sessionStartTime: savedSessionStart,
          initialDuration: savedInitialDuration,
          enableNotifications: savedNotifications,
          enableSound: savedSound
        } = parsed;

        if (savedSettings) {
          timerSettingsRef.current = savedSettings;
        }

        if (savedNotifications !== undefined) {
          setEnableNotifications(savedNotifications);
        }

        if (savedSound !== undefined) {
          setEnableSound(savedSound);
        }

        let currentMins = savedMinutes;
        let currentSecs = savedSeconds;
        let currentRunning = savedRunning;

        if (savedRunning && savedTimestamp) {
          const elapsedSeconds = Math.floor((Date.now() - savedTimestamp) / 1000);
          const remainingSeconds = savedMinutes * 60 + savedSeconds;
          const newRemaining = remainingSeconds - elapsedSeconds;

          if (newRemaining > 0) {
            currentMins = Math.floor(newRemaining / 60);
            currentSecs = newRemaining % 60;
          } else {
            // Timer expired while away
            currentMins = 0;
            currentSecs = 0;
            currentRunning = false;
          }
        }

        setTimerMode(savedMode);
        setTimerMinutes(currentMins);
        setTimerSeconds(currentSecs);
        setIsTimerRunning(currentRunning);
        if (savedSessionStart) {
          sessionStartTime.current = savedSessionStart;
        }
        if (savedInitialDuration) {
          initialDuration.current = savedInitialDuration;
        }
      } catch (err) {
        console.error('Error loading timer state from localStorage:', err);
      }
    }
    isLoadedRef.current = true;
  }, []);

  // Save state to localStorage on state changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoadedRef.current) return;

    const stateToSave = {
      timerMode,
      timerMinutes,
      timerSeconds,
      isTimerRunning,
      timerSettings: timerSettingsRef.current,
      lastUpdatedTimestamp: Date.now(),
      sessionStartTime: sessionStartTime.current,
      initialDuration: initialDuration.current,
      enableNotifications,
      enableSound
    };

    localStorage.setItem('padhega_timer_state', JSON.stringify(stateToSave));
  }, [timerMode, timerMinutes, timerSeconds, isTimerRunning, enableNotifications, enableSound]);

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

            // Add client-side notification to the dropdown
            addAppNotification(
              timerMode === 'pomodoro' ? 'Focus Session Completed!' : 'Break Completed!',
              label,
              timerMode === 'pomodoro' ? 'success' : 'info',
              timerMode === 'pomodoro' ? '/stats' : undefined
            );

            // Play sound chime if enabled
            if (enableSound) {
              playTimerSound();
            }

            // Send desktop notification if enabled
            if (enableNotifications) {
              sendBrowserNotification(
                timerMode === 'pomodoro' ? 'Focus Session Completed!' : 'Break Completed!',
                label
              );
            }

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
  }, [
    isTimerRunning,
    timerSeconds,
    timerMinutes,
    timerMode,
    status,
    logTimerComplete,
    enableSound,
    enableNotifications,
    playTimerSound,
    sendBrowserNotification
  ]);

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

  const handleSaveTimerSettings = (
    pomodoro: number,
    shortBreak: number,
    longBreak: number,
    enableNotifs: boolean,
    enableSnd: boolean
  ) => {
    timerSettingsRef.current = { pomodoro, shortBreak, longBreak };
    setEnableNotifications(enableNotifs);
    setEnableSound(enableSnd);
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
      enableNotifications,
      enableSound,
      formatTime,
      handleTimerModeChange,
      handleStartPauseTimer,
      handleResetTimer,
      handleSaveTimerSettings,
      setShowSettingsModal,
      requestNotificationPermission
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
