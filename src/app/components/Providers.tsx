"use client";

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../context/AuthContext';
import { MobileMenuProvider } from '../context/MobileMenuContext';
import AuthModal from './AuthModal';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                <MobileMenuProvider>
                    {children}
                    <AuthModal />
                </MobileMenuProvider>
            </AuthProvider>
        </SessionProvider>
    );
}
