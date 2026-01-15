import React, { useState, useEffect } from 'react';
import { ShoppingBag, Image as ImageIcon, X, Upload, Paperclip } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePosts } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import FileAttachment from '../components/FileAttachment';
import './CreatePost.css';

const CreatePost = () => {
    const { t } = useLanguage();
    const { addPost, addItem } = usePosts();
    const navigate = useNavigate();
    const location = useLocation();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('lab'); // Default selection
    const [images, setImages] = useState([]);
    const [attachments, setAttachments] = useState([]); // 通用文件附件
    const [uploading, setUploading] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [price, setPrice] = useState('');
    const [itemCategory, setItemCategory] = useState('textbook');
    const { user } = useAuth();

    const categories = [
        { id: 'lab', label: '研究室' },
        { id: 'job', label: '就活' },
        { id: 'class', label: '授業' },
        { id: 'items', label: 'フリマ' },
        { id: 'other', label: 'その他' }
    ];

    // Check if we navigated here with a specific category intent
    useEffect(() => {
        if (location.state?.category) {
            setSelectedCategory(location.state.category);
        }
    }, [location.state]);

    const isItemMode = selectedCategory === 'items';

    // 当切换到商品模式时，自动取消匿名
    useEffect(() => {
        if (isItemMode && isAnonymous) {
            setIsAnonymous(false);
        }
    }, [isItemMode, isAnonymous]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!user) {
            alert(t.common?.loginRequired || 'ログインが必要です');
            return;
        }

        setUploading(true);
        const uploadedUrls = [];

        try {
            for (const file of files) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert(`${file.name} is not an image file`);
                    continue;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`${file.name} is too large (max 5MB)`);
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await client.post('/uploads/post-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                uploadedUrls.push(response.data.url);
            }

            setImages([...images, ...uploadedUrls]);
        } catch (error) {
            console.error('Image upload failed:', error);
            alert(t.common?.uploadFailed || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // 通用文件上传处理
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!user) {
            alert(t.common?.loginRequired || 'ログインが必要です');
            return;
        }

        setUploading(true);
        const uploadedFiles = [];

        try {
            for (const file of files) {
                // 验证文件大小（最大50MB）
                if (file.size > 50 * 1024 * 1024) {
                    alert(`${file.name} 文件过大（最大50MB）`);
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await client.post('/uploads/file', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                uploadedFiles.push(response.data);
            }

            setAttachments([...attachments, ...uploadedFiles]);
        } catch (error) {
            console.error('文件上传失败:', error);
            alert(t.common?.uploadFailed || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handlePost = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!title.trim() || !content.trim()) {
            alert(t.post?.titleAndContentRequired || 'タイトルと内容を入力してください。');
            return;
        }

        if (isItemMode) {
            // 商品发布的额外验证
            if (!title.trim()) {
                alert('商品名を入力してください');
                return;
            }
            
            const priceValue = parseFloat(price);
            if (isNaN(priceValue) || priceValue < 0) {
                alert('有効な価格を入力してください（0円以上）');
                return;
            }
            
            try {
                const itemData = {
                    title: title.trim(),
                    description: content.trim() || null,
                    price: priceValue,
                    status: 'selling',
                    category: itemCategory || 'other',
                    tags: itemCategory ? [itemCategory] : [],
                    image_urls: images.length > 0 ? images.join(',') : null,
                    contact_method: 'message',
                    is_anonymous: false  // 商品不支持匿名
                };
                
                // 不发送attachments，因为Item模型不支持
                // attachments字段只在Post中使用
                
                await addItem(itemData);
                alert(t.items?.sellSuccess || '出品しました！');
                navigate('/items');
            } catch (error) {
                console.error('Item creation failed:', error);
                const errorMsg = error.response?.data?.detail || error.message || '不明なエラー';
                alert((t.items?.sellFailed || '出品に失敗しました') + ': ' + errorMsg);
            }
        } else {
            try {
                await addPost({
                    title,
                    content,
                    category: selectedCategory,
                    tags: [selectedCategory],
                    source_language: 'ja', // Default
                    image_urls: images.length > 0 ? images.join(',') : null,
                    attachments: attachments.length > 0 ? attachments : null,
                    is_anonymous: isAnonymous
                });
                alert(t.post?.postSuccess || 'Posted');

                // Navigate to the relevant page based on category
                navigate('/notes');
            } catch (error) {
                alert(t.post?.postFailed || 'Failed to post');
            }
        }
    };

    const isPostDisabled =
        content.length === 0 ||
        title.length === 0;

    return (
        <div className="create-post-page">
            <div className="container">
                <div className="create-card glass">
                    <h1 className="page-title">
                        {isItemMode ? (t.items?.sellTitle || 'Sell an item') : t.post.createTitle}
                    </h1>


                    <form className="post-form" onSubmit={handlePost}>
                        <div className="form-group">
                            <label className="form-label">
                                {isItemMode ? '商品名' : t.post.titlePlaceholder}
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={isItemMode ? "例：線形代数の教科書" : "タイトルを入力..."}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t.post.category}</label>
                            <div className="tag-selector">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`tag-btn ${selectedCategory === cat.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.id === 'items' && <ShoppingBag size={14} style={{ marginRight: 4 }} />}
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 商品分类和价格 - 只在フリマ模式显示 */}
                        {isItemMode && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">商品分类</label>
                                    <select 
                                        value={itemCategory}
                                        onChange={(e) => setItemCategory(e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="textbook">教科書</option>
                                        <option value="electronics">電子機器</option>
                                        <option value="furniture">家具</option>
                                        <option value="clothing">衣類</option>
                                        <option value="sports">スポーツ用品</option>
                                        <option value="other">その他</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">価格（円）</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="例：1000"
                                        value={price}
                                        onChange={(e) => {
                                            // Only allow numbers and empty string
                                            const value = e.target.value;
                                            if (value === '' || /^\d+$/.test(value)) {
                                                setPrice(value);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // Ensure it's a valid number on blur
                                            const value = e.target.value.trim();
                                            if (value === '' || isNaN(value) || parseFloat(value) < 0) {
                                                setPrice('');
                                            } else {
                                                setPrice(Math.floor(parseFloat(value)).toString());
                                            }
                                        }}
                                    />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        💡 0円で「無料」、「相談可」なども可能
                                    </small>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">
                                {isItemMode ? '商品の説明' : '内容'}
                            </label>
                            <textarea
                                className="form-textarea"
                                rows="6"
                                placeholder={isItemMode ? "状態、受け渡し場所、希望価格（相談可）などを記入してください..." : t.post.contentPlaceholder}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Image Upload Section */}
                        <div className="form-group">
                            <label className="form-label">
                                {isItemMode ? '商品画像' : '画像を追加'}
                            </label>
                            <div className="image-upload-section">
                                <label className="image-upload-btn">
                                    <Upload size={18} />
                                    <span>{uploading ? 'アップロード中...' : '画像を選択'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {images.length > 0 && (
                                    <div className="image-preview-grid">
                                        {images.map((url, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={url} alt={`Preview ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="image-remove-btn"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* File Attachments Section - Discord Style */}
                        <div className="form-group">
                            <label className="form-label">
                                <Paperclip size={16} style={{ marginRight: 4 }} />
                                ファイルを添付（文書・音声・動画など）
                            </label>
                            <div className="file-upload-section">
                                <label className="file-upload-btn">
                                    <Paperclip size={18} />
                                    <span>{uploading ? 'アップロード中...' : 'ファイルを選択'}</span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <div className="file-upload-hint">
                                    対応形式: PDF, DOC, MP3, MP4, ZIP など（最大50MB）
                                </div>
                                {attachments.length > 0 && (
                                    <div className="attachments-list">
                                        {attachments.map((file, index) => (
                                            <FileAttachment
                                                key={index}
                                                file={file}
                                                onRemove={() => removeAttachment(index)}
                                                showRemove={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            {!isItemMode && (
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                    /> 
                                    {t.post.anonymous}
                                </label>
                            )}
                            <button type="submit" className="btn btn-primary" disabled={isPostDisabled}>
                                {isItemMode ? '出品する' : t.common.post}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
