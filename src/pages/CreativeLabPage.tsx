import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Search,
  Video,
  Loader2,
  Camera,
  Mic,
  X,
  Copy,
  Check,
  ChevronDown,
  Send,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import { useDailyLimits } from '../hooks/useDailyLimits';
import { IMAGE_MODELS } from '../constants/imageModels';
import { VIDEO_MODELS } from '../constants/videoModels';
import { ImageService } from '../services/imageService';
import { VideoService } from '../services/videoService';
import {
  GenerationService,
  ImageGeneration,
  VideoGeneration,
} from '../services/generationService';
import { ModelLogo } from '../components/ModelLogo';
import { GalleryCardSkeleton } from '../components/GalleryCardSkeleton';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';

/** Resolves Supabase video URL to signed URL and renders <video>. */
const SupabaseVideo: React.FC<{
  generationId: string;
  videoUrl: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  preload?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}> = ({ generationId, videoUrl, videoRef, ...videoProps }) => {
  const isSupabase = Boolean(videoUrl && videoUrl.includes('supabase.co'));
  const [src, setSrc] = useState<string | null>(isSupabase ? null : (videoUrl || null));
  const [loading, setLoading] = useState(isSupabase);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) return;
    if (!videoUrl.includes('supabase.co')) {
      setSrc(videoUrl);
      setLoading(false);
      return;
    }
    let cancelled = false;
    GenerationService.getVideoPlayUrl(generationId).then(({ url, error }) => {
      if (cancelled) return;
      setErr(error || null);
      setSrc(url || videoUrl);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [generationId, videoUrl]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-white/[0.06] ${videoProps.className || ''}`}>
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }
  if (err && !src) {
    return (
      <div className={`flex items-center justify-center text-gray-400 text-sm ${videoProps.className || ''}`}>
        {err}
      </div>
    );
  }
  if (!src) return null;
  return <video ref={videoRef} src={src} {...videoProps} />;
};

type ModelTab = 'image' | 'video';

/** Карточка в галерее Creative Lab: публичные генерации пользователей */
const CreativeLabCard: React.FC<{
  gen: UnifiedGeneration;
  onOpenLightbox: () => void;
}> = ({ gen, onOpenLightbox }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideoUrl = gen.type === 'video' && gen.videoUrl;

  const handleMouseEnter = () => {
    if (hasVideoUrl && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };
  const handleMouseLeave = () => {
    if (hasVideoUrl && videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <button
      type="button"
      onClick={onOpenLightbox}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[3/4] rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden hover:border-white/20 transition-colors text-left block w-full"
    >
      {gen.type === 'image' && gen.thumbnail ? (
        <img
          src={gen.thumbnail}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : gen.type === 'video' && gen.videoUrl ? (
        <SupabaseVideo
          videoRef={videoRef}
          generationId={gen.id}
          videoUrl={gen.videoUrl}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          preload="metadata"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.06]">
          <Video className="w-10 h-10 text-gray-500" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs truncate">
        {gen.prompt.slice(0, 40)}{gen.prompt.length > 40 ? '…' : ''}
      </div>
    </button>
  );
};

interface UnifiedGeneration {
  type: 'image' | 'video';
  id: string;
  prompt: string;
  model: string;
  status: string;
  thumbnail?: string;
  imageUrls?: string[];
  videoUrl?: string | null;
  videoId?: string | null;
  createdAt: string;
}

/** Кастомный выпадающий список в тёмной теме */
const CustomSelect: React.FC<{
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  id?: string;
}> = ({ value, options, onChange, id }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onOutside);
      return () => document.removeEventListener('mousedown', onOutside);
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary-500 flex items-center justify-between gap-2"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-[100] mt-1 w-full min-w-[120px] rounded-lg border border-white/15 bg-[#141418] shadow-xl shadow-black/40 py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                opt.value === value
                  ? 'bg-primary-500/25 text-primary-300'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CreativeLabPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { imageCount, videoCount, imageLimit, videoLimit, canGenerateImage, canGenerateVideo, refresh } = useDailyLimits(user?.id ?? null);
  const [prompt, setPrompt] = useState('');
  const [modelTab, setModelTab] = useState<ModelTab>('image');
  const [selectedImageModelId, setSelectedImageModelId] = useState<string>(IMAGE_MODELS[0]?.id || '');
  const [selectedVideoModelId, setSelectedVideoModelId] = useState<string>(VIDEO_MODELS[0]?.id || '');
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [recentGenerations, setRecentGenerations] = useState<UnifiedGeneration[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [lightboxGen, setLightboxGen] = useState<UnifiedGeneration | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Параметры генерации изображений
  const [imageQuality, setImageQuality] = useState<string>('standard');
  const [imageSize, setImageSize] = useState<string>('1024x1024');
  const [imageOutputFormat, setImageOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [imageModeration, setImageModeration] = useState<'low' | 'auto'>('low');
  const [imageStyle, setImageStyle] = useState<'vivid' | 'natural'>('vivid');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageParamsOpen, setImageParamsOpen] = useState(false);

  // Параметры видео
  const [videoSize, setVideoSize] = useState<string>('720x1280');
  const [videoDuration, setVideoDuration] = useState<number>(4);
  const [videoParamsOpen, setVideoParamsOpen] = useState(false);
  const [videoReferenceOriginalFile, setVideoReferenceOriginalFile] = useState<File | null>(null);
  const [videoReferenceFile, setVideoReferenceFile] = useState<File | null>(null);
  const [videoReferenceSize, setVideoReferenceSize] = useState<string | null>(null);
  const [isVideoReferenceProcessing, setIsVideoReferenceProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoReferenceInputRef = useRef<HTMLInputElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const imageServiceRef = useRef(new ImageService());
  const videoServiceRef = useRef(new VideoService());

  const selectedImageModel = IMAGE_MODELS.find((m) => m.id === selectedImageModelId);
  const selectedVideoModel = VIDEO_MODELS.find((m) => m.id === selectedVideoModelId);

  useEffect(() => {
    if (!selectedImageModel) return;
    const q = selectedImageModel.supportedQualities?.[0];
    const s = selectedImageModel.supportedResolutions?.[0];
    const style = selectedImageModel.supportedStyles?.[0];
    if (q) setImageQuality(q);
    if (s) setImageSize(s);
    if (style) setImageStyle(style);
  }, [selectedImageModel?.id]);

  useEffect(() => {
    if (!selectedVideoModel) return;
    const size = selectedVideoModel.supportedQualities?.[0];
    const duration = selectedVideoModel.supportedDurations?.[0];
    if (size) setVideoSize(size);
    if (typeof duration === 'number') setVideoDuration(duration);
    // Сброс референса при смене модели, чтобы не получить mismatch по size
    setVideoReferenceOriginalFile(null);
    setVideoReferenceFile(null);
    setVideoReferenceSize(null);
    setIsVideoReferenceProcessing(false);
  }, [selectedVideoModel?.id]);

  function parseSize(size: string): { w: number; h: number } | null {
    const m = size.match(/^(\d+)x(\d+)$/);
    if (!m) return null;
    const w = Number(m[1]);
    const h = Number(m[2]);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
    return { w, h };
  }

  async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Не удалось загрузить изображение'));
      };
      img.src = url;
    });
  }

  /** Обрезает изображение под target WxH (cover crop) и возвращает новый File (PNG). */
  async function cropReferenceToSize(file: File, targetW: number, targetH: number): Promise<File> {
    const img = await loadImageFromFile(file);
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    if (!srcW || !srcH) throw new Error('Некорректный размер изображения');

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas недоступен');

    // cover-crop: масштабируем так, чтобы заполнить целевой кадр, затем обрезаем по центру
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (targetW - drawW) / 2;
    const dy = (targetH - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Не удалось подготовить изображение'))),
        'image/png'
      );
    });

    const outName = `reference_${targetW}x${targetH}.png`;
    return new File([blob], outName, { type: 'image/png' });
  }

  async function prepareVideoReference(file: File, sizeStr: string) {
    const parsed = parseSize(sizeStr);
    if (!parsed) throw new Error(`Некорректный размер видео: ${sizeStr}`);
    const cropped = await cropReferenceToSize(file, parsed.w, parsed.h);
    setVideoReferenceFile(cropped);
    setVideoReferenceSize(`${parsed.w}x${parsed.h}`);
  }

  // Если пользователь меняет разрешение видео после выбора референса — переобрезаем под новое.
  useEffect(() => {
    if (!selectedVideoModel?.supportsReferenceImage) return;
    if (!videoReferenceOriginalFile) return;
    const supported = selectedVideoModel.supportedQualities || [];
    if (supported.length && !supported.includes(videoSize)) return;
    setIsVideoReferenceProcessing(true);
    prepareVideoReference(videoReferenceOriginalFile, videoSize)
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось обработать референс'))
      .finally(() => setIsVideoReferenceProcessing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSize]);

  const displayModelName =
    modelTab === 'image'
      ? selectedImageModel?.name || 'Выберите модель'
      : selectedVideoModel?.name || 'Выберите модель';

  const PUBLIC_PAGE_SIZE = 24;
  const [galleryHasMore, setGalleryHasMore] = useState(true);
  const [galleryLoadingMore, setGalleryLoadingMore] = useState(false);

  // Load public gallery (generations shared by users) — первая порция
  React.useEffect(() => {
    const load = async () => {
      setGalleryLoading(true);
      const { imageGenerations, videoGenerations, error } = await GenerationService.getPublicGenerations({
        limit: PUBLIC_PAGE_SIZE,
        offset: 0,
      });
      if (error) {
        setRecentGenerations([]);
        setGalleryLoading(false);
        return;
      }
      const img: UnifiedGeneration[] = (imageGenerations || []).map((g: ImageGeneration) => ({
        type: 'image',
        id: g.id,
        prompt: g.prompt,
        model: g.model,
        status: g.status,
        thumbnail: g.imageUrls?.[0],
        imageUrls: g.imageUrls,
        createdAt: String(g.createdAt),
      }));
      const vid: UnifiedGeneration[] = (videoGenerations || []).map((g: VideoGeneration) => ({
        type: 'video',
        id: g.id,
        prompt: g.prompt,
        model: g.model,
        status: g.status,
        thumbnail: undefined,
        videoUrl: g.videoUrl,
        videoId: g.videoId,
        createdAt: String(g.createdAt),
      }));
      const merged = [...img, ...vid].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentGenerations(merged);
      setGalleryHasMore((imageGenerations?.length ?? 0) >= PUBLIC_PAGE_SIZE || (videoGenerations?.length ?? 0) >= PUBLIC_PAGE_SIZE);
      setGalleryLoading(false);
    };
    load();
  }, []);

  const loadMoreGallery = async () => {
    if (galleryLoadingMore || !galleryHasMore) return;
    setGalleryLoadingMore(true);
    const offset = recentGenerations.length;
    const { imageGenerations, videoGenerations, error } = await GenerationService.getPublicGenerations({
      limit: PUBLIC_PAGE_SIZE,
      offset,
    });
    setGalleryLoadingMore(false);
    if (error || ((imageGenerations?.length ?? 0) === 0 && (videoGenerations?.length ?? 0) === 0)) {
      setGalleryHasMore(false);
      return;
    }
    const img: UnifiedGeneration[] = (imageGenerations || []).map((g: ImageGeneration) => ({
      type: 'image',
      id: g.id,
      prompt: g.prompt,
      model: g.model,
      status: g.status,
      thumbnail: g.imageUrls?.[0],
      imageUrls: g.imageUrls,
      createdAt: String(g.createdAt),
    }));
    const vid: UnifiedGeneration[] = (videoGenerations || []).map((g: VideoGeneration) => ({
      type: 'video',
      id: g.id,
      prompt: g.prompt,
      model: g.model,
      status: g.status,
      thumbnail: undefined,
      videoUrl: g.videoUrl,
      videoId: g.videoId,
      createdAt: String(g.createdAt),
    }));
    const merged = [...img, ...vid].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentGenerations((prev) => {
      const ids = new Set(prev.map((x) => x.id));
      const newOnes = merged.filter((x) => !ids.has(x.id));
      return [...prev, ...newOnes];
    });
    setGalleryHasMore((imageGenerations?.length ?? 0) >= PUBLIC_PAGE_SIZE || (videoGenerations?.length ?? 0) >= PUBLIC_PAGE_SIZE);
  };

  const filteredImageModels = IMAGE_MODELS.filter(
    (m) =>
      !modelSearch.trim() ||
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );
  const filteredVideoModels = VIDEO_MODELS.filter(
    (m) =>
      !modelSearch.trim() ||
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleSelectImageModel = (id: string) => {
    setModelTab('image');
    setSelectedImageModelId(id);
    setModelModalOpen(false);
  };
  const handleSelectVideoModel = (id: string) => {
    setModelTab('video');
    setSelectedVideoModelId(id);
    setModelModalOpen(false);
  };

  const handleSubmit = async () => {
    const text = prompt.trim();
    if (!text) {
      setError('Введите описание');
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }

    if (modelTab === 'image' && !canGenerateImage) {
      setError(`Дневной лимит изображений (${imageLimit}) исчерпан. Перейдите на Премиум.`);
      return;
    }
    if (modelTab === 'video' && !canGenerateVideo) {
      setError(`Дневной лимит видео (${videoLimit}) исчерпан. Перейдите на Премиум.`);
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      if (modelTab === 'image') {
        const modelId = selectedImageModelId || IMAGE_MODELS[0]?.id;
        const model = IMAGE_MODELS.find((m) => m.id === modelId);
        const size = imageSize || model?.supportedResolutions?.[0] || '1024x1024';
        const quality = (imageQuality as 'low' | 'medium' | 'high' | 'standard' | 'hd') || 'standard';
        const outputFormat = imageOutputFormat === 'jpeg' ? 'jpg' : imageOutputFormat;
        const useEdit = Boolean(attachedImage && model?.supportsImageInput);

        // Редактирование с прикреплённым изображением: создаём запись, сразу переходим в библиотеку, editImage доделывается в фоне
        if (useEdit) {
          const { generation, error: createErr } = await GenerationService.createImageGeneration({
            model: modelId,
            prompt: text,
            quality,
            size,
            outputFormat: outputFormat as 'png' | 'jpg' | 'webp',
            numImages: 1,
            imageUrls: [],
            status: 'processing',
          });
          if (createErr || !generation) {
            throw new Error(createErr || 'Не удалось создать запись');
          }
          refresh();
          navigate('/library');

          const baseParams = {
            model: modelId,
            prompt: text,
            size,
            quality,
            n: 1 as const,
            output_format: outputFormat as 'png' | 'jpg' | 'webp',
            moderation: imageModeration,
          };
          const withStyle = model?.supportedStyles?.length
            ? { ...baseParams, style: imageStyle }
            : baseParams;
          const genId = generation.id;
          imageServiceRef.current
            .editImage({ ...withStyle, image: attachedImage! })
            .then(async (response) => {
              if (response.error || !response.data?.length) {
                await GenerationService.updateImageGeneration(genId, {
                  status: 'failed',
                  errorMessage: response.error?.message || 'Ошибка генерации изображения',
                });
              } else {
                const imageUrls = response.data
                  .map((item) => {
                    if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
                    if (item.url) return item.url;
                    return null;
                  })
                  .filter((u): u is string => !!u);
                await GenerationService.updateImageGeneration(genId, {
                  imageUrls,
                  status: 'completed',
                });
              }
            })
            .catch(async (editErr) => {
              await GenerationService.updateImageGeneration(genId, {
                status: 'failed',
                errorMessage: editErr instanceof Error ? editErr.message : 'Ошибка генерации изображения',
              });
            });
          return;
        }

        // Обычная генерация: создаём запись «в процессе», переходим в библиотеку, генерация доделается там
        const { generation, error: createErr } = await GenerationService.createImageGeneration({
          model: modelId,
          prompt: text,
          quality,
          size,
          outputFormat: outputFormat as 'png' | 'jpg' | 'webp',
          numImages: 1,
          imageUrls: [],
          status: 'processing',
        });
        if (createErr || !generation) {
          throw new Error(createErr || 'Не удалось создать запись');
        }
        refresh();
        navigate('/library', {
          state: {
            pendingImageGeneration: {
              generationId: generation.id,
              modelId,
              prompt: text,
              size,
              quality,
              outputFormat: outputFormat as 'png' | 'jpg' | 'webp',
              imageModeration,
              imageStyle: model?.supportedStyles?.length ? imageStyle : undefined,
            },
          },
        });
        return;
      }

      // Video
      const modelId = selectedVideoModelId || VIDEO_MODELS[0]?.id;
      const videoModel = VIDEO_MODELS.find((m) => m.id === modelId);
      const size = videoSize || videoModel?.supportedQualities?.[0] || '720x1280';
      const duration = videoDuration || videoModel?.supportedDurations?.[0] || 4;

      if (videoModel?.supportsReferenceImage && isVideoReferenceProcessing) {
        setError('Референсное изображение ещё обрабатывается. Подождите пару секунд.');
        setIsGenerating(false);
        return;
      }

      const response = await videoServiceRef.current.generateVideo({
        model: modelId,
        prompt: text,
        size,
        seconds: duration,
        ...(videoModel?.supportsReferenceImage && videoReferenceFile && { input_reference: videoReferenceFile }),
      });
      if (videoModel?.supportsReferenceImage) setVideoReferenceFile(null);

      const externalId = response.id;
      if (!externalId || typeof externalId !== 'string') {
        throw new Error('Видео не было создано: провайдер не вернул id задания.');
      }
      if (!externalId.startsWith('video_')) {
        throw new Error(`Видео не было создано: получен некорректный id (${externalId}). Ожидается video_...`);
      }
      const apiStatus = response.status?.toLowerCase();
      const status =
        apiStatus === 'completed'
          ? 'completed'
          : apiStatus === 'failed'
          ? 'failed'
          : 'processing';

      const { generation, error: createErr } = await GenerationService.createVideoGeneration({
        model: modelId,
        prompt: text,
        videoId: String(externalId),
        status,
        duration,
        size,
        seconds: duration,
      });

      if (createErr) console.error(createErr);
      refresh();
      navigate('/library', {
        state: generation
          ? {
              pendingVideoGeneration: {
                generationId: generation.id,
                videoId: String(externalId),
                prompt: text,
                model: modelId,
                status,
                size,
                seconds: duration,
                createdAt: generation.createdAt,
              },
            }
          : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-full flex flex-col bg-[#0d0d0f]">
      <PulsingOrbsBackground />
      {/* Gallery area — отступ снизу под фиксированную панель */}
      <div className="relative z-10 flex-1 overflow-auto p-6 pb-72">
        <div className="max-w-6xl mx-auto">
          {galleryLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <GalleryCardSkeleton key={i} />
              ))}
            </div>
          ) : recentGenerations.length === 0 ? (
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-12 text-center">
              <Palette className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Пока нет публичных генераций</p>
              <p className="text-gray-500 text-sm mt-2">
                В Библиотеке включите «Поделиться в Creative Lab» у любой генерации — она появится здесь для других
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recentGenerations.map((gen) => (
                  <CreativeLabCard
                    key={gen.id}
                    gen={gen}
                    onOpenLightbox={() => setLightboxGen(gen)}
                  />
                ))}
              </div>
              {galleryHasMore && recentGenerations.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMoreGallery}
                    disabled={galleryLoadingMore}
                    className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {galleryLoadingMore ? 'Загрузка…' : 'Загрузить ещё'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom bar — фиксирована внизу экрана; pointer-events-none на обёртке, чтобы не перекрывать сайдбар (тема, аккаунт) */}
      <div className="fixed bottom-0 left-0 right-0 z-10 py-5 px-4 pointer-events-none">
        <div className="max-w-4xl mx-auto rounded-t-[2rem] bg-black/90 border border-white/10 border-b-0 overflow-hidden shadow-[0_-4px_24px_rgba(0,0,0,0.4)] pointer-events-auto">
          <div className="space-y-3 pt-4 px-4 pb-5">
          {/* Осталось бесплатных генераций на сегодня */}
          <div className="flex items-center justify-center gap-4 text-sm">
            {modelTab === 'image' ? (
              imageLimit === Infinity ? (
                <span className="text-gray-400">Изображений сегодня: <span className="font-semibold text-primary-400">без лимита</span></span>
              ) : (
                <span className="text-gray-400">
                  Осталось сегодня: <span className="font-semibold text-white">{Math.max(0, imageLimit - imageCount)}</span> изображений
                </span>
              )
            ) : videoLimit === Infinity ? (
              <span className="text-gray-400">Видео сегодня: <span className="font-semibold text-primary-400">без лимита</span></span>
            ) : (
              <span className="text-gray-400">
                Осталось сегодня: <span className="font-semibold text-white">{Math.max(0, videoLimit - videoCount)}</span> видео
              </span>
            )}
          </div>
          {/* Параметры изображения (качество, размер, формат, модерация, стиль, прикрепить) */}
          {modelTab === 'image' && (
            <div className="relative z-10 rounded-xl bg-white/[0.04] border border-white/10 overflow-visible">
              <button
                type="button"
                onClick={() => setImageParamsOpen((o) => !o)}
                className="w-full px-4 py-2 flex items-center justify-between text-gray-400 hover:text-white text-sm"
              >
                <span>Параметры и фильтры</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${imageParamsOpen ? 'rotate-180' : ''}`} />
              </button>
              {imageParamsOpen && (
                <div className="px-4 pb-4 pt-0 grid grid-cols-2 sm:flex sm:flex-wrap gap-3 border-t border-white/10">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Качество</label>
                    <CustomSelect
                      value={imageQuality}
                      options={(selectedImageModel?.supportedQualities || ['standard']).map((q) => ({ value: q, label: q }))}
                      onChange={setImageQuality}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Размер</label>
                    <CustomSelect
                      value={imageSize}
                      options={(selectedImageModel?.supportedResolutions || ['1024x1024']).map((s) => ({ value: s, label: s }))}
                      onChange={setImageSize}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Формат</label>
                    <CustomSelect
                      value={imageOutputFormat}
                      options={[
                        { value: 'png', label: 'PNG' },
                        { value: 'jpeg', label: 'JPEG' },
                        { value: 'webp', label: 'WebP' },
                      ]}
                      onChange={(v) => setImageOutputFormat(v as 'png' | 'jpeg' | 'webp')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Модерация</label>
                    <CustomSelect
                      value={imageModeration}
                      options={[
                        { value: 'low', label: 'Низкая' },
                        { value: 'auto', label: 'Авто' },
                      ]}
                      onChange={(v) => setImageModeration(v as 'low' | 'auto')}
                    />
                  </div>
                  {selectedImageModel?.supportedStyles?.length ? (
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Стиль (DALL·E 3)</label>
                      <CustomSelect
                        value={imageStyle}
                        options={[
                          { value: 'vivid', label: 'Vivid' },
                          { value: 'natural', label: 'Natural' },
                        ]}
                        onChange={(v) => setImageStyle(v as 'vivid' | 'natural')}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
          {/* Параметры видео (размер, длительность, оценка цены) */}
          {modelTab === 'video' && (
            <div className="relative z-10 rounded-xl bg-white/[0.04] border border-white/10 overflow-visible mt-3">
              <button
                type="button"
                onClick={() => setVideoParamsOpen((o) => !o)}
                className="w-full px-4 py-2 flex items-center justify-between text-gray-400 hover:text-white text-sm"
              >
                <span>Параметры и фильтры видео</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${videoParamsOpen ? 'rotate-180' : ''}`} />
              </button>
              {videoParamsOpen && (
                <div className="px-4 pb-4 pt-0 grid grid-cols-2 sm:flex sm:flex-wrap gap-3 border-t border-white/10">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Разрешение</label>
                    <CustomSelect
                      value={videoSize}
                      options={(selectedVideoModel?.supportedQualities || ['720x1280']).map((s) => ({ value: s, label: s }))}
                      onChange={setVideoSize}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Длительность (сек.)</label>
                    <CustomSelect
                      value={String(videoDuration)}
                      options={(selectedVideoModel?.supportedDurations || [4]).map((d) => ({
                        value: String(d),
                        label: `${d} сек.`,
                      }))}
                      onChange={(v) => setVideoDuration(Number(v))}
                    />
                  </div>
                  {selectedVideoModel && (
                    <div className="flex flex-col justify-center text-xs text-gray-500 space-y-0.5">
                      {(() => {
                        const pricePerSecond =
                          (selectedVideoModel.priceMap && selectedVideoModel.priceMap[videoSize]) ||
                          selectedVideoModel.pricePerSecond;
                        if (!pricePerSecond || !videoDuration) return null;
                        const perVideo = pricePerSecond * videoDuration;
                        return (
                          <>
                            <span>
                              Оценка: <span className="text-primary-400 font-semibold">{perVideo.toFixed(0)}₽</span> за видео
                            </span>
                            <span className="text-[11px] text-gray-600">
                              Расчёт по тарифам AITunnel (приблизительно)
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex items-end gap-3 px-5 py-4">
          {modelTab === 'image' && selectedImageModel?.supportsImageInput && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = () => setAttachedImage(r.result as string);
                  r.readAsDataURL(f);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-1"
                title="Прикрепить изображение для редактирования"
              >
                <Camera className="w-5 h-5" />
                {attachedImage && <span className="w-2 h-2 rounded-full bg-primary-500" />}
              </button>
            </>
          )}
          {modelTab === 'video' && selectedVideoModel?.supportsReferenceImage && (
            <>
              <input
                ref={videoReferenceInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) {
                    setVideoReferenceOriginalFile(null);
                    setVideoReferenceFile(null);
                    setVideoReferenceSize(null);
                    return;
                  }
                  setError(null);
                  setVideoReferenceOriginalFile(f);
                  setIsVideoReferenceProcessing(true);
                  prepareVideoReference(f, videoSize)
                    .catch((err) => {
                      setVideoReferenceFile(null);
                      setVideoReferenceSize(null);
                      setError(err instanceof Error ? err.message : 'Не удалось обработать референсное изображение');
                    })
                    .finally(() => setIsVideoReferenceProcessing(false));
                }}
              />
              <button
                type="button"
                onClick={() => videoReferenceInputRef.current?.click()}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-1"
                title="Референсное изображение (первый кадр). Разрешение желательно совпадать с размером видео."
              >
                <Camera className="w-5 h-5" />
                {videoReferenceFile && <span className="w-2 h-2 rounded-full bg-primary-500" />}
              </button>
              {videoReferenceFile && (
                <span className="text-xs text-gray-500 truncate max-w-[120px]" title={videoReferenceFile.name}>
                  {videoReferenceFile.name}
                  {videoReferenceSize ? ` (${videoReferenceSize})` : ''}
                </span>
              )}
            </>
          )}
          <textarea
            ref={promptTextareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              const ta = promptTextareaRef.current;
              if (ta) {
                ta.style.height = 'auto';
                ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Опиши свой шедевр"
            rows={1}
            className="flex-1 min-w-0 px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none overflow-y-auto min-h-[2.5rem] max-h-[7.5rem]"
            style={{ minHeight: '2.5rem', maxHeight: '7.5rem' }}
          />
          <button
            type="button"
            onClick={() => setModelModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/15 shrink-0 max-w-[200px] truncate"
          >
            <span className="truncate">{displayModelName}</span>
          </button>
          <button
            type="button"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            title="Голосовой ввод"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating || isVideoReferenceProcessing}
            className="px-4 py-2 rounded-xl bg-white/10 text-gray-200 font-medium hover:bg-white/15 disabled:opacity-50 flex items-center gap-2 border border-white/10"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isVideoReferenceProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-current" />
            )}
            <span>Создать</span>
          </button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-center text-sm text-red-400">{error}</p>
        )}
        </div>
      </div>

      {/* Lightbox: увеличенное изображение/видео + копировать промпт */}
      {lightboxGen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => { setLightboxGen(null); setCopiedPrompt(false); }}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => { setLightboxGen(null); setCopiedPrompt(false); }}
              className="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-hidden rounded-xl bg-black/50 flex items-center justify-center min-h-0">
              {lightboxGen.type === 'image' && lightboxGen.imageUrls?.length ? (
                <img
                  src={lightboxGen.imageUrls[0]}
                  alt=""
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                />
              ) : lightboxGen.type === 'video' && lightboxGen.videoUrl ? (
                <SupabaseVideo
                  generationId={lightboxGen.id}
                  videoUrl={lightboxGen.videoUrl}
                  controls
                  className="max-w-full max-h-[70vh] rounded-lg"
                  playsInline
                />
              ) : lightboxGen.type === 'video' ? (
                <div className="text-gray-400 py-8">Видео загружается или доступно в Библиотеке</div>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (lightboxGen.prompt) {
                    navigator.clipboard.writeText(lightboxGen.prompt);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
              >
                {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedPrompt ? 'Скопировано' : 'Скопировать промпт'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model selection modal */}
      {modelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setModelModalOpen(false)}
        >
          <div
            className="bg-[#1a1a1d] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="Быстрый поиск нейросетей"
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => setModelTab('image')}
                className={`flex-1 py-3 text-sm font-medium ${
                  modelTab === 'image'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Картинка
              </button>
              <button
                type="button"
                onClick={() => setModelTab('video')}
                className={`flex-1 py-3 text-sm font-medium ${
                  modelTab === 'video'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Видео
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {modelTab === 'image' ? (
                <ul className="space-y-0.5">
                  {filteredImageModels.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectImageModel(m.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${
                          selectedImageModelId === m.id ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <ModelLogo providerName={m.provider} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white truncate">{m.name}</div>
                          <div className="text-xs text-gray-500">{m.provider}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-0.5">
                  {filteredVideoModels.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectVideoModel(m.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${
                          selectedVideoModelId === m.id ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <ModelLogo providerName={m.provider} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white truncate">{m.name}</div>
                          <div className="text-xs text-gray-500">{m.provider}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setModelModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/15"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
