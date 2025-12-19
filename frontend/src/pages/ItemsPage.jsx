import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePosts } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';
import ItemCard from '../components/ItemCard';
import './ItemsPage.css';

const ItemsPage = () => {
    const { t } = useLanguage();
    const { items } = usePosts(); // Use items from Context
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [displayItems, setDisplayItems] = useState([]);

    const handleSell = () => {
        navigate('/create', { state: { category: 'items' } });
    };

    useEffect(() => {
        // Filter Logic
        const filtered = (items || []).filter(item => {
        // 1. Category Filter
        const matchesCategory = filter === 'all' || item.category === filter;

            // 2. Search Filter
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                item.title.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query);
            // item.tags.some(tag => tag.toLowerCase().includes(query));

            return matchesCategory && matchesSearch;
        });
        
        setDisplayItems(filtered);
    }, [items, filter, searchQuery]);

    return (
        <div className="items-page">
            <div className="container">
                <div className="items-header">
                    <div>
                        <h1 className="page-title">{t.nav.items}</h1>
                        <p className="page-subtitle">キャンパス内での譲り合い。金銭トラブルを避けるため、詳細はメッセージで。</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleSell}>
                        <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                        出品する
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="items-controls">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="何を探していますか？"
                            className="item-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-tags">
                        <button className={`filter-tag ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>すべて</button>
                        <button className={`filter-tag ${filter === 'book' ? 'active' : ''}`} onClick={() => setFilter('book')}>教科書</button>
                        <button className={`filter-tag ${filter === 'appliance' ? 'active' : ''}`} onClick={() => setFilter('appliance')}>家電</button>
                        <button className={`filter-tag ${filter === 'other' ? 'active' : ''}`} onClick={() => setFilter('other')}>その他</button>
                    </div>
                </div>

                <div className="items-grid">
                    {displayItems.length > 0 ? (
                        displayItems.map(item => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                isOwner={!!user && ((item.user_id === user.id) || (item.owner?.id === user.id))}
                            />
                        ))
                    ) : (
                        <div className="no-results">
                            <p>条件に一致するアイテムは見つかりませんでした。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemsPage;
