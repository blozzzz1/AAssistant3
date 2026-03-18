import React, { useState, useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  stream: MediaStream | null;
  barColor?: string;
  barCount?: number;
  maxHeight?: number;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isListening,
  stream,
  barColor = 'bg-blue-400',
  barCount = 5,
  maxHeight = 24
}) => {
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(barCount).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>();
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!isListening || !stream) {
      stopAudioAnalysis();
      return;
    }

    startAudioAnalysis(stream);
    
    return () => {
      stopAudioAnalysis();
    };
  }, [isListening, stream]);

  const startAudioAnalysis = async (audioStream: MediaStream) => {
    try {
      // Создаем AudioContext
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Настройки анализатора
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Подключаем поток к анализатору
      sourceRef.current = audioContextRef.current.createMediaStreamSource(audioStream);
      sourceRef.current.connect(analyserRef.current);
      
      // Создаем массив для данных с правильным типом
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // Запускаем анимацию
      startVisualization();
      
    } catch (error) {
      console.error('Error starting audio analysis:', error);
      // Fallback на случайную анимацию при ошибке
      startFallbackAnimation();
    }
  };

  const stopAudioAnalysis = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Отключаем и закрываем аудио контекст
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    dataArrayRef.current = null;
    
    setAudioLevels(Array(barCount).fill(0));
  };

  const startVisualization = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyzeAudio = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      // Создаем новый Uint8Array с явным указанием типа для обхода ошибки TypeScript
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Получаем данные о частотах
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Разбиваем частотный диапазон на сегменты для каждой полоски
      const segmentSize = Math.floor(bufferLength / barCount);
      
      const newLevels: number[] = [];
      
      for (let i = 0; i < barCount; i++) {
        const start = i * segmentSize;
        const end = start + segmentSize;
        let sum = 0;
        
        for (let j = start; j < end; j++) {
          sum += dataArray[j];
        }
        
        const average = sum / segmentSize;
        // Нормализуем значение от 0 до 1
        const normalizedLevel = Math.min(average / 255, 1);
        
        // Добавляем немного минимального уровня для видимости
        const finalLevel = Math.max(normalizedLevel, 0.1);
        newLevels.push(finalLevel);
      }
      
      setAudioLevels(newLevels);
      animationRef.current = requestAnimationFrame(analyzeAudio);
    };
    
    animationRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startFallbackAnimation = () => {
    const animate = () => {
      const newLevels = Array(barCount).fill(0).map(() => {
        // Случайные значения с некоторой "живостью"
        return Math.random() * 0.5 + 0.3;
      });
      setAudioLevels(newLevels);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  if (!isListening) return null;

  return (
    <div className="flex items-center gap-1 h-6" title="Real-time audio level">
      {audioLevels.map((level, index) => {
        const height = Math.max(2, level * maxHeight);
        return (
          <div
            key={index}
            className={`w-1 ${barColor} rounded-full transition-all duration-75 ease-out`}
            style={{ 
              height: `${height}px`,
              opacity: 0.7 + (level * 0.3) // Динамическая прозрачность
            }}
          />
        );
      })}
    </div>
  );
};