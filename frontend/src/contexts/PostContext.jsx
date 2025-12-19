import React, { createContext, useState, useContext, useEffect } from 'react';

import client from '../api/client';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [items, setItems] = useState([]);
    const [likedPostIds, setLikedPostIds] = useState([]);
    const [favoritedPostIds, setFavoritedPostIds] = useState([]);
    const [followingUserIds, setFollowingUserIds] = useState([]);

    const { user } = useAuth();
    const { t } = useLanguage();

    const fetchPosts = async () => {
        try {
            console.log('Fetching posts from /posts...');
            const res = await client.get('/posts');
            console.log('Posts fetched:', res.data.length, 'posts');
            console.log('Posts data:', res.data);
            setPosts(res.data);

            // 同步后端的 liked_by_me，避免 UI 显示已点赞但无法取消点赞（状态不一致）
            const likedIds = (res.data || []).filter(p => p?.liked_by_me).map(p => p.id);
            setLikedPostIds(likedIds);

            // 同步后端的 favorited_by_me（与 /favorites/me 取并集，防止分页导致丢失）
            const favoritedIdsInFeed = (res.data || []).filter(p => p?.favorited_by_me).map(p => p.id);
            setFavoritedPostIds(prev => Array.from(new Set([...(prev || []), ...favoritedIdsInFeed])));
        } catch (error) {
            console.error("Failed to fetch posts", error);
            console.error("Error details:", error.response?.data);
        }
    };

    const fetchItems = async () => {
        try {
            const res = await client.get('/items');
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch items", error);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchItems();
        
        // 初始化收藏状态
        const initFavorites = async () => {
            try {
                const res = await client.get('/favorites/me');
                setFavoritedPostIds(res.data.map(p => p.id));
            } catch (error) {
                // 如果未登录(401)或其他错误，忽略错误
                if (error.response?.status === 401) {
                    // 未登录，这是正常的，不输出错误
                    setFavoritedPostIds([]);
                } else {
                    console.error("Failed to fetch favorites:", error);
                    setFavoritedPostIds([]);
                }
            }
        };
        initFavorites();

        // 实时刷新 - 每30秒自动获取新帖子
        const refreshInterval = setInterval(() => {
            fetchPosts();
            fetchItems();
        }, 30000); // 30秒

        return () => clearInterval(refreshInterval);
    }, []);

    // 登录状态变化时加载“我关注的人”列表
    useEffect(() => {
        const loadFollowing = async () => {
            if (!user) {
                setFollowingUserIds([]);
                return;
            }
            try {
                const res = await client.get('/users/me/following');
                setFollowingUserIds(res.data || []);
            } catch (error) {
                if (error.response?.status === 401) {
                    setFollowingUserIds([]);
                } else {
                    console.error('Failed to fetch following users:', error);
                    setFollowingUserIds([]);
                }
            }
        };

        loadFollowing();
    }, [user]);

    // Add a new post
    const addPost = async (newPost) => {
        try {
            await client.post('/posts', newPost);
            await fetchPosts();
            return true;
        } catch (error) {
            console.error("Failed to create post", error);
            throw error;
        }
    };

    // Add a new item
    const addItem = async (newItem) => {
        try {
            await client.post('/items', newItem);
            await fetchItems();
            return true;
        } catch (error) {
            console.error("Failed to create item", error);
            throw error;
        }
    };

    // Delete post
    const deletePost = async (id) => {
        try {
            await client.delete(`/posts/${id}`);
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    // Delete item
    const deleteItem = async (id) => {
        try {
            await client.delete(`/items/${id}`);
            setItems(items.filter(i => i.id !== id));
        } catch (error) {
            console.error("Failed to delete item", error);
            alert('削除に失敗しました：' + (error.response?.data?.detail || error.message));
        }
    };

    // Toggle Like
    const toggleLike = async (id) => {
        console.log('toggleLike called with id:', id);
        const isLiked = likedPostIds.includes(id) || posts.some(p => p.id === id && p.liked_by_me);
        console.log('Currently liked:', isLiked);
        
        try {
            if (isLiked) {
                console.log('Sending DELETE request to /posts/' + id + '/like');
                const response = await client.delete(`/posts/${id}/like`);
                console.log('Unlike response:', response.data);
                setLikedPostIds(likedPostIds.filter(pid => pid !== id));
            } else {
                console.log('Sending POST request to /posts/' + id + '/like');
                const response = await client.post(`/posts/${id}/like`);
                console.log('Like response:', response.data);
                setLikedPostIds([...likedPostIds, id]);
            }
            // Optimistic update or fetch
            fetchPosts();
        } catch (error) {
            console.error("Failed to toggle like", error);
            console.error("Error details:", error.response?.data);
            alert((t.common?.likeFailed || 'Like failed') + ': ' + (error.response?.data?.detail || error.message));
        }
    };

    // Toggle Favorite
    const toggleFavorite = async (id) => {
        console.log('toggleFavorite called with id:', id);
        const isFavorited = favoritedPostIds.includes(id);
        console.log('Currently favorited:', isFavorited);
        
        try {
            if (isFavorited) {
                console.log('Sending DELETE request to /favorites/posts/' + id);
                const response = await client.delete(`/favorites/posts/${id}`);
                console.log('Unfavorite response:', response.data);
                setFavoritedPostIds(favoritedPostIds.filter(pid => pid !== id));
            } else {
                console.log('Sending POST request to /favorites/posts/' + id);
                const response = await client.post(`/favorites/posts/${id}`);
                console.log('Favorite response:', response.data);
                setFavoritedPostIds([...favoritedPostIds, id]);
            }
            // Optimistic update or fetch
            fetchPosts();
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            console.error("Error details:", error.response?.data);
            alert((t.common?.favoriteFailed || 'Favorite failed') + ': ' + (error.response?.data?.detail || error.message));
        }
    };

    // Follow / Unfollow user
    const followUser = async (userId) => {
        await client.post(`/users/${userId}/follow`);
        setFollowingUserIds(prev => Array.from(new Set([...(prev || []), userId])));
    };

    const unfollowUser = async (userId) => {
        await client.delete(`/users/${userId}/follow`);
        setFollowingUserIds(prev => (prev || []).filter(id => id !== userId));
    };

    const toggleFollowUser = async (userId) => {
        const isFollowing = (followingUserIds || []).includes(userId);
        if (isFollowing) return unfollowUser(userId);
        return followUser(userId);
    };

    // Edit Item (Mock)
    const updateItem = (id, updatedData) => {
        setItems(items.map(i => i.id === id ? { ...i, ...updatedData } : i));
    };

    return (
        <PostContext.Provider value={{
            posts,
            items,
            likedPostIds,
            favoritedPostIds,
            followingUserIds,
            refreshPosts: fetchPosts,
            refreshItems: fetchItems,
            addPost,
            addItem,
            deletePost,
            deleteItem,
            toggleLike,
            toggleFavorite,
            updateItem,
            followUser,
            unfollowUser,
            toggleFollowUser,
        }}>
            {children}
        </PostContext.Provider>
    );
};
