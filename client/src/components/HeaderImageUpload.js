import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

const HeaderImageUpload = ({ currentImage, onImageUpload, onImageRemove }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      {currentImage ? (
        <div className="relative group">
          <img
            src={currentImage}
            alt="Form header"
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
          <button
            onClick={onImageRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="header-image-upload"
          />
          <label
            htmlFor="header-image-upload"
            className="cursor-pointer flex flex-col items-center space-y-3"
          >
            <div className="p-3 bg-gray-100 rounded-full">
              <ImageIcon size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default HeaderImageUpload;
