import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Share2, ThumbsUp, BookOpen, ShoppingBag, Compass, Star, Award, Zap, Shield, Smile, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import './BadgePage.css';

// Badge Configuration with Keys for Translation
const BADGE_CONFIG = [
    // 1. Learning
    {
        id: 1,
        key: 'first_post',
        image: 'https://ui-avatars.com/api/?name=FP&background=10B981&color=fff&size=200',
        category: 'study',
        icon: <BookOpen size={20} />,
        color: '#10B981'
    },
    {
        id: 2,
        key: 'night_owl',
        image: 'https://ui-avatars.com/api/?name=NO&background=4B5563&color=fff&size=200',
        category: 'study',
        icon: <Star size={20} />,
        color: '#4B5563'
    },
    {
        id: 3,
        key: 'streak_poster',
        image: 'https://ui-avatars.com/api/?name=SP&background=F59E0B&color=fff&size=200',
        category: 'study',
        icon: <Award size={20} />,
        color: '#F59E0B'
    },
    {
        id: 4,
        key: 'polyglot',
        image: 'https://ui-avatars.com/api/?name=PL&background=3B82F6&color=fff&size=200',
        category: 'study',
        icon: <MessageCircle size={20} />,
        color: '#3B82F6'
    },

    // 2. Social
    {
        id: 5,
        key: 'heart_collector',
        image: 'https://ui-avatars.com/api/?name=HC&background=EF4444&color=fff&size=200',
        category: 'social',
        icon: <Heart size={20} />,
        color: '#EF4444'
    },
    {
        id: 6,
        key: 'comment_king',
        image: 'https://ui-avatars.com/api/?name=CK&background=8B5CF6&color=fff&size=200',
        category: 'social',
        icon: <MessageCircle size={20} />,
        color: '#8B5CF6'
    },
    {
        id: 7,
        key: 'helpful_friend',
        image: 'https://ui-avatars.com/api/?name=HF&background=EC4899&color=fff&size=200',
        category: 'social',
        icon: <Shield size={20} />,
        color: '#EC4899'
    },

    // 3. Trade
    {
        id: 8,
        key: 'smart_buyer',
        image: 'https://ui-avatars.com/api/?name=SB&background=06B6D4&color=fff&size=200',
        category: 'trade',
        icon: <ShoppingBag size={20} />,
        color: '#06B6D4'
    },
    {
        id: 9,
        key: 'top_seller',
        image: 'https://ui-avatars.com/api/?name=TS&background=14B8A6&color=fff&size=200',
        category: 'trade',
        icon: <ShoppingBag size={20} />,
        color: '#14B8A6'
    },
    {
        id: 10,
        key: 'treasure_hunter',
        image: 'https://ui-avatars.com/api/?name=TH&background=F97316&color=fff&size=200',
        category: 'trade',
        icon: <Compass size={20} />,
        color: '#F97316'
    },

    // 4. Fun
    {
        id: 11,
        key: 'lucky_clover',
        image: 'https://ui-avatars.com/api/?name=LC&background=10B981&color=fff&size=200',
        category: 'fun',
        icon: <Zap size={20} />,
        color: '#10B981'
    },
    {
        id: 12,
        key: 'heart_artist',
        image: 'https://ui-avatars.com/api/?name=HA&background=E11D48&color=fff&size=200',
        category: 'fun',
        icon: <Heart size={20} />,
        color: '#E11D48'
    },
    {
        id: 13,
        key: 'brave_beginner',
        image: 'https://ui-avatars.com/api/?name=BB&background=6366F1&color=fff&size=200',
        category: 'fun',
        icon: <Smile size={20} />,
        color: '#6366F1'
    },
    {
        id: 14,
        key: 'lost_scholar',
        image: 'https://ui-avatars.com/api/?name=LS&background=8B5CF6&color=fff&size=200',
        category: 'fun',
        icon: <Compass size={20} />,
        color: '#8B5CF6'
    }
];

const CATEGORIES = [
    { id: 'all', label: 'All', icon: <Award size={16} /> },
    { id: 'study', label: 'Study', icon: <BookOpen size={16} /> },
    { id: 'social', label: 'Social', icon: <Heart size={16} /> },
    { id: 'trade', label: 'Trade', icon: <ShoppingBag size={16} /> },
    { id: 'fun', label: 'Fun', icon: <Smile size={16} /> },
];

// Mock Owned Badges (In a real app, this comes from API)
// const OWNED_BADGES = [1, 5, 11, 13];

const BadgePage = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    // Interaction States
    const [liked, setLiked] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);

    const [ownedBadges, setOwnedBadges] = useState([]);

    useEffect(() => {
        const fetchBadges = async () => {
            if (user) {
                try {
                    // Try to get user badges
                    const response = await client.get('/badges/me');
                    setOwnedBadges(response.data || []);
                } catch (error) {
                    // If error, just show empty badges
                    console.log("Failed to fetch user badges:", error);
                    setOwnedBadges([]);
                }
            } else {
                setOwnedBadges([]);
            }
        };
        fetchBadges();
    }, [user]);

    // Merge config with translations and ownership
    const badges = BADGE_CONFIG.map(badge => {
        const trans = t.badgesList?.[badge.key] || {};
        // Check if owned - handle both array of UserBadgeOut and array of badges
        let userBadge = null;
        if (ownedBadges && ownedBadges.length > 0) {
            userBadge = ownedBadges.find(ub => {
                if (ub.badge) {
                    return ub.badge.name === badge.key || ub.badge.id === badge.id;
                }
                return false;
            });
        }
        const isOwned = !!userBadge;

        return {
            ...badge,
            title: trans.title || badge.key,
            condition: trans.condition || '',
            description: trans.description || '',
            titleEn: badge.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            isOwned,
            date: isOwned && userBadge?.awarded_at ? new Date(userBadge.awarded_at).toLocaleDateString() : null,
            no: isOwned ? `No.${badge.id.toString().padStart(3, '0')}` : '???'
        };
    });

    const filteredBadges = activeCategory === 'all'
        ? badges
        : badges.filter(b => b.category === activeCategory);

    const handleLike = () => {
        setLiked(!liked);
        // In real app, call API
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setComments([...comments, { text: comment, date: 'Just now' }]);
        setComment('');
    };

    const handleShare = () => {
        alert(t.user.share + ': Link copied to clipboard!');
    };

    return (
        <div className="badge-page">
            <div className="container">
                <h1 className="page-title">{t.badge.collection}</h1>

                {/* Category Filter */}
                <div className="category-filter">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.icon}
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div className="badge-grid">
                    {filteredBadges && filteredBadges.length > 0 ? filteredBadges.map((badge) => (
                        <div
                            key={badge.id}
                            className={`badge-item ${!badge.isOwned ? 'locked' : ''}`}
                            onClick={() => {
                                setSelectedBadge(badge);
                                setLiked(false); // Reset like for new modal
                                setComments([]); // Reset comments
                            }}
                        >
                            <div className="badge-circle-wrapper">
                                <div className="badge-circle" style={{ borderColor: badge.isOwned ? badge.color : '#ccc' }}>
                                    <img src={badge.image} alt={badge.title} className="badge-img" />
                                    {!badge.isOwned && (
                                        <div className="locked-overlay">
                                            <Lock size={24} />
                                        </div>
                                    )}
                                </div>
                                {badge.isOwned && (
                                    <div className="badge-icon-overlay" style={{ background: badge.color }}>
                                        {badge.icon}
                                    </div>
                                )}
                            </div>
                            <span className="badge-title">{badge.title}</span>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>No badges available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedBadge && (
                <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
                    <div
                        className={`badge-modal ${!selectedBadge.isOwned ? 'modal-locked' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: selectedBadge.isOwned
                                ? `linear-gradient(180deg, ${selectedBadge.color} 0%, ${adjustColor(selectedBadge.color, -20)} 100%)`
                                : 'linear-gradient(180deg, #9CA3AF 0%, #4B5563 100%)'
                        }}
                    >
                        <div className="modal-header">
                            <button className="close-btn" onClick={() => setSelectedBadge(null)}>
                                <X size={20} color="white" />
                                <span>{t.badge.close}</span>
                            </button>
                        </div>

                        <div className="modal-content-scroll">
                            <div className="detail-badge-wrapper">
                                <div className={`detail-badge-circle ${!selectedBadge.isOwned ? 'grayscale' : ''}`}>
                                    <div className="badge-overlay-text">
                                        {selectedBadge.isOwned ? (
                                            <>
                                                <span className="label">{t.badge.owner}</span>
                                                <span className="value">You</span>
                                                <span className="label">{t.badge.acquired}</span>
                                                <span className="value">{selectedBadge.date}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={32} style={{ marginBottom: '0.5rem' }} />
                                                <span className="value">LOCKED</span>
                                            </>
                                        )}
                                    </div>
                                    <img src={selectedBadge.image} alt={selectedBadge.title} />
                                </div>
                            </div>

                            <div className="badge-id-tag">
                                {selectedBadge.no}
                            </div>

                            <h2 className="detail-title">{selectedBadge.title}</h2>
                            <p className="detail-subtitle">{selectedBadge.titleEn}</p>

                            <div className="info-card highlight-card">
                                <h3>{t.badge.condition}</h3>
                                <p>{selectedBadge.condition}</p>
                            </div>

                            <div className="info-card">
                                <h3>{t.badge.description}</h3>
                                <p className="badge-description">
                                    {selectedBadge.description}
                                </p>
                            </div>

                            {/* User Actions - Only if Owned? Or allow interaction anyway? Let's allow interaction but maybe different context */}
                            <div className="user-actions">
                                <button className={`action-btn ${liked ? 'active' : ''}`} onClick={handleLike}>
                                    <Heart size={24} fill={liked ? "white" : "none"} />
                                    <span>{liked ? "Liked!" : t.user.like}</span>
                                </button>
                                <button className="action-btn" onClick={() => document.getElementById('modal-comment-input').focus()}>
                                    <MessageCircle size={24} />
                                    <span>{t.user.comment}</span>
                                </button>
                                <button className="action-btn" onClick={handleShare}>
                                    <Share2 size={24} />
                                    <span>{t.user.share}</span>
                                </button>
                            </div>

                            {/* Simple Comment Section in Modal */}
                            <div className="modal-comments">
                                {comments.map((c, i) => (
                                    <div key={i} className="modal-comment-item">
                                        <span>{c.text}</span>
                                    </div>
                                ))}
                                <form onSubmit={handleCommentSubmit} className="modal-comment-form">
                                    <input
                                        id="modal-comment-input"
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Write a comment..."
                                    />
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper to darken color for gradient
const adjustColor = (color, amount) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

export default BadgePage;
