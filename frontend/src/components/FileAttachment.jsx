import React from 'react';
import { 
    FileText, 
    File, 
    Music, 
    Video, 
    Archive, 
    Image as ImageIcon,
    Download,
    X
} from 'lucide-react';
import './FileAttachment.css';

const FileAttachment = ({ file, onRemove, showRemove = false }) => {
    // 根据文件类型选择图标
    const getFileIcon = (category) => {
        switch (category) {
            case 'image':
                return <ImageIcon size={24} />;
            case 'video':
                return <Video size={24} />;
            case 'audio':
                return <Music size={24} />;
            case 'document':
                return <FileText size={24} />;
            case 'archive':
                return <Archive size={24} />;
            default:
                return <File size={24} />;
        }
    };

    // 格式化文件大小
    const formatFileSize = (bytes) => {
        if (!bytes) return '未知大小';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // 获取文件类型的颜色
    const getCategoryColor = (category) => {
        const colors = {
            image: '#10b981',
            video: '#8b5cf6',
            audio: '#f59e0b',
            document: '#3b82f6',
            archive: '#ef4444',
            other: '#6b7280'
        };
        return colors[category] || colors.other;
    };

    return (
        <div className="file-attachment" style={{ borderLeftColor: getCategoryColor(file.category) }}>
            <div className="file-icon" style={{ color: getCategoryColor(file.category) }}>
                {getFileIcon(file.category)}
            </div>
            <div className="file-info">
                <div className="file-name">{file.filename}</div>
                <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-category">{file.category}</span>
                </div>
            </div>
            <div className="file-actions">
                {file.url && (
                    <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="file-action-btn download"
                        title="下载"
                    >
                        <Download size={18} />
                    </a>
                )}
                {showRemove && onRemove && (
                    <button
                        className="file-action-btn remove"
                        onClick={onRemove}
                        title="移除"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FileAttachment;

