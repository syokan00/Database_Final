import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Video, Phone, MessageCircle, Flag, Copy, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './MoreMenu.css';

const ItemMoreMenu = ({ item, isOwner = false, onEdit, onDelete, onMessage }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const { t } = useLanguage();
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // 计算菜单位置
    useEffect(() => {
        if (!showMenu || !buttonRef.current) return;

        const updatePosition = () => {
            if (!buttonRef.current) return;
            
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuWidth = 200; // 菜单宽度
            const estimatedMenuHeight = 250; // 估算的菜单高度
            
            // 计算位置（基于视口坐标，因为菜单是 fixed 定位）
            let top = buttonRect.bottom + 8;
            let right = window.innerWidth - buttonRect.right;
            
            // 检查是否超出底部
            if (top + estimatedMenuHeight > window.innerHeight) {
                top = buttonRect.top - estimatedMenuHeight - 8;
            }
            
            // 检查是否超出右侧
            if (right + menuWidth > window.innerWidth) {
                right = window.innerWidth - buttonRect.left - menuWidth;
            }
            
            // 确保不超出顶部和左侧
            top = Math.max(8, Math.min(top, window.innerHeight - estimatedMenuHeight - 8));
            right = Math.max(8, Math.min(right, window.innerWidth - menuWidth - 8));
            
            setMenuPosition({ top, right });
        };

        // 使用 requestAnimationFrame 确保 DOM 已更新
        requestAnimationFrame(() => {
            updatePosition();
        });
        
        // 监听窗口大小变化和滚动
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [showMenu]);

    // 点击外部关闭菜单
    useEffect(() => {
        if (!showMenu) return;

        const handleClickOutside = (event) => {
            if (menuRef.current && 
                buttonRef.current &&
                !menuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        // 延迟添加，避免立即触发
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleVideoCall = () => {
        alert(t.items?.videoCall || 'Video call');
        setShowMenu(false);
    };

    const handleVoiceCall = () => {
        if (item.owner?.phone) {
            window.location.href = `tel:${item.owner.phone}`;
        } else {
            alert(t.items?.noPhone || 'No phone number');
        }
        setShowMenu(false);
    };

    const handleMessage = () => {
        if (onMessage) {
            onMessage();
        } else {
            alert(t.common?.featureInDev || 'この機能は開発中です');
        }
        setShowMenu(false);
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/items/${item.id}`;
        navigator.clipboard.writeText(url);
        alert(t.common?.linkCopied || 'Link copied');
        setShowMenu(false);
    };

    const handleReport = () => {
        if (window.confirm(t.items?.reportConfirm || 'Report this item?')) {
            alert(t.items?.reportReceived || 'Report received');
        }
        setShowMenu(false);
    };

    return (
        <div className="more-menu-container" style={{ position: 'relative' }}>
            <button 
                ref={buttonRef}
                className="btn-icon more-btn"
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(prev => !prev);
                }}
                title={t.common?.moreOptions || "More options"}
                style={{ 
                    padding: '0.5rem',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 1
                }}
            >
                <MoreVertical size={20} strokeWidth={2.5} />
            </button>

            {showMenu && createPortal(
                <>
                    <div 
                        className="menu-overlay" 
                        onClick={() => setShowMenu(false)}
                    />
                    <div 
                        ref={menuRef} 
                        className="more-menu-dropdown"
                        style={{
                            top: `${menuPosition.top}px`,
                            right: `${menuPosition.right}px`
                        }}
                    >
                        {isOwner ? (
                            <>
                                <button className="menu-item" onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit && onEdit();
                                    setShowMenu(false);
                                }}>
                                    <Edit size={18} />
                                    <span>{t.common?.edit || 'Edit'}</span>
                                </button>
                                <button className="menu-item danger" onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete && onDelete();
                                    setShowMenu(false);
                                }}>
                                    <Trash2 size={18} />
                                    <span>{t.common?.delete || 'Delete'}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="menu-item" onClick={handleVideoCall}>
                                    <Video size={18} />
                                    <span>{t.items?.videoCall || 'Video call'}</span>
                                </button>
                                <button className="menu-item" onClick={handleVoiceCall}>
                                    <Phone size={18} />
                                    <span>{t.items?.voiceCall || 'Voice call'}</span>
                                </button>
                                <button className="menu-item" onClick={handleMessage}>
                                    <MessageCircle size={18} />
                                    <span>{t.items?.message || 'Message'}</span>
                                </button>
                                <div className="menu-divider" />
                            </>
                        )}
                        <button className="menu-item" onClick={handleCopyLink}>
                            <Copy size={18} />
                            <span>{t.items?.copyLink || 'Copy link'}</span>
                        </button>
                        {!isOwner && (
                            <>
                                <div className="menu-divider" />
                                <button className="menu-item danger" onClick={handleReport}>
                                    <Flag size={18} />
                                    <span>{t.items?.report || 'Report'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

export default ItemMoreMenu;

