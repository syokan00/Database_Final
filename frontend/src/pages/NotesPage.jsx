import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePosts } from '../contexts/PostContext';
import PostCard from '../components/PostCard';
import { samplePosts } from '../data/samplePosts';
import { useLocation } from 'react-router-dom';
import './NotesPage.css';

const NotesPage = () => {
    const { t } = useLanguage();
    const { posts } = usePosts();
    const location = useLocation();
    const [filter, setFilter] = useState('all');
    const [displayPosts, setDisplayPosts] = useState([]);

    // 允许从 /labs /jobs 等入口带过滤条件跳转过来
    useEffect(() => {
        const incoming = location.state?.filter;
        if (incoming) {
            setFilter(incoming);
        }
    }, [location.state]);

    useEffect(() => {
        // Use sample posts if no posts from API
        const allPosts = posts.length > 0 ? posts : samplePosts;
        const filtered = allPosts.filter(p => {
            if (filter === 'all') return p.category !== 'items';
            return p.category === filter;
        });
        setDisplayPosts(filtered);
    }, [posts, filter]);

    return (
        <div className="notes-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">{t.nav.notes}</h1>
                    <p className="page-subtitle">みんなの経験談が集まる場所。</p>
                </div>

                {/* Search & Filter */}
                <div className="notes-controls">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="キーワードで検索..." className="notes-search-input" />
                    </div>
                    <div className="filter-tags">
                        <button className={`filter-tag ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>すべて</button>
                        <button className={`filter-tag ${filter === 'lab' ? 'active' : ''}`} onClick={() => setFilter('lab')}>研究室</button>
                        <button className={`filter-tag ${filter === 'job' ? 'active' : ''}`} onClick={() => setFilter('job')}>就活</button>
                        <button className={`filter-tag ${filter === 'class' ? 'active' : ''}`} onClick={() => setFilter('class')}>授業</button>
                        <button className={`filter-tag ${filter === 'other' ? 'active' : ''}`} onClick={() => setFilter('other')}>その他</button>
                    </div>
                </div>

                <div className="posts-list">
                    {displayPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotesPage;
