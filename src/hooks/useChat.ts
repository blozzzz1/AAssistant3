import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, ChatSession, ImageAttachment, FileAttachment, VideoAttachment, AudioAttachment } from '../types';
import { AIService } from '../services/aiService';
import { ChatService } from '../services/chatService';
import { StorageService } from '../utils/storage';

interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

export const useChat = (userId?: string) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => {
    const savedModel = StorageService.getSelectedModel();
    return savedModel || 'openai/gpt-oss-120b';
  });

  const [speechState, setSpeechState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    isSupported: false,
    error: null
  });
  
  const recognitionRef = useRef<any>(null);
  const aiService = new AIService(); // API ключ берется из .env
  const manuallyStoppedRef = useRef(false);

  // Инициализация Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';

      let interimBuffer = '';

      recognition.onstart = () => {
        setSpeechState(prev => ({ 
          ...prev, 
          isListening: true,
          error: null 
        }));
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        interimBuffer = interimTranscript;

        setSpeechState(prev => ({
          ...prev,
          transcript: finalTranscript || interimTranscript,
          error: null
        }));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'network') {
          if (!manuallyStoppedRef.current) {
            recognition.stop(); 
          }
          return;
        }
        
        let errorMessage = 'Unknown error';
        
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during speech recognition';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found or microphone not accessible';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setSpeechState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage
        }));
      };

      recognition.onend = () => {
        if (interimBuffer) {
          setSpeechState((prev) => ({
            ...prev,
            transcript: (prev.transcript + ' ' + interimBuffer).trim(),
          }));
          interimBuffer = '';
        }

        setSpeechState((prev) => ({
          ...prev,
          isListening: false,
        }));

        if (!manuallyStoppedRef.current && speechState.isSupported) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.warn('Failed to restart recognition:', e);
            }
          }, 250);
        }
      };

      setSpeechState(prev => ({ ...prev, isSupported: true }));
    } else {
      console.warn('Web Speech API не поддерживается в этом браузере');
      setSpeechState(prev => ({ 
        ...prev, 
        isSupported: false,
        error: 'Web Speech API is not supported in your browser'
      }));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Load data from Supabase or localStorage on mount
  useEffect(() => {
    const loadSessions = async () => {
      if (userId) {
        // Load from Supabase
        setIsSyncing(true);
        try {
          const { sessions, error } = await ChatService.getUserSessions(userId);
          
          if (!error && sessions) {
            setChatSessions(sessions);
            
            if (sessions.length > 0) {
              const mostRecent = sessions[0]; // Already sorted by updated_at
              setCurrentSessionId(mostRecent.id);
            }
            // Don't create session automatically - let the UI handle it
          } else {
            console.error('Error loading sessions:', error);
            // Fallback to empty array on error
            setChatSessions([]);
          }
        } catch (err) {
          console.error('Exception loading sessions:', err);
          setChatSessions([]);
        } finally {
          setIsSyncing(false);
        }
      } else {
        // Fallback to localStorage
        const savedSessions = StorageService.getChatSessions();
        const savedCurrentSession = StorageService.getCurrentSession();

        setChatSessions(savedSessions);

        if (savedCurrentSession && savedSessions.find(s => s.id === savedCurrentSession)) {
          setCurrentSessionId(savedCurrentSession);
        } else if (savedSessions.length > 0) {
          const mostRecent = savedSessions.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          setCurrentSessionId(mostRecent.id);
        }
        // Don't create session automatically - let the UI handle it
      }
    };
    
    loadSessions();
  }, [userId]);

  // Подгрузка сообщений текущей сессии (список приходит без messages для снижения egress)
  useEffect(() => {
    if (!userId || !currentSessionId) return;
    const session = chatSessions.find(s => s.id === currentSessionId);
    if (!session || session.messages.length > 0) return;
    ChatService.getSession(currentSessionId).then(({ session: full, error }) => {
      if (error || !full) return;
      setChatSessions(prev => prev.map(s => s.id === currentSessionId ? full : s));
    });
  }, [userId, currentSessionId, chatSessions]);

  // Save sessions to Supabase or localStorage
  const saveSession = useCallback(async (session: ChatSession) => {
    if (userId) {
      // Save to Supabase
      try {
        const { error } = await ChatService.updateSession(session);
        if (error) {
          console.error('Error saving session:', error);
        }
      } catch (err) {
        console.error('Exception saving session:', err);
      }
    } else {
      // Fallback to localStorage - update state and save
      setChatSessions(prev => {
        const updated = prev.map(s => s.id === session.id ? session : s);
        // Save to localStorage without triggering re-render
        try {
          StorageService.saveChatSessions(updated);
        } catch (err) {
          console.error('Error saving to localStorage:', err);
        }
        return updated;
      });
    }
  }, [userId]);

  // Save selected model when it changes
  useEffect(() => {
    StorageService.saveSelectedModel(selectedModel);
  }, [selectedModel]);

  const startListening = useCallback(async () => {
    if (!speechState.isSupported) {
      setSpeechState(prev => ({
        ...prev,
        error: 'Speech recognition is not supported in your browser'
      }));
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setSpeechState(prev => ({ 
        ...prev, 
        transcript: '',
        error: null 
      }));
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setSpeechState(prev => ({
          ...prev,
          error: 'Failed to start speech recognition'
        }));
      }
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setSpeechState(prev => ({
        ...prev,
        error: 'Microphone access denied. Please allow microphone access in your browser settings.'
      }));
    }
  }, [speechState.isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && speechState.isSupported) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }, [speechState.isSupported]);

  const clearSpeechError = useCallback(() => {
    setSpeechState(prev => ({ 
      ...prev, 
      error: null 
    }));
  }, []);

  const createNewSession = useCallback(async () => {
    // Prevent creating multiple sessions at once
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'Новый чат',
      messages: [],
      selectedModel,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId
    };

    if (userId) {
      // Create in Supabase
      try {
        const { session, error } = await ChatService.createSession(userId, newSession.title, selectedModel);
        if (session && !error) {
          setChatSessions(prev => {
            // Check if session already exists (prevent duplicates)
            if (prev.some(s => s.id === session.id)) {
              return prev;
            }
            return [session, ...prev];
          });
          setCurrentSessionId(session.id);
          return session.id;
        } else {
          console.error('Error creating session:', error);
          // Fallback to local on error
          setChatSessions(prev => {
            if (prev.some(s => s.id === newSession.id)) {
              return prev;
            }
            return [newSession, ...prev];
          });
          setCurrentSessionId(newSession.id);
          return newSession.id;
        }
      } catch (err) {
        console.error('Exception creating session:', err);
        // Fallback to local on exception
        setChatSessions(prev => {
          if (prev.some(s => s.id === newSession.id)) {
            return prev;
          }
          return [newSession, ...prev];
        });
        setCurrentSessionId(newSession.id);
        return newSession.id;
      }
    }
    
    // Fallback to local
    setChatSessions(prev => {
      // Check if session already exists (prevent duplicates)
      if (prev.some(s => s.id === newSession.id)) {
        return prev;
      }
      return [newSession, ...prev];
    });
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, [selectedModel, userId]);

  const getCurrentSession = useCallback(() => {
    return chatSessions.find(session => session.id === currentSessionId);
  }, [chatSessions, currentSessionId]);

  const sendMessage = useCallback(async (
    content: string,
    images?: ImageAttachment[],
    files?: FileAttachment[],
    video?: VideoAttachment[],
    audio?: AudioAttachment[]
  ) => {
    const isError = content.includes('Ошибка распознавания:') || 
                   content.includes('Speech recognition error:') ||
                   content.includes('Microphone access denied');
    
    if (isError) {
      console.warn('Attempted to send error message, skipping');
      return;
    }

    let sessionId = currentSessionId;
    
    if (!sessionId) {
      sessionId = await createNewSession();
    }
  
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      model: selectedModel,
      images: images && images.length > 0 ? images : undefined,
      files: files && files.length > 0 ? files : undefined,
      video: video && video.length > 0 ? video : undefined,
      audio: audio && audio.length > 0 ? audio : undefined
    };
  
    // Get current session messages before updating
    let currentMessages: Message[] = [];
    setChatSessions(prev => {
      const currentSession = prev.find(s => s.id === sessionId);
      if (currentSession) {
        currentMessages = currentSession.messages;
      }
      
      return prev.map(session => {
        if (session.id === sessionId) {
          const updatedMessages = [...session.messages, userMessage];
          const isFirstMessage = session.messages.filter(m => m.role === 'user').length === 0;
          
          const updatedSession = {
            ...session,
            messages: updatedMessages,
            title: isFirstMessage 
              ? (content.length > 50 ? content.substring(0, 50) + '...' : content) 
              : session.title,
            selectedModel,
            updatedAt: new Date()
          };

          // Save to database asynchronously (don't wait)
          saveSession(updatedSession).catch(err => console.error('Error saving session:', err));
          
          return updatedSession;
        }
        return session;
      });
    });
  
    setIsLoading(true);
  
    try {
      // Use the messages we captured, plus the new user message
      const messagesForAPI = [...currentMessages, userMessage];
      
      const systemMessage: Message = {
        id: 'system',
        role: 'system',
        content: 'You are a helpful AI assistant, answer only russian',
        timestamp: new Date()
      };
  
      const response = await aiService.sendMessage([systemMessage, ...messagesForAPI], selectedModel);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model: selectedModel
      };
  
      setChatSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          const updatedSession = {
            ...session,
            messages: [...session.messages, assistantMessage],
            updatedAt: new Date()
          };

          // Save to database asynchronously (don't wait)
          saveSession(updatedSession).catch(err => console.error('Error saving session:', err));
          
          return updatedSession;
        }
        return session;
      }));
  
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Извините, произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        timestamp: new Date(),
        model: selectedModel
      };
  
      setChatSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          const updatedSession = { 
            ...session, 
            messages: [...session.messages, errorMessage],
            updatedAt: new Date()
          };

          saveSession(updatedSession).catch(err => console.error('Error saving session:', err));
          
          return updatedSession;
        }
        return session;
      }));
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, selectedModel, aiService, createNewSession, saveSession]);

  const clearCurrentChat = useCallback(async () => {
    if (currentSessionId) {
      setChatSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          const updatedSession = { 
            ...session, 
            messages: [], 
            title: 'Новый чат', 
            updatedAt: new Date() 
          };
          
          saveSession(updatedSession);
          
          return updatedSession;
        }
        return session;
      }));
    }
  }, [currentSessionId, userId]);

  const deleteSession = useCallback(async (sessionId: string) => {
    if (userId) {
      // Delete from Supabase
      const { error } = await ChatService.deleteSession(sessionId);
      if (error) {
        console.error('Error deleting session:', error);
        return;
      }
    }
    
    setChatSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      
      if (sessionId === currentSessionId) {
        if (filtered.length > 0) {
          const mostRecent = filtered.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          setCurrentSessionId(mostRecent.id);
        } else {
          setCurrentSessionId(null);
        }
      }
      
      return filtered;
    });
  }, [currentSessionId, userId]);

  const switchToSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const changeModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    
    if (currentSessionId) {
      setChatSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          const updatedSession = { 
            ...session, 
            selectedModel: modelId, 
            updatedAt: new Date() 
          };
          
          saveSession(updatedSession);
          
          return updatedSession;
        }
        return session;
      }));
    }
  }, [currentSessionId, userId]);

  const sendVoiceMessage = useCallback(() => {
    if (speechState.transcript.trim() && !speechState.error) {
      sendMessage(speechState.transcript);
      setSpeechState(prev => ({ 
        ...prev, 
        transcript: '' 
      }));
    }
  }, [speechState.transcript, speechState.error, sendMessage]);

  const setSpeechTranscript = useCallback((transcript: string) => {
    setSpeechState(prev => ({ 
      ...prev, 
      transcript,
      error: null 
    }));
  }, []);

  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

  return {
    messages,
    isLoading,
    isSyncing,
    selectedModel,
    chatSessions,
    currentSessionId,
    sendMessage,
    clearCurrentChat,
    changeModel,
    createNewSession,
    deleteSession,
    switchToSession,
    // Голосовой ввод
    speechState,
    startListening,
    stopListening,
    sendVoiceMessage,
    setSpeechTranscript,
    clearSpeechError
  };
};
