import React from 'react';
import { BarChart2, Award, Tag, CreditCard, Globe, ChevronRight } from 'lucide-react';

export default function ProfileMenu() {
  const menuItems = [
    { icon: BarChart2, label: 'Моя статистика', desc: 'Посещения, дни в зале', action: () => alert('Статистика') },
    { icon: Award, label: 'Подписка GymConnect', desc: 'Активна до конца октября', action: () => alert('Подписка') },
    { icon: Tag, label: 'Ввести промокод', desc: 'Активация бонусов', action: () => alert('Промокод') },
    { icon: CreditCard, label: 'История платежей', desc: 'Чеки и транзакции', action: () => alert('Платежи') },
    { icon: Globe, label: 'Язык интерфейса', desc: 'Русский / Қазақша', action: () => alert('Смена языка') },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Основное меню
      </div>
      <div className="divide-y divide-slate-50">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button 
              key={index}
              onClick={item.action}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:text-blue-600 transition-colors">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
