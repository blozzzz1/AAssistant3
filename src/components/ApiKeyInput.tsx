import React, { useState } from 'react';
import { Key, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  onLogout?: () => void;
  showLogout?: boolean;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit, onLogout, showLogout }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background-darker flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Code Assistant</h1>
          <p className="text-gray-400">Введите ваш API ключ Intelligence.io для начала работы</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
              API ключ
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите ваш Intelligence.io API ключ"
                className="w-full px-4 py-3 bg-background-card text-white rounded-lg border border-primary-900/30 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Запустить ассистента
          </button>
        </form>

        {showLogout && onLogout && (
          <div className="mt-4">
            <button
              onClick={onLogout}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Использовать другой API ключ
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-background-card border border-primary-900/30 rounded-lg">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-white mb-1">Нужен API ключ?</h3>
              <p className="text-sm text-gray-400 mb-2">
                Получите бесплатный API ключ от Intelligence.io Solutions для доступа к мощным AI моделям для решения ваших задач.
              </p>
              <a
                href="https://intelligence.io.solutions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
              >
                Получить API ключ →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};