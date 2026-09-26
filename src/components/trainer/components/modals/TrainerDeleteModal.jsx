// src/components/trainer/components/modals/TrainerDeleteModal.jsx
import React from 'react';
import { ArrowLeft, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../../../supabaseClient';

export default function TrainerDeleteModal({ isOpen, onClose, cleanUsername, onDeleted }) {
  if (!isOpen) return null;

  const handleDeleteCoachAccount = async () => {
    const confirmation = window.confirm(
      'Вы уверены, что хотите деактивировать тренерский профиль? Все данные подопечных и визитка станут недоступны.'
    );
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from('trainer_profiles')
        .delete()
        .eq('username', cleanUsername);

      if (error) throw error;
      alert('Тренерский профиль успешно удален.');
      if (onDeleted) onDeleted();
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад в меню</span>
        </button>
        <h2 className="text-xs font-bold text-rose-600">Опасная зона</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
        <div className="bg-white rounded-3xl p-5 border border-rose-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold">Деактивация анкеты тренера</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Удаление анкеты тренера приведет к закрытию публичной визитки и отключению доступа к разделу CoachOS CRM. Ваш личный профиль атлета сохранится.
          </p>

          <button
            type="button"
            onClick={handleDeleteCoachAccount}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Удалить анкету тренера</span>
          </button>
        </div>
      </div>
    </div>
  );
}
