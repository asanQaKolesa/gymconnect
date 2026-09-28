// src/components/trainer/components/AddStudentModal.jsx
import React from 'react';
import { X, UserPlus, Info, MessageCircle, Send } from 'lucide-react';

export default function AddStudentModal({ 
  isOpen, 
  onClose, 
  form, 
  setForm, 
  onSubmit,
  coachUsername = 'coach',
  coachGym = 'Алматы'
}) {
  if (!isOpen) return null;

  const cleanCoach = (coachUsername || 'coach').replace(/[@\s]/g, '');
  const cleanPhone = (form.phone || '').replace(/\D/g, '');

  const inviteTelegramLink = `https://t.me/gymconnect_almaty_bot?start=coach_${cleanCoach}`;
  
  const handleSendWhatsAppInvite = () => {
    if (!cleanPhone) {
      alert('Укажите номер WhatsApp ученика');
      return;
    }
    const studentName = form.first_name ? form.first_name.trim() : 'атлет';
    const message = encodeURIComponent(
      `Привет, ${studentName}! Я подключил твой тренировочный абонемент в GymConnect. Перейди по ссылке в Telegram, чтобы видеть свой график, баланс занятий и персональную программу: ${inviteTelegramLink}`
    );
    window.open(`https://wa.me/7${cleanPhone.startsWith('7') ? cleanPhone.slice(1) : cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-3.5">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Добавить ученика в CRM</h3>
              <p className="text-[10px] text-slate-400">Быстрая регистрация и привязка</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-[11px] text-blue-900 leading-snug">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>Если ученик уже есть в боте GymConnect, укажите его Telegram никнейм или телефон — карточка свяжется с ним <b>без создания дублей</b>!</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Имя *</label>
              <input 
                type="text"
                required
                value={form.first_name}
                onChange={(e) => setForm({...form, first_name: e.target.value})}
                placeholder="Даурен"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Фамилия</label>
              <input 
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({...form, last_name: e.target.value})}
                placeholder="Омаров"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Telegram Username (для связи с ботом)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">@</span>
              <input 
                type="text"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value.replace(/[@\s]/g, '')})}
                placeholder="username"
                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Телефон WhatsApp *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">+7</span>
              <input 
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                placeholder="701 123 45 67"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Быстрая отправка инвайта в WhatsApp */}
          {cleanPhone.length >= 10 && (
            <button
              type="button"
              onClick={handleSendWhatsAppInvite}
              className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-[11px] font-bold border border-emerald-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Отправить ссылку-приглашение ученику в WhatsApp</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Стоимость (₸ / блок)</label>
              <input 
                type="number"
                value={form.monthly_price}
                onChange={(e) => setForm({...form, monthly_price: Number(e.target.value)})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Всего занятий в блоке</label>
              <input 
                type="number"
                value={form.total_trainings}
                onChange={(e) => setForm({...form, total_trainings: Number(e.target.value)})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-center"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Фитнес-клуб тренировок</label>
            <input 
              type="text"
              value={form.gym}
              onChange={(e) => setForm({...form, gym: e.target.value})}
              placeholder={coachGym || 'Invictus Go'}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer active:scale-95"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Сохранить в CRM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
