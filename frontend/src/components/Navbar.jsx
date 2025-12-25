import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenTool, User, Menu, X, Clover, ShoppingBag, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Debug: Log authentication state (only in dev mode)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Navbar - isAuthenticated:', isAuthenticated, 'user:', user);
    }
  }, [isAuthenticated, user]);

  // 点击外部关闭通知下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    // ESC键关闭通知下拉菜单
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showNotifications) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showNotifications]);

  // 通知状态
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // 格式化时间显示
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  // 格式化通知文本
  const formatNotificationText = (notification) => {
    const actorName = notification.actor?.nickname || notification.actor?.email || 'ユーザー';
    
    switch (notification.type) {
      case 'like':
        return `${actorName}${t.notifications?.notificationLike || 'があなたの投稿にいいねしました'}`;
      case 'favorite':
        return `${actorName}${t.notifications?.notificationFavorite || 'があなたの投稿をブックマークしました'}`;
      case 'follow':
        return `${actorName}${t.notifications?.notificationFollow || 'があなたをフォローしました'}`;
      case 'comment':
        return `${actorName}${t.notifications?.notificationComment || 'があなたの投稿にコメントしました'}`;
      case 'message':
        if (notification.target_type === 'item') {
          return `${actorName}${t.notifications?.notificationItemMessage || 'から商品に関するメッセージが届きました'}`;
        }
        return `${actorName}${t.notifications?.notificationMessage || 'からメッセージが届きました'}`;
      default:
        return t.notifications?.newNotification || '新しい通知があります';
    }
  };

  // 获取通知列表
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingNotifications(true);
      const [notifsRes, countRes] = await Promise.all([
        client.get('/notifications/', { params: { limit: 20 } }),
        client.get('/notifications/unread/count')
      ]);
      
      setNotifications(notifsRes.data || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // 如果未登录或API错误，设置为空
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // 当登录状态变化时获取通知
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // 每30秒刷新一次通知
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // 标记通知为已读
  const markAsRead = async (notificationId) => {
    try {
      await client.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      await client.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 通知クリック時の処理：通知タイプに応じて適切なページへ遷移
  const handleNotificationClick = async (notification) => {
    // 如果未读，标记为已读
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    setShowNotifications(false);
    
    switch (notification.type) {
      case 'like':
      case 'favorite':
      case 'comment':
        // 跳转到对应的帖子（通过滚动到帖子位置或跳转到首页）
        if (notification.target_id) {
          navigate(`/notes?highlight=${notification.target_id}`);
        } else {
          navigate('/notes');
        }
        break;
      case 'follow':
        // 跳转到关注者的资料页
        if (notification.actor_id) {
          navigate(`/profile?userId=${notification.actor_id}`);
        } else {
          navigate('/');
        }
        break;
      case 'message':
        // 跳转到商品聊天页面
        if (notification.target_type === 'item' && notification.target_id) {
          // 如果是卖家收到买家消息的通知，需要传递买家ID
          if (notification.actor_id) {
            navigate(`/chat/item/${notification.target_id}?buyerId=${notification.actor_id}`);
          } else {
            navigate(`/chat/item/${notification.target_id}`);
          }
        } else {
          navigate('/chat');
        }
        break;
      default:
        navigate('/');
    }
  };

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
            <div className="notification-wrapper" ref={notificationRef}>
              <button 
                className="icon-btn" 
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="通知"
                aria-expanded={showNotifications}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown glass">
                  <div className="notification-header">
                    <span>通知</span>
                    {unreadCount > 0 && (
                      <>
                        <span className="notification-header-badge">{unreadCount}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '0.25rem 0.5rem'
                          }}
                        >
                          {t.notifications?.markAllAsRead || 'すべて既読'}
                        </button>
                      </>
                    )}
                  </div>
                  {loadingNotifications ? (
                    <div className="notification-empty">
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.notifications?.loading || '読み込み中...'}</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.notifications?.noNotifications || 'まだ通知はありません'}</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(n)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNotificationClick(n);
                          }
                        }}
                      >
                        <p>{formatNotificationText(n)}</p>
                        <span>{formatTime(n.created_at)}</span>
                      </div>
                    ))
                  )}
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
