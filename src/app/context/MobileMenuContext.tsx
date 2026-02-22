"use client";

import React, { createContext, useContext, useState } from 'react';

interface MobileMenuContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    toggleMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType>({
    isOpen: false,
    setIsOpen: () => { },
    toggleMenu: () => { },
});

export const MobileMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <MobileMenuContext.Provider value={{ isOpen, setIsOpen, toggleMenu }}>
            {children}
        </MobileMenuContext.Provider>
    );
};

export const useMobileMenu = () => useContext(MobileMenuContext);
