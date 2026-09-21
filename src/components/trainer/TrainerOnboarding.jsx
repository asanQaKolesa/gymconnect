// src/components/trainer/TrainerOnboarding.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Dumbbell, ShieldCheck, CheckCircle2, User, Phone, MapPin, Award, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TrainerOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Данные анкеты тренера
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    gyms: [],
    formats: ['offline'],
    specialization: 'Тренажерный зал / Набор массы',
    experience_years: '3-5 лет',
    certificate_url: '',
    agree_verification: false
  });

  // Список популярных залов Алматы для выбора
  const almatyGyms = [
    'Invictus Go | Улица Навои, 97',
    'Invictus Fitness | Аль-Фараби',
    'World Class Almaty | Наурызбай батыра',
    'Fitnation | Розыбакиева',
    'БАНЗАЙ Fitness | Проспект Абая, 150',
    'Другой / Работаю персонально'
  ];

  const handleGymToggle = (gym) => {
    setFormData(prev => {
      const exists = prev.gyms.includes(gym);
      if (exists) {
        return { ...prev, gyms: prev.gyms.filter(g => g !== gym) };
      } else {
        return { ...prev, gyms: [...prev.gyms, gym] };
      }
    });
  };

  const handleFormatToggle = (format) => {
    setFormData(prev => {
      const exists = prev.formats.includes(format);
      if (exists) {
        return { ...prev, formats: prev.formats.filter(f => f !== format) };
      } else {
        return { ...prev, formats: [...prev.formats, format] };
      }
    });
  };

  // Сохранение данных в Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agree_verification) {
      alert('Необходимо подтвердить согласие на верификацию квалификации.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('trainer_profiles')
        .insert([formData]);

      if (error) throw error;

      localStorage.setItem('gymconnect_trainer_registered', 'true');
      localStorage.setItem('gymconnect_trainer_username', formData.username);
      if (onComplete) onComplete(formData.username);
    } catch (err) {
      alert('Ошибка регистрации: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        
        {/* Шапка */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              GC
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Регистрация тренера</h1>
              <p className="text-xs text-slate-400">Шаг {step} из 3</p>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
            Partner Portal
          </span>
        </div>

        {/* ШАГ 1: Контакты и специализация */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200">1. Основная информация</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Имя *</label>
                <input 
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Аскар"
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Фамилия *</label>
                <input 
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Сериков"
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Telegram Username *</label>
              <input 
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="@askar_coach"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Номер телефона (WhatsApp / Kaspi) *</label>
              <input 
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+7 (701) 000-00-00"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Специализация</label>
                <select 
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-600"
                >
                  <option>Тренажерный зал / Набор массы</option>
                  <option>Похудение / Рекомпозиция</option>
                  <option>Функциональный тренинг</option>
                  <option>Реабилитация / ОФП</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Стаж работы</label>
                <select 
                  value={formData.experience_years}
                  onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-600"
                >
                  <option>1-3 года</option>
                  <option>3-5 лет</option>
                  <option>Более 5 лет</option>
                </select>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => {
                if (!formData.first_name || !formData.username || !formData.phone) {
                  alert('Заполните обязательные поля');
                  return;
                }
                setStep(2);
              }}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span>Далее: Локация и формат</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ШАГ 2: Выбор фитнес-залов и форматы */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200">2. Где вы проводите тренировки?</h2>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Выберите фитнес-клубы Алматы (можно несколько):</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {almatyGyms.map((gym, index) => {
                  const isSelected = formData.gyms.includes(gym);
                  return (
                    <div 
                      key={index}
                      onClick={() => handleGymToggle(gym)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected ? 'bg-blue-600/20 border-blue-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{gym}</span>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Формат работы:</label>
              <div className="grid grid-cols-3 gap-2">
                {['offline', 'online', 'group'].map((format) => {
                  const isSelected = formData.formats.includes(format);
                  const labels = { offline: 'Персонально', online: 'Онлайн', group: 'Мини-группы' };
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => handleFormatToggle(format)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {labels[format]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
              <button 
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Далее: Верификация</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 3: Верификация и сертификаты */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200">3. Подтверждение квалификации</h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Ссылка на диплом / сертификат (необязательно)</label>
              <input 
                type="text"
                value={formData.certificate_url}
                onChange={(e) => setFormData({...formData, certificate_url: e.target.value})}
                placeholder="https://drive.google.com/... или ссылка на сайт академии"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-600 font-mono text-xs"
              />
              <p className="text-[10px] text-slate-500 mt-1">Укажите ссылку на ваши документы об образовании или сертификат академии (например, Invictus Academy).</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  required
                  checked={formData.agree_verification}
                  onChange={(e) => setFormData({...formData, agree_verification: e.target.checked})}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  Я даю согласие администрации GymConnect на направление официального запроса в указанные фитнес-клубы и учебные заведения для верификации моей квалификации и трудоустройства.
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
              >
                {loading ? 'Регистрация...' : 'Завершить и войти в CRM'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
