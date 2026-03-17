"use client";

import React, { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

// ---------- Global event bus ----------
const TOAST_EVENT = 'padhega_toast';

export const showToast = (message: string, type: ToastType = 'info', duration = 4000) => {
    const event = new CustomEvent(TOAST_EVENT, {
        detail: { id: `${Date.now()}-${Math.random()}`, message, type, duration } as ToastMessage,
    });
    window.dispatchEvent(event);
};

// ---------- Icons ----------
const icons: Record<ToastType, string> = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
};

// ---------- Single Toast ----------
const Toast: React.FC<{ toast: ToastMessage; onClose: (id: string) => void }> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(toast.id), toast.duration ?? 4000);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    return (
        <div className={`toast toast-${toast.type}`} role="alert">
            <span className="toast-icon">{icons[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => onClose(toast.id)} aria-label="Dismiss">×</button>
        </div>
    );
};

// ---------- Toast Container ----------
export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            const toast = (e as CustomEvent<ToastMessage>).detail;
            setToasts(prev => [...prev.slice(-4), toast]); // keep max 5
        };
        window.addEventListener(TOAST_EVENT, handler);
        return () => window.removeEventListener(TOAST_EVENT, handler);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map(t => (
                <Toast key={t.id} toast={t} onClose={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
