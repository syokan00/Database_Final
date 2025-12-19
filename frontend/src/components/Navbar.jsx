import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenTool, User, Menu, X, Clover, ShoppingBag, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Debug: Log authentication state
  useEffect(() => {
    console.log('Navbar - isAuthenticated:', isAuthenticated, 'user:', user);
  }, [isAuthenticated, user]);

  // Mock Notifications
  const notifications = [
    { id: 1, text: 'B1学生 から新しいメッセージ', time: '2分前', read: false },
    { id: 2, text: 'あなたの投稿にいいねが10件つきました！', time: '1時間前', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="navbar glass">
      <div className="container navbar-container">
        <Link to="/" className="logo-link">
          <div className="logo-icon">
            <span style={{ fontSize: '24px' }}>🍀</span>
          </div>
          <span className="logo-text">{t.common.appName}</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="search-bar-container desktop-only">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t.common.search}
            className="search-input"
          />
        </div>

        <div className={`nav-menu ${isOpen ? 'is-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/notes" className="nav-item" onClick={() => setIsOpen(false)}>{t.nav.notes}</Link>
              <Link to="/items" className="nav-item" onClick={() => setIsOpen(false)}>
                <ShoppingBag size={16} style={{ marginRight: '4px' }} />
                {t.nav.items}
              </Link>
              <Link to="/badges" className="nav-item" onClick={() => setIsOpen(false)}>{t.nav.badges}</Link>
            </>
          ) : (
            <div className="nav-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
              {t.common.loginRequired}
            </div>
          )}

          <div className="mobile-only" style={{ padding: '1rem' }}>
            <Link to="/create" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>
              {t.common.post}
            </Link>
          </div>
        </div>

        <div className="nav-actions">
          {/* Notifications - Only if logged in */}
          {isAuthenticated && (
            <div className="notification-wrapper">
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown glass">
                  <div className="notification-header">通知</div>
                  {notifications.map(n => (
                    <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`} onClick={() => navigate('/chat')}>
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Link to="/create" className="btn btn-primary desktop-only">
            <PenTool size={16} style={{ marginRight: '6px' }} />
            {t.common.post}
          </Link>

          {isAuthenticated ? (
            <Link to="/profile" className="icon-btn profile-btn-nav" aria-label="Profile">
              <img 
                src={user?.avatar_url || user?.avatar || `https://ui-avatars.com/api/?name=${user?.nickname || 'User'}&background=10b981&color=fff`} 
                alt="Profile" 
                className="nav-avatar" 
              />
            </Link>
          ) : (
            <Link to="/login" className="icon-btn" aria-label="Login">
              <User size={20} />
            </Link>
          )}

          <button className="icon-btn mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
