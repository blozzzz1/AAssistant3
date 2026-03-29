import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Brain,
  MessageSquare,
  Palette,
  Library,
  Ellipsis,
  Wrench,
  Sun,
  Moon,
  LogIn,
  Settings,
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AdminService } from '../services/adminService';

const tabs = [
  { to: '/', icon: Sparkles, label: 'Главная', end: true },
  { to: '/models', icon: Brain, label: 'Модели' },
  { to: '/chat', icon: MessageSquare, label: 'Чаты' },
  { to: '/creative-lab', icon: Palette, label: 'Lab' },
  { to: '/library', icon: Library, label: 'Медиа' },
] as const;

export const MobileTabBar: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const check = async () => {
      if (user) setIsAdmin(await AdminService.isAdmin());
      else setIsAdmin(false);
    };
    check();
  }, [user]);

  const moreRoutesActive =
    location.pathname.startsWith('/tools') ||
    location.pathname.startsWith('/account') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/pricing') ||
    location.pathname.startsWith('/payment');

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] flex items-stretch justify-around gap-0.5 border-t border-white/10 bg-[#0d0d0f]/95 px-1 pt-1 backdrop-blur-md pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_24px_rgba(0,0,0,0.35)]"
        aria-label="Основная навигация"
      >
        {tabs.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 px-0.5 transition-colors ${
                isActive ? 'text-primary-400' : 'text-gray-500 active:bg-white/5'
              }`
            }
          >
            <Icon className="h-6 w-6 flex-shrink-0" strokeWidth={1.75} />
            <span className="max-w-full truncate text-center text-[10px] font-medium leading-tight">
              {label}
            </span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 px-0.5 transition-colors active:bg-white/5 ${
            moreRoutesActive ? 'text-primary-400' : 'text-gray-500'
          }`}
        >
          <Ellipsis className="h-6 w-6 flex-shrink-0" strokeWidth={1.75} />
          <span className="text-[10px] font-medium leading-tight">Ещё</span>
        </button>
      </nav>

      {moreOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[70] bg-black/55"
            aria-hidden
            onClick={() => setMoreOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[80] max-h-[85vh] overflow-y-auto rounded-t-2xl border border-white/10 border-b-0 bg-[#141418] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold text-white">Ещё</span>
              <button
                type="button"
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Закрыть"
                onClick={() => setMoreOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-1 p-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <Link
                to="/tools"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-200 hover:bg-white/5"
              >
                <Wrench className="h-5 w-5 text-primary-400" />
                <span>Инструменты</span>
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-200 hover:bg-white/5"
              >
                <Sparkles className="h-5 w-5 text-primary-400" />
                <span>Тарифы</span>
              </Link>
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-200 hover:bg-white/5"
                  >
                    <Settings className="h-5 w-5 text-primary-400" />
                    <span>Аккаунт</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-purple-300 hover:bg-purple-500/10"
                    >
                      <Shield className="h-5 w-5" />
                      <span>Админ</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-200 hover:bg-white/5"
                >
                  <LogIn className="h-5 w-5 text-primary-400" />
                  <span>Войти</span>
                </Link>
              )}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-gray-200 hover:bg-white/5"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-300" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-300" />
                )}
                <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Выйти</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
