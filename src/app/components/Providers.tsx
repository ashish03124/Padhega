"use client";

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../context/AuthContext';
import { MobileMenuProvider } from '../context/MobileMenuContext';
import { TimerProvider } from '../context/TimerContext';
import AuthModal from './AuthModal';
import ToastContainer from './Toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                <TimerProvider>
                    <MobileMenuProvider>
                        {children}
                        <AuthModal />
                        <ToastContainer />
                    </MobileMenuProvider>
                </TimerProvider>
            </AuthProvider>
        </SessionProvider>
    );
}
