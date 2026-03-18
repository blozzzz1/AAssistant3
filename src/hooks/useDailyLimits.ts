import { useState, useEffect, useCallback } from 'react';
import { fetchPlan } from '../services/planService';

export function useDailyLimits(userId: string | null) {
  const [imageCount, setImageCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [imageLimit, setImageLimit] = useState<number>(20);
  const [videoLimit, setVideoLimit] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await fetchPlan();
    if (data) {
      setImageCount(data.imageCountToday);
      setVideoCount(data.videoCountToday);
      // null = премиум, без лимита; тогда храним 0 как "без лимита"
      setImageLimit(data.imageLimit ?? 0);
      setVideoLimit(data.videoLimit ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) {
      setImageCount(0);
      setVideoCount(0);
      setImageLimit(20);
      setVideoLimit(5);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [userId, refresh]);

  const canGenerateImage = imageLimit === 0 || imageCount < imageLimit; // 0 = без лимита (премиум)
  const canGenerateVideo = videoLimit === 0 || videoCount < videoLimit;

  return {
    imageCount,
    videoCount,
    imageLimit: imageLimit === 0 ? Infinity : imageLimit,
    videoLimit: videoLimit === 0 ? Infinity : videoLimit,
    canGenerateImage,
    canGenerateVideo,
    loading,
    refresh,
  };
}
