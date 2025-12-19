import React from 'react';
import { X } from 'lucide-react';
import './ImageLightbox.css';

const ImageLightbox = ({ imageUrl, onClose }) => {
    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <button className="lightbox-close" onClick={onClose}>
                <X size={32} />
            </button>
            <img 
                src={imageUrl} 
                alt="Full size" 
                className="lightbox-image"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default ImageLightbox;

