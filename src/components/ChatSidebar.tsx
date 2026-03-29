import React, { useState, useEffect } from 'react';
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
  mobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
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
  isSyncing = false,
  mobileDrawerOpen = false,
  onCloseMobileDrawer
}) => {
  const sortedSessions = sessions.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const [isLgUp, setIsLgUp] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setIsLgUp(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const narrowChrome = isCollapsed && isLgUp;
  const closeMobile = () => onCloseMobileDrawer?.();

  const handleToggleCollapse = () => {
    if (!isLgUp) {
      closeMobile();
      return;
    }
    onToggleCollapse();
  };

  const widthDesktop = narrowChrome ? 'lg:w-20' : 'lg:w-80';

  return (
    <div
      className={`${widthDesktop} max-lg:!w-[min(20rem,calc(100vw-1rem))] flex flex-col border-r border-primary-900/30 bg-background-dark transition-transform duration-300 ease-out max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:z-[50] max-lg:h-full max-lg:min-h-screen max-lg:shadow-2xl lg:translate-x-0 ${
        mobileDrawerOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'
      }`}
    >
      <div className="h-[87px] border-b border-primary-900/30 px-4 py-5">
        <div className="flex items-center justify-between">
          {!narrowChrome && (
            <Link
              to="/"
              onClick={closeMobile}
              className="cursor-pointer text-lg font-bold text-white transition-opacity hover:opacity-80"
              title="На главную"
            >
              Чаты
            </Link>
          )}
          <button
            onClick={handleToggleCollapse}
            className={`rounded-lg border border-transparent p-3 text-gray-400 transition-colors hover:bg-background-hover hover:text-primary-400 ${narrowChrome ? 'flex w-full items-center justify-center max-lg:w-auto' : 'ml-auto'}`}
            title={!isLgUp ? 'Закрыть' : narrowChrome ? 'Развернуть' : 'Свернуть'}
          >
            {narrowChrome ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="border-b border-primary-900/30 p-4">
        <button
          onClick={() => {
            onChangeModel();
            closeMobile();
          }}
          className={`flex w-full items-center gap-3 rounded-lg border border-primary-900/30 bg-background-card p-3 text-white transition-all hover:border-primary-800/50 hover:bg-background-hover ${narrowChrome ? 'justify-center' : 'text-left'}`}
          title={narrowChrome ? selectedModelName : undefined}
        >
          {narrowChrome ? (
            selectedModelProvider ? (
              <ModelLogo providerName={selectedModelProvider} size="sm" />
            ) : (
              <Settings className="h-5 w-5 flex-shrink-0 text-primary-400" />
            )
          ) : (
            <>
              {selectedModelProvider ? (
                <ModelLogo providerName={selectedModelProvider} size="md" />
              ) : (
                <Settings className="h-5 w-5 flex-shrink-0 text-primary-400" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">Текущая модель</div>
                <div className="truncate text-xs text-gray-400">{selectedModelName}</div>
              </div>
            </>
          )}
        </button>
      </div>

      <div className="border-b border-primary-900/30 p-4">
        <button
          onClick={() => {
            onNewSession();
            closeMobile();
          }}
          className={`flex w-full items-center gap-3 rounded-lg bg-primary-500 p-3 text-white transition-all hover:bg-primary-600 ${narrowChrome ? 'justify-center' : ''}`}
          title={narrowChrome ? 'Новый чат' : undefined}
        >
          <Plus className="h-5 w-5 flex-shrink-0" />
          {!narrowChrome && <span>Новый чат</span>}
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {!narrowChrome && <h3 className="mb-3 text-sm font-medium text-gray-400">Недавние чаты</h3>}

        {isSyncing ? (
          !narrowChrome && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              <p className="text-sm text-gray-500">Загрузка чатов...</p>
            </div>
          )
        ) : sortedSessions.length === 0 ? (
          !narrowChrome && (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-600" />
              <p className="text-sm text-gray-500">Нет чатов</p>
            </div>
          )
        ) : (
          sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative cursor-pointer rounded-lg p-3 transition-all ${
                currentSessionId === session.id
                  ? 'border border-primary-500/30 bg-primary-600/20 shadow-lg shadow-primary-500/10'
                  : 'border border-transparent hover:bg-background-hover'
              } ${narrowChrome ? 'flex justify-center' : ''}`}
              onClick={() => {
                onSessionSelect(session.id);
                closeMobile();
              }}
              title={narrowChrome ? session.title : undefined}
            >
              {narrowChrome ? (
                <MessageSquare className="h-5 w-5 text-gray-400" />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 truncate text-sm font-medium text-white">{session.title}</h4>
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
                    className="p-1 text-gray-400 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100 max-lg:opacity-100"
                    title="Удалить сессию"
                  >
                    <Trash2 className="h-4 w-4" />
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
