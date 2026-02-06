import React, { useState } from 'react';
import './ImageUploadPopup.css';

const ImageUploadPopup = ({ isOpen, onClose, onUpload }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState('');

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (imagePreview) {
      onUpload({
        image: imagePreview,
        text: imageName.split('.')[0] || 'New Image'
      });
      setImagePreview(null);
      setImageName('');
      onClose();
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageName('');
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="popup-content">
          <div className="upload-section">
            {imagePreview ? (
              <div className="image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="image-preview"
                />
                <button 
                  className="remove-btn" 
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📷</div>
                <p>No image selected</p>
              </div>
            )}
          </div>

          <div className="upload-controls">
            <label htmlFor="image-input" className="upload-btn">
              Choose Image
            </label>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className="popup-actions">
            <button 
              className="cancel-btn" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="upload-submit-btn" 
              onClick={handleUpload}
              disabled={!imagePreview}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPopup;