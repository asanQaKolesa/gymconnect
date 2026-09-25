import React from 'react';
import { 
  BarChart2, 
  Award, 
  Target, 
  Tag, 
  CreditCard, 
  Briefcase, 
  Building2, 
  ChevronRight 
} from 'lucide-react';

export default function ProfileMenu() {
  const handleOpenGymPartnership = () => {
    window.open('https://t.me/gymconnect_support?text=' + encodeURIComponent('Здравствуйте! Интересует сотрудничество и подключение фитнес-зала к GymConnect.'), '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Секция: Основное меню */}
      <div className="space-y-1.5">
        <p className="px-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ОСНОВНОЕ МЕНЮ</p>
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Моя статистика</h4>
                <p className="text-[10px] text-slate-400">Посещения, дни в зале</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Подписка GymConnect</h4>
                <p className="text-[10px] text-slate-400">Активна до конца октября</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Персональная программа</h4>
                <p className="text-[10px] text-slate-400">Настройка целей и дней тренировок</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Ввести промокод</h4>
                <p className="text-[10px] text-slate-400">Активация бонусов</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900">История платежей</h4>
                <p className="text-[10px] text-slate-400">Чеки и транзакции</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Секция: Партнёрам и сотрудничество */}
      <div className="space-y-1.5">
        <p className="px-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ПАРТНЁРАМ И СОТРУДНИЧЕСТВО</p>
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
          <button 
            onClick={() => { window.location.href = '?trainer=true'; }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Кабинет фитнес-тренера</h4>
                <p className="text-[10px] text-slate-400">CRM, аналитика, клиенты и календарь</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button 
            onClick={handleOpenGymPartnership}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Сотрудничество для фитнес-залов</h4>
                <p className="text-[10px] text-slate-400">Подключение клубов Алматы и партнерство</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
