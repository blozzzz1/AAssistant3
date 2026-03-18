import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, MessageSquare, User, LogOut, LogIn, Settings, Palette, Brain, Wrench, Sun, Moon, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AdminService } from '../services/adminService';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await AdminService.isAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  return (
    <header className="bg-background-dark border-b border-primary-900/30 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">AI Assistant</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 flex-1 justify-center">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive('/')
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-background-hover'
              }`}
            >
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Главная</span>
            </Link>

            <Link
              to="/models"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive('/models')
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-background-hover'
              }`}
            >
              <Brain className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Модели</span>
            </Link>

            <Link
              to="/chat"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive('/chat')
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-background-hover'
              }`}
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Чаты</span>
            </Link>

            <Link
              to="/creative-lab"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive('/creative-lab')
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-background-hover'
              }`}
            >
              <Palette className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Creative Lab</span>
            </Link>

            <Link
              to="/tools"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive('/tools')
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-background-hover'
              }`}
            >
              <Wrench className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Инструменты</span>
            </Link>

            <Link
              to="/account"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive('/account')
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-background-hover'
              }`}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Аккаунт</span>
            </Link>
          </nav>

          {/* Theme Toggle & User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-background-card border border-primary-900/30 hover:border-primary-600 transition-all text-gray-300 hover:text-white"
              title={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Menu or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-card border border-primary-900/30 hover:border-primary-600 transition-all"
                >
                  <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-300 hidden lg:block max-w-[200px] truncate">
                    {user?.email}
                  </span>
                </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-background-card border border-primary-900/30 rounded-lg shadow-2xl z-20 overflow-hidden">
                  <div className="p-4 border-b border-primary-900/30">
                    <p className="text-sm text-gray-400">Вы вошли как</p>
                    <p className="text-white font-medium truncate">{user?.email}</p>
                  </div>

                  <div className="p-2">
                    <Link
                      to="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-background-hover rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Настройки аккаунта</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                      >
                        <Shield className="w-5 h-5" />
                        <span>Админ-панель</span>
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Выйти</span>
                    </button>
                  </div>
                </div>
              </>
            )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Войти</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

