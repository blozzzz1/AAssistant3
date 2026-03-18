import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Library,
  Image as ImageIcon,
  Video,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  X,
  Download,
  Copy,
  Check,
  Calendar,
  Globe,
  Trash2,
} from 'lucide-react';

import {
  GenerationService,
  ImageGeneration,
  VideoGeneration,
} from '../services/generationService';
import { VideoService } from '../services/videoService';
import { ImageService } from '../services/imageService';
import { GalleryCardSkeleton } from '../components/GalleryCardSkeleton';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';

/** Видео: Supabase (signed URL), иначе AITunnel (videoId → blob) или прямой videoUrl */
const LibraryVideoPlayer: React.FC<{
  videoUrl?: string | null;
  videoId?: string | null;
  generationId?: string | null;
  model?: string;
  videoService: VideoService;
}> = ({ videoUrl, videoId, generationId, model, videoService }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const useSupabaseSigned = Boolean(
    videoUrl && generationId && (videoUrl.includes('supabase.co') || videoUrl.includes('supabase.co/storage'))
  );

  useEffect(() => {
    if (!useSupabaseSigned || !generationId) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);
    setSignedUrl(null);
    GenerationService.getVideoPlayUrl(generationId).then(({ url, error }) => {
      if (cancelled) return;
      if (error) setErr(error);
      else if (url) setSignedUrl(url);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [useSupabaseSigned, generationId]);

  const needBlob = !videoUrl && videoId && (['sora-2', 'sora-2-pro', 'wan2.5', 'wan2.6'].includes((model || '').toLowerCase()) || (videoId && videoId.startsWith('video_')));

  useEffect(() => {
    if (videoUrl) return;
    if (!needBlob || !videoId) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);
    videoService.downloadVideo(videoId).then((blob) => {
      if (cancelled) return;
      const url = window.URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setBlobUrl(url);
      setLoading(false);
    }).catch((e) => {
      if (!cancelled) {
        setErr(e instanceof Error ? e.message : 'Ошибка загрузки');
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        window.URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [videoUrl, videoId, model, needBlob]);

  if (useSupabaseSigned) {
    if (loading) {
      return (
        <div className="w-full aspect-video rounded-xl bg-white/[0.06] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
        </div>
      );
    }
    if (err || !signedUrl) {
      return (
        <div className="w-full aspect-video rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-400 text-sm">
          {err || 'Не удалось загрузить видео'}
        </div>
      );
    }
    return (
      <video
        src={signedUrl}
        controls
        className="w-full aspect-video rounded-xl bg-black"
        playsInline
      >
        Ваш браузер не поддерживает видео.
      </video>
    );
  }

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        controls
        className="w-full aspect-video rounded-xl bg-black"
        playsInline
      >
        Ваш браузер не поддерживает видео.
      </video>
    );
  }
  if (needBlob && loading) {
    return (
      <div className="w-full aspect-video rounded-xl bg-white/[0.06] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
      </div>
    );
  }
  if (needBlob && (err || !blobUrl)) {
    return (
      <div className="w-full aspect-video rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-400 text-sm">
        {err || 'Не удалось загрузить видео'}
      </div>
    );
  }
  if (needBlob && blobUrl) {
    return (
      <video
        src={blobUrl}
        controls
        className="w-full aspect-video rounded-xl bg-black"
        playsInline
      >
        Ваш браузер не поддерживает видео.
      </video>
    );
  }
  return null;
};

type UnifiedItem = { type: 'image'; data: ImageGeneration } | { type: 'video'; data: VideoGeneration };

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

const LibraryDetailModal: React.FC<{
  item: UnifiedItem;
  getStatus: (item: UnifiedItem) => { label: string; icon: React.ElementType; className: string };
  onClose: () => void;
  onDownloadImage: (g: ImageGeneration) => void;
  onDownloadVideo: (g: VideoGeneration) => void;
  onDelete: (id: string, type: 'image' | 'video') => void;
  deletingId: string | null;
  videoService: VideoService;
  isPublic: boolean;
  onTogglePublic: (id: string) => void;
  togglingPublic: boolean;
}> = ({ item, getStatus, onClose, onDownloadImage, onDownloadVideo, onDelete, deletingId, videoService, isPublic, onTogglePublic, togglingPublic }) => {
  const [copied, setCopied] = useState(false);
  const status = getStatus(item);
  const StatusIcon = status.icon;

  const handleCopyPrompt = () => {
    if (item.data.prompt) {
      navigator.clipboard.writeText(item.data.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1d] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <span className="text-white font-semibold">
            {item.type === 'image' ? 'Изображение' : 'Видео'} · {item.data.model}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Медиа: картинка полностью или видео */}
          {item.type === 'image' && (item.data as ImageGeneration).imageUrls?.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 justify-center">
                {(item.data as ImageGeneration).imageUrls!.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="max-w-full max-h-[60vh] w-auto h-auto object-contain rounded-xl bg-black/30"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => onDownloadImage(item.data as ImageGeneration)}
                className="w-full py-2.5 rounded-xl bg-primary-500 text-white font-medium flex items-center justify-center gap-2 hover:bg-primary-600"
              >
                <Download className="w-5 h-5" />
                Скачать изображение
              </button>
            </div>
          )}

          {item.type === 'video' && (item.data as VideoGeneration).status === 'completed' && ((item.data as VideoGeneration).videoUrl || (item.data as VideoGeneration).videoId) && (
            <div className="space-y-3">
              <LibraryVideoPlayer
                videoUrl={(item.data as VideoGeneration).videoUrl}
                videoId={(item.data as VideoGeneration).videoId}
                generationId={item.data.id}
                model={(item.data as VideoGeneration).model}
                videoService={videoService}
              />
              <button
                type="button"
                onClick={() => onDownloadVideo(item.data as VideoGeneration)}
                className="w-full py-2.5 rounded-xl bg-primary-500 text-white font-medium flex items-center justify-center gap-2 hover:bg-primary-600"
              >
                <Download className="w-5 h-5" />
                Скачать видео
              </button>
            </div>
          )}

          {item.type === 'video' && (item.data as VideoGeneration).status === 'processing' && (
            <div className="py-12 flex flex-col items-center gap-3 text-blue-400">
              <Loader2 className="w-12 h-12 animate-spin" />
              <span>Видео генерируется...</span>
            </div>
          )}

          {/* Сведения */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`flex items-center gap-1.5 text-sm ${status.className}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(item.data.createdAt)}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-gray-400 text-sm font-medium">Промпт</span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 text-gray-400 hover:text-white text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
              <p className="text-white bg-white/[0.06] rounded-xl p-4 text-sm leading-relaxed">
                {item.data.prompt}
              </p>
            </div>
            {(item.data as VideoGeneration).negativePrompt && (
              <div>
                <span className="text-gray-400 text-sm font-medium">Нежелательное</span>
                <p className="text-gray-300 bg-white/[0.06] rounded-xl p-3 text-sm mt-1">
                  {(item.data as VideoGeneration).negativePrompt}
                </p>
              </div>
            )}
            <div className="pt-3 flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Поделиться в Creative Lab</span>
                <span className="text-gray-500 text-sm">(другие увидят промпт)</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPublic}
                disabled={togglingPublic}
                onClick={() => onTogglePublic(item.data.id)}
                className={`
                  relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1d]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isPublic ? 'bg-primary-500' : 'bg-white/20'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0
                    transition duration-200 mt-0.5
                    ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}
                  `}
                />
              </button>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => onDelete(item.data.id, item.type)}
                disabled={deletingId === item.data.id}
                className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30"
              >
                {deletingId === item.data.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                {deletingId === item.data.id ? 'Удаление...' : 'Удалить генерацию'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  completed: { label: 'Готово', icon: CheckCircle2, className: 'text-green-400' },
  failed: { label: 'Ошибка', icon: XCircle, className: 'text-red-400' },
  moderation_failed: { label: 'Модерация', icon: AlertCircle, className: 'text-yellow-400' },
  processing: { label: 'В процессе', icon: Loader2, className: 'text-blue-400' },
  pending: { label: 'Ожидание', icon: Clock, className: 'text-gray-400' },
};

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UnifiedItem | null>(null);
  const [togglingPublicId, setTogglingPublicId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const videoServiceRef = useRef(new VideoService());
  const imageServiceRef = useRef(new ImageService());
  const pollingRef = useRef<Record<string, NodeJS.Timeout>>({});
  const loadRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const handleTogglePublic = async (id: string) => {
    const item = items.find((i) => i.data.id === id);
    if (!item) return;
    const nextPublic = !(item.data as { isPublic?: boolean }).isPublic;
    setTogglingPublicId(id);
    try {
      if (item.type === 'image') {
        await GenerationService.updateImageGeneration(id, { isPublic: nextPublic });
      } else {
        await GenerationService.updateVideoGeneration(id, { isPublic: nextPublic });
      }
      setItems((prev) =>
        prev.map((it) =>
          it.data.id === id ? { ...it, data: { ...it.data, isPublic: nextPublic } } : it
        )
      );
    } catch (_) {
      // keep UI state unchanged on error
    } finally {
      setTogglingPublicId(null);
    }
  };

  const handleDelete = async (id: string, type: 'image' | 'video') => {
    setDeletingId(id);
    if (type === 'video' && pollingRef.current[id]) {
      clearInterval(pollingRef.current[id]);
      delete pollingRef.current[id];
    }
    const { error: err } = type === 'image'
      ? await GenerationService.deleteImageGeneration(id)
      : await GenerationService.deleteVideoGeneration(id);
    setDeletingId(null);
    if (err) {
      setError(err);
    } else {
      setSelected(null);
      load();
    }
  };

  const LIBRARY_PAGE_SIZE = 30;
  const [libraryOffset, setLibraryOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (silent = false, offset = 0, append = false) => {
    if (!silent && !append) {
      setLoading(true);
      setError(null);
    }
    if (append) setLoadingMore(true);
    try {
      const [imgRes, vidRes] = await Promise.all([
        GenerationService.getUserImageGenerations({ limit: LIBRARY_PAGE_SIZE, offset }),
        GenerationService.getUserVideoGenerations({ limit: LIBRARY_PAGE_SIZE, offset }),
      ]);
      const img: UnifiedItem[] = (imgRes.generations || []).map((g) => ({ type: 'image', data: g }));
      const vid: UnifiedItem[] = (vidRes.generations || []).map((g) => ({ type: 'video', data: g }));
      let merged = [...img, ...vid].sort(
        (a, b) =>
          new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
      );

      const moreImages = (imgRes.generations?.length ?? 0) >= LIBRARY_PAGE_SIZE;
      const moreVideos = (vidRes.generations?.length ?? 0) >= LIBRARY_PAGE_SIZE;
      if (append) {
        setItems((prev) => {
          const ids = new Set(prev.map((i) => i.data.id));
          const newOnes = merged.filter((i) => !ids.has(i.data.id));
          return [...prev, ...newOnes];
        });
        setLibraryOffset(offset + LIBRARY_PAGE_SIZE);
        setHasMore(moreImages || moreVideos);
        setLoadingMore(false);
        return;
      }

      const state = location.state as {
        pendingImageGeneration?: { generationId: string; modelId: string; prompt: string; [k: string]: unknown };
        pendingVideoGeneration?: { generationId: string; videoId: string; prompt: string; model: string; status: string; size?: string; seconds?: number; createdAt?: string };
      } | null;

      const now = new Date().toISOString();
      if (state?.pendingImageGeneration && !merged.some((i) => i.data.id === state.pendingImageGeneration!.generationId)) {
        const p = state.pendingImageGeneration;
        const optimistic: UnifiedItem = {
          type: 'image',
          data: {
            id: p.generationId,
            userId: '',
            model: p.modelId,
            prompt: p.prompt,
            imageUrls: [],
            status: 'processing',
            createdAt: now,
            updatedAt: now,
          } as ImageGeneration,
        };
        merged = [optimistic, ...merged];
      }
      if (state?.pendingVideoGeneration && !merged.some((i) => i.data.id === state.pendingVideoGeneration!.generationId)) {
        const p = state.pendingVideoGeneration;
        const optimistic: UnifiedItem = {
          type: 'video',
          data: {
            id: p.generationId,
            userId: '',
            model: p.model,
            prompt: p.prompt,
            videoId: p.videoId,
            status: (p.status || 'processing') as VideoGeneration['status'],
            size: p.size,
            seconds: p.seconds,
            createdAt: typeof p.createdAt === 'string' ? p.createdAt : now,
            updatedAt: now,
          } as VideoGeneration,
        };
        merged = [optimistic, ...merged];
      }

      setItems(merged);
      setLibraryOffset(merged.length > 0 ? LIBRARY_PAGE_SIZE : 0);
      setHasMore(moreImages || moreVideos);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      if (append) setLoadingMore(false);
    } finally {
      if (!silent && !append) setLoading(false);
    }
  };
  loadRef.current = load;

  useEffect(() => {
    load(false, 0, false);
  }, []);

  const loadMoreLibrary = () => {
    if (loadingMore || !hasMore) return;
    load(true, libraryOffset, true);
  };

  // Догнать генерацию изображения, переданную из Creative Lab: запись уже создана со статусом processing
  const pendingImageDoneRef = useRef<string | null>(null);
  useEffect(() => {
    const pending = (location.state as { pendingImageGeneration?: {
      generationId: string;
      modelId: string;
      prompt: string;
      size: string;
      quality: string;
      outputFormat: 'png' | 'jpg' | 'webp';
      imageModeration?: string;
      imageStyle?: string;
    } })?.pendingImageGeneration;
    if (!pending || pendingImageDoneRef.current === pending.generationId) return;
    pendingImageDoneRef.current = pending.generationId;
    const imageService = imageServiceRef.current;
    const baseParams = {
      model: pending.modelId,
      prompt: pending.prompt,
      size: pending.size,
      quality: pending.quality as 'low' | 'medium' | 'high' | 'standard' | 'hd',
      n: 1 as const,
      output_format: pending.outputFormat,
      moderation: (pending.imageModeration as 'low' | 'medium' | 'high' | 'auto') || 'low',
    };
    const withStyle = pending.imageStyle
      ? { ...baseParams, style: pending.imageStyle as 'vivid' | 'natural' }
      : baseParams;
    imageService.generateImage(withStyle).then(async (response) => {
      if (response.error || !response.data?.length) {
        await GenerationService.updateImageGeneration(pending.generationId, {
          status: 'failed',
          errorMessage: response.error?.message || 'Ошибка генерации',
        });
      } else {
        const imageUrls = response.data
          .map((item) => {
            if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
            if (item.url) return item.url;
            return null;
          })
          .filter((u): u is string => !!u);
        await GenerationService.updateImageGeneration(pending.generationId, {
          imageUrls,
          status: 'completed',
        });
      }
      await load();
      navigate('/library', { replace: true, state: {} });
    }).catch(async (err) => {
      await GenerationService.updateImageGeneration(pending.generationId, {
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : 'Ошибка генерации',
      });
      await load();
      navigate('/library', { replace: true, state: {} });
    });
  }, [location.state, navigate]);

  // Опрос для изображений «в процессе» (edit в фоне): периодически перезагружаем список
  const imageProcessingCount = items.filter((i) => i.type === 'image' && i.data.status === 'processing').length;
  useEffect(() => {
    if (imageProcessingCount === 0) return;
    const t = setInterval(() => loadRef.current(true), 5000);
    return () => clearInterval(t);
  }, [imageProcessingCount]);

  // Poll video status for processing items
  useEffect(() => {
    const videoItems = items.filter((i) => i.type === 'video' && i.data.status === 'processing' && i.data.videoId);
    videoItems.forEach((item) => {
      const vid = item.data as VideoGeneration;
      if (pollingRef.current[vid.id]) return;
      const poll = async () => {
        try {
          const res = await videoServiceRef.current.getVideoStatus(vid.videoId!);
          const s = res.status?.toLowerCase();
          if (s === 'completed' || s === 'failed') {
            if (pollingRef.current[vid.id]) {
              clearInterval(pollingRef.current[vid.id]);
              delete pollingRef.current[vid.id];
            }
            await GenerationService.updateVideoGeneration(vid.id, {
              status: s === 'completed' ? 'completed' : 'failed',
              errorMessage: res.error,
            });

            // Автозагрузка готового AITunnel-видео в Supabase bucket `videos`, чтобы видео было доступно по videoUrl.
            // Раньше оно могло подтягиваться только через /content; теперь сохраняем в Storage после completed.
            if (s === 'completed' && !vid.videoUrl && vid.videoId) {
              const modelLower = (vid.model || '').toLowerCase();
              const isAITunnel =
                ['sora-2', 'sora-2-pro', 'wan2.5', 'wan2.6'].includes(modelLower) || vid.videoId.startsWith('video_');
              if (isAITunnel) {
                const { error: uploadErr } = await GenerationService.uploadVideoToSupabase(vid.id, {
                  videoId: vid.videoId,
                  isAITunnel: true,
                });
                if (uploadErr) {
                  // Не ломаем статус completed, но сохраняем текст ошибки для диагностики
                  await GenerationService.updateVideoGeneration(vid.id, { errorMessage: uploadErr });
                }
              }
            }

            load();
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          // Терминальные ошибки: прекращаем опрос и помечаем генерацию как failed
          const isTerminal =
            msg.includes('Некорректный videoId') ||
            msg.includes('not found') ||
            msg.includes('Video with id') ||
            msg.includes('404') ||
            msg.includes('moderation_blocked') ||
            /moderation|blocked by our moderation/i.test(msg);
          if (isTerminal) {
            if (pollingRef.current[vid.id]) {
              clearInterval(pollingRef.current[vid.id]);
              delete pollingRef.current[vid.id];
            }
            await GenerationService.updateVideoGeneration(vid.id, {
              status: 'failed',
              errorMessage: msg,
            });
            load();
          }
        }
      };
      poll();
      const id = setInterval(poll, 5000);
      pollingRef.current[vid.id] = id;
    });
    return () => {
      Object.keys(pollingRef.current).forEach((k) => {
        clearInterval(pollingRef.current[k]);
        delete pollingRef.current[k];
      });
    };
  }, [items]);

  const getStatus = (item: UnifiedItem) => {
    const status = item.data.status;
    return statusConfig[status] || statusConfig.pending;
  };

  const handleDownloadImage = (g: ImageGeneration) => {
    if (!g.imageUrls?.length) return;
    g.imageUrls.forEach((url, i) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${g.id}-${i}.png`;
      link.click();
    });
  };

  const handleDownloadVideo = async (g: VideoGeneration) => {
    if (!g.videoId) return;
    const modelLower = (g.model || '').toLowerCase();
    const isAITunnel = ['sora-2', 'sora-2-pro', 'wan2.5', 'wan2.6'].includes(modelLower) || g.videoId.startsWith('video_');
    try {
      if (isAITunnel) {
        const blob = await videoServiceRef.current.downloadVideo(g.videoId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `video-${g.id}.mp4`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (g.videoUrl) {
        const link = document.createElement('a');
        link.href = g.videoUrl;
        link.download = `video-${g.id}.mp4`;
        link.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-full p-6 bg-[#0d0d0f]">
        <PulsingOrbsBackground />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-40 rounded bg-white/10 animate-pulse" />
              <div className="h-4 w-56 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <GalleryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-full p-8 bg-[#0d0d0f]">
        <PulsingOrbsBackground />
        <div className="relative z-10 rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-3 max-w-2xl mx-auto">
          <XCircle className="w-6 h-6 text-red-400" />
          <div>
            <p className="text-red-400 font-medium">Ошибка</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full p-6 bg-[#0d0d0f]">
      <PulsingOrbsBackground />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Library className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Библиотека</h1>
            <p className="text-gray-400 text-sm">Все ваши генерации изображений и видео</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-12 text-center">
            <Library className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Пока нет генераций</p>
            <p className="text-gray-500 text-sm mt-2">
              Создайте изображение или видео в Creative Lab
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => {
              const status = getStatus(item);
              const StatusIcon = status.icon;
              const isImage = item.type === 'image';
              const g = item.data;
              const thumb = isImage && (g as ImageGeneration).imageUrls?.[0];
              const videoUrl = !isImage && (g as VideoGeneration).videoUrl;

              const onCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
                const v = e.currentTarget.querySelector('video');
                if (v) v.play().catch(() => {});
              };
              const onCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
                const v = e.currentTarget.querySelector('video');
                if (v) v.pause();
              };

              const isProcessing = g.status === 'processing';

              return (
                <div
                  key={`${item.type}-${g.id}`}
                  className="group relative aspect-[3/4] rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                  onMouseEnter={onCardMouseEnter}
                  onMouseLeave={onCardMouseLeave}
                >
                  <button
                    type="button"
                    className="absolute inset-0 w-full h-full text-left z-[1]"
                    onClick={() => setSelected(item)}
                  />
                  {isProcessing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/[0.06] gap-3">
                      <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
                      <span className="text-sm text-gray-400">Генерация...</span>
                    </div>
                  ) : thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : videoUrl ? (
                    <video
                      src={videoUrl}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/[0.06]">
                      {isImage ? (
                        <ImageIcon className="w-12 h-12 text-gray-500" />
                      ) : (
                        <Video className="w-12 h-12 text-gray-500" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-[1] pointer-events-none">
                    <p className="text-white text-sm truncate">{g.prompt.slice(0, 50)}{g.prompt.length > 50 ? '…' : ''}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{g.model}</span>
                      <span className={`flex items-center gap-1 text-xs ${status.className}`}>
                        {status.label === 'В процессе' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <StatusIcon className="w-3.5 h-3.5" />
                        )}
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {hasMore && items.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={loadMoreLibrary}
              disabled={loadingMore}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMore ? 'Загрузка…' : 'Загрузить ещё'}
            </button>
          </div>
        )}
      </div>

      {/* Detail modal — сведения, просмотр картинки/видео */}
      {selected && (() => {
        const currentItem = items.find((i) => i.data.id === selected.data.id) ?? selected;
        return (
          <LibraryDetailModal
            item={currentItem}
            getStatus={getStatus}
            onClose={() => setSelected(null)}
            onDownloadImage={handleDownloadImage}
            onDownloadVideo={handleDownloadVideo}
            onDelete={handleDelete}
            deletingId={deletingId}
            videoService={videoServiceRef.current}
            isPublic={(currentItem.data as { isPublic?: boolean }).isPublic ?? false}
            onTogglePublic={handleTogglePublic}
            togglingPublic={togglingPublicId === selected.data.id}
          />
        );
      })()}
    </div>
  );
}
