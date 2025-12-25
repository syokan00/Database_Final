import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, Award, FileText, Heart, MapPin, Calendar, ShoppingBag, Trash2, Camera, UserPlus, UserCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import ItemCard from '../components/ItemCard';
import client from '../api/client';
import './ProfilePage.css';

const ProfilePage = () => {
    const { t } = useLanguage();
    const { user: authUser, logout, isAuthenticated, setUser: setAuthUser } = useAuth();
    const { posts, items, likedPostIds, deletePost, deleteItem, followingUserIds, toggleFollowUser } = usePosts();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userIdParam = searchParams.get('userId');
    const targetUserId = userIdParam && !isNaN(userIdParam) ? parseInt(userIdParam, 10) : null;

    const [activeTab, setActiveTab] = useState('posts');
    const [ownedBadges, setOwnedBadges] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [localUser, setLocalUser] = useState(authUser);
    const [profileNickname, setProfileNickname] = useState('');
    const [profileMajor, setProfileMajor] = useState('');
    const [profileYear, setProfileYear] = useState('');
    const [profileGrade, setProfileGrade] = useState('');
    const [profileBio, setProfileBio] = useState('');
    const [userStats, setUserStats] = useState({ follower_count: 0, following_count: 0, followed_by_me: false });
    const [isOwnProfile, setIsOwnProfile] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 如果指定了userId，获取该用户的信息
    useEffect(() => {
        const loadUser = async () => {
            // 检查 targetUserId 是否有效
            if (targetUserId && !isNaN(targetUserId) && targetUserId > 0) {
                setLoading(true);
                setError(null);
                try {
                    console.log('Loading user profile for userId:', targetUserId);
                    const response = await client.get(`/users/${targetUserId}/stats`);
                    console.log('User stats response:', response.data);
                    
                    if (!response.data || !response.data.user) {
                        throw new Error('User not found in response');
                    }
                    
                    const targetUser = response.data.user;
                    setLocalUser(targetUser);
                    setIsOwnProfile(authUser && targetUser.id === authUser.id);
                    
                    // 获取该用户的徽章
                    try {
                        const badgesResponse = await client.get(`/badges/users/${targetUserId}`);
                        setOwnedBadges(badgesResponse.data || []);
                    } catch (badgeError) {
                        console.error('Failed to fetch badges:', badgeError);
                        setOwnedBadges([]);
                    }
                    
                    setLoading(false);
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    setError(error.message || 'ユーザー情報の取得に失敗しました');
                    setLoading(false);
                    
                    // 如果用户不存在或未登录，导航到自己的主页或登录页
                    if (!authUser) {
                        navigate('/login');
                    } else {
                        setLocalUser(authUser);
                        setIsOwnProfile(true);
                    }
                }
            }
            // 注意：没有指定userId的情况在另一个useEffect中处理
        };
        // 只有在有targetUserId时才执行
        if (targetUserId && !isNaN(targetUserId) && targetUserId > 0) {
            loadUser();
        }
    }, [targetUserId, authUser, navigate]);
    
    // 当targetUserId变化时，重置状态
    useEffect(() => {
        if (targetUserId && !isNaN(targetUserId) && targetUserId > 0) {
            // 重置状态，准备加载新用户
            setLocalUser(null);
            setLoading(true);
            setError(null);
        }
    }, [targetUserId]);

    // 同步authUser到localUser（如果查看自己的资料）
    useEffect(() => {
        if (!targetUserId) {
            // 没有指定userId，显示当前用户
            if (authUser) {
                console.log('Setting localUser to authUser (own profile):', authUser);
                setLocalUser(authUser);
                setIsOwnProfile(true);
                setLoading(false);
                setError(null);
            } else {
                // 如果没有登录，保持localUser为null
                console.log('No authUser, setting localUser to null');
                setLocalUser(null);
                setLoading(false);
            }
        } else {
            // 有targetUserId时，确保loading状态正确
            console.log('targetUserId exists, waiting for user data to load');
        }
    }, [authUser, targetUserId]);

    const user = localUser || authUser;

    // 当打开设置时，用当前 user 初始化表单
    useEffect(() => {
        if (!showSettings) return;
        if (!user) return;
        setProfileNickname(user.nickname || '');
        setProfileMajor(user.major || '');
        setProfileYear(user.year ? String(user.year) : '');
        setProfileGrade(user.grade || '');
        setProfileBio(user.bio || '');
    }, [showSettings, user]);

    useEffect(() => {
        const fetchUserStats = async () => {
            if (user) {
                try {
                    const userId = targetUserId || user.id;
                    const response = await client.get(`/users/${userId}/stats`);
                    setUserStats({
                        follower_count: response.data.follower_count || 0,
                        following_count: response.data.following_count || 0,
                        followed_by_me: response.data.followed_by_me || false,
                    });
                } catch (error) {
                    console.error('Failed to fetch user stats:', error);
                }
            }
        };
        fetchUserStats();
    }, [user, targetUserId]);

    useEffect(() => {
        const fetchBadges = async () => {
            if (user) {
                try {
                    if (isOwnProfile) {
                        // 自己的徽章
                        const response = await client.get('/badges/me');
                        setOwnedBadges(response.data || []);
                    } else {
                        // 其他用户的徽章（已在loadUser中获取）
                        // 这里不需要重复获取
                    }
                } catch (error) {
                    console.error("Failed to fetch badges", error);
                }
            }
        };
        fetchBadges();
    }, [user, isOwnProfile]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await client.put('/auth/password', { old_password: oldPassword, new_password: newPassword });
            alert(t.profile?.passwordUpdated || 'Password updated');
            setOldPassword('');
            setNewPassword('');
        } catch (error) {
            alert((t.profile?.passwordUpdateFailed || 'Failed to update password') + ': ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nickname: profileNickname,
                major: profileMajor,
                grade: profileGrade,
                bio: profileBio
            };
            if (profileYear !== '') {
                payload.year = parseInt(profileYear, 10);
            }
            await client.put('/auth/me', payload);
            const userResponse = await client.get('/auth/me');
            setLocalUser(userResponse.data);
            if (setAuthUser) setAuthUser(userResponse.data);
            alert(t.profile?.profileSaved || 'Profile updated');
        } catch (error) {
            alert((t.profile?.profileSaveFailed || 'Failed to update profile') + ': ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert(t.common?.uploadFailed || 'Invalid file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert(t.common?.uploadFailed || 'File too large');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await client.post('/uploads/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Update user in context
            if (response.data) {
                // Refresh user data from AuthContext
                const userResponse = await client.get('/auth/me');
                setLocalUser(userResponse.data);
                if (setAuthUser) setAuthUser(userResponse.data);
                alert(t.profile?.profileSaved || 'Updated');
            }
        } catch (error) {
            console.error('Avatar upload failed', error);
            const errorMessage = error.response?.data?.detail || (t.common?.uploadFailed || 'Upload failed');
            alert(errorMessage);
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert(t.common?.uploadFailed || 'Invalid file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert(t.common?.uploadFailed || 'File too large');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await client.post('/uploads/cover', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data) {
                const userResponse = await client.get('/auth/me');
                setLocalUser(userResponse.data);
                if (setAuthUser) setAuthUser(userResponse.data);
                alert(t.profile?.profileSaved || 'Updated');
            }
        } catch (error) {
            console.error('Cover upload failed', error);
            alert(t.common?.uploadFailed || 'Upload failed');
        }
    };

    // 显示加载状态
    if (loading) {
        return (
            <div className="profile-page">
                <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <h2>{t.profile?.loadingProfile || 'ユーザー情報を読み込み中...'}</h2>
                    <p>ユーザーID: {targetUserId}</p>
                </div>
            </div>
        );
    }

    // 显示错误状态
    if (error && targetUserId) {
        return (
            <div className="profile-page">
                <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <h2>エラー</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                        {t.profile?.backToMyProfile || '自分のプロフィールに戻る'}
                    </button>
                </div>
            </div>
        );
    }

    if (!user && !loading) {
        // 只有在不是加载状态且没有用户时才显示登录提示
        // 如果正在加载其他用户的资料，不应该显示这个
        if (!targetUserId) {
            return (
                <div className="profile-page">
                    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <h2>{t.profile?.pleaseLoginTitle || t.common?.loginRequired || 'ログインしてください'}</h2>
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>{t.common?.login || 'ログイン'}</button>
                    </div>
                </div>
            );
        }
        // 如果指定了userId但加载失败，显示错误（已在上面处理）
        return null;
    }

    // Filter data for current user or target user
    const displayPosts = posts.filter(p => {
        if (!p.author && !p.author_id) return false;
        return (p.author?.id === user.id) || (p.author_id === user.id);
    });
    const displayItems = items.filter(i => (i.user_id === user.id) || (i.owner?.id === user.id));
    // 只在自己查看自己的资料时显示喜欢的帖子
    const likedPosts = isOwnProfile ? posts.filter(p => likedPostIds.includes(p.id)) : [];

    console.log('ProfilePage - posts:', posts.length, 'displayPosts:', displayPosts.length, 'items:', items.length, 'displayItems:', displayItems.length);

    return (
        <div className="profile-page" style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-body)', padding: '2rem 0' }}>
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
                    <div className="profile-cover" style={{
                        backgroundImage: user.cover_image_url ? `url(${user.cover_image_url})` : 'linear-gradient(135deg, #10b981, #059669)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                    }}>
                        {isOwnProfile && (
                            <label className="cover-upload-btn">
                                <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
                                <Camera size={18} color="white" />
                                <span style={{ color: 'white', fontSize: '0.875rem', marginLeft: '4px' }}>{t.profile?.changeCover || 'Change cover'}</span>
                            </label>
                        )}
                    </div>
                    <div className="profile-info-wrapper">
                        <div className="profile-avatar-large">
                            <img
                                src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${user.nickname || 'User'}`}
                                alt="Profile"
                            />
                            {/* Upload Overlay - 只有自己的资料才显示 */}
                            {isOwnProfile && (
                                <label className="avatar-upload-overlay">
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                                    <Camera size={20} color="white" />
                                </label>
                            )}
                        </div>
                        <div className="profile-details">
                            <h1 className="profile-name">{user.nickname || user.email}</h1>
                            <p className="profile-bio">
                                {user.grade || 'Student'} 
                                {user.year && ` / ${user.year}年入学`}
                                {user.major && ` / ${user.major}`}
                            </p>
                            {user.bio && <p className="profile-bio-text">{user.bio}</p>}
                            <div className="profile-meta">
                                <span><MapPin size={14} /> Tokyo, Japan</span>
                                <span><Calendar size={14} /> Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="profile-actions">
                            {isOwnProfile ? (
                                <>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>
                                        <Settings size={18} />
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                                        <LogOut size={18} />
                                        <span>{t.common.logout}</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {isAuthenticated && (
                                        <button 
                                            className={`btn ${userStats.followed_by_me ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                                            onClick={async () => {
                                                if (user) {
                                                    await toggleFollowUser(user.id);
                                                    // 更新本地状态
                                                    setUserStats(prev => ({
                                                        ...prev,
                                                        followed_by_me: !prev.followed_by_me
                                                    }));
                                                }
                                            }}
                                        >
                                            {userStats.followed_by_me ? (
                                                <>
                                                    <UserCheck size={18} />
                                                    <span>{t.profile?.following || 'フォロー中'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={18} />
                                                    <span>{t.profile?.followUser || 'フォロー'}</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="profile-stats">
                        <div className="stat-item" onClick={() => navigate(`/users/${user.id}/follow?type=following`)} style={{ cursor: 'pointer' }}>
                            <span className="stat-value">{userStats.following_count}</span>
                            <span className="stat-label">{t.profile?.following || 'フォロー中'}</span>
                        </div>
                        <div className="stat-item" onClick={() => navigate(`/users/${user.id}/follow?type=followers`)} style={{ cursor: 'pointer' }}>
                            <span className="stat-value">{userStats.follower_count}</span>
                            <span className="stat-label">{t.profile?.followers || 'フォロワー'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{displayPosts.length}</span>
                            <span className="stat-label">{t.profile?.posts || 'Posts'}</span>
                        </div>
                        {isOwnProfile && (
                            <div className="stat-item">
                                <span className="stat-value">{likedPosts.length}</span>
                                <span className="stat-label">{t.profile?.likes || 'Likes'}</span>
                            </div>
                        )}
                        <div className="stat-item" onClick={() => navigate('/badges')} style={{ cursor: 'pointer' }}>
                            <span className="stat-value">{ownedBadges.length}</span>
                            <span className="stat-label">{t.profile?.badgesLabel || 'Badges'}</span>
                        </div>
                    </div>
                </div>

                {/* Settings Modal */}
                {showSettings && (
                    <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>{t.profile?.settingsTitle || '設定'}</h3>

                            <form onSubmit={handleSaveProfile}>
                                <h4 style={{ margin: '0.5rem 0' }}>{t.profile?.profileSectionTitle || 'Profile'}</h4>
                                <div className="form-group">
                                    <label htmlFor="profile-nickname">{t.profile?.nicknameLabel || 'Nickname'}</label>
                                    <input id="profile-nickname" name="nickname" value={profileNickname} onChange={e => setProfileNickname(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="profile-major">{t.profile?.majorLabel || 'Major'}</label>
                                    <input id="profile-major" name="major" value={profileMajor} onChange={e => setProfileMajor(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="profile-year">{t.profile?.yearLabel || 'Year'}</label>
                                    <input id="profile-year" name="year" type="number" value={profileYear} onChange={e => setProfileYear(e.target.value)} placeholder="2025" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="profile-grade">{t.profile?.gradeLabel || 'Grade'}</label>
                                    <input id="profile-grade" name="grade" value={profileGrade} onChange={e => setProfileGrade(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="profile-bio">{t.profile?.bioLabel || 'Bio'}</label>
                                    <textarea id="profile-bio" name="bio" value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={3} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">{t.profile?.saveProfile || t.common?.save || 'Save'}</button>
                                </div>
                            </form>

                            <hr style={{ margin: '1.25rem 0' }} />

                            <form onSubmit={handleChangePassword}>
                                <h4 style={{ margin: '0.5rem 0' }}>{t.profile?.passwordSectionTitle || 'Change password'}</h4>
                                <div className="form-group">
                                    <label htmlFor="old-password">{t.profile?.oldPasswordLabel || 'Old password'}</label>
                                    <input id="old-password" name="oldPassword" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="new-password">{t.profile?.newPasswordLabel || 'New password'}</label>
                                    <input id="new-password" name="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">{t.profile?.updatePassword || 'Update'}</button>
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowSettings(false)}>{t.profile?.close || t.common?.cancel || '閉じる'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Content Tabs */}
                <div className="profile-content">
                    <div className="profile-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            <FileText size={18} />
                            <span>{t.profile?.myPosts || 'My Posts'}</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('likes')}
                        >
                            <Heart size={18} />
                            <span>{t.profile?.liked || 'Liked'}</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
                            onClick={() => setActiveTab('items')}
                        >
                            <ShoppingBag size={18} />
                            <span>{t.profile?.myItems || 'My Items'}</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
                            onClick={() => setActiveTab('badges')}
                        >
                            <Award size={18} />
                            <span>{t.profile?.badges || 'Badges'}</span>
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'posts' && (
                            <div className="profile-list">
                                {displayPosts.length > 0 ? (
                                    displayPosts.map(post => (
                                        <div key={post.id} className="profile-post-wrapper">
                                            <PostCard post={post} />
                                            {isOwnProfile && (
                                                <button className="delete-btn" onClick={() => deletePost(post.id)}>
                                                    <Trash2 size={16} /> {t.common?.delete || 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <FileText size={48} color="var(--border-light)" />
                                        <p>{t.profile?.noPostsYet || 'No posts yet'}</p>
                                        {isOwnProfile && (
                                            <button className="btn btn-primary" onClick={() => navigate('/create')}>{t.profile?.createPost || 'Create Post'}</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'likes' && (
                            <div className="profile-list">
                                {isOwnProfile ? (
                                    likedPosts.length > 0 ? (
                                        likedPosts.map(post => <PostCard key={post.id} post={post} />)
                                    ) : (
                                        <div className="empty-state">
                                            <Heart size={48} color="var(--border-light)" />
                                            <p>{t.profile?.noLikedPostsYet || 'No liked posts yet'}</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="empty-state">
                                        <Heart size={48} color="var(--border-light)" />
                                        <p>{t.profile?.thisTabOnlyForMe || 'このタブは自分のプロフィールでのみ表示されます'}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'items' && (
                            <div className="items-grid">
                                {displayItems.length > 0 ? (
                                    displayItems.map(item => (
                                        <div key={item.id} className="profile-item-wrapper">
                                            <ItemCard item={item} isOwner={isOwnProfile} />
                                            {isOwnProfile && (
                                                <button className="delete-btn-item" onClick={() => deleteItem(item.id)}>
                                                    <Trash2 size={16} /> {t.common?.delete || 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <ShoppingBag size={48} color="var(--border-light)" />
                                        <p>{t.profile?.noItemsYet || 'No items yet'}</p>
                                        {isOwnProfile && (
                                            <button className="btn btn-primary" onClick={() => navigate('/items')}>{t.nav.items || 'Go to Market'}</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'badges' && (
                            <div className="badge-grid" style={{ padding: '1rem' }}>
                                {ownedBadges.length > 0 ? (
                                    ownedBadges.map(ub => (
                                        <div key={ub.badge.id} className="badge-item">
                                            <div className="badge-circle-wrapper">
                                                <div className="badge-circle" style={{ borderColor: '#10B981' }}>
                                                    <div className="badge-icon-overlay" style={{ background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: '50%' }}>
                                                        <Award size={32} color="white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="badge-title">{ub.badge.name}</span>
                                            <span className="badge-date" style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {new Date(ub.awarded_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <Award size={48} color="var(--border-light)" />
                                        <p>{t.profile?.noItemsYet || 'No badges collected yet.'}</p>
                                        <button className="btn btn-primary" onClick={() => navigate('/badges')}>{t.profile?.viewAllBadges || 'View All Badges'}</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
