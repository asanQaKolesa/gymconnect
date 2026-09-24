import React from 'react';
import { Sparkles, BellRing, UserPlus } from 'lucide-react';
import { supabase } from '../../../../supabaseClient';

export default function QuickActionsBanner({ students, onOpenAddModal }) {
  const handleRemindLowBalance = () => {
    const lowStudents = students.filter(s => (s.status === 'active' || !s.status) && (s.left_trainings !== undefined ? s.left_trainings : 12) <= 2);
    if (lowStudents.length === 0) {
      alert('У всех активных учеников достаточно оплаченных занятий!');
      return;
    }
    
    const target = lowStudents.find(s => s.phone);
    if (target) {
      const cleanPhone = target.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Привет, ${target.first_name}! У тебя осталось мало оплаченных занятий (${target.left_trainings} зан.). Напомни, когда сможешь закинуть оплату за следующий абонемент? 💪`);
      window.open(`https://wa.me/7${cleanPhone}?text=${message}`, '_blank');
    } else {
      alert(`Найдено учеников с низким балансом: ${lowStudents.length}, но ни у одного из них не указан номер телефона в профиле.`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Быстрые действия тренера</h4>
          <p className="text-[11px] text-blue-100">Управление базой и моментальная связь с атлетами</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
        <button 
          onClick={handleRemindLowBalance}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
          title="Напомнить ученикам с остатком ≤ 2 занятий"
        >
          <BellRing className="w-4 h-4" />
          <span>Напомнить об оплате</span>
        </button>
        <button 
          onClick={onOpenAddModal}
          className="px-3.5 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Добавить ученика</span>
        </button>
      </div>
    </div>
  );
}
