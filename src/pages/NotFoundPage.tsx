import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, Sparkles, AlertTriangle, Video, MessageSquare } from 'lucide-react';
import { Header } from '../components/Header';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background-darker">
      <PulsingOrbsBackground />
      <Header />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* 404 Number with gradient */}
            <div className="mb-8">
              <h1 className="text-9xl sm:text-[12rem] font-extrabold text-primary-500/80 animate-pulse">
                404
              </h1>
            </div>

            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="relative w-32 h-32 bg-primary-500/20 rounded-full flex items-center justify-center border border-white/10">
                  <AlertTriangle className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Страница не найдена
            </h2>
            
            {/* Description */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              К сожалению, страница, которую вы ищете, не существует или была перемещена.
              <br />
              Возможно, вы ввели неправильный адрес или страница была удалена.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all text-lg"
              >
                <Home className="w-5 h-5" />
                На главную
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-background-card border border-primary-900/30 text-white rounded-xl font-semibold hover:bg-background-hover hover:border-primary-600 transition-all text-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-background-card border border-primary-900/30 rounded-xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-primary-400" />
                <h3 className="text-xl font-bold text-white">Популярные разделы</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/models')}
                  className="p-4 bg-background-dark border border-primary-900/30 rounded-lg hover:border-primary-600 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                      Модели
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Выберите AI модель</p>
                </button>

                <button
                  onClick={() => navigate('/chat')}
                  className="p-4 bg-background-dark border border-primary-900/30 rounded-lg hover:border-primary-600 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                      Чаты
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Ваши чаты</p>
                </button>

                <button
                  onClick={() => navigate('/creative-lab')}
                  className="p-4 bg-background-dark border border-primary-900/30 rounded-lg hover:border-primary-600 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                      Creative Lab
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Изображения и видео</p>
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="mt-16 flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};

