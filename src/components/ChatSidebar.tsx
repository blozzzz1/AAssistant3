import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatSession } from '../types';
import { ModelLogo } from './ModelLogo';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onChangeModel: () => void;
  selectedModelName: string;
  selectedModelProvider?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isSyncing?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onChangeModel,
  selectedModelName,
  selectedModelProvider,
  isCollapsed,
  onToggleCollapse,
  isSyncing = false
}) => {
  const sortedSessions = sessions.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-80'} bg-background-dark border-r border-primary-900/30 flex flex-col transition-all duration-300`}>
      {/* Header with Title and Collapse Button */}
      <div className="h-[87px] px-4 py-5 border-b border-primary-900/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link 
              to="/" 
              className="text-lg font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
              title="На главную"
            >
              AI Assistant
            </Link>
          )}
          <button
            onClick={onToggleCollapse}
            className={`p-3 text-gray-400 hover:text-primary-400 hover:bg-background-hover border border-transparent rounded-lg transition-colors ${isCollapsed ? 'w-full flex items-center justify-center' : 'ml-auto'}`}
            title={isCollapsed ? 'Развернуть' : 'Свернуть'}
          >
            {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Model Info */}
      <div className="p-4 border-b border-primary-900/30">
        <button
          onClick={onChangeModel}
          className={`w-full flex items-center gap-3 p-3 bg-background-card border border-primary-900/30 hover:bg-background-hover hover:border-primary-800/50 text-white rounded-lg transition-all ${isCollapsed ? 'justify-center' : 'text-left'}`}
          title={isCollapsed ? selectedModelName : undefined}
        >
          {isCollapsed ? (
            selectedModelProvider ? (
              <ModelLogo providerName={selectedModelProvider} size="sm" />
            ) : (
              <Settings className="w-5 h-5 text-primary-400 flex-shrink-0" />
            )
          ) : (
            <>
              {selectedModelProvider ? (
                <ModelLogo providerName={selectedModelProvider} size="md" />
              ) : (
                <Settings className="w-5 h-5 text-primary-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">Текущая модель</div>
                <div className="text-xs text-gray-400 truncate">{selectedModelName}</div>
              </div>
            </>
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-primary-900/30">
        <button
          onClick={onNewSession}
          className={`w-full flex items-center gap-3 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Новый чат' : undefined}
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Новый чат</span>}
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!isCollapsed && <h3 className="text-sm font-medium text-gray-400 mb-3">Недавние чаты</h3>}
        
        {isSyncing ? (
          !isCollapsed && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Загрузка чатов...</p>
            </div>
          )
        ) : sortedSessions.length === 0 ? (
          !isCollapsed && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Нет чатов</p>
            </div>
          )
        ) : (
          sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                currentSessionId === session.id
                  ? 'bg-primary-600/20 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                  : 'hover:bg-background-hover border border-transparent'
              } ${isCollapsed ? 'flex justify-center' : ''}`}
              onClick={() => onSessionSelect(session.id)}
              title={isCollapsed ? session.title : undefined}
            >
              {isCollapsed ? (
                <MessageSquare className="w-5 h-5 text-gray-400" />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate mb-1">
                      {session.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{session.messages.length} сообщений</span>
                      <span>•</span>
                      <span>{session.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all"
                    title="Удалить сессию"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};