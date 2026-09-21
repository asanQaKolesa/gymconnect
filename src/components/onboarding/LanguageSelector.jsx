// src/components/onboarding/LanguageSelector.jsx
import React, { useState } from 'react';
import { Check, Globe } from 'lucide-react';

export default function LanguageSelector({ currentLang = 'kk', onSelectLanguage }) {
  // Локальное состояние выбранного языка (по умолчанию казахский 'kk')
  const [selected, setSelected] = useState(currentLang);

  const handleContinue = (e) => {
    e.preventDefault();
    if (onSelectLanguage) {
      onSelectLanguage(selected);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col justify-between">
        
        <div>
          {/* Иконка и заголовок */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600 shadow-sm">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              Тілді таңдаңыз / Выберите язык
            </h1>
            <p className="text-xs text-slate-500">
              Қолданба тілін таңдап, жалғастырыңыз
            </p>
          </div>

          {/* Карточки выбора языка */}
          <div className="space-y-3 mb-6">
            
            {/* Казахский */}
            <div 
              onClick={() => setSelected('kk')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                selected === 'kk' 
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇰🇿</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Қазақша</h3>
                  <p className="text-[11px] text-slate-500">Қазақ тілінде жалғастыру</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                selected === 'kk' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {selected === 'kk' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Русский */}
            <div 
              onClick={() => setSelected('ru')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                selected === 'ru' 
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇷🇺</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Русский</h3>
                  <p className="text-[11px] text-slate-500">Продолжить на русском языке</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                selected === 'ru' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {selected === 'ru' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

          </div>
        </div>

        {/* Кнопка продолжения */}
        <button
          onClick={handleContinue}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
        >
          <span>{selected === 'kk' ? 'Жалғастыру' : 'Продолжить'}</span>
        </button>

      </div>
    </div>
  );
}
