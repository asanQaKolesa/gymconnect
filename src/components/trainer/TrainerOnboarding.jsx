// src/components/trainer/TrainerOnboarding.jsx
import React, { useState } from 'react';
import { ArrowLeft, Dumbbell, Send, Check } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { ALMATY_GYMS } from '../../data/almatyGyms';

export default function TrainerOnboarding({ onComplete, onBack, onExitToProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    gym: ALMATY_GYMS[2] || 'Invictus Go | Улица Тимирязева, 42',
    experience_years: '3',
    specialization: 'Силовые тренировки и набор массы',
    bio: ''
  });

  const handleBackAction = () => {
    if (typeof onExitToProfile === 'function') {
      onExitToProfile();
    } else if (typeof onBack === 'function') {
      onBack();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.username.trim() || !formData.phone.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanU = formData.username.trim().replace('@', '');
      
      const payload = {
        full_name: formData.full_name.trim(),
        username: cleanU,
        phone: formData.phone.trim(),
        gym: formData.gym,
        experience_years: Number(formData.experience_years) || 1,
        specialization: formData.specialization,
        bio: formData.bio.trim(),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('trainer_profiles')
        .insert([payload]);

      if (error) throw error;

      alert('Ваша заявка успешно отправлена! Администратор GymConnect проверит профиль в течение 24 часов.');
      
      if (onComplete) {
        onComplete(cleanU);
      } else {
        handleBackAction();
      }
    } catch (err) {
      console.error('Ошибка отправки заявки тренера:', err);
      alert('Ошибка при отправке заявки: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between p-4 overflow-y-auto select-none">
      <div className="max-w-md mx-auto w-full space-y-4 pt-2 pb-12">
        
        {/* Кнопка Назад в профиль */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackAction}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-700 active:scale-95 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Назад в профиль</span>
          </button>
          
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Регистрация тренера
          </span>
        </div>

        {/* Заголовок */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center space-y-1">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Dumbbell className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Анкета тренера GymConnect
          </h1>
          <p className="text-xs text-slate-500">
            Заполните данные для подключения к платформе и получения клиентов
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3.5">
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ФИО тренера <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Данияр Сериков"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Telegram Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-mono text-xs font-bold">@</span>
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value.replace(/[@\s]/g, '') })}
                placeholder="username"
                className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Номер телефона (WhatsApp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 701 123 45 67"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Основной фитнес-клуб тренировок <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.gym}
              onChange={e => setFormData({ ...formData, gym: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              {ALMATY_GYMS.slice(0, 50).map((g, idx) => (
                <option key={idx} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Опыт (лет)</label>
              <input
                type="number"
                min="1"
                max="40"
                value={formData.experience_years}
                onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Специализация</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Бодибилдинг / ОФП"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">О себе и квалификации</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Спортивные звания, сертификаты, опыт ведения атлетов..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50 mt-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Отправка заявки...' : 'Отправить заявку на модерацию'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
