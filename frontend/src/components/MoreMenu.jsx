import React, { useState } from 'react';
import { MoreVertical, Video, Phone, Bookmark, Flag, Link as LinkIcon, Copy } from 'lucide-react';
import './MoreMenu.css';

const MoreMenu = ({ post }) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleVideoCall = () => {
        alert('视频通话功能开发中...');
        setShowMenu(false);
    };

    const handleVoiceCall = () => {
        alert('语音通话功能开发中...');
        setShowMenu(false);
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(url);
        alert('リンクをコピーしました！');
        setShowMenu(false);
    };

    const handleReport = () => {
        if (window.confirm('この投稿を報告しますか？')) {
            alert('報告を受け付けました。ありがとうございます。');
        }
        setShowMenu(false);
    };

    return (
        <div className="more-menu-container">
            <button 
                className="action-btn more-btn"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
                title="More options"
            >
                <MoreVertical size={20} strokeWidth={2.5} />
            </button>

            {showMenu && (
                <>
                    <div className="menu-overlay" onClick={() => setShowMenu(false)} />
                    <div className="more-menu-dropdown">
                        <button className="menu-item" onClick={handleVideoCall}>
                            <Video size={18} />
                            <span>ビデオ通話</span>
                        </button>
                        <button className="menu-item" onClick={handleVoiceCall}>
                            <Phone size={18} />
                            <span>音声通話</span>
                        </button>
                        <div className="menu-divider" />
                        <button className="menu-item" onClick={handleCopyLink}>
                            <Copy size={18} />
                            <span>リンクをコピー</span>
                        </button>
                        <button className="menu-item" onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: post.title,
                                    text: post.content,
                                    url: window.location.href
                                });
                            }
                            setShowMenu(false);
                        }}>
                            <LinkIcon size={18} />
                            <span>シェア</span>
                        </button>
                        <div className="menu-divider" />
                        <button className="menu-item danger" onClick={handleReport}>
                            <Flag size={18} />
                            <span>報告</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MoreMenu;

