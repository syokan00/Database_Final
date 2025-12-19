import React, { useState } from 'react';
import { MoreVertical, Video, Phone, MessageCircle, Flag, Copy, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './MoreMenu.css';

const ItemMoreMenu = ({ item, isOwner = false, onEdit, onDelete, onMessage }) => {
    const [showMenu, setShowMenu] = useState(false);
    const { t } = useLanguage();

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
                className="btn-icon more-btn"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('More menu clicked, current state:', showMenu);
                    setShowMenu(!showMenu);
                }}
                title="More options"
                style={{ 
                    padding: '0.5rem',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <MoreVertical size={20} strokeWidth={2.5} />
            </button>

            {showMenu && (
                <>
                    <div className="menu-overlay" onClick={() => setShowMenu(false)} />
                    <div className="more-menu-dropdown">
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
                </>
            )}
        </div>
    );
};

export default ItemMoreMenu;

