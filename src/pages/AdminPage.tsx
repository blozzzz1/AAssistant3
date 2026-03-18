import React, { useState, useEffect, useRef } from 'react';
import { Users, Settings, Shield, Activity, Ban, CheckCircle, XCircle, Save, RefreshCw, Plus, Trash2, Image, Video, MessageSquare, Layers } from 'lucide-react';
import { AdminService, UserInfo, SystemSetting, ModelSetting, UserActivity, Admin } from '../services/adminService';
import { AI_MODELS } from '../constants/models';
import { IMAGE_MODELS } from '../constants/imageModels';
import { VIDEO_MODELS } from '../constants/videoModels';
import { AdminContentSkeleton } from '../components/AdminContentSkeleton';
import { invalidatePlanConfigCache } from '../hooks/usePlanConfig';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';

type TabType = 'users' | 'settings' | 'plans' | 'activity' | 'admins';
type ChatModelTier = 'free' | 'premium' | 'disabled';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [modelSettings, setModelSettings] = useState<ModelSetting[]>([]);
  const [activityLogs, setActivityLogs] = useState<UserActivity[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockUntil, setBlockUntil] = useState('');
  const [newAdminUserId, setNewAdminUserId] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');
  const [planConfig, setPlanConfig] = useState<{
    freeChatModelIds: string[];
    freeImageLimit: number;
    freeVideoLimit: number;
  }>({ freeChatModelIds: [], freeImageLimit: 20, freeVideoLimit: 5 });
  const [limitsDraft, setLimitsDraft] = useState({ freeImageLimit: 20, freeVideoLimit: 5 });
  const [savingPlan, setSavingPlan] = useState(false);
  const freeChatModelIdsRef = useRef<string[]>([]);
  const hasOptimisticFreeIdsRef = useRef(false);
  const planUpdatePromiseRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (!hasOptimisticFreeIdsRef.current) {
      freeChatModelIdsRef.current = planConfig.freeChatModelIds;
    }
  }, [planConfig.freeChatModelIds]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'users':
          const { users: usersData, error: usersError } = await AdminService.getAllUsers(100, 0);
          if (usersError) throw new Error(usersError);
          setUsers(usersData);
          break;
        case 'settings':
          const { settings: settingsData, error: settingsError } = await AdminService.getSystemSettings();
          if (settingsError) throw new Error(settingsError);
          setSettings(settingsData);
          break;
        case 'plans': {
          const [
            { settings: plansModelsData, error: plansModelsError },
            { freeChatModelIds, freeImageLimit, freeVideoLimit, error: planConfigError },
          ] = await Promise.all([
            AdminService.getModelSettings(),
            AdminService.getPlanConfig(),
          ]);
          if (plansModelsError) throw new Error(plansModelsError);
          if (planConfigError) throw new Error(planConfigError);
          setModelSettings(plansModelsData);
          const freeIdsToApply = hasOptimisticFreeIdsRef.current
            ? freeChatModelIdsRef.current
            : freeChatModelIds;
          if (hasOptimisticFreeIdsRef.current) hasOptimisticFreeIdsRef.current = false;
          freeChatModelIdsRef.current = freeIdsToApply;
          setPlanConfig({ freeChatModelIds: freeIdsToApply, freeImageLimit, freeVideoLimit });
          setLimitsDraft({ freeImageLimit, freeVideoLimit });
          break;
        }
        case 'activity':
          const { logs, error: activityError } = await AdminService.getActivityLogs(undefined, 100, 0);
          if (activityError) throw new Error(activityError);
          setActivityLogs(logs);
          break;
        case 'admins':
          const { admins: adminsData, error: adminsError } = await AdminService.getAdmins();
          if (adminsError) throw new Error(adminsError);
          setAdmins(adminsData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!blockReason.trim()) {
      setError('Укажите причину блокировки');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: blockError } = await AdminService.blockUser(
        userId,
        blockReason,
        blockUntil ? new Date(blockUntil) : undefined
      );
      if (blockError) throw new Error(blockError);
      setSuccess('Пользователь заблокирован');
      setSelectedUser(null);
      setBlockReason('');
      setBlockUntil('');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка блокировки пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: unblockError } = await AdminService.unblockUser(userId);
      if (unblockError) throw new Error(unblockError);
      setSuccess('Пользователь разблокирован');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка разблокировки пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await AdminService.updateSystemSetting(key, value);
      if (updateError) throw new Error(updateError);
      setSuccess('Настройка обновлена');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления настройки');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModel = async (modelId: string, isEnabled: boolean, reason?: string) => {
    setError(null);
    // Оптимистичное обновление: кнопка меняется сразу
    setModelSettings((prev) => {
      const existing = prev.find((s) => s.modelId === modelId);
      if (existing) {
        return prev.map((s) => (s.modelId === modelId ? { ...s, isEnabled } : s));
      }
      return [...prev, { id: '', modelId, isEnabled, updatedAt: new Date() } as ModelSetting];
    });
    try {
      const { error: updateError } = await AdminService.updateModelSetting(modelId, isEnabled, reason);
      if (updateError) throw new Error(updateError);
      setSuccess(`Модель ${isEnabled ? 'включена' : 'отключена'}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления модели');
      setModelSettings((prev) => {
        const existing = prev.find((s) => s.modelId === modelId);
        if (existing) {
          return prev.map((s) => (s.modelId === modelId ? { ...s, isEnabled: !isEnabled } : s));
        }
        return prev.filter((s) => s.modelId !== modelId);
      });
    }
  };

  const getChatModelTier = (modelId: string): ChatModelTier => {
    const setting = modelSettings.find((s) => s.modelId === modelId);
    const enabled = setting ? setting.isEnabled : true;
    if (!enabled) return 'disabled';
    return planConfig.freeChatModelIds.includes(modelId) ? 'free' : 'premium';
  };

  const handleSetChatModelTier = (modelId: string, tier: ChatModelTier) => {
    setError(null);
    const prevSettings = modelSettings.find((s) => s.modelId === modelId);
    const prevEnabled = prevSettings ? prevSettings.isEnabled : true;
    const currentFreeIds = freeChatModelIdsRef.current;

    let newFreeIds: string[];
    if (tier === 'disabled') {
      newFreeIds = currentFreeIds.filter((id) => id !== modelId);
      setModelSettings((prev) =>
        prev.some((s) => s.modelId === modelId)
          ? prev.map((s) => (s.modelId === modelId ? { ...s, isEnabled: false } : s))
          : [...prev, { id: '', modelId, isEnabled: false, updatedAt: new Date() } as ModelSetting]
      );
    } else {
      newFreeIds =
        tier === 'free'
          ? [...new Set([...currentFreeIds, modelId])]
          : currentFreeIds.filter((id) => id !== modelId);
      setModelSettings((prev) =>
        prev.some((s) => s.modelId === modelId)
          ? prev.map((s) => (s.modelId === modelId ? { ...s, isEnabled: true } : s))
          : [...prev, { id: '', modelId, isEnabled: true, updatedAt: new Date() } as ModelSetting]
      );
    }
    freeChatModelIdsRef.current = newFreeIds;
    setPlanConfig((c) => ({ ...c, freeChatModelIds: newFreeIds }));
    hasOptimisticFreeIdsRef.current = true;
    setSavingPlan(true);

    const runUpdate = async () => {
      const toSend = [...freeChatModelIdsRef.current];
      try {
        if (tier === 'disabled') {
          const { error: e } = await AdminService.updateModelSetting(modelId, false);
          if (e) throw new Error(e);
          const { error: configErr } = await AdminService.updatePlanConfig({
            freeChatModelIds: toSend,
          });
          if (configErr) throw new Error(configErr);
          setSuccess(`Модель отключена`);
        } else {
          const [modelRes, configRes] = await Promise.all([
            AdminService.updateModelSetting(modelId, true),
            AdminService.updatePlanConfig({ freeChatModelIds: toSend }),
          ]);
          if (modelRes.error) throw new Error(modelRes.error);
          if (configRes.error) throw new Error(configRes.error);
          invalidatePlanConfigCache();
          setSuccess(tier === 'free' ? 'Модель переведена в бесплатные' : 'Модель переведена в премиум');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка сохранения');
        hasOptimisticFreeIdsRef.current = false;
        freeChatModelIdsRef.current = currentFreeIds;
        setPlanConfig((c) => ({ ...c, freeChatModelIds: currentFreeIds }));
        setModelSettings((prev) =>
          prev.some((s) => s.modelId === modelId)
            ? prev.map((s) => (s.modelId === modelId ? { ...s, isEnabled: prevEnabled } : s))
            : prev.filter((s) => s.modelId !== modelId)
        );
      } finally {
        setSavingPlan(false);
      }
    };

    planUpdatePromiseRef.current = planUpdatePromiseRef.current.then(runUpdate);
  };

  const handleSaveLimits = async () => {
    setSavingPlan(true);
    setError(null);
    try {
      const { error: e } = await AdminService.updatePlanConfig({
        freeImageLimit: limitsDraft.freeImageLimit,
        freeVideoLimit: limitsDraft.freeVideoLimit,
      });
      if (e) throw new Error(e);
      invalidatePlanConfigCache();
      setPlanConfig((c) => ({
        ...c,
        freeImageLimit: limitsDraft.freeImageLimit,
        freeVideoLimit: limitsDraft.freeVideoLimit,
      }));
      setSuccess('Лимиты сохранены');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения лимитов');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminUserId.trim()) {
      setError('Укажите ID пользователя');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: addError } = await AdminService.addAdmin(newAdminUserId, newAdminRole);
      if (addError) throw new Error(addError);
      setSuccess('Администратор добавлен');
      setNewAdminUserId('');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления администратора');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить администратора?')) return;

    setLoading(true);
    setError(null);
    try {
      const { error: removeError } = await AdminService.removeAdmin(userId);
      if (removeError) throw new Error(removeError);
      setSuccess('Администратор удален');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления администратора');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="relative min-h-screen bg-background-darker">
      <PulsingOrbsBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Админ-панель</h1>
          <p className="text-gray-400">Управление пользователями, настройками и моделями</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-primary-900/30">
          {[
            { id: 'users' as TabType, label: 'Пользователи', icon: Users },
            { id: 'settings' as TabType, label: 'Настройки', icon: Settings },
            { id: 'plans' as TabType, label: 'Тарифы и модели', icon: Layers },
            { id: 'activity' as TabType, label: 'Активность', icon: Activity },
            { id: 'admins' as TabType, label: 'Администраторы', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-background-card border border-primary-900/30 rounded-xl p-6">
          {loading && (
            <AdminContentSkeleton variant={activeTab === 'settings' || activeTab === 'plans' ? 'cards' : 'table'} />
          )}

          {!loading && activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Пользователи ({users.length})</h2>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-background-hover border border-primary-900/30 rounded-lg text-white hover:bg-background-darker transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-900/30">
                      <th className="text-left p-3 text-gray-400">Email</th>
                      <th className="text-left p-3 text-gray-400">Дата регистрации</th>
                      <th className="text-left p-3 text-gray-400">Последний вход</th>
                      <th className="text-left p-3 text-gray-400">Статус</th>
                      <th className="text-left p-3 text-gray-400">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-primary-900/30 hover:bg-background-hover">
                        <td className="p-3 text-white">{user.email}</td>
                        <td className="p-3 text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="p-3 text-gray-400">
                          {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('ru-RU') : 'Никогда'}
                        </td>
                        <td className="p-3">
                          {user.isBlocked ? (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">Заблокирован</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">Активен</span>
                          )}
                          {user.isAdmin && (
                            <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                              {user.adminRole === 'super_admin' ? 'Супер-админ' : 'Админ'}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {user.isBlocked ? (
                              <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                              >
                                Разблокировать
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                              >
                                Заблокировать
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Системные настройки</h2>
              {settings.map((setting) => (
                <div key={setting.id} className="border border-primary-900/30 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{setting.key}</h3>
                      {setting.description && (
                        <p className="text-gray-400 text-sm mt-1">{setting.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {setting.key === 'registration_enabled' && (
                        <button
                          onClick={() => handleUpdateSetting(setting.key, !setting.value)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            setting.value
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {setting.value ? 'Включена' : 'Отключена'}
                        </button>
                      )}
                      {setting.key === 'maintenance_mode' && (
                        <button
                          onClick={() => handleUpdateSetting(setting.key, !setting.value)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            setting.value
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {setting.value ? 'Включен' : 'Отключен'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && activeTab === 'plans' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-2">Тарифы и модели</h2>
              <p className="text-gray-400 text-sm mb-6">
                Настройте бесплатные и премиум чат-модели, включение изображений и видео, а также дневные лимиты для бесплатного плана.
              </p>

              {/* Лимиты бесплатного плана */}
              <section className="border border-primary-900/30 rounded-xl p-5 bg-background-hover/50">
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary-400" />
                  Лимиты для бесплатного плана
                </h3>
                <p className="text-gray-400 text-sm mb-4">Количество генераций в день (изображения и видео) для пользователей без премиума.</p>
                <div className="flex flex-wrap gap-6 items-end">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Изображений в день</label>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={limitsDraft.freeImageLimit}
                      onChange={(e) => setLimitsDraft((d) => ({ ...d, freeImageLimit: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                      className="w-28 px-3 py-2 bg-background-darker border border-primary-900/30 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Видео в день</label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={limitsDraft.freeVideoLimit}
                      onChange={(e) => setLimitsDraft((d) => ({ ...d, freeVideoLimit: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                      className="w-28 px-3 py-2 bg-background-darker border border-primary-900/30 rounded-lg text-white"
                    />
                  </div>
                  <button
                    onClick={handleSaveLimits}
                    disabled={savingPlan}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Сохранить лимиты
                  </button>
                </div>
              </section>

              {/* Чат-модели: бесплатные / премиум / отключены */}
              <section className="border border-primary-900/30 rounded-xl p-5 bg-background-hover/50">
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-400" />
                  Чат-модели
                </h3>
                <p className="text-gray-400 text-sm mb-4">Бесплатные доступны без подписки, премиум — только с подпиской, отключённые скрыты.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AI_MODELS.map((model) => {
                    const tier = getChatModelTier(model.id);
                    return (
                      <div key={model.id} className="border border-primary-900/30 rounded-lg p-4 bg-background-darker/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-medium">{model.name}</h4>
                            <p className="text-gray-500 text-xs">{model.id}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            tier === 'free' ? 'bg-green-500/20 text-green-400' :
                            tier === 'premium' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {tier === 'free' ? 'Бесплатная' : tier === 'premium' ? 'Премиум' : 'Отключена'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {(['free', 'premium', 'disabled'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => handleSetChatModelTier(model.id, t)}
                              disabled={savingPlan || tier === t}
                              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                                tier === t
                                  ? t === 'free'
                                    ? 'bg-green-500/30 text-green-300'
                                    : t === 'premium'
                                    ? 'bg-amber-500/30 text-amber-300'
                                    : 'bg-gray-500/30 text-gray-300'
                                  : 'bg-background-hover text-gray-400 hover:text-white hover:bg-primary-900/30'
                              }`}
                            >
                              {t === 'free' ? 'Беспл.' : t === 'premium' ? 'Премиум' : 'Выкл'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Модели изображений */}
              <section className="border border-primary-900/30 rounded-xl p-5 bg-background-hover/50">
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary-400" />
                  Модели изображений
                </h3>
                <p className="text-gray-400 text-sm mb-4">Включение и отключение моделей генерации изображений.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {IMAGE_MODELS.map((model) => {
                    const setting = modelSettings.find((s) => s.modelId === model.id);
                    const isEnabled = setting ? setting.isEnabled : true;
                    return (
                      <div key={model.id} className="border border-primary-900/30 rounded-lg p-4 bg-background-darker/50 flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">{model.name}</h4>
                          <p className="text-gray-500 text-xs">{model.id}</p>
                        </div>
                        <button
                          onClick={() => handleUpdateModel(model.id, !isEnabled)}
                          disabled={loading}
                          className={`px-3 py-1.5 rounded text-sm transition-colors ${
                            isEnabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {isEnabled ? 'Вкл' : 'Выкл'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Модели видео */}
              <section className="border border-primary-900/30 rounded-xl p-5 bg-background-hover/50">
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary-400" />
                  Модели видео
                </h3>
                <p className="text-gray-400 text-sm mb-4">Включение и отключение моделей генерации видео.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {VIDEO_MODELS.map((model) => {
                    const setting = modelSettings.find((s) => s.modelId === model.id);
                    const isEnabled = setting ? setting.isEnabled : true;
                    return (
                      <div key={model.id} className="border border-primary-900/30 rounded-lg p-4 bg-background-darker/50 flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">{model.name}</h4>
                          <p className="text-gray-500 text-xs">{model.id}</p>
                        </div>
                        <button
                          onClick={() => handleUpdateModel(model.id, !isEnabled)}
                          disabled={loading}
                          className={`px-3 py-1.5 rounded text-sm transition-colors ${
                            isEnabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {isEnabled ? 'Вкл' : 'Выкл'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {!loading && activeTab === 'activity' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Журнал активности</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-900/30">
                      <th className="text-left p-3 text-gray-400">Пользователь</th>
                      <th className="text-left p-3 text-gray-400">Действие</th>
                      <th className="text-left p-3 text-gray-400">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="border-b border-primary-900/30 hover:bg-background-hover">
                        <td className="p-3 text-white">{log.userId.substring(0, 8)}...</td>
                        <td className="p-3 text-gray-400">{log.actionType}</td>
                        <td className="p-3 text-gray-400">
                          {new Date(log.createdAt).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && activeTab === 'admins' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Администраторы</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ID пользователя"
                    value={newAdminUserId}
                    onChange={(e) => setNewAdminUserId(e.target.value)}
                    className="px-4 py-2 bg-background-hover border border-primary-900/30 rounded-lg text-white"
                  />
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'super_admin')}
                    className="px-4 py-2 bg-background-hover border border-primary-900/30 rounded-lg text-white"
                  >
                    <option value="admin">Админ</option>
                    <option value="super_admin">Супер-админ</option>
                  </select>
                  <button
                    onClick={handleAddAdmin}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-900/30">
                      <th className="text-left p-3 text-gray-400">ID пользователя</th>
                      <th className="text-left p-3 text-gray-400">Роль</th>
                      <th className="text-left p-3 text-gray-400">Дата создания</th>
                      <th className="text-left p-3 text-gray-400">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b border-primary-900/30 hover:bg-background-hover">
                        <td className="p-3 text-white">{admin.userId}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            admin.role === 'super_admin'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {admin.role === 'super_admin' ? 'Супер-админ' : 'Админ'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400">
                          {new Date(admin.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleRemoveAdmin(admin.userId)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Block User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-card border border-primary-900/30 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Заблокировать пользователя</h3>
            <p className="text-gray-400 mb-4">{selectedUser.email}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Причина блокировки</label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-4 py-2 bg-background-hover border border-primary-900/30 rounded-lg text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Заблокировать до (необязательно)</label>
                <input
                  type="datetime-local"
                  value={blockUntil}
                  onChange={(e) => setBlockUntil(e.target.value)}
                  className="w-full px-4 py-2 bg-background-hover border border-primary-900/30 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setBlockReason('');
                    setBlockUntil('');
                  }}
                  className="flex-1 px-4 py-2 bg-background-hover border border-primary-900/30 rounded-lg text-white hover:bg-background-darker transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleBlockUser(selectedUser.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Заблокировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
