// src/components/trainer/TrainerOnboarding.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Dumbbell, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TrainerOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '+7 ',
    instagram: '',
    specializations: [],
    formats: ['offline'],
    gyms: [],
    products: '',
    certificate_url: '',
    agree_verification: false
  });

  const availableSpecializations = [
    'Тренажерный зал',
    'Набор массы',
    'Похудение',
    'Рекомпозиция',
    'Функциональный тренинг',
    'Реабилитация / ОФП'
  ];

  const almatyGyms = [
    'Invictus Go | Улица Навои, 97',
    'Invictus Fitness | Аль-Фараби',
    'World Class Almaty | Наурызбай батыра',
    'Fitnation | Розыбакиева',
    'БАНЗАЙ Fitness | Проспект Абая, 150',
    'Индивидуальный формат / Свой зал'
  ];

  const handleToggle = (field, item) => {
    setFormData(prev => {
      const exists = prev[field].includes(item);
      return {
        ...prev,
        [field]: exists ? prev[field].filter(i => i !== item) : [...prev[field], item]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agree_verification) {
      alert('Подтвердите согласие на верификацию квалификации.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        city: 'Алматы'
      };

      const { error } = await supabase.from('trainer_profiles').insert([payload]);
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
        
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              GC
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Регистрация тренера</h1>
              <p className="text-xs text-slate-500">Шаг {step} из 3</p>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            Partner Portal
          </span>
        </div>

        {/* ШАГ 1: Контакты */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">1. Основная информация и контакты</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Имя *</label>
                <input 
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Аскар"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Фамилия *</label>
                <input 
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Сериков"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Telegram Username *</label>
              <input 
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="@askar_coach"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Номер телефона WhatsApp *</label>
              <input 
                type="text"
                required
                value={formData.phone}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith('+7')) val = '+7 ' + val.replace(/^\+?[78]\s?/, '');
                  setFormData({...formData, phone: val});
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Instagram профиль</label>
              <input 
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                placeholder="@askar_fitness"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <button 
              type="button"
              onClick={() => {
                if (!formData.first_name || !formData.username || formData.phone.length < 5) {
                  alert('Заполните обязательные поля корректно');
                  return;
                }
                setStep(2);
              }}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span>Далее: Направления и клубы</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ШАГ 2: Специализация, залы и форматы */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">2. Направления, клубы и форматы</h2>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Ваша специализация (можно выбрать несколько):</label>
              <div className="grid grid-cols-2 gap-2">
                {availableSpecializations.map((spec, index) => {
                  const isSelected = formData.specializations.includes(spec);
                  return (
                    <div 
                      key={index}
                      onClick={() => handleToggle('specializations', spec)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{spec}</span>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Фитнес-клубы, где вы работаете:</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {almatyGyms.map((gym, index) => {
                  const isSelected = formData.gyms.includes(gym);
                  return (
                    <div 
                      key={index}
                      onClick={() => handleToggle('gyms', gym)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{gym}</span>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Формат работы:</label>
              <div className="grid grid-cols-3 gap-2">
                {['offline', 'online', 'group'].map((format) => {
                  const isSelected = formData.formats.includes(format);
                  const labels = { offline: 'Персонально', online: 'Онлайн', group: 'Мини-группы' };
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => handleToggle('formats', format)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'
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
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
              <button 
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Далее: Продукты и верификация</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 3: Продукты и верификация */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">3. Ваши продукты и верификация</h2>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ваши продукты / челленджи / программы</label>
              <textarea 
                rows="2"
                value={formData.products}
                onChange={(e) => setFormData({...formData, products: e.target.value})}
                placeholder="Например: Онлайн ведение, авторский 30-дневный челлендж сушки, гайд по питанию..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">Мы сможем платно продвигать ваши программы внутри приложения GymConnect.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ссылка на диплом / сертификат</label>
              <input 
                type="text"
                value={formData.certificate_url}
                onChange={(e) => setFormData({...formData, certificate_url: e.target.value})}
                placeholder="https://... (сертификат Invictus Academy или академии)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  required
                  checked={formData.agree_verification}
                  onChange={(e) => setFormData({...formData, agree_verification: e.target.checked})}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-[11px] text-slate-700 leading-relaxed">
                  Согласен на запрос администрации GymConnect в указанные клубы для верификации моей квалификации.
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
              >
                {loading ? 'Создание профиля...' : 'Завершить и открыть CRM'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
