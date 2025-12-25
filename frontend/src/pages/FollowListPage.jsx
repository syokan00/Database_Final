import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import client from '../api/client';
import './FollowListPage.css';

const FollowListPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  
  const type = searchParams.get('type') || 'following'; // 'following' or 'followers'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);

  useEffect(() => {
    if (userId || currentUser) {
      fetchUsers();
      if (currentUser) {
        fetchFollowingIds();
      }
    }
  }, [userId, type, currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;

      const endpoint = type === 'followers' 
        ? `/users/${targetUserId}/followers`
        : `/users/${targetUserId}/following`;
      
      const response = await client.get(endpoint);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingIds = async () => {
    try {
      const response = await client.get('/users/me/following');
      setFollowingIds(response.data || []);
    } catch (error) {
      console.error('Failed to fetch following IDs:', error);
      setFollowingIds([]);
    }
  };

  const handleFollowToggle = async (targetUserId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const isFollowing = followingIds.includes(targetUserId);
    
    try {
      if (isFollowing) {
        await client.delete(`/users/${targetUserId}/follow`);
        setFollowingIds(prev => prev.filter(id => id !== targetUserId));
      } else {
        await client.post(`/users/${targetUserId}/follow`);
        setFollowingIds(prev => [...prev, targetUserId]);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      alert('操作に失敗しました');
    }
  };

  const handleUserClick = (targetUserId) => {
    if (targetUserId === currentUser?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile?userId=${targetUserId}`);
    }
  };

  return (
    <div className="follow-list-page">
      <div className="container">
        <div className="follow-list-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1>{type === 'followers' ? (t.follow?.followers || 'フォロワー') : (t.follow?.following || 'フォロー中')}</h1>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>{t.follow?.loading || '読み込み中...'}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p>{type === 'followers' ? (t.follow?.noFollowers || 'まだフォロワーがいません') : (t.follow?.noFollowing || 'まだ誰もフォローしていません')}</p>
          </div>
        ) : (
          <div className="user-list">
            {users.map((user) => {
              const isFollowing = followingIds.includes(user.id);
              const isCurrentUser = user.id === currentUser?.id;

              return (
                <div key={user.id} className="user-item glass">
                  <div 
                    className="user-info"
                    onClick={() => handleUserClick(user.id)}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname || user.email)}&background=10b981&color=fff`}
                      alt={user.nickname || user.email}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <h3>{user.nickname || user.email}</h3>
                      {user.grade && <span className="user-grade">{user.grade}</span>}
                      {user.bio && <p className="user-bio">{user.bio}</p>}
                    </div>
                  </div>
                  {!isCurrentUser && currentUser && (
                    <button
                      className={`follow-btn ${isFollowing ? 'following' : ''}`}
                      onClick={() => handleFollowToggle(user.id)}
                    >
                      {isFollowing ? (t.follow?.unfollowUser || 'フォロー解除') : (t.follow?.followUser || 'フォロー')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowListPage;

