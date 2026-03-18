import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { FileAttachment } from '../types';

interface FileUploadProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSize?: number; // Максимальный размер файла в байтах (по умолчанию 50MB)
  acceptedTypes?: string[]; // MIME типы, например ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSize = 50 * 1024 * 1024, // 50MB по умолчанию
  acceptedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  };

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
    if (mimeType.includes('word')) return 'DOC';
    return mimeType.split('/')[1]?.toUpperCase() || 'Файл';
  };

  const validateFile = (file: File): string | null => {
    if (files.length >= maxFiles) {
      return `Максимум ${maxFiles} файлов`;
    }

    if (file.size > maxSize) {
      return `Файл слишком большой. Максимум ${formatFileSize(maxSize)}`;
    }

    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      return `Неподдерживаемый тип файла. Поддерживаются: ${acceptedTypes.map(t => getFileTypeLabel(t)).join(', ')}`;
    }

    return null;
  };

  const processFile = useCallback(async (file: File): Promise<FileAttachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        // Убираем префикс data:mimeType;base64, если он есть
        const base64Data = result.includes(',') ? result.split(',')[1] : result;
        
        resolve({
          type: 'base64',
          data: base64Data,
          mimeType: file.type,
          filename: file.name,
          size: file.size
        });
      };
      
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };
      
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError(null);
    const newFiles: FileAttachment[] = [];
    const errors: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      try {
        const fileAttachment = await processFile(file);
        newFiles.push(fileAttachment);
      } catch (err) {
        errors.push(`${file.name}: Ошибка обработки файла`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('; '));
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
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
    
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleUrlSubmit = (url: string) => {
    if (!url.trim()) return;

    setError(null);

    // Определяем тип файла по расширению или MIME типу из URL
    const urlLower = url.toLowerCase();
    let mimeType = 'application/pdf';
    let filename = 'document.pdf';

    if (urlLower.includes('.docx') || urlLower.includes('word')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      filename = 'document.docx';
    } else if (urlLower.includes('.pdf')) {
      mimeType = 'application/pdf';
      filename = 'document.pdf';
    }

    // Проверяем лимит файлов
    if (files.length >= maxFiles) {
      setError(`Максимум ${maxFiles} файлов`);
      return;
    }

    const newFile: FileAttachment = {
      type: 'url',
      url: url.trim(),
      mimeType,
      filename
    };

    onFilesChange([...files, newFile]);
  };

  return (
    <div className="space-y-3">
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 bg-background-dark rounded-lg border border-primary-900/30"
            >
              <FileText className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">{file.filename}</p>
                <p className="text-xs text-gray-500">
                  {getFileTypeLabel(file.mimeType)}
                  {file.size && ` • ${formatFileSize(file.size)}`}
                  {file.type === 'url' && ' • URL'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

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
          accept={acceptedTypes.join(',')}
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
              PDF, DOCX (макс. {formatFileSize(maxSize)}, до {maxFiles} файлов)
            </p>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="url"
            placeholder="Или вставьте URL файла (PDF, DOCX)..."
            className="w-full pl-10 pr-4 py-2 bg-background-dark border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlSubmit(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            disabled={disabled || files.length >= maxFiles}
          />
        </div>
      </div>
    </div>
  );
};
