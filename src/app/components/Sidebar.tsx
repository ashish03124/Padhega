"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobileMenu } from '../context/MobileMenuContext';

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { isOpen, toggleMenu } = useMobileMenu();

    const navItems = [
        { name: 'Home', path: '/', icon: 'fa-home' },
        { name: 'Resources', path: '/resources', icon: 'fa-book' },
        { name: 'Study Room', path: '/study-rooms', icon: 'fa-users' },
        { name: 'Community', path: '/community', icon: 'fa-comments' },
        { name: 'Stats', path: '/stats', icon: 'fa-chart-bar' },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    onClick={toggleMenu}
                ></div>
            )}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <img src="/images/logo.png" alt="Padhega Logo" className="logo-img dark-logo" />
                    <img src="/images/logo1.jpg" alt="Padhega Logo" className="logo-img light-logo" />
                    <h1>Padhega</h1>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-decoration">
                    <img src="/images/sidebar-sakura-light.png" alt="Decoration Light" className="sakura-light" />
                    <img src="/images/sidebar-sakura-dark.png" alt="Decoration Dark" className="sakura-dark" />
                </div>
                <div className="sidebar-footer">
                    <p>&copy; 2026 Padhega</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
