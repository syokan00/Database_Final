import React, { useEffect, useMemo, useState } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import client from '../api/client';
import './ChatPage.css';

// MOCK_CHATS: 開発環境のみ表示、本番環境では空（後でバックエンド API と統合予定）
const MOCK_CHATS = import.meta.env.DEV ? [
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
] : [];

const ChatPage = () => {
    const navigate = useNavigate();
    const { id, type } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const { t } = useLanguage();
    const isItemChat = type === 'item';
    const itemId = isItemChat ? parseInt(id) : null;

    const [activeChatId, setActiveChatId] = useState(id ? parseInt(id) : null);
    const [inputText, setInputText] = useState('');

    // 如果是从商品进入，显示商品和卖家信息
    const [itemInfo, setItemInfo] = useState(location.state?.item || null);
    const [seller, setSeller] = useState(location.state?.seller || null);
    const [buyer, setBuyer] = useState(null); // 卖家视角：买家信息

    // 非商品聊天：只使用MOCK数据（开发环境），生产环境为空
    const activeChat = !isItemChat && activeChatId 
        ? MOCK_CHATS.find(c => c.id === activeChatId) 
        : null;
    const [messages, setMessages] = useState(activeChat?.messages || []);

    // item chat：如果刷新页面导致 state 丢失，尝试从后端补齐 item/seller
    useEffect(() => {
        if (!isItemChat) return;
        if (!itemId || Number.isNaN(itemId)) return;
        if (itemInfo && seller) return;

        const fetchItem = async () => {
            try {
                const res = await client.get(`/items/${itemId}`);
                const itemData = res.data;
                setItemInfo(itemData);
                // 确保seller被设置（从itemData.owner获取）
                if (itemData?.owner) {
                    setSeller(itemData.owner);
                }
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

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        if (!user) return;

        const messageText = inputText.trim();
        setInputText(''); // 立即清空输入框，提供即时反馈

        // 如果是商品聊天，使用后端API
        if (isItemChat && itemId) {
            try {
                // 确定接收者：买家发给卖家，卖家发给买家
                const isSeller = itemInfo?.owner?.id === user.id || seller?.id === user.id;
                let receiverId = null;
                
                if (isSeller) {
                    // 卖家：需要知道买家ID（从URL参数或已存在的消息中获取）
                    const urlParams = new URLSearchParams(window.location.search);
                    const buyerId = urlParams.get('buyerId');
                    if (buyerId) {
                        receiverId = parseInt(buyerId);
                    } else if (messages.length > 0 && messages[0].sender_id) {
                        // 从第一条消息中查找买家ID（消息来自API响应，有sender_id字段）
                        // 这里需要从原始响应中获取，暂时从seller推断
                        // 如果seller存在且不是自己，说明seller是买家
                        if (seller && seller.id !== user.id) {
                            receiverId = seller.id;
                        }
                    }
                    
                    // 如果没有从URL获取到，尝试从buyer state获取
                    if (!receiverId && buyer && buyer.id) {
                        receiverId = buyer.id;
                    }
                    
                    if (!receiverId) {
                        alert(t.chat?.selectBuyer || '買い手を選択してください。通知からメッセージを開くか、ページをリロードしてください。');
                        setInputText(messageText); // 恢复输入
                        return;
                    }
                } else {
                    // 买家：接收者是卖家
                    receiverId = seller?.id || itemInfo?.owner?.id;
                }
                
                if (!receiverId) {
                    alert(t.chat?.receiverUnknown || 'メッセージの送信先が不明です');
                    setInputText(messageText); // 恢复输入
                    return;
                }
                
                const response = await client.post(`/messages/items/${itemId}`, {
                    content: messageText,
                    receiver_id: receiverId
                });

                // 重新获取消息列表
                await fetchItemMessages();
            } catch (error) {
                console.error('Failed to send message:', error);
                alert((t.chat?.messageFailed || 'メッセージの送信に失敗しました') + ': ' + (error.response?.data?.detail || error.message));
                // 恢复输入框内容
                setInputText(messageText);
            }
        } else {
            // 非商品聊天：使用本地存储（临时方案）
        const newMessage = {
            id: Date.now(),
                text: messageText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const next = [...messages, newMessage];
        setMessages(next);
        }
    };

    // 获取商品聊天消息
    const fetchItemMessages = async () => {
        if (!isItemChat || !itemId || !user) return;

        try {
            // 确定对方用户ID
            // 如果是买家，对方是卖家（商品所有者）
            // 如果是卖家，需要知道买家ID，或者后端会自动返回最近联系的买家
            const isSeller = itemInfo?.owner?.id === user.id || seller?.id === user.id;
            let otherUserId = null;
            
            if (!isSeller) {
                // 买家：对方是卖家
                otherUserId = seller?.id || itemInfo?.owner?.id;
            } else {
                // 卖家：如果有buyerId参数（从通知或URL中获取），使用它
                // 否则后端会返回最近联系的买家
                const urlParams = new URLSearchParams(window.location.search);
                const buyerId = urlParams.get('buyerId');
                if (buyerId) {
                    otherUserId = parseInt(buyerId);
                    // 如果从URL参数获取了buyerId，先获取买家信息
                    try {
                        const buyerRes = await client.get(`/users/${otherUserId}/stats`);
                        if (buyerRes.data && buyerRes.data.user) {
                            setBuyer(buyerRes.data.user);
                        }
                    } catch (e) {
                        console.error('Failed to fetch buyer info:', e);
                    }
                }
            }
            
            const params = otherUserId ? { other_user_id: otherUserId } : {};
            const response = await client.get(`/messages/items/${itemId}`, { params });

            const formattedMessages = (response.data || []).map(msg => ({
                id: msg.id,
                text: msg.content,
                sender: msg.sender_id === user.id ? 'me' : 'them',
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            setMessages(formattedMessages);
            
            // 如果是卖家，从消息中获取买家信息
            if (isSeller) {
                if (response.data && response.data.length > 0) {
                    // 找到买家（不是卖家的那个）
                    for (const msg of response.data) {
                        if (msg.sender_id !== user.id && msg.sender) {
                            // 这是买家发送的消息，获取买家信息
                            setBuyer(msg.sender);
                            break;
                        } else if (msg.receiver_id !== user.id && !buyer) {
                            // 如果消息是卖家发送给买家的，receiver_id是买家
                            // 需要单独获取买家信息
                            try {
                                const buyerRes = await client.get(`/users/${msg.receiver_id}/stats`);
                                if (buyerRes.data && buyerRes.data.user) {
                                    setBuyer(buyerRes.data.user);
                                }
                            } catch (e) {
                                console.error('Failed to fetch buyer info:', e);
                            }
                            break;
                        }
                    }
                } else if (!buyer) {
                    // 如果没有消息，但URL中有buyerId，获取买家信息
                    const urlParams = new URLSearchParams(window.location.search);
                    const buyerId = urlParams.get('buyerId');
                    if (buyerId) {
                        try {
                            const buyerRes = await client.get(`/users/${buyerId}/stats`);
                            if (buyerRes.data && buyerRes.data.user) {
                                setBuyer(buyerRes.data.user);
                            }
                        } catch (e) {
                            console.error('Failed to fetch buyer info from URL:', e);
                        }
                    }
                }
            } else {
                // 买家：确保seller被设置
                if (!seller && itemInfo?.owner) {
                    setSeller(itemInfo.owner);
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            // 如果API失败，尝试从localStorage加载（向后兼容）
            if (itemChatKey) {
                try {
                    const raw = localStorage.getItem(itemChatKey);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        setMessages(Array.isArray(parsed) ? parsed : []);
                    }
                } catch (e) {
                    console.error('Failed to load from storage:', e);
                }
            }
        }
    };

    // 当商品信息加载完成后，获取消息
    useEffect(() => {
        if (isItemChat && itemId && user && (seller || itemInfo)) {
            fetchItemMessages();
            }
    }, [isItemChat, itemId, user, seller, itemInfo]);

    // 额外：如果URL中有buyerId参数，确保获取买家信息（卖家视角）
    useEffect(() => {
        if (!isItemChat || !user) return;
        const isSeller = itemInfo?.owner?.id === user.id || seller?.id === user.id;
        if (!isSeller) return; // 只有卖家需要这个
        
        const urlParams = new URLSearchParams(window.location.search);
        const buyerId = urlParams.get('buyerId');
        if (buyerId && !buyer) {
            const fetchBuyerInfo = async () => {
                try {
                    const buyerRes = await client.get(`/users/${buyerId}/stats`);
                    if (buyerRes.data && buyerRes.data.user) {
                        setBuyer(buyerRes.data.user);
                    }
                } catch (e) {
                    console.error('Failed to fetch buyer info from URL:', e);
                }
            };
            fetchBuyerInfo();
        }
    }, [isItemChat, user, itemInfo, seller, buyer]);

    // item chat：若未登录，提示并引导登录
    if (isItemChat && !user) {
        return (
            <div className="chat-page">
                <div className="chat-container glass" style={{ padding: '2rem' }}>
                    <h2 style={{ marginTop: 0 }}>{t.profile?.pleaseLoginTitle || 'ログインしてください'}</h2>
                    <p>{t.chat?.loginToMessage || 'ログインすると出品者へメッセージを送れます。'}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>{t.common?.login || 'ログイン'}</button>
                </div>
            </div>
        );
    }

    // item chat：用商品/卖家信息渲染真实入口（不再用 MOCK）
    if (isItemChat) {
        const isSeller = itemInfo?.owner?.id === user.id || seller?.id === user.id;
        
        // 确定对方用户：如果是卖家，显示买家；如果是买家，显示卖家
        let otherUser = null;
        let otherUserId = null;
        
        if (isSeller) {
            // 卖家：显示买家
            otherUser = buyer;
            // 尝试从多个来源获取买家ID
            otherUserId = buyer?.id || (() => {
                const urlParams = new URLSearchParams(window.location.search);
                const buyerId = urlParams.get('buyerId');
                return buyerId ? parseInt(buyerId) : null;
            })();
        } else {
            // 买家：显示卖家
            otherUser = seller || itemInfo?.owner;
            otherUserId = seller?.id || itemInfo?.owner?.id;
        }
        
        const otherUserName = otherUser?.nickname || otherUser?.email || (isSeller ? '買い手' : '出品者');
        const otherUserAvatar = otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}&background=10b981&color=fff`;

        return (
            <div className="chat-page">
                <div className="chat-container glass">
                    <div className="chat-main">
                        <div className="chat-header">
                            <button className="back-btn" onClick={() => navigate(-1)}>
                                <ArrowLeft size={20} />
                            </button>
                            <img 
                                src={otherUserAvatar} 
                                alt={otherUserName} 
                                className="header-avatar"
                            />
                            <div className="header-info" style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{otherUserName}</h3>
                                <span className="status-indicator">
                                    {itemInfo?.title ? `${t.chat?.itemChat || '商品'}：${itemInfo.title}` : (isSeller ? (t.chat?.contactBuyer || '買い手と連絡中') : (t.chat?.contactSeller || '出品者に連絡'))}
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
                                    {t.chat?.noChats || 'まだメッセージがありません。まずは挨拶してみましょう。'}
                                </div>
                            )}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder={t.chat?.typeMessage || "メッセージを入力..."}
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
                        <h2>{t.chat?.title || 'メッセージ'}</h2>
                    </div>
                    <div className="chat-list">
                        {MOCK_CHATS.length > 0 ? (
                            MOCK_CHATS.map(chat => (
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
                            ))
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>{t.chat?.noChats || 'まだメッセージはありません'}</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    {t.chat?.loginToMessage || '商品ページから出品者へメッセージを送ることができます'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`chat-main ${!id ? 'hidden-mobile' : ''}`}>
                    {activeChat ? (
                        <>
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
                            placeholder={t.chat?.typeMessage || "Type a message..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit" className="send-btn">
                            <Send size={20} />
                        </button>
                    </form>
                        </>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p>{t.chat?.noChats || 'チャットを選択してください'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
