// src/components/trainer/components/modals/TrainerIncomeCalcModal.jsx
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TrainerIncomeCalcModal({ isOpen, onClose }) {
  const [calcTargetIncome, setCalcTargetIncome] = useState(600000);
  const [calcPricePerSession, setCalcPricePerSession] = useState(6000);
  const [calcGymCutPercent, setCalcGymCutPercent] = useState(30);

  if (!isOpen) return null;

  const netPerSession = Math.round(calcPricePerSession * (1 - calcGymCutPercent / 100));
  const sessionsNeededMonth = Math.ceil(calcTargetIncome / (netPerSession || 1));
  const sessionsNeededWeek = Math.ceil(sessionsNeededMonth / 4.3);
  const sessionsNeededDay = Math.ceil(sessionsNeededWeek / 5);

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
        <h2 className="text-xs font-bold text-slate-900">Калькулятор дохода</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24 text-xs">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Планирование финансовой цели</h3>
          
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Желаемый чистый доход в месяц (₸):</label>
            <input
              type="number"
              step="50000"
              value={calcTargetIncome}
              onChange={e => setCalcTargetIncome(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Стоимость 1 персональной тренировки (₸):</label>
            <input
              type="number"
              step="500"
              value={calcPricePerSession}
              onChange={e => setCalcPricePerSession(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Процент залу / аренда клуба ({calcGymCutPercent}%):</label>
            <input
              type="range"
              min="0"
              max="60"
              value={calcGymCutPercent}
              onChange={e => setCalcGymCutPercent(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-sans">Чистыми с 1 тренировки:</span>
              <span className="font-bold text-blue-900">{netPerSession.toLocaleString()} ₸</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-sans">Тренировок в месяц:</span>
              <span className="font-bold text-blue-900">{sessionsNeededMonth} зан.</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-sans">Тренировок в неделю:</span>
              <span className="font-bold text-blue-900">~{sessionsNeededWeek} зан.</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-blue-200 pt-2 font-sans font-bold">
              <span className="text-slate-900">Нагрузка в день (при 5 днях):</span>
              <span className="text-blue-600 font-mono text-sm">{sessionsNeededDay} клиента/день</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
