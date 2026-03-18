import React, { useState, useEffect } from 'react';
import { Image, Video, Loader2, Download, Calendar, XCircle, CheckCircle2, AlertCircle, Clock, X, Copy, Check } from 'lucide-react';
import { GenerationService, ImageGeneration, VideoGeneration } from '../services/generationService';
import { VideoService } from '../services/videoService';

// Component for AITunnel videos that require authentication
const VideoPlayerWithAuth: React.FC<{
  videoId: string;
  videoService: VideoService;
  model: string;
}> = ({ videoId, videoService, model }) => {
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if model is AITunnel model - check by model name and videoId format
  const modelLower = (model || '').toLowerCase();
  const isAITunnel = 
    modelLower === 'sora-2' || 
    modelLower === 'sora-2-pro' || 
    modelLower === 'wan2.5' || 
    videoId.startsWith('video_');

  useEffect(() => {
    if (!isAITunnel) {
      setLoading(false);
      return;
    }

    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const blob = await videoService.downloadVideo(videoId);
        const url = window.URL.createObjectURL(blob);
        setVideoBlobUrl(url);
      } catch (err) {
        console.error('Error loading video:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки видео');
      } finally {
        setLoading(false);
      }
    };

    loadVideo();

    return () => {
      if (videoBlobUrl) {
        window.URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [videoId, videoService, isAITunnel]);

  if (!isAITunnel) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full aspect-video bg-background-dark rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error || !videoBlobUrl) {
    return (
      <div className="w-full aspect-video bg-background-dark rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-sm">{error || 'Не удалось загрузить видео'}</p>
      </div>
    );
  }

  return (
    <video
      src={videoBlobUrl}
      className="w-full h-full object-cover rounded-lg"
      muted
      loop
      playsInline
    />
  );
};

// Detail Modal Component
const GenerationDetailModal: React.FC<{
  generation: ImageGeneration | VideoGeneration | null;
  type: 'image' | 'video' | null;
  onClose: () => void;
  onDownload: (generation: ImageGeneration | VideoGeneration) => void;
  videoService: VideoService;
}> = ({ generation, type, onClose, onDownload, videoService }) => {
  const [copied, setCopied] = useState(false);

  if (!generation || !type) return null;

  const isImage = type === 'image';
  const imageGen = isImage ? generation as ImageGeneration : null;
  const videoGen = !isImage ? generation as VideoGeneration : null;

  const handleCopyPrompt = () => {
    if (generation.prompt) {
      navigator.clipboard.writeText(generation.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed':
      case 'moderation_failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'failed':
        return 'Ошибка';
      case 'moderation_failed':
        return 'Модерация не пройдена';
      case 'processing':
        return 'В процессе';
      case 'pending':
        return 'Ожидание';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-background-card border border-primary-900/30 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-card border-b border-primary-900/30 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {isImage ? <Image className="w-6 h-6 text-primary-400" /> : <Video className="w-6 h-6 text-primary-400" />}
            <h2 className="text-2xl font-bold text-white">
              {isImage ? 'Детали генерации изображения' : 'Детали генерации видео'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-hover rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon(generation.status)}
            <span className="text-sm font-medium text-gray-300">{getStatusText(generation.status)}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{generation.model}</span>
          </div>

          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-300">Промпт</label>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-2 px-3 py-1.5 bg-background-hover hover:bg-background-dark rounded-lg transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Копировать</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-white bg-background-dark rounded-lg p-4">{generation.prompt}</p>
          </div>

          {/* Negative Prompt */}
          {generation.negativePrompt && (
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">Нежелательное</label>
              <p className="text-gray-400 bg-background-dark rounded-lg p-4">{generation.negativePrompt}</p>
            </div>
          )}

          {/* Media */}
          {isImage && imageGen && imageGen.imageUrls && imageGen.imageUrls.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">Изображения</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageGen.imageUrls.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-background-dark rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EОшибка загрузки%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `image-${generation.prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '-')}-${index}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="absolute top-2 right-2 p-2 bg-background-card/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background-hover"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isImage && videoGen && videoGen.videoId && (
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">Видео</label>
              {(() => {
                const modelLower = (videoGen.model || '').toLowerCase();
                const isAITunnelModel = 
                  modelLower === 'sora-2' || 
                  modelLower === 'sora-2-pro' || 
                  modelLower === 'wan2.5' || 
                  videoGen.videoId.startsWith('video_') ||
                  (videoGen.videoUrl && videoGen.videoUrl.includes('aitunnel.ru')) ||
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoGen.videoId);

                if (isAITunnelModel && videoGen.status === 'completed') {
                  return (
                    <div className="aspect-video bg-background-dark rounded-lg overflow-hidden">
                      <VideoPlayerWithAuth 
                        videoId={videoGen.videoId}
                        videoService={videoService}
                        model={videoGen.model}
                      />
                    </div>
                  );
                } else if (videoGen.videoUrl && videoGen.status === 'completed') {
                  return (
                    <div className="aspect-video bg-background-dark rounded-lg overflow-hidden">
                      <video
                        src={videoGen.videoUrl}
                        controls
                        className="w-full h-full"
                      >
                        Ваш браузер не поддерживает видео.
                      </video>
                    </div>
                  );
                } else if (videoGen.status === 'processing') {
                  return (
                    <div className="aspect-video bg-background-dark rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                        <p className="text-blue-400">Видео генерируется...</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Дата создания</label>
              <p className="text-sm text-white">{formatDate(generation.createdAt)}</p>
            </div>
            {isImage && imageGen && (
              <>
                {imageGen.quality && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Качество</label>
                    <p className="text-sm text-white">{imageGen.quality}</p>
                  </div>
                )}
                {imageGen.size && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Размер</label>
                    <p className="text-sm text-white">{imageGen.size}</p>
                  </div>
                )}
                {imageGen.outputFormat && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Формат</label>
                    <p className="text-sm text-white">{imageGen.outputFormat.toUpperCase()}</p>
                  </div>
                )}
                {imageGen.numImages && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Количество</label>
                    <p className="text-sm text-white">{imageGen.numImages}</p>
                  </div>
                )}
              </>
            )}
            {!isImage && videoGen && (
              <>
                {videoGen.duration && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Длительность</label>
                    <p className="text-sm text-white">{videoGen.duration} сек</p>
                  </div>
                )}
                {videoGen.quality && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Качество</label>
                    <p className="text-sm text-white">{videoGen.quality}</p>
                  </div>
                )}
                {videoGen.aspectRatio && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Соотношение</label>
                    <p className="text-sm text-white">{videoGen.aspectRatio}</p>
                  </div>
                )}
                {videoGen.size && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Размер</label>
                    <p className="text-sm text-white">{videoGen.size}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Error Message */}
          {generation.errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{generation.errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-primary-900/30">
            <button
              onClick={() => onDownload(generation)}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>{isImage ? 'Скачать изображения' : 'Скачать видео'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type TabType = 'images' | 'videos';

export const GenerationsHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [imageGenerations, setImageGenerations] = useState<ImageGeneration[]>([]);
  const [videoGenerations, setVideoGenerations] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<ImageGeneration | VideoGeneration | null>(null);
  const [selectedType, setSelectedType] = useState<'image' | 'video' | null>(null);
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(null);
  const videoServiceRef = React.useRef(new VideoService());

  useEffect(() => {
    loadGenerations();
  }, [activeTab]);

  const loadGenerations = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'images') {
        const { generations, error } = await GenerationService.getUserImageGenerations();
        if (error) {
          setError(error);
        } else {
          setImageGenerations(generations);
        }
      } else {
        const { generations, error } = await GenerationService.getUserVideoGenerations();
        if (error) {
          setError(error);
        } else {
          setVideoGenerations(generations);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, index: number, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '-')}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadVideo = async (generation: VideoGeneration) => {
    if (!generation.videoId) {
      console.error('No video ID available');
      return;
    }

    const modelLower = (generation.model || '').toLowerCase();
    const isAITunnel = 
      modelLower === 'sora-2' || 
      modelLower === 'sora-2-pro' || 
      modelLower === 'wan2.5' || 
      modelLower === 'wan2.6' ||
      generation.videoId.startsWith('video_') ||
      (generation.videoUrl && generation.videoUrl.includes('aitunnel.ru')) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(generation.videoId);
    
    setDownloadingVideoId(generation.id);

    try {
      if (isAITunnel) {
        const blob = await videoServiceRef.current.downloadVideo(generation.videoId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `video-${generation.prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '-')}.mp4`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        if (generation.videoUrl) {
          const link = document.createElement('a');
          link.href = generation.videoUrl;
          link.download = `video-${generation.prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '-')}.mp4`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
        }
      }
    } catch (err) {
      console.error('Error downloading video:', err);
      alert(err instanceof Error ? err.message : 'Ошибка при скачивании видео');
    } finally {
      setDownloadingVideoId(null);
    }
  };

  const handleDownload = (generation: ImageGeneration | VideoGeneration) => {
    if (activeTab === 'images') {
      const imgGen = generation as ImageGeneration;
      if (imgGen.imageUrls && imgGen.imageUrls.length > 0) {
        imgGen.imageUrls.forEach((url, index) => {
          handleDownloadImage(url, index, imgGen.prompt);
        });
      }
    } else {
      handleDownloadVideo(generation as VideoGeneration);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 font-semibold">Ошибка загрузки</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-primary-900/30">
        <button
          onClick={() => setActiveTab('images')}
          className={`px-6 py-3 font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === 'images'
              ? 'text-primary-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" />
          Изображения ({imageGenerations.length})
          {activeTab === 'images' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-6 py-3 font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'text-primary-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          Видео ({videoGenerations.length})
          {activeTab === 'videos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"></div>
          )}
        </button>
      </div>

      {/* Grid Gallery */}
      {activeTab === 'images' ? (
        <div>
          {imageGenerations.length === 0 ? (
            <div className="bg-background-card border border-primary-900/30 rounded-xl p-12 text-center">
              <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">История генераций изображений пуста</p>
              <p className="text-gray-500 text-sm mt-2">
                Создайте свое первое изображение на странице генерации
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageGenerations.map((generation) => (
                generation.imageUrls && generation.imageUrls.length > 0 ? (
                  generation.imageUrls.map((imageUrl, imgIndex) => (
                    <div
                      key={`${generation.id}-${imgIndex}`}
                      className="group relative aspect-square bg-background-dark rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                      onClick={() => {
                        setSelectedGeneration(generation);
                        setSelectedType('image');
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={generation.prompt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EОшибка загрузки%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white text-sm line-clamp-2">{generation.prompt}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">{generation.model}</span>
                            {generation.status === 'completed' && (
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : null
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {videoGenerations.length === 0 ? (
            <div className="bg-background-card border border-primary-900/30 rounded-xl p-12 text-center">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">История генераций видео пуста</p>
              <p className="text-gray-500 text-sm mt-2">
                Создайте свое первое видео на странице генерации
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videoGenerations.map((generation) => {
                const modelLower = (generation.model || '').toLowerCase();
                const isAITunnelModel = 
                  modelLower === 'sora-2' || 
                  modelLower === 'sora-2-pro' || 
                  modelLower === 'wan2.5' || 
                  generation.videoId?.startsWith('video_') ||
                  (generation.videoUrl && generation.videoUrl.includes('aitunnel.ru')) ||
                  (generation.videoId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(generation.videoId));

                return (
                  <div
                    key={generation.id}
                    className="group relative aspect-video bg-background-dark rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => {
                      setSelectedGeneration(generation);
                      setSelectedType('video');
                    }}
                  >
                    {generation.status === 'completed' && generation.videoId ? (
                      isAITunnelModel ? (
                        <VideoPlayerWithAuth 
                          videoId={generation.videoId}
                          videoService={videoServiceRef.current}
                          model={generation.model}
                        />
                      ) : generation.videoUrl ? (
                        <video
                          src={generation.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-gray-600" />
                        </div>
                      )
                    ) : generation.status === 'processing' ? (
                      <div className="w-full h-full flex items-center justify-center bg-background-darker">
                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-background-darker">
                        <XCircle className="w-12 h-12 text-red-400" />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm line-clamp-2">{generation.prompt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">{generation.model}</span>
                          {generation.status === 'completed' && (
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          )}
                          {generation.status === 'processing' && (
                            <Clock className="w-3 h-3 text-blue-400 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedGeneration && selectedType && (
        <GenerationDetailModal
          generation={selectedGeneration}
          type={selectedType}
          onClose={() => {
            setSelectedGeneration(null);
            setSelectedType(null);
          }}
          onDownload={handleDownload}
          videoService={videoServiceRef.current}
        />
      )}
    </div>
  );
};
