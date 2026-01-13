import React, { useState } from 'react';
import { MessageCircle, Phone, Video, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePosts } from '../contexts/PostContext';
import ItemMoreMenu from './ItemMoreMenu';
import './ItemCard.css';

const ItemCard = ({ item, isOwner = false }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { deleteItem } = usePosts();
    const [showMenu, setShowMenu] = useState(false);

    const handleContact = (e) => {
        e?.stopPropagation?.();
        // 导航到聊天页面，传递商品信息
        navigate(`/chat/item/${item.id}`, { 
            state: { 
                item: item,
                seller: item.owner 
            } 
        });
    };

    const handlePhone = (e) => {
        e.stopPropagation();
        if (item.owner?.phone) {
            window.location.href = `tel:${item.owner.phone}`;
        } else {
            alert(t.items?.noPhone || '電話番号が登録されていません');
        }
    };

    const handleVideo = (e) => {
        e.stopPropagation();
        if (item.owner?.video_link) {
            window.open(item.owner.video_link, '_blank');
        } else {
            alert(t.items?.noVideo || 'ビデオリンクが登録されていません');
        }
    };

    const handleEdit = (e) => {
        e?.stopPropagation?.();
        setShowMenu(false);
        navigate(`/items/${item.id}/edit`);
    };

    const handleDelete = async (e) => {
        e?.stopPropagation?.();
        setShowMenu(false);
        if (window.confirm(t.common?.deleteConfirm || '本当に削除しますか？')) {
            await deleteItem(item.id);
        }
    };

    return (
        <div className="item-card">
            <div className="item-image-wrapper">
                <img 
                    src={item.image_urls || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='} 
                    alt={item.title} 
                    className="item-image"
                    onError={(e) => {
                        // 如果图片加载失败，使用占位符
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                />
                <span className={`item-status status-${item.status}`}>
                    {item.status === 'selling'
                        ? (t.items?.statusSelling || 'Selling')
                        : (t.items?.statusNegotiating || 'Negotiating')}
                </span>
            </div>
            <div className="item-content">
                <div className="item-tags">
                    {item.tags && item.tags.map((tag, i) => (
                        <span key={i} className="item-tag">#{tag}</span>
                    ))}
                </div>
                <h3 className="item-title">{item.title}</h3>
                <div className="item-meta">
                    <span className="item-price">¥{item.price}</span>
                </div>
                <p className="item-desc">{item.description}</p>

                <div className="item-footer">
                    <div className="seller-info">
                        {!item.is_anonymous && item.owner?.avatar_url ? (
                            <img src={item.owner.avatar_url} alt={item.owner.nickname} className="seller-avatar" />
                        ) : (
                            <div className="seller-avatar"></div>
                        )}
                        <span>{item.is_anonymous ? '匿名ユーザー' : (item.owner?.nickname || 'Anonymous')}</span>
                    </div>

                    <div className="item-actions">
                        {isOwner ? (
                            <ItemMoreMenu 
                                item={item} 
                                isOwner={true}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ) : (
                            <>
                                <button 
                                    className="btn-icon" 
                                    onClick={handlePhone}
                                    title={t.items?.call || '電話'}
                                >
                                    <Phone size={18} />
                                </button>
                                <button 
                                    className="btn-icon" 
                                    onClick={handleVideo}
                                    title={t.items?.video || 'ビデオ'}
                                >
                                    <Video size={18} />
                                </button>
                                <button 
                                    className="btn btn-outline-primary btn-sm" 
                                    onClick={handleContact}
                                >
                                    <MessageCircle size={16} style={{ marginRight: '4px' }} />
                                    {t.items?.contact || '連絡する'}
                                </button>
                                <ItemMoreMenu 
                                    item={item} 
                                    isOwner={false}
                                    onMessage={handleContact}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
