import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiCheckCircle, FiLoader, FiImage } from 'react-icons/fi';
import { cloudinaryService } from '@/services/cloudinaryService';

interface CloudinaryUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
  className?: string;
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  value,
  onChange,
  label,
  description = 'PNG, JPG or GIF up to 5MB',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const url = await cloudinaryService.uploadImage(file);
      onChange(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    } else {
      setError('Please drop a valid image file');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
        {label}
      </label>
      
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
          isUploading 
            ? 'border-unill-purple-400 bg-unill-purple-50/50 dark:bg-unill-purple-900/10' 
            : value 
              ? 'border-green-300 dark:border-green-600 bg-green-50/30 dark:bg-green-900/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-unill-purple-400 dark:hover:border-unill-purple-500 bg-gray-50/50 dark:bg-gray-800/50'
        }`}
      >
        {value ? (
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img 
                src={value} 
                alt="Upload preview" 
                className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white dark:border-gray-700" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <FiImage className="text-white w-6 h-6" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                <FiCheckCircle className="w-4 h-4" />
                <span>Upload successful</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]">
                {value}
              </p>
              <button
                type="button"
                onClick={() => onChange('')}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-bold mt-2 transition-colors"
              >
                <FiX className="w-3.5 h-3.5" />
                Remove and replace
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div className="flex flex-col items-center py-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 ${isUploading ? 'bg-unill-purple-100 dark:bg-unill-purple-900/30' : 'bg-gray-100 dark:bg-gray-700 group-hover:scale-110'}`}>
                {isUploading ? (
                  <FiLoader className="w-6 h-6 text-unill-purple-600 animate-spin" />
                ) : (
                  <FiUploadCloud className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {isUploading ? 'Uploading to Cloudinary...' : 'Click or drag image to upload'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}

        {error && (
          <div className="absolute -bottom-6 left-0 flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
            <FiX className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
