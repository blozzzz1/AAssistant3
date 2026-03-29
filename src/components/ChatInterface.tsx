import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Mic, Square, AlertCircle, Image as ImageIcon, FileText, X, Video, Music, PanelLeft } from 'lucide-react';
import { Message, ImageAttachment, FileAttachment, VideoAttachment, AudioAttachment } from '../types';
import { VoiceVisualizer } from './VoiceVisualizer.tsx';
import { ImageUpload } from './ImageUpload';
import { FileUpload } from './FileUpload';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ModelLogo } from './ModelLogo';

interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (
    message: string,
    images?: ImageAttachment[],
    files?: FileAttachment[],
    video?: VideoAttachment[],
    audio?: AudioAttachment[]
  ) => void;
  onClearChat: () => void;
  isLoading: boolean;
  selectedModelName: string;
  selectedModelProvider?: string;
  selectedModelSupportsImages: boolean;
  selectedModelSupportsFiles?: boolean;
  selectedModelSupportsVideo?: boolean;
  selectedModelSupportsAudio?: boolean;
  speechState: SpeechRecognitionState;
  onStartListening: () => void;
  onStopListening: () => void;
  onSendVoiceMessage: () => void;
  onSetSpeechTranscript: (transcript: string) => void;
  onClearSpeechError: () => void;
  onOpenSessionsDrawer?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  selectedModelName,
  selectedModelProvider,
  selectedModelSupportsImages,
  selectedModelSupportsFiles = false,
  selectedModelSupportsVideo = false,
  selectedModelSupportsAudio = false,
  speechState,
  onStartListening,
  onStopListening,
  onSetSpeechTranscript,
  onClearSpeechError,
  onOpenSessionsDrawer
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [attachedVideo, setAttachedVideo] = useState<VideoAttachment | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<AudioAttachment[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, speechState.transcript]);


  const [isSpeaking, setIsSpeaking] = useState(false);



  // Автоматически закрываем окно разрешения при успешном начале записи
  useEffect(() => {
    if (showPermissionRequest && speechState.isListening) {
      setShowPermissionRequest(false);
      setIsRequestingPermission(false);
    }
  }, [speechState.isListening, showPermissionRequest]);

  // Сбрасываем ошибку при изменении состояния записи
  useEffect(() => {
    if (speechState.isListening && speechState.error) {
      onClearSpeechError();
    }
  }, [speechState.isListening]);

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedVideo({ type: 'base64', url: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const format = file.name.toLowerCase().endsWith('.wav') ? 'wav' as const : 'mp3' as const;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
      if (base64) {
        setAttachedAudio((prev) => [...prev, { type: 'base64', data: base64, format, filename: file.name }]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = speechState.isListening ? speechState.transcript : inputMessage;
    
    // Блокируем отправку если это сообщение об ошибке
    if (isErrorMessage(messageToSend)) {
      return;
    }
    
    const hasContent = messageToSend.trim() || attachedVideo || attachedAudio.length > 0;
    if (hasContent && !isLoading) {
      onSendMessage(
        messageToSend.trim(),
        attachedImages.length > 0 ? attachedImages : undefined,
        attachedFiles.length > 0 ? attachedFiles : undefined,
        attachedVideo ? [attachedVideo] : undefined,
        attachedAudio.length > 0 ? attachedAudio : undefined
      );
      setInputMessage('');
      setAttachedImages([]);
      setAttachedFiles([]);
      setAttachedVideo(null);
      setAttachedAudio([]);
      setShowImageUpload(false);
      setShowFileUpload(false);
      
      // Сбрасываем высоту textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      if (speechState.isListening) {
        onStopListening();
        onSetSpeechTranscript('');
      }
    }
  };

  const isErrorMessage = (message: string): boolean => {
    return message.includes('Ошибка распознавания:') || 
           message.includes('Speech recognition error:') ||
           message.includes('Microphone access denied') ||
           message.includes('not-allowed') ||
           message.includes('permission') ||
           message.includes('Микрофон не найден') ||
           message.includes('настройки аудио');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    
    // Сбрасываем ошибку при изменении текста
    if (speechState.error && value !== speechState.transcript) {
      onClearSpeechError();
    }
  };

  const toggleListening = async () => {
    if (speechState.isListening) {
      onStopListening();
      // Останавливаем поток при завершении записи
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    } else {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMicrophonePermission = devices.some(device => 
          device.kind === 'audioinput' && device.deviceId !== ''
        );
        
        if (hasMicrophonePermission) {
          // Если разрешение уже есть, запрашиваем поток
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          });
          setMediaStream(stream);
          onStartListening();
          setInputMessage('');
          onClearSpeechError();
        } else {
          setShowPermissionRequest(true);
        }
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        setShowPermissionRequest(true);
      }
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ru-RU"; // можно сделать выбор голоса
    utter.rate = 1.0;
    utter.pitch = 1.0;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };


  useEffect(() => {
    return () => {

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const handleSendVoiceMessage = () => {
    // Не отправляем если есть ошибка или сообщение является ошибкой
    if (speechState.transcript.trim() && !speechState.error && !isErrorMessage(speechState.transcript)) {
      onSendMessage(
        speechState.transcript.trim(), 
        attachedImages.length > 0 ? attachedImages : undefined,
        attachedFiles.length > 0 ? attachedFiles : undefined
      );
      onSetSpeechTranscript('');
      setAttachedImages([]);
      setAttachedFiles([]);
      setShowImageUpload(false);
      setShowFileUpload(false);
      if (speechState.isListening) {
        onStopListening();
      }
    }
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    onClearSpeechError();
    
    try {
      // Запрашиваем разрешение и получаем поток
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      setMediaStream(stream); // Сохраняем поток для визуализатора
      
      // Закрываем окно запроса
      setShowPermissionRequest(false);
      setIsRequestingPermission(false);
      
      // Автоматически начинаем запись после получения разрешения
      setTimeout(() => {
        onStartListening();
        setInputMessage('');
      }, 100);
      
    } catch (error) {
      console.error('Доступ к микрофону запрещён:', error);
      
      
      let errorMessage = '';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Пожалуйста, разрешите доступ к микрофону.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'Микрофон не найден. Пожалуйста проверьте настройки аудио.';
        } else {
          errorMessage += `Ошибка: ${error.message}`;
        }
      }
      
      // Обновляем состояние ошибки
      onSetSpeechTranscript(errorMessage);
      
      // Закрываем окно запроса при ошибке
      setShowPermissionRequest(false);
      setIsRequestingPermission(false);
    }
  };

  const handleCancelPermission = () => {
    setShowPermissionRequest(false);
    setIsRequestingPermission(false);
    onClearSpeechError();
    onSetSpeechTranscript('');
  };

  // Закрытие окна по клику на overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancelPermission();
    }
  };

  const isErrorTranscript = (text: string): boolean => {
    return isErrorMessage(text);
  };

  const canSendMessage = (): boolean => {
    const messageToSend = speechState.isListening ? speechState.transcript : inputMessage;
    return !isLoading && 
           !speechState.isListening && 
           messageToSend.trim() !== '' && 
           !isErrorMessage(messageToSend);
  };


  // Компонент для визуализации звуковых волн

  return (
    <div className="flex flex-col h-full bg-background-darker">
      {/* Header */}
      <div className="shrink-0 border-b border-primary-900/30 bg-background-dark/50 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-5 min-h-[72px] sm:min-h-[87px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {onOpenSessionsDrawer && (
              <button
                type="button"
                onClick={onOpenSessionsDrawer}
                className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-background-hover hover:text-white lg:hidden"
                aria-label="Список чатов"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            )}
            {selectedModelProvider ? (
              <ModelLogo providerName={selectedModelProvider} size="lg" />
            ) : (
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-semibold leading-tight text-white">AI помощник</h2>
              <p className="truncate text-xs leading-tight text-gray-400 sm:text-sm">Используется {selectedModelName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearChat}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-background-hover rounded-lg transition-colors"
              title="Очистить чат"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Задайте вопрос!</h3>
            <p className="text-gray-500">Чем я могу вам помочь?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* --- Аватарка бота --- */}
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                {/* --- Изображения в сообщении --- */}
                {message.images && message.images.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.images.map((image, idx) => {
                      const imgSrc = image.type === 'url' && image.url 
                        ? image.url 
                        : `data:${image.mimeType};base64,${image.data}`;
                      return (
                        <img
                          key={idx}
                          src={imgSrc}
                          alt={`Attachment ${idx + 1}`}
                          className="max-w-xs max-h-48 rounded-lg border border-primary-800/50 object-contain cursor-pointer hover:opacity-80 transition-opacity hover:border-primary-600"
                          onClick={() => window.open(imgSrc, '_blank')}
                        />
                      );
                    })}
                  </div>
                )}

                {/* --- Видео в сообщении --- */}
                {message.video && message.video.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.video.map((v, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm"
                      >
                        <Video className="w-4 h-4 text-primary-400" />
                        Видео
                      </span>
                    ))}
                  </div>
                )}
                {/* --- Аудио в сообщении --- */}
                {message.audio && message.audio.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.audio.map((a, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm"
                      >
                        <Music className="w-4 h-4 text-primary-400" />
                        Аудио{a.filename ? `: ${a.filename}` : ''}
                      </span>
                    ))}
                  </div>
                )}
                {/* --- Файлы в сообщении --- */}
                {message.files && message.files.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.files.map((file, idx) => {
                      const getFileIcon = () => {
                        if (file.mimeType === 'application/pdf') return '📄';
                        if (file.mimeType.includes('word') || file.mimeType.includes('document')) return '📝';
                        return '📎';
                      };

                      const formatFileSize = (bytes?: number): string => {
                        if (!bytes) return '';
                        if (bytes < 1024) return bytes + ' Б';
                        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
                        return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
                      };

                      const fileUrl = file.type === 'url' && file.url 
                        ? file.url 
                        : file.data 
                        ? `data:${file.mimeType};base64,${file.data}` 
                        : null;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 bg-background-card border border-primary-800/50 rounded-lg hover:border-primary-600 transition-colors cursor-pointer group"
                          onClick={() => {
                            if (fileUrl) {
                              window.open(fileUrl, '_blank');
                            }
                          }}
                        >
                          <span className="text-xl">{getFileIcon()}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm text-gray-300 truncate group-hover:text-primary-400 transition-colors">
                              {file.filename}
                            </span>
                            {file.size && (
                              <span className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </span>
                            )}
                          </div>
                          <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* --- Само сообщение --- */}
                <div
                  className={`p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-background-card border border-primary-900/30 text-gray-100'
                  }`}
                >
                  <div className="prose prose-invert max-w-none overflow-x-hidden">
                    <MarkdownRenderer content={message.content} isUser={message.role === 'user'} />
                  </div>
                </div>

                {/* --- Таймштамп + Play/Stop --- */}
                <div className="flex items-center gap-2 mt-2 px-2">
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>

                  {message.role === 'assistant' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => speak(message.content)}
                        className="text-gray-500 hover:text-blue-400 transition-colors text-xs"
                      >
                        {isSpeaking ? "🔊 Speaking..." : "▶️ Play"}
                      </button>
                      {isSpeaking && (
                        <button
                          onClick={stopSpeaking}
                          className="text-gray-500 hover:text-red-400 transition-colors text-xs"
                        >
                          ⏹ Stop
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- Аватарка юзера --- */}
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-background-card border border-primary-900/30 p-4 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Окно запроса разрешения на микрофон */}
      {showPermissionRequest && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Требуется доступ к микрофону</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Чтобы использовать голосовой ввод пожалуйста разрешите доступ к микрофону в браузере. 
              После нажатия "Разрешить", браузер запросит разрешение на использование микрофона.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRequestPermission}
                disabled={isRequestingPermission}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {isRequestingPermission ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Получение...
                  </>
                ) : (
                  'Разрешить'
                )}
              </button>
              <button
                onClick={handleCancelPermission}
                disabled={isRequestingPermission}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Голосовой ввод - отображается поверх основного инпута при активации */}
      {speechState.isListening && (
        <div className="border-t border-primary-500/50 p-4 bg-primary-900/20 backdrop-blur-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-primary-400 font-medium">Слушаю...</span>
              </div>
               <VoiceVisualizer 
                  isListening={speechState.isListening && !speechState.error}
                  stream={mediaStream}
                  barColor="bg-primary-400"
                  barCount={5}
                  maxHeight={20}
                
                />
            </div>
            
            <div className={`rounded-lg p-3 min-h-[60px] ${
              speechState.error ? 'bg-red-900/30 border border-red-500/50' : 'bg-primary-900/30'
            }`}>
              <p className={`text-sm ${speechState.error ? 'text-red-200' : 'text-white'}`}>
                {speechState.error || speechState.transcript || 'Говорите...'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onStopListening}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" />
                Остановить запись
              </button>
              
              {speechState.transcript && !speechState.error && (
                <button
                  onClick={handleSendVoiceMessage}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Отправить сообщение
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Основной input */}
      <div className="border-t border-primary-900/30 p-4 bg-background-dark/50 backdrop-blur-sm">
        {/* Image Upload Section */}
        {showImageUpload && selectedModelSupportsImages && (
          <div className="mb-3 p-3 bg-background-card rounded-lg border border-primary-800/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary-400" />
                Прикрепить изображения
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowImageUpload(false);
                  setAttachedImages([]);
                }}
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ImageUpload
              images={attachedImages}
              onImagesChange={setAttachedImages}
              maxImages={10}
              disabled={isLoading}
            />
          </div>
        )}

        {/* File Upload Section */}
        {showFileUpload && selectedModelSupportsFiles && (
          <div className="mb-3 p-3 bg-background-card rounded-lg border border-primary-800/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-400" />
                Прикрепить файлы (PDF, DOCX)
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowFileUpload(false);
                  setAttachedFiles([]);
                }}
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FileUpload
              files={attachedFiles}
              onFilesChange={setAttachedFiles}
              maxFiles={5}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Видео / Аудио прикреплены */}
        {(attachedVideo || attachedAudio.length > 0) && (
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
            {attachedVideo && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                <Video className="w-4 h-4 text-primary-400" />
                Видео
                <button
                  type="button"
                  onClick={() => setAttachedVideo(null)}
                  className="text-gray-400 hover:text-white ml-0.5"
                  aria-label="Удалить видео"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {attachedAudio.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                <Music className="w-4 h-4 text-primary-400" />
                Аудио: {attachedAudio.length}
                <button
                  type="button"
                  onClick={() => setAttachedAudio([])}
                  className="text-gray-400 hover:text-white ml-0.5"
                  aria-label="Удалить аудио"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Текстовое поле */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={speechState.isListening ? speechState.transcript : inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                speechState.isListening 
                  ? "Говорю..." 
                  : "Опишите вашу задачу или задайте вопрос..."
              }
              disabled={isLoading || speechState.isListening}
              rows={1}
              className={`w-full px-4 py-3 bg-background-card text-white rounded-xl border resize-none min-h-[48px] max-h-[200px] disabled:opacity-50 transition-all ${
                speechState.error && speechState.isListening
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-primary-900/30 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20'
              }`}
              style={{ overflowY: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 200) + 'px';
              }}
            />
          </div>
          
          {/* Кнопки снизу */}
          <div className="flex items-center gap-2">
            {selectedModelSupportsImages && (
              <button
                type="button"
                onClick={() => {
                  setShowImageUpload(!showImageUpload);
                  if (showImageUpload) setShowFileUpload(false);
                }}
                disabled={isLoading || speechState.isListening}
                className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                  showImageUpload || attachedImages.length > 0
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-background-card border border-primary-900/30 text-gray-300 hover:bg-background-hover hover:border-primary-800/50'
                } disabled:opacity-50 disabled:cursor-not-allowed relative`}
                title="Прикрепить изображения"
              >
                <ImageIcon className="w-4 h-4" />
                {attachedImages.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-pink text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-lg font-medium">
                    {attachedImages.length}
                  </span>
                )}
              </button>
            )}

            {selectedModelSupportsFiles && (
              <button
                type="button"
                onClick={() => {
                  setShowFileUpload(!showFileUpload);
                  if (showFileUpload) setShowImageUpload(false);
                }}
                disabled={isLoading || speechState.isListening}
                className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                  showFileUpload || attachedFiles.length > 0
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-background-card border border-primary-900/30 text-gray-300 hover:bg-background-hover hover:border-primary-800/50'
                } disabled:opacity-50 disabled:cursor-not-allowed relative`}
                title="Прикрепить файлы (PDF, DOCX)"
              >
                <FileText className="w-4 h-4" />
                {attachedFiles.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-pink text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-lg font-medium">
                    {attachedFiles.length}
                  </span>
                )}
              </button>
            )}

            {selectedModelSupportsVideo && (
              <>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/mpeg,video/quicktime"
                  className="hidden"
                  onChange={handleVideoFile}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isLoading || speechState.isListening}
                  className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                    attachedVideo
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-background-card border border-primary-900/30 text-gray-300 hover:bg-background-hover hover:border-primary-800/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Прикрепить видео"
                >
                  <Video className="w-4 h-4" />
                </button>
              </>
            )}

            {selectedModelSupportsAudio && (
              <>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/wav,audio/wave,audio/x-wav,audio/mpeg,audio/mp3"
                  className="hidden"
                  onChange={handleAudioFile}
                />
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isLoading || speechState.isListening}
                  className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                    attachedAudio.length > 0
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-background-card border border-primary-900/30 text-gray-300 hover:bg-background-hover hover:border-primary-800/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed relative`}
                  title="Прикрепить аудио (WAV, MP3)"
                >
                  <Music className="w-4 h-4" />
                  {attachedAudio.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-pink text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-lg font-medium">
                      {attachedAudio.length}
                    </span>
                  )}
                </button>
              </>
            )}

            {speechState.isSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                  speechState.isListening
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/50'
                    : speechState.error
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/50'
                    : 'bg-background-card border border-primary-900/30 text-gray-300 hover:bg-background-hover hover:text-primary-400 hover:border-primary-800/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={
                  speechState.error 
                    ? 'Доступ к микрофону запрещен' 
                    : speechState.isListening 
                    ? 'Остановить запись' 
                    : 'Начать голосовой ввод'
                }
              >
              {speechState.isListening ? (
                <Square className="w-4 h-4" />
              ) : speechState.error ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              </button>
            )}

            <div className="flex-1"></div>

            <button
              type="submit"
              disabled={!canSendMessage()}
              className="w-10 h-10 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        
        {/* Успешное распознавание (без ошибки) */}
        {speechState.isSupported &&
          !speechState.isListening &&
          speechState.transcript &&
          !isErrorTranscript(speechState.transcript) && (
            <div className="mt-2 p-2 bg-background-card rounded-lg border border-primary-900/30">
              <p className="text-sm text-gray-300 mb-2">Голосовое сообщение распознано:</p>
              <p className="text-white text-sm mb-2">{speechState.transcript}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleSendVoiceMessage}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Отправить
                </button>
                <button
                  onClick={() => {
                    onSetSpeechTranscript('');
                    onClearSpeechError();
                  }}
                  className="px-3 py-1 bg-background-hover text-white text-xs rounded hover:bg-background-card transition-colors"
                >
                  Очистить
                </button>
              </div>
            </div>
          )}


        {/* Ошибка распознавания или доступа к микрофону */}
        {speechState.isSupported &&
          !speechState.isListening &&
          isErrorTranscript(speechState.transcript) && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-200 font-medium">Ошибка микрофона</p>
              </div>
              {/* Используем speechState.transcript, потому что именно там ошибка! */}
              <p className="text-red-200 text-sm mb-2">{speechState.transcript}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onClearSpeechError();
                    onSetSpeechTranscript('');
                  }}
                  className="px-3 py-1 bg-red-700/30 text-red-200 text-xs rounded hover:bg-red-700/50 hover:text-red-100 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};