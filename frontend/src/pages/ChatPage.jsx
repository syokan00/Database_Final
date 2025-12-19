import React, { useEffect, useMemo, useState } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import client from '../api/client';
import './ChatPage.css';

const MOCK_CHATS = [
    {
        id: 1,
        user: 'B1学生',
        avatar: 'https://ui-avatars.com/api/?name=B1&background=random',
        lastMessage: '教科書の受け渡し場所について...',
        time: '10:30',
        unread: 2,
        messages: [
            { id: 1, text: 'こんにちは！線形代数の教科書に興味があります。', sender: 'them', time: '10:00' },
            { id: 2, text: 'ありがとうございます！まだありますよ。', sender: 'me', time: '10:05' },
            { id: 3, text: '今日の昼休みに食堂で受け渡し可能ですか？', sender: 'them', time: '10:30' }
        ]
    },
    {
        id: 2,
        user: 'M2修了生',
        avatar: 'https://ui-avatars.com/api/?name=M2&background=random',
        lastMessage: 'ありがとうございます！',
        time: 'Yesterday',
        unread: 0,
        messages: [
            { id: 1, text: '電子レンジの件ですが...', sender: 'me', time: 'Yesterday' },
            { id: 2, text: 'はい、3月末までならいつでも大丈夫です。', sender: 'them', time: 'Yesterday' },
            { id: 3, text: 'ありがとうございます！', sender: 'me', time: 'Yesterday' }
        ]
    }
];

const ChatPage = () => {
    const navigate = useNavigate();
    const { id, type } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const { t } = useLanguage();
    const isItemChat = type === 'item';
    const itemId = isItemChat ? parseInt(id) : null;

    const [activeChatId, setActiveChatId] = useState(id ? parseInt(id) : 1);
    const [inputText, setInputText] = useState('');

    // 如果是从商品进入，显示商品和卖家信息
    const [itemInfo, setItemInfo] = useState(location.state?.item || null);
    const [seller, setSeller] = useState(location.state?.seller || null);

    const activeChat = MOCK_CHATS.find(c => c.id === activeChatId) || MOCK_CHATS[0];
    const [messages, setMessages] = useState(activeChat.messages);

    // item chat：如果刷新页面导致 state 丢失，尝试从后端补齐 item/seller
    useEffect(() => {
        if (!isItemChat) return;
        if (!itemId || Number.isNaN(itemId)) return;
        if (itemInfo && seller) return;

        const fetchItem = async () => {
            try {
                const res = await client.get(`/items/${itemId}`);
                setItemInfo(res.data);
                setSeller(res.data?.owner || null);
            } catch (err) {
                console.error('Failed to fetch item for chat:', err);
            }
        };

        fetchItem();
    }, [isItemChat, itemId, itemInfo, seller]);

    // item chat：localStorage 持久化（轻量版“联络卖家”，无需后端聊天系统也能用）
    const itemChatKey = useMemo(() => {
        if (!isItemChat) return null;
        if (!user?.id) return null;
        if (!itemId || Number.isNaN(itemId)) return null;
        const sellerId = seller?.id || itemInfo?.owner?.id || 'unknown';
        return `chat:item:${itemId}:buyer:${user.id}:seller:${sellerId}`;
    }, [isItemChat, user?.id, itemId, seller?.id, itemInfo?.owner?.id]);

    useEffect(() => {
        if (!isItemChat) return;
        if (!itemChatKey) return;
        try {
            const raw = localStorage.getItem(itemChatKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                setMessages(Array.isArray(parsed) ? parsed : []);
            } else {
                setMessages([]);
            }
        } catch (e) {
            console.error('Failed to load chat from storage:', e);
            setMessages([]);
        }
    }, [isItemChat, itemChatKey]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: inputText.trim(),
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const next = [...messages, newMessage];
        setMessages(next);

        if (isItemChat && itemChatKey) {
            try {
                localStorage.setItem(itemChatKey, JSON.stringify(next));
            } catch (err) {
                console.error('Failed to persist chat:', err);
            }
        }
        setInputText('');
    };

    // item chat：若未登录，提示并引导登录
    if (isItemChat && !user) {
        return (
            <div className="chat-page">
                <div className="chat-container glass" style={{ padding: '2rem' }}>
                    <h2 style={{ marginTop: 0 }}>{t.profile?.pleaseLoginTitle || 'ログインしてください'}</h2>
                    <p>ログインすると出品者へメッセージを送れます。</p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>{t.common?.login || 'ログイン'}</button>
                </div>
            </div>
        );
    }

    // item chat：用商品/卖家信息渲染真实入口（不再用 MOCK）
    if (isItemChat) {
        const sellerName = seller?.nickname || seller?.email || '出品者';
        const sellerAvatar = seller?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=10b981&color=fff`;

        return (
            <div className="chat-page">
                <div className="chat-container glass">
                    <div className="chat-main">
                        <div className="chat-header">
                            <button className="back-btn" onClick={() => navigate(-1)}>
                                <ArrowLeft size={20} />
                            </button>
                            <img src={sellerAvatar} alt={sellerName} className="header-avatar" />
                            <div className="header-info">
                                <h3 style={{ margin: 0 }}>{sellerName}</h3>
                                <span className="status-indicator">
                                    {itemInfo?.title ? `商品：${itemInfo.title}` : '出品者に連絡'}
                                </span>
                            </div>
                            <div className="header-actions">
                                <button className="icon-btn" title="Phone"><Phone size={20} /></button>
                                <button className="icon-btn" title="Video"><Video size={20} /></button>
                                <button className="icon-btn" title="More"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        <div className="messages-area">
                            {messages.length > 0 ? (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                        <p>{msg.text}</p>
                                        <span className="message-time">{msg.time}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>
                                    まだメッセージがありません。まずは挨拶してみましょう。
                                </div>
                            )}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="メッセージを入力..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button type="submit" className="send-btn">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <div className="chat-container glass">
                {/* Sidebar (Chat List) */}
                <div className={`chat-sidebar ${id ? 'hidden-mobile' : ''}`}>
                    <div className="sidebar-header">
                        <h2>メッセージ</h2>
                    </div>
                    <div className="chat-list">
                        {MOCK_CHATS.map(chat => (
                            <div
                                key={chat.id}
                                className={`chat-list-item ${activeChatId === chat.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveChatId(chat.id);
                                    setMessages(chat.messages);
                                    navigate(`/chat/${chat.id}`);
                                }}
                            >
                                <img src={chat.avatar} alt={chat.user} className="chat-avatar" />
                                <div className="chat-info">
                                    <div className="chat-top">
                                        <span className="chat-name">{chat.user}</span>
                                        <span className="chat-time">{chat.time}</span>
                                    </div>
                                    <p className="chat-preview">{chat.lastMessage}</p>
                                </div>
                                {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`chat-main ${!id ? 'hidden-mobile' : ''}`}>
                    <div className="chat-header">
                        <button className="back-btn mobile-only" onClick={() => navigate('/chat')}>
                            <ArrowLeft size={20} />
                        </button>
                        <img src={activeChat.avatar} alt={activeChat.user} className="header-avatar" />
                        <div className="header-info">
                            <h3>{activeChat.user}</h3>
                            <span className="status-indicator">Online</span>
                        </div>
                        <div className="header-actions">
                            <button className="icon-btn"><Phone size={20} /></button>
                            <button className="icon-btn"><Video size={20} /></button>
                            <button className="icon-btn"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    <div className="messages-area">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                <p>{msg.text}</p>
                                <span className="message-time">{msg.time}</span>
                            </div>
                        ))}
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit" className="send-btn">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
