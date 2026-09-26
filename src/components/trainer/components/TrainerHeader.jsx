// src/components/trainer/components/TrainerHeader.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  LogOut, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  MapPin, 
  Share2, 
  Sparkles,
  Settings,
  Save
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import * as GymsData from '../../../data/almatyGyms';

const GYMS_ARRAY = Array.isArray(GymsData.ALMATY_GYMS) ? GymsData.ALMATY_GYMS : [];

export default function TrainerHeader({ trainer, onLogout, onBack }) {
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Стейт редактирования данных визитки
  const [editForm, setEditForm] = useState({
    gym: trainer?.gym || '',
    secondary_gym: trainer?.secondary_gym || '',
    personal_single: trainer?.pricing?.personal_single || 8000,
    personal_block: trainer?.pricing?.personal_block || 70000,
    bio: trainer?.bio || '',
    has_free_trial: Boolean(trainer?.has_free_trial)
  });

  const cleanUsername = trainer?.username ? trainer.username.replace('@', '') : 'coach';
  const isApproved = trainer?.status === 'approved';
  const publicCoachLink = `https://t.me/gymconnect_almaty_bot?start=coach_${cleanUsername}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicCoachLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    const text = encodeURIComponent(`Записывайтесь ко мне на персональные тренировки в GymConnect:`);
    const url = encodeURIComponent(publicCoachLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleSaveProfileSettings = async () => {
    setIsSaving(true);
    try {
      const updatedPricing = {
        ...(trainer?.pricing || {}),
        personal_single: Number(editForm.personal_single) || 0,
        personal_block: Number(editForm.personal_block) || 0
      };

      const { error } = await supabase
        .from('trainer_profiles')
        .update({
          gym: editForm.gym,
          secondary_gym: editForm.secondary_gym || null,
          bio: editForm.bio,
          has_free_trial: editForm.has_free_trial,
          pricing: updatedPricing
        })
        .eq('username', cleanUsername);

      if (error) throw error;
      alert('Данные визитки успешно обновлены!');
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (e) {
      alert('Ошибка обновления: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200/80 p-3.5 sticky top-0 z-30 select-none shadow-xs">
        <div className="flex items-center justify-between gap-2">
          
          {/* Левая часть: Кнопка «Атлет» и имя тренера */}
          <div className="flex items-center gap-2 overflow-hidden">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all active:scale-95 flex items-center gap-1 text-[11px] font-bold border border-slate-200/70 shrink-0"
                title="Вернуться в профиль атлета"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Атлет</span>
              </button>
            )}

            {/* Аватар и статус */}
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm overflow-hidden">
                {trainer?.avatar_url || trainer?.photo_url ? (
                  <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{trainer?.first_name?.[0] || 'T'}</span>
                )}
              </div>

              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <h1 className="text-xs font-bold text-slate-900 truncate">
                    {trainer?.full_name || `${trainer?.first_name || 'Тренер'} ${trainer?.last_name || ''}`.trim()}
                  </h1>
                  {isApproved && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  @{cleanUsername} • CoachOS
                </p>
              </div>
            </div>
          </div>

          {/* Правая часть: Визитка, Настройки, Выход */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Кнопка визитки */}
            <button
              type="button"
              onClick={() => setIsPublicModalOpen(true)}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11px] font-bold border border-blue-200/80 flex items-center gap-1 active:scale-95 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Визитка</span>
            </button>

            {/* Кнопка настроек визитки и цен */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-95"
              title="Настройки визитки и прайса"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Выход из CRM */}
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
              title="Выйти из аккаунта тренера"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ================= 1. МОДАЛЬНОЕ ОКНО ПУБЛИЧНОЙ ВИЗИТКИ ================= */}
      {isPublicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Публичная визитка тренера</h3>
                  <p className="text-[10px] text-slate-400">Так ваш профиль видят клиенты</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublicModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                  {trainer?.avatar_url || trainer?.photo_url ? (
                    <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                      {cleanUsername[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden space-y-0.5">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {trainer?.full_name || `${trainer?.first_name || ''} ${trainer?.last_name || ''}`}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Стаж: <b className="text-slate-800 font-semibold">{trainer?.experience_years || 3} года</b>
                  </p>
                  <p className="text-[10px] text-blue-600 font-mono">@{cleanUsername}</p>
                </div>
              </div>

              {/* Залы */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{trainer?.gym || 'Зал не привязан'}</span>
                </div>
                {trainer?.secondary_gym && (
                  <p className="text-[10px] text-slate-500 pl-5 truncate">
                    Второй зал: {trainer.secondary_gym}
                  </p>
                )}
              </div>

              {/* Прайс-лист */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400">Разовая тренировка</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 font-mono">
                    {trainer?.pricing?.personal_single ? `${Number(trainer.pricing.personal_single).toLocaleString()} ₸` : '8 000 ₸'}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400">Абонемент (12 зан.)</p>
                  <p className="text-xs font-bold text-blue-600 mt-0.5 font-mono">
                    {trainer?.pricing?.personal_block ? `${Number(trainer.pricing.personal_block).toLocaleString()} ₸` : '70 000 ₸'}
                  </p>
                </div>
              </div>

              {/* Пробная тренировка */}
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 font-semibold">
                <span>Пробная тренировка:</span>
                <span>{trainer?.has_free_trial ? 'Бесплатно' : 'По тарифу'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-500 truncate mr-2">
                  {publicCoachLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 active:scale-95"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>Отправить визитку клиенту</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 2. МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ДАННЫХ ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Настройки визитки и цен</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Основной клуб</label>
                <select
                  value={editForm.gym}
                  onChange={e => setEditForm({ ...editForm, gym: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {GYMS_ARRAY.slice(0, 60).map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Второй клуб</label>
                <select
                  value={editForm.secondary_gym}
                  onChange={e => setEditForm({ ...editForm, secondary_gym: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Не указан</option>
                  {GYMS_ARRAY.slice(0, 60).map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Разовое занятие (₸)</label>
                  <input
                    type="number"
                    value={editForm.personal_single}
                    onChange={e => setEditForm({ ...editForm, personal_single: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Абонемент (₸)</label>
                  <input
                    type="number"
                    value={editForm.personal_block}
                    onChange={e => setEditForm({ ...editForm, personal_block: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">О себе и методике</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div 
                onClick={() => setEditForm({ ...editForm, has_free_trial: !editForm.has_free_trial })}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer active:scale-98"
              >
                <span className="text-xs font-semibold text-slate-800">Проводить бесплатную пробу</span>
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                  editForm.has_free_trial ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {editForm.has_free_trial && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveProfileSettings}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 active:scale-98 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить изменения'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
