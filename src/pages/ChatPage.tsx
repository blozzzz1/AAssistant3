import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChatInterface } from '../components/ChatInterface';
import { ChatSidebar } from '../components/ChatSidebar';
import { ModelSelector } from '../components/ModelSelector';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import { AI_MODELS, getModelProviderName } from '../constants/models';
import { usePlanConfig } from '../hooks/usePlanConfig';
import { ChatPageSkeleton } from '../components/ChatPageSkeleton';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isPremium } = usePlan();
  const { freeChatModelIds, loading: planConfigLoading } = usePlanConfig();
  const freeIds = planConfigLoading ? [] : freeChatModelIds;
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const processedParamsRef = useRef<string | null>(null);
  const pendingCreationRef = useRef(false);

  const {
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
    speechState,
    startListening,
    stopListening,
    sendVoiceMessage,
    setSpeechTranscript,
    clearSpeechError
  } = useChat(user?.id);

  const selectedModelInfo = AI_MODELS.find(model => model.id === selectedModel);
  const selectedModelProvider = selectedModelInfo ? getModelProviderName(selectedModelInfo) : '';

  // Для бесплатного плана переключить на доступную модель, если текущая — премиум (только после загрузки конфига)
  useEffect(() => {
    if (planConfigLoading || isPremium || !selectedModel || freeIds.length === 0) return;
    if (!freeIds.includes(selectedModel)) {
      changeModel(freeIds[0]);
    }
  }, [planConfigLoading, isPremium, selectedModel, freeIds, changeModel]);

  // Handle URL params for creating new chat with specific model
  useEffect(() => {
    // Only process when not syncing and not already processing
    if (pendingCreationRef.current || isSyncing) {
      return;
    }
    
    const modelId = searchParams.get('model');
    const shouldCreateNew = searchParams.get('new') === 'true';
    
    if (modelId && shouldCreateNew) {
      // Check if we already processed this exact request
      const currentRequest = `${modelId}-new`;
      if (processedParamsRef.current === currentRequest) {
        return; // Already processed
      }
      
      // Mark this request as processed
      processedParamsRef.current = currentRequest;
      pendingCreationRef.current = true;
      
      // Clear URL params immediately to prevent re-processing
      setSearchParams({}, { replace: true });
      
      // Change model first
      changeModel(modelId);
      
      // Create session after sessions are loaded
      const timeoutId = setTimeout(async () => {
        try {
          // Always create a new session when coming from model catalog
          await createNewSession();
        } catch (error) {
          console.error('Error creating session:', error);
        } finally {
          pendingCreationRef.current = false;
        }
      }, 300);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [searchParams, isSyncing, changeModel, createNewSession, setSearchParams]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleModelSelect = (modelId: string) => {
    if (!isPremium && !freeIds.includes(modelId)) {
      setShowModelSelector(false);
      navigate('/pricing');
      return;
    }
    changeModel(modelId);
    setShowModelSelector(false);
  };

  const handleChangeModel = () => {
    setShowModelSelector(true);
  };

  const handleNewSession = () => {
    createNewSession();
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!showModelSelector && isSyncing && chatSessions.length === 0) {
    return <ChatPageSkeleton />;
  }

  if (showModelSelector) {
    return (
      <div className="min-h-screen bg-background-darker p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowModelSelector(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Назад к чату
            </button>
            
          </div>
          <ModelSelector
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-background-darker flex">
      <PulsingOrbsBackground />
      <div className="relative z-10 flex flex-1 min-w-0">
        <ChatSidebar
          sessions={chatSessions}
          currentSessionId={currentSessionId}
          onSessionSelect={switchToSession}
          onNewSession={handleNewSession}
          onDeleteSession={deleteSession}
          onChangeModel={handleChangeModel}
          selectedModelName={selectedModelInfo?.name || 'Неизвестная модель'}
          selectedModelProvider={selectedModelProvider}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isSyncing={isSyncing}
        />
        <div className="flex-1 flex flex-col">
        <ChatInterface
          messages={messages}
          onSendMessage={sendMessage}
          onClearChat={clearCurrentChat}
          isLoading={isLoading}
          selectedModelName={selectedModelInfo?.name || 'Неизвестная модель'}
          selectedModelProvider={selectedModelProvider}
          selectedModelSupportsImages={selectedModelInfo?.supportsImages || false}
          selectedModelSupportsFiles={selectedModelInfo?.supportsPDF || false}
          selectedModelSupportsVideo={selectedModelInfo?.supportsVideo || false}
          selectedModelSupportsAudio={selectedModelInfo?.supportsAudio || false}
          speechState={speechState}
          onStartListening={startListening}
          onStopListening={stopListening}
          onSendVoiceMessage={sendVoiceMessage}
          onSetSpeechTranscript={setSpeechTranscript}
          onClearSpeechError={clearSpeechError}
        />
        </div>
      </div>
    </div>
  );
};

