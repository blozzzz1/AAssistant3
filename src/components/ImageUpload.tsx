import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { ImageAttachment } from '../types';

interface ImageUploadProps {
  images: ImageAttachment[];
  onImagesChange: (images: ImageAttachment[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = async (file: File): Promise<boolean> => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Неверный формат. Поддерживаются: JPEG, PNG, WEBP, GIF');
      return false;
    }

    // Check file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setError('Размер файла превышает 20МБ');
      return false;
    }

    // Check image dimensions
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 512 || img.height < 512) {
          setError('Разрешение изображения должно быть не менее 512x512 пикселей');
          resolve(false);
        } else if (img.width > 4096 || img.height > 4096) {
          setError('Разрешение изображения не должно превышать 4096x4096 пикселей');
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        setError('Не удалось загрузить изображение');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled) return;

    setError(null);
    const newImages: ImageAttachment[] = [];

    for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
      const file = files[i];
      const isValid = await validateImage(file);

      if (isValid) {
        try {
          const base64Data = await convertToBase64(file);
          newImages.push({
            type: 'base64',
            data: base64Data,
            mimeType: file.type
          });
        } catch (err) {
          setError('Не удалось обработать изображение');
        }
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleUrlAdd = () => {
    if (!imageUrl.trim() || disabled) return;

    setError(null);

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      setError('Неверный URL');
      return;
    }

    if (images.length >= maxImages) {
      setError(`Максимум ${maxImages} изображений`);
      return;
    }

    onImagesChange([
      ...images,
      {
        type: 'url',
        url: imageUrl
      }
    ]);

    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    if (disabled) return;
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getImagePreview = (image: ImageAttachment): string => {
    if (image.type === 'url' && image.url) {
      return image.url;
    } else if (image.type === 'base64' && image.data && image.mimeType) {
      return `data:${image.mimeType};base64,${image.data}`;
    }
    return '';
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-primary-900/30 hover:border-primary-800/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="w-8 h-8 text-primary-400" />
          <div>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-primary-400">Нажмите для загрузки</span> или перетащите сюда
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, WEBP, GIF (макс. 20МБ, 512-4096пкс)
            </p>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
            placeholder="Или вставьте URL изображения..."
            disabled={disabled}
            className="w-full pl-10 pr-4 py-2 bg-background-card text-white rounded-lg border border-primary-900/30 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleUrlAdd}
          disabled={disabled || !imageUrl.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Добавить
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {images.length} / {maxImages} изображений
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-video bg-background-darker rounded-lg overflow-hidden border border-primary-900/30"
              >
                <img
                  src={getImagePreview(image)}
                  alt={`Загрузка ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {image.type === 'url' && (
                  <div className="absolute top-2 left-2 bg-primary-600/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    URL
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

