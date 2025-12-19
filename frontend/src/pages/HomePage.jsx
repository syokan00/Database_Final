import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PostCard from '../components/PostCard';
import './HomePage.css';

const POPULAR_POSTS = [
    {
        id: 101,
        title: '情報工学専攻 A研究室のリアルな日常について',
        content: 'コアタイムは特にありませんが、ゼミの準備は結構大変です。先生は優しいですが、進捗には厳しい一面も...',
        categoryType: 'lab',
        categoryLabel: '研究室',
        date: '2日前',
        author: '匿名希望',
        likes: 12,
        comments: 3
    },
    {
        id: 102,
        title: '【就活】大手SIerの早期選考ルート',
        content: 'サマーインターン参加者限定の早期選考フローに乗ることができました。面接は全部で3回、技術質問は少なめでした。',
        categoryType: 'job',
        categoryLabel: '就活',
        date: '3日前',
        author: '26卒',
        likes: 45,
        comments: 8
    },
    {
        id: 103,
        title: '学食の裏メニュー「唐揚げカレー大盛り」',
        content: 'メニューには載っていませんが、食券機の右下の空白ボタンを押すと買えます。ボリューム満点で500円！',
        categoryType: 'note',
        categoryLabel: '生活',
        date: '5日前',
        author: 'グルメ王',
        likes: 88,
        comments: 12
    }
];

const HomePage = () => {
    const { t } = useLanguage();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-container">
                    <div className="hero-content animate-fade-in">
                        <div className="hero-badge">
                            <Sparkles size={14} />
                            <span>New: 2025年度 研究室情報更新</span>
                        </div>
                        <h1 className="hero-title">
                            {t.home.heroTitle}
                        </h1>
                        <p className="hero-subtitle">
                            {t.home.heroSubtitle}
                            <br />
                            <span className="text-gradient">{t.common.slogan}</span>
                        </p>
                        <div className="hero-actions">
                            <Link to="/create" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                                今すぐ始める <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </Link>
                            <Link to="/notes" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
                                もっと詳しく
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="clover-visual">
                            <div className="clover-leaf leaf-1"></div>
                            <div className="clover-leaf leaf-2"></div>
                            <div className="clover-leaf leaf-3"></div>
                            <div className="clover-leaf leaf-4"></div>
                            <div className="clover-center"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{t.home.popularPosts}</h2>
                        <Link to="/notes" className="btn btn-ghost" style={{ textDecoration: 'none' }}>すべて見る</Link>
                    </div>

                    <div className="grid-3">
                        {POPULAR_POSTS.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
