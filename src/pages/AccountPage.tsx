import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Calendar, LogOut, Trash2, AlertCircle, Image, Video, Crown, CreditCard, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import { GenerationsHistory } from '../components/GenerationsHistory';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';
import { getTransactions, cancelSubscription, type Transaction } from '../services/paymentService';

type TabType = 'account' | 'generations' | 'payments';

export const AccountPage: React.FC = () => {
  const { user, signOut, deleteAccount } = useAuth();
  const { isPremium, refreshPlan } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setActiveTab('payments');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.paymentSuccess, location.pathname, navigate]);

  useEffect(() => {
    if (activeTab === 'payments') {
      setTransactionsLoading(true);
      getTransactions().then(({ transactions: list }) => {
        setTransactions(list);
        setTransactionsLoading(false);
      });
    }
  }, [activeTab]);

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelError(null);
    const { error } = await cancelSubscription();
    setCancelLoading(false);
    if (error) {
      setCancelError(error);
      return;
    }
    setShowCancelConfirm(false);
    await refreshPlan();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const { error } = await deleteAccount();
      
      if (error) {
        setDeleteError(error);
      } else {
        // Successfully deleted, redirect to register
        navigate('/register');
      }
    } catch (err) {
      setDeleteError('Произошла ошибка при удалении аккаунта');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative min-h-screen bg-background-darker">
      <PulsingOrbsBackground />
      <div className="relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Настройки аккаунта</h1>
          <p className="text-gray-400">Управление вашим профилем и настройками</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-primary-900/30">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'account'
                ? 'text-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Информация об аккаунте
            </span>
            {activeTab === 'account' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('generations')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'generations'
                ? 'text-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              История генераций
            </span>
            {activeTab === 'generations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'payments'
                ? 'text-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Платежи
            </span>
            {activeTab === 'payments' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'account' ? (
          <>

        {/* Account Information */}
        <div className="bg-background-card border border-primary-900/30 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-primary-400" />
            Информация об аккаунте
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-4 p-4 bg-background-darker rounded-lg">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Email адрес</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start gap-4 p-4 bg-background-darker rounded-lg">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Дата регистрации</p>
                <p className="text-white font-medium">{formatDate(user?.createdAt)}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-4 p-4 bg-background-darker rounded-lg">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">ID пользователя</p>
                <p className="text-white font-mono text-sm break-all">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* План и оплата — клик ведёт на страницу тарифов */}
        <div className="bg-background-card border border-primary-900/30 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary-400" />
            План и оплата
          </h2>
          <div className="space-y-4">
            <Link
              to="/pricing"
              className="flex items-center justify-between gap-4 p-4 bg-background-darker rounded-lg hover:bg-white/[0.06] transition-colors border border-transparent hover:border-primary-500/30"
            >
              <div>
                <p className="text-sm text-gray-400 mb-1">Текущий план</p>
                <p className="text-white font-medium">
                  {isPremium ? 'Премиум' : 'Бесплатный'}
                </p>
                {!isPremium && (
                  <p className="text-sm text-gray-500 mt-1">
                    5 видео и 20 изображений в день · Базовые текстовые модели
                  </p>
                )}
              </div>
              {isPremium ? (
                <span className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium">
                  Всё открыто
                </span>
              ) : (
                <span className="text-sm text-primary-400">Тарифы →</span>
              )}
            </Link>
            {isPremium && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-2">Подписку можно отменить в любой момент.</p>
                {!showCancelConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-colors"
                  >
                    Отменить подписку
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-400">Перейти на бесплатный план?</span>
                    <button
                      type="button"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelLoading ? 'Отмена...' : 'Да, отменить'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCancelConfirm(false); setCancelError(null); }}
                      disabled={cancelLoading}
                      className="px-4 py-2 bg-background-hover text-white rounded-lg"
                    >
                      Нет
                    </button>
                  </div>
                )}
                {cancelError && (
                  <p className="text-sm text-red-400 mt-2">{cancelError}</p>
                )}
              </div>
            )}
            {!isPremium && (
              <p className="text-xs text-gray-500">
                Нажмите на блок выше, чтобы перейти к тарифам и подключить Премиум.
              </p>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-background-card border border-red-900/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            Опасная зона
          </h2>

          <div className="space-y-4">
            {/* Logout */}
            <div className="p-4 bg-background-darker rounded-lg">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-white font-medium mb-1">Выход из системы</h3>
                  <p className="text-sm text-gray-400">
                    Выйти из текущей сессии
                  </p>
                </div>
              </div>
              {!showLogoutConfirm ? (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Подтвердить выход
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-4 py-2 bg-background-hover text-white rounded-lg hover:bg-background-card transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>

            {/* Delete Account */}
            <div className="p-4 bg-background-darker rounded-lg">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-white font-medium mb-1">Удалить аккаунт</h3>
                  <p className="text-sm text-gray-400">
                    Безвозвратно удалить аккаунт и все данные
                  </p>
                </div>
              </div>
              
              {deleteError && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить аккаунт
                </button>
              ) : (
                <div className="mt-3">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-3">
                    <p className="text-red-200 text-sm mb-2">
                      ⚠️ <strong>Внимание!</strong> Это действие необратимо.
                    </p>
                    <p className="text-red-200 text-sm">
                      Будут удалены:
                    </p>
                    <ul className="text-red-200 text-sm list-disc list-inside mt-2">
                      <li>Все ваши чаты и сообщения</li>
                      <li>История генераций изображений и видео</li>
                      <li>Данные аккаунта</li>
                      <li>История активности</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {deleteLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Удаление...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Да, удалить навсегда
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteError(null);
                      }}
                      disabled={deleteLoading}
                      className="px-4 py-2 bg-background-hover text-white rounded-lg hover:bg-background-card transition-colors disabled:opacity-50"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        ) : activeTab === 'payments' ? (
          <div className="bg-background-card border border-primary-900/30 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">История транзакций</h2>
            {transactionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-gray-400">Платежей пока нет.</p>
            ) : (
              <ul className="space-y-3">
                {transactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-4 p-4 bg-background-darker rounded-lg border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      {t.payment_method === 'sbp' ? (
                        <Smartphone className="w-5 h-5 text-primary-400" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-primary-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {t.payment_method === 'sbp' ? 'СБП' : 'Карта'} · {t.plan === 'premium' ? 'Премиум' : t.plan}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(t.created_at).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{(t.amount_cents / 100).toFixed(0)} ₽</p>
                      <p className="text-xs text-gray-500 capitalize">{t.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <GenerationsHistory />
        )}
      </div>
      </div>
    </div>
  );
};

