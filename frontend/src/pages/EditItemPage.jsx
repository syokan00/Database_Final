import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePosts } from '../contexts/PostContext';
import client from '../api/client';
import FileAttachment from '../components/FileAttachment';
import { Upload, X, Paperclip, ShoppingBag, ArrowLeft } from 'lucide-react';
import './CreatePost.css';

const EditItemPage = () => {
  const { id } = useParams();
  const itemId = parseInt(id, 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { refreshItems } = usePosts();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('selling');
  const [category, setCategory] = useState('textbook');
  const [images, setImages] = useState([]); // url[]
  const [attachments, setAttachments] = useState([]); // [{url, filename, ...}]
  const [uploading, setUploading] = useState(false);

  const isValidId = Number.isFinite(itemId) && itemId > 0;

  const isOwner = useMemo(() => {
    if (!user) return false;
    // item.owner may exist; fallback to user_id
    return true; // owner check is enforced by backend; keep UI permissive to avoid false negatives
  }, [user]);

  useEffect(() => {
    const load = async () => {
      if (!isValidId) {
        alert('商品IDが不正です');
        navigate('/items');
        return;
      }
      if (!user) {
        alert(t.common?.loginRequired || 'ログインが必要です');
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const res = await client.get(`/items/${itemId}`);
        const item = res.data;
        setTitle(item.title || '');
        setDescription(item.description || '');
        setPrice(item.price != null ? String(item.price) : '');
        setStatus(item.status || 'selling');
        setCategory(item.category || 'textbook');
        setImages(
          item.image_urls
            ? String(item.image_urls)
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            : []
        );
        setAttachments(Array.isArray(item.attachments) ? item.attachments : []);
      } catch (e) {
        const detail = e?.response?.data?.detail || e.message;
        alert('商品の読み込みに失敗しました：' + detail);
        navigate('/items');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isValidId, itemId, user, navigate, t.common?.loginRequired]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!user) {
      alert(t.common?.loginRequired || 'ログインが必要です');
      return;
    }
    setUploading(true);
    const uploadedUrls = [];
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;
        const formData = new FormData();
        formData.append('file', file);
        const response = await client.post('/uploads/post-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data?.url) uploadedUrls.push(response.data.url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      alert(t.common?.uploadFailed || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!user) {
      alert(t.common?.loginRequired || 'ログインが必要です');
      return;
    }
    setUploading(true);
    const uploadedFiles = [];
    try {
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) continue;
        const formData = new FormData();
        formData.append('file', file);
        const response = await client.post('/uploads/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data) uploadedFiles.push(response.data);
      }
      setAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      alert(t.common?.uploadFailed || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert(t.post?.titleAndContentRequired || 'タイトルと内容を入力してください。');
      return;
    }
    if (!user) {
      alert(t.common?.loginRequired || 'ログインが必要です');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        status,
        category,
        tags: [category, 'item'],
        image_urls: images.length > 0 ? images.join(',') : null,
        attachments: attachments.length > 0 ? attachments : null,
        contact_method: 'message'
      };
      await client.put(`/items/${itemId}`, payload);
      await refreshItems?.();
      alert('更新しました');
      navigate('/items');
    } catch (error) {
      alert('更新に失敗しました：' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (!isOwner) {
    // 这里不强行拦截：真正权限由后端决定
  }

  return (
    <div className="create-post-page">
      <div className="container">
        <div className="create-card glass">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} style={{ marginRight: 6 }} />
              戻る
            </button>
            <h1 className="page-title" style={{ margin: 0 }}>
              <ShoppingBag size={20} style={{ marginRight: 8 }} />
              出品を編集
            </h1>
            <div style={{ width: 90 }} />
          </div>

          {loading ? (
            <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>読み込み中...</div>
          ) : (
            <form className="post-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">商品名</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例：線形代数の教科書"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">商品分類</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                  <option value="textbook">教科書</option>
                  <option value="electronics">電子機器</option>
                  <option value="furniture">家具</option>
                  <option value="clothing">衣類</option>
                  <option value="sports">スポーツ用品</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">状態</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-input">
                  <option value="selling">募集中</option>
                  <option value="negotiating">交渉中</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">価格（円）</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="例：1000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">商品の説明</label>
                <textarea
                  className="form-textarea"
                  rows="6"
                  placeholder="状態、受け渡し場所、希望価格（相談可）などを記入してください..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">商品画像</label>
                <div className="image-upload-section">
                  <label className="image-upload-btn">
                    <Upload size={18} />
                    <span>{uploading ? 'アップロード中...' : '画像を選択'}</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
                  </label>
                  {images.length > 0 && (
                    <div className="image-preview-grid">
                      {images.map((url, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={url} alt={`Preview ${index + 1}`} />
                          <button type="button" className="image-remove-btn" onClick={() => removeImage(index)}>
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Paperclip size={16} style={{ marginRight: 4 }} />
                  ファイルを添付
                </label>
                <div className="file-upload-section">
                  <label className="file-upload-btn">
                    <Paperclip size={18} />
                    <span>{uploading ? 'アップロード中...' : 'ファイルを選択'}</span>
                    <input type="file" multiple onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                  </label>
                  {attachments.length > 0 && (
                    <div className="attachments-list">
                      {attachments.map((file, index) => (
                        <FileAttachment key={index} file={file} onRemove={() => removeAttachment(index)} showRemove={true} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditItemPage;


