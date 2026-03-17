"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useRouter } from 'next/navigation';
import UserSettingsModal from './UserSettingsModal';

const Header: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'settings'>('profile');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, setShowAuthModal, logout } = useAuth();
  const { toggleMenu } = useMobileMenu();
  const router = useRouter();

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome to Padhega!',
      message: 'Start your first study session and earn XP.',
      time: 'Just now',
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: 'Daily Streak',
      message: 'You have a 3-day study streak. Keep it up!',
      time: '2h ago',
      type: 'info',
      read: false,
      link: '/stats'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

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
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const markAsRead = (id: number, link?: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    if (link) {
      router.push(link);
    }
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

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
        <img src="/images/logo.png" alt="Padhega" className="mobile-logo-img dark-logo" />
        <img src="/images/logo1.jpg" alt="Padhega" className="mobile-logo-img light-logo" />
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
            <div className="notification-menu-container" ref={notificationRef}>
              <button 
                className={`notification-bell ${showNotifications ? 'active' : ''}`} 
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="notification-dot"></span>}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <div className="header-flex">
                      <span className="dropdown-name">Notifications</span>
                      {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={markAllAsRead}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                          onClick={() => markAsRead(notif.id, (notif as any).link)}
                        >
                          <div className={`notif-icon-circle ${notif.type}`}>
                            <i className={`fas fa-${notif.type === 'success' ? 'check' : notif.type === 'warning' ? 'exclamation' : 'info'}-circle`}></i>
                          </div>
                          <div className="notif-content">
                            <p className="notif-title">{notif.title}</p>
                            <p className="notif-message">{notif.message}</p>
                            <span className="notif-time">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <i className="fas fa-bell-slash"></i>
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
