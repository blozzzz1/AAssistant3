import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Sparkles,
  MessageSquare,
  User,
  LogOut,
  LogIn,
  Settings,
  Brain,
  Wrench,
  Sun,
  Moon,
  Shield,
  Palette,
  Library,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AdminService } from '../services/adminService';

const navItems = [
  { to: '/', icon: Sparkles, label: 'Главная' },
  { to: '/models', icon: Brain, label: 'Модели' },
  { to: '/chat', icon: MessageSquare, label: 'Чаты' },
  { to: '/creative-lab', icon: Palette, label: 'Creative Lab' },
  { to: '/library', icon: Library, label: 'Библиотека' },
  { to: '/tools', icon: Wrench, label: 'Инструменты' },
];

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <aside className="sticky top-0 left-0 z-10 w-64 h-screen flex-shrink-0 flex flex-col bg-[#0d0d0f] border-r border-white/10 overflow-y-auto">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-3 px-5 py-4 border-b border-white/10 hover:bg-white/[0.03] transition-colors"
      >
        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-400" />
        </div>
        <span className="text-lg font-bold text-white">AI Assistant</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: theme, account, login */}
      <div className="p-3 border-t border-white/10 space-y-0.5">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-400" />
              </div>
              <span className="text-sm truncate flex-1 text-left">{user.email}</span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute left-3 right-3 bottom-full mb-1 py-2 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                  <Link
                    to="/account"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/[0.05]"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Аккаунт</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Админ</span>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Выйти</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span>Войти</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
