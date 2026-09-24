import React from 'react';
import { X, UserPlus, Info } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose, form, setForm, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Добавить ученика в CRM</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-[11px] text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>Если ученик уже зарегистрирован в боте GymConnect, укажите его Telegram username — карточка автоматически привяжется к вашему аккаунту без создания дублей!</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Имя *</label>
              <input 
                type="text"
                required
                value={form.first_name}
                onChange={(e) => setForm({...form, first_name: e.target.value})}
                placeholder="Асанәли"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Фамилия</label>
              <input 
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({...form, last_name: e.target.value})}
                placeholder="Құсайынов"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Telegram Username</label>
            <input 
              type="text"
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              placeholder="@username"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Телефон WhatsApp</label>
            <input 
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              placeholder="7011234567"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Стоимость (₸ / мес)</label>
              <input 
                type="number"
                value={form.monthly_price}
                onChange={(e) => setForm({...form, monthly_price: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Всего занятий</label>
              <input 
                type="number"
                value={form.total_trainings}
                onChange={(e) => setForm({...form, total_trainings: e.target.value, left_trainings: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Фитнес-зал</label>
            <input 
              type="text"
              value={form.gym}
              onChange={(e) => setForm({...form, gym: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium">Отмена</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md">Добавить в CRM</button>
          </div>
        </form>
      </div>
    </div>
  );
}
