"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import UserSettingsModal from './UserSettingsModal';

const Header: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'settings'>('profile');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, setShowAuthModal, logout } = useAuth();
  const { toggleMenu } = useMobileMenu();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme as 'dark' | 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const toggleTheme = () => {
    if (!mounted) return;
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  if (!mounted) return <header className="app-header-actions"></header>;

  return (
    <header className="app-header-actions">
      <div className="header-left mobile-only">
        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Open Menu">
          <i className="fas fa-bars"></i>
        </button>
      </div>

      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
          <span className="theme-text">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {user ? (
          <div className="user-actions">
            {/* Notification Bell */}
            <button className="notification-bell" aria-label="Notifications">
              <i className="fas fa-bell"></i>
              <span className="notification-dot"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="profile-menu-container" ref={dropdownRef}>
              <button className="avatar-btn" onClick={toggleDropdown} aria-label="Profile menu">
                {user.image ? (
                  <img src={user.image} alt="Profile" className="avatar-img" />
                ) : (
                  user.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </button>

              {showDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-name">{user.name}</span>
                    <span className="dropdown-email">{user.email || 'user@example.com'}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => { setShowSettingsModal(true); setSettingsTab('profile'); setShowDropdown(false); }}>
                    <i className="fas fa-user-circle"></i> Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { setShowSettingsModal(true); setSettingsTab('settings'); setShowDropdown(false); }}>
                    <i className="fas fa-cog"></i> Settings
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={logout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="auth-btn" onClick={() => setShowAuthModal(true)}>
            <i className="fas fa-user"></i> Login
          </button>
        )}
      </div>

      <UserSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={settingsTab}
      />
    </header>
  );
};

export default Header;
