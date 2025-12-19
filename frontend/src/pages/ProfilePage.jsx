import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, Award, FileText, Heart, MapPin, Calendar, ShoppingBag, Trash2, Camera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import ItemCard from '../components/ItemCard';
import client from '../api/client';
import './ProfilePage.css';

const ProfilePage = () => {
    const { t } = useLanguage();
    const { user: authUser, logout, isAuthenticated, setUser: setAuthUser } = useAuth();
    const { posts, items, likedPostIds, deletePost, deleteItem } = usePosts();
    const navigate = useNavigate();

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

    // 同步authUser到localUser
    useEffect(() => {
        setLocalUser(authUser);
    }, [authUser]);

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
        const fetchBadges = async () => {
            if (user) {
                try {
                    const response = await client.get('/badges/me');
                    setOwnedBadges(response.data);
                } catch (error) {
                    console.error("Failed to fetch badges", error);
                }
            }
        };
        fetchBadges();
    }, [user]);

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

    if (!user) {
        return (
            <div className="profile-page">
                <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <h2>{t.profile?.pleaseLoginTitle || t.common?.loginRequired || 'ログインしてください'}</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>{t.common?.login || 'ログイン'}</button>
                </div>
            </div>
        );
    }

    // Filter data for current user
    const myPosts = posts.filter(p => {
        if (!p.author && !p.author_id) return false;
        return (p.author?.id === user.id) || (p.author_id === user.id);
    });
    const myItems = items.filter(i => (i.user_id === user.id) || (i.owner?.id === user.id));
    const likedPosts = posts.filter(p => likedPostIds.includes(p.id));

    console.log('ProfilePage - posts:', posts.length, 'myPosts:', myPosts.length, 'items:', items.length, 'myItems:', myItems.length);

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
                        <label className="cover-upload-btn">
                            <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
                            <Camera size={18} color="white" />
                            <span style={{ color: 'white', fontSize: '0.875rem', marginLeft: '4px' }}>{t.profile?.changeCover || 'Change cover'}</span>
                        </label>
                    </div>
                    <div className="profile-info-wrapper">
                        <div className="profile-avatar-large">
                            <img
                                src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${user.nickname || 'User'}`}
                                alt="Profile"
                            />
                            {/* Upload Overlay */}
                            <label className="avatar-upload-overlay">
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                                <Camera size={20} color="white" />
                            </label>
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
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>
                                <Settings size={18} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                                <LogOut size={18} />
                                <span>{t.common.logout}</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{myPosts.length}</span>
                            <span className="stat-label">{t.profile?.posts || 'Posts'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{likedPosts.length}</span>
                            <span className="stat-label">{t.profile?.likes || 'Likes'}</span>
                        </div>
                        <div className="stat-item" onClick={() => navigate('/badges')}>
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
                                    <label>{t.profile?.nicknameLabel || 'Nickname'}</label>
                                    <input value={profileNickname} onChange={e => setProfileNickname(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>{t.profile?.majorLabel || 'Major'}</label>
                                    <input value={profileMajor} onChange={e => setProfileMajor(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>{t.profile?.yearLabel || 'Year'}</label>
                                    <input type="number" value={profileYear} onChange={e => setProfileYear(e.target.value)} placeholder="2025" />
                                </div>
                                <div className="form-group">
                                    <label>{t.profile?.gradeLabel || 'Grade'}</label>
                                    <input value={profileGrade} onChange={e => setProfileGrade(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>{t.profile?.bioLabel || 'Bio'}</label>
                                    <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={3} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">{t.profile?.saveProfile || t.common?.save || 'Save'}</button>
                                </div>
                            </form>

                            <hr style={{ margin: '1.25rem 0' }} />

                            <form onSubmit={handleChangePassword}>
                                <h4 style={{ margin: '0.5rem 0' }}>{t.profile?.passwordSectionTitle || 'Change password'}</h4>
                                <div className="form-group">
                                    <label>{t.profile?.oldPasswordLabel || 'Old password'}</label>
                                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>{t.profile?.newPasswordLabel || 'New password'}</label>
                                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
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
                                {myPosts.length > 0 ? (
                                    myPosts.map(post => (
                                        <div key={post.id} className="profile-post-wrapper">
                                            <PostCard post={post} />
                                            <button className="delete-btn" onClick={() => deletePost(post.id)}>
                                                <Trash2 size={16} /> {t.common?.delete || 'Delete'}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <FileText size={48} color="var(--border-light)" />
                                        <p>{t.profile?.noPostsYet || 'No posts yet'}</p>
                                        <button className="btn btn-primary" onClick={() => navigate('/create')}>{t.profile?.createPost || 'Create Post'}</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'likes' && (
                            <div className="profile-list">
                                {likedPosts.length > 0 ? (
                                    likedPosts.map(post => <PostCard key={post.id} post={post} />)
                                ) : (
                                    <div className="empty-state">
                                        <Heart size={48} color="var(--border-light)" />
                                        <p>{t.profile?.noLikedPostsYet || 'No liked posts yet'}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'items' && (
                            <div className="items-grid">
                                {myItems.length > 0 ? (
                                    myItems.map(item => (
                                        <div key={item.id} className="profile-item-wrapper">
                                            <ItemCard item={item} isOwner={true} />
                                            <button className="delete-btn-item" onClick={() => deleteItem(item.id)}>
                                                <Trash2 size={16} /> {t.common?.delete || 'Delete'}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <ShoppingBag size={48} color="var(--border-light)" />
                                        <p>{t.profile?.noItemsYet || 'No items yet'}</p>
                                        <button className="btn btn-primary" onClick={() => navigate('/items')}>{t.nav.items || 'Go to Market'}</button>
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
