import React, { useState } from 'react';
import { MessageCircle, Heart, Share2, Trash2, Star } from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import FileAttachment from './FileAttachment';
import ImageLightbox from './ImageLightbox';
import client from '../api/client';
import './PostCard.css';

const PostCard = ({ post, highlight = false }) => {
    const { toggleLike, deletePost, toggleFavorite, likedPostIds, favoritedPostIds, followingUserIds, toggleFollowUser, refreshPosts } = usePosts();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [lightboxImage, setLightboxImage] = useState(null);
    const postRef = React.useRef(null);

    // 如果被高亮，滚动到该帖子
    React.useEffect(() => {
        if (highlight && postRef.current) {
            setTimeout(() => {
                postRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // 添加高亮效果
                postRef.current.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
                setTimeout(() => {
                    if (postRef.current) {
                        postRef.current.style.boxShadow = '';
                    }
                }, 2000);
            }, 100);
        }
    }, [highlight]);

    // Check if liked by current user
    const isLiked = post.liked_by_me || likedPostIds.includes(post.id);
    const isFavorited = post.favorited_by_me || favoritedPostIds.includes(post.id);
    // Check if current user is the owner
    const isOwner = user && post.author && (post.author.id === user.id || post.author_id === user.id);
    const authorId = post.author?.id;
    const isFollowingAuthor = !!user && !!authorId && (followingUserIds || []).includes(authorId);
    
    console.log('PostCard Debug:', {
        postId: post.id,
        userId: user?.id,
        authorId: post.author?.id,
        postAuthorId: post.author_id,
        isOwner: isOwner,
        isLiked: isLiked,
        isFavorited: isFavorited
    });

    const handleLike = () => {
        console.log('Like button clicked, post.id:', post.id);
        toggleLike(post.id);
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        
        try {
            console.log('Submitting comment:', commentText);
            await client.post('/comments', {
                post_id: post.id,
                content: commentText.trim()
            });
            setCommentText('');
            alert(t.postCard?.commentPosted || 'Comment posted');
            // 刷新以显示新评论（避免整页 reload）
            await refreshPosts?.();
        } catch (error) {
            console.error('Comment failed:', error);
            alert((t.postCard?.commentPostFailed || 'Comment failed') + ': ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm(t.postCard?.deleteCommentConfirm || t.common?.deleteConfirm || 'Delete this comment?')) return;
        
        try {
            await client.delete(`/comments/${commentId}`);
            alert(t.postCard?.commentDeleted || 'Deleted');
            await refreshPosts?.();
        } catch (error) {
            console.error('Delete comment failed:', error);
            alert(t.postCard?.commentDeleteFailed || t.common?.deleteFailed || 'Delete failed');
        }
    };

    const handleDelete = () => {
        if (window.confirm('本当に削除しますか？')) {
            deletePost(post.id);
        }
    };

    const getCategoryLabel = (cat) => {
        switch (cat) {
            case 'lab': return '研究室';
            case 'job': return '就活';
            case 'class': return '授業';
            default: return 'その他';
        }
    };

    return (
        <div className="post-card" ref={postRef} data-post-id={post.id}>
            {/* 1. Category Badge at Top Left */}
            <div className="post-header-top">
                <span className={`category-badge tag-${post.category}`}>
                    {getCategoryLabel(post.category)}
                </span>
                {isOwner && (
                    <button className="icon-btn-small" onClick={handleDelete} title="削除">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* 2. Author & Date */}
            <div className="post-meta-simple">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span className="author-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.author?.nickname || post.author?.email || 'Anonymous'}
                    </span>
                    {!!user && !!authorId && !isOwner && (
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.25rem 0.6rem', borderRadius: '9999px' }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFollowUser(authorId).catch(err => {
                                    alert((t.common?.followFailed || 'Follow failed') + ': ' + (err.response?.data?.detail || err.message));
                                });
                            }}
                            title={isFollowingAuthor ? (t.common?.following || 'Following') : (t.common?.follow || 'Follow')}
                        >
                            {isFollowingAuthor ? (t.common?.following || 'Following') : (t.common?.follow || 'Follow')}
                        </button>
                    )}
                </div>
                <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>

            {/* 3. Title */}
            <h3 className="post-title">{post.title}</h3>

            {/* 4. Content */}
            <p className="post-text">{post.content}</p>

            {/* 4.5. Images */}
            {post.image_urls && post.image_urls.trim() && (
                <div className="post-images">
                    {post.image_urls.split(',').filter(url => url.trim()).map((url, index) => (
                        <img 
                            key={index} 
                            src={url.trim()} 
                            alt={`Post image ${index + 1}`} 
                            className="post-image" 
                            onClick={() => setLightboxImage(url.trim())}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>
            )}

            {/* Image Lightbox */}
            {lightboxImage && (
                <ImageLightbox 
                    imageUrl={lightboxImage} 
                    onClose={() => setLightboxImage(null)} 
                />
            )}

            {/* 4.6. File Attachments */}
            {post.attachments && post.attachments.length > 0 && (
                <div className="post-attachments">
                    {post.attachments.map((file, index) => (
                        <FileAttachment 
                            key={index} 
                            file={file} 
                            showRemove={false}
                        />
                    ))}
                </div>
            )}

            {/* 5. Tags */}
            <div className="post-tags-simple">
                {/* Also showing category as a tag if needed, but usually redundant if badge is there. 
            User example showed "研究室#研究室#悩み", so maybe category name + tags */}
                <span className="hash-tag">#{getCategoryLabel(post.category)}</span>
                {post.tags && post.tags.map((tag, i) => (
                    // Avoid duplicate category tag if it's already in tags
                    tag !== post.category && <span key={i} className="hash-tag">#{tag}</span>
                ))}
            </div>

            {/* Footer */}
            <div className="post-footer">
                <button
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (user) {
                            handleLike();
                        } else {
                            alert(t.common?.loginRequired || 'ログインが必要です');
                        }
                    }}
                    title={user ? (isLiked ? 'いいね解除' : 'いいね') : 'ログインが必要です'}
                    style={{ cursor: user ? 'pointer' : 'not-allowed' }}
                >
                    <Heart size={20} fill={isLiked ? "#EF4444" : "none"} stroke={isLiked ? "#EF4444" : "currentColor"} strokeWidth={2.5} />
                    <span>{post.likes || 0}</span>
                </button>
                <button
                    className={`action-btn ${isFavorited ? 'favorited' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (user && toggleFavorite) {
                            toggleFavorite(post.id);
                        } else {
                            alert(t.common?.loginRequired || 'ログインが必要です');
                        }
                    }}
                    title={user ? (isFavorited ? 'お気に入り解除' : 'お気に入り') : 'ログインが必要です'}
                    style={{ cursor: user ? 'pointer' : 'not-allowed' }}
                >
                    <Star size={20} fill={isFavorited ? "#F59E0B" : "none"} stroke={isFavorited ? "#F59E0B" : "currentColor"} strokeWidth={2.5} />
                </button>
                <button
                    className="action-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (user) {
                            setShowComments(!showComments);
                        } else {
                            alert(t.common?.loginRequired || 'ログインが必要です');
                        }
                    }}
                    title={user ? 'コメント' : 'ログインが必要です'}
                    style={{ cursor: user ? 'pointer' : 'not-allowed' }}
                >
                    <MessageCircle size={20} strokeWidth={2.5} />
                    <span>{post.comments ? post.comments.length : 0}</span>
                </button>
                <button 
                    className="action-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (navigator.share) {
                            navigator.share({
                                title: post.title,
                                text: post.content,
                                url: window.location.href
                            }).catch(err => console.log('Share failed:', err));
                        } else {
                            // Fallback: copy link
                            navigator.clipboard.writeText(window.location.href);
                            alert(t.common?.linkCopied || 'Link copied');
                        }
                    }}
                    title="Share"
                >
                    <Share2 size={20} strokeWidth={2.5} />
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    {/* 显示现有评论 */}
                    {post.comments && post.comments.length > 0 && (
                        <div className="comments-list">
                            {post.comments.map((comment) => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-avatar">
                                        <img 
                                            src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.nickname || 'User'}`} 
                                            alt={comment.author?.nickname}
                                        />
                                    </div>
                                    <div className="comment-content">
                                        <div className="comment-header">
                                            <span className="comment-author">{comment.author?.nickname || 'Anonymous'}</span>
                                            <span className="comment-time">{new Date(comment.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="comment-text">{comment.content}</p>
                                    </div>
                                    {user && comment.author && comment.author.id === user.id && (
                                        <button 
                                            className="comment-delete-btn"
                                            onClick={() => handleDeleteComment(comment.id)}
                                            title="削除"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* 评论输入框 */}
                    <div className="comment-input-wrapper">
                        <input
                            type="text"
                            placeholder="コメントを書く..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && commentText.trim()) {
                                    handleComment();
                                }
                            }}
                        />
                        <button 
                            className="btn-send" 
                            disabled={!commentText.trim()}
                            onClick={handleComment}
                        >
                            送信
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
