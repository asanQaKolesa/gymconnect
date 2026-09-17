import React, { useState } from 'react';

export default function AthleteStats({ user }) {
  const [viewTab, setViewTab] = useState('overview'); // 'overview' | 'prs' | 'calendar'

  // Отмеченные тренировки в текущем месяце
  const [trainedDays, setTrainedDays] = useState([2, 4, 7, 9, 11, 14, 16, 18]);

  // Персональные рекорды (PR) атлета
  const [prs, setPrs] = useState({
    bench: 110,
    squat: 140,
    deadlift: 170,
    weight: 78
  });

  const [editingPR, setEditingPR] = useState(false);
  const [prForm, setPrForm] = useState({ ...prs });

  const toggleDay = (day) => {
    if (trainedDays.includes(day)) {
      setTrainedDays(trainedDays.filter(d => d !== day));
    } else {
      setTrainedDays([...trainedDays, day]);
    }
  };

  const handleSavePRs = (e) => {
    e.preventDefault();
    setPrs({ ...prForm });
    setEditingPR(false);
  };

  const completionRate = Math.min(100, Math.round((trainedDays.length / 16) * 100));

  return (
    <div className="space-y-4">
      {/* 1. Карточка дисциплины GymConnect Consistency */}
      <div className="apple-glass-card p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A1F]">
              GymConnect Performance
            </span>
            <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
              Индекс дисциплины
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Цель: 4 тренировки в неделю
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 flex flex-col items-center justify-center shadow-lg shadow-[#FF5A1F]/10">
            <span className="text-xs font-black text-[#FF8C38] leading-none">{completionRate}%</span>
            <span className="text-[9px] text-slate-400 uppercase font-bold mt-1">ПЛАН</span>
          </div>
        </div>

        {/* Прогресс-бар Apple Style */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF682B] to-[#FF8C38] transition-all duration-500 shadow-sm"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Выполнено: {trainedDays.length} из 16 за месяц</span>
            <span className="text-emerald-400 font-semibold">В темпе 🔥</span>
          </div>
        </div>
      </div>

      {/* 2. Apple Segmented Control */}
      <div className="apple-glass p-1.5 flex gap-1.5">
        <button
          onClick={() => setViewTab('overview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
            viewTab === 'overview'
              ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Метрики
        </button>
        <button
          onClick={() => setViewTab('prs')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
            viewTab === 'prs'
              ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Силовые (PR)
        </button>
        <button
          onClick={() => setViewTab('calendar')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
            viewTab === 'calendar'
              ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Календарь
        </button>
      </div>

      {/* ================= ВКЛАДКА 1: МЕТРИКИ ================= */}
      {viewTab === 'overview' && (
        <div className="grid grid-cols-2 gap-2.5">
          <div className="apple-glass p-4 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block">⚡ Активные сессии</span>
            <p className="text-2xl font-black text-white tracking-tight">{trainedDays.length}</p>
            <span className="text-[10px] text-emerald-400 font-semibold block">+3 на этой неделе</span>
          </div>

          <div className="apple-glass p-4 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block">⏱ Время под нагрузкой</span>
            <p className="text-2xl font-black text-white tracking-tight">{(trainedDays.length * 1.3).toFixed(1)} ч</p>
            <span className="text-[10px] text-slate-500 font-medium block">В среднем 75 мин/день</span>
          </div>

          <div className="apple-glass p-4 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block">⚖️ Вес атлета</span>
            <p className="text-2xl font-black text-white tracking-tight">{prs.weight} кг</p>
            <span className="text-[10px] text-[#FF8C38] font-semibold block">Качественная масса</span>
          </div>

          <div className="apple-glass p-4 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block">🏆 Сумма базы</span>
            <p className="text-2xl font-black text-[#FF5A1F] tracking-tight">{prs.bench + prs.squat + prs.deadlift} кг</p>
            <span className="text-[10px] text-slate-500 font-medium block">Жим + Присед + Тяга</span>
          </div>
        </div>
      )}

      {/* ================= ВКЛАДКА 2: СИЛОВЫЕ РЕКОРДЫ (PR) ================= */}
      {viewTab === 'prs' && (
        <div className="apple-glass p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Личные рекорды (PR)</h3>
              <p className="text-xs text-slate-400">Максимальные веса на 1 повторение</p>
            </div>
            <button
              onClick={() => {
                setPrForm({ ...prs });
                setEditingPR(!editingPR);
              }}
              className="text-xs text-[#FF5A1F] font-semibold hover:underline cursor-pointer"
            >
              {editingPR ? 'Отмена' : 'Изменить'}
            </button>
          </div>

          {editingPR ? (
            <form onSubmit={handleSavePRs} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Жим лежа (кг)</label>
                <input
                  type="number"
                  value={prForm.bench}
                  onChange={e => setPrForm({ ...prForm, bench: Number(e.target.value) })}
                  className="w-full apple-input"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Приседания со штангой (кг)</label>
                <input
                  type="number"
                  value={prForm.squat}
                  onChange={e => setPrForm({ ...prForm, squat: Number(e.target.value) })}
                  className="w-full apple-input"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Становая тяга (кг)</label>
                <input
                  type="number"
                  value={prForm.deadlift}
                  onChange={e => setPrForm({ ...prForm, deadlift: Number(e.target.value) })}
                  className="w-full apple-input"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Текущий собственный вес (кг)</label>
                <input
                  type="number"
                  value={prForm.weight}
                  onChange={e => setPrForm({ ...prForm, weight: Number(e.target.value) })}
                  className="w-full apple-input"
                />
              </div>
              <button
                type="submit"
                className="w-full gymshark-btn-electric py-2.5 text-xs font-bold mt-2 cursor-pointer"
              >
                Сохранить рекорды
              </button>
            </form>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                <span className="text-xs font-semibold text-slate-300">Жим лежа</span>
                <span className="text-sm font-black text-white">{prs.bench} кг</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                <span className="text-xs font-semibold text-slate-300">Приседания</span>
                <span className="text-sm font-black text-white">{prs.squat} кг</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                <span className="text-xs font-semibold text-slate-300">Становая тяга</span>
                <span className="text-sm font-black text-white">{prs.deadlift} кг</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20">
                <span className="text-xs font-bold text-[#FF8C38]">Сумма троеборья</span>
                <span className="text-sm font-black text-white">{prs.bench + prs.squat + prs.deadlift} кг</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= ВКЛАДКА 3: КАЛЕНДАРЬ ТРЕНИРОВОК ================= */}
      {viewTab === 'calendar' && (
        <div className="apple-glass p-5 space-y-3.5">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white tracking-tight">Лог тренировочных дней</h3>
            <span className="text-[11px] text-[#FF8C38] font-bold">Сентябрь 2026</span>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 pb-1">
            <span>ПН</span><span>ВТ</span><span>СР</span><span>ЧТ</span><span>ПТ</span><span>СБ</span><span>ВС</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            <div className="h-9" />
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
              const isDone = trainedDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    isDone
                      ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/25 active:scale-95'
                      : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-white/[0.05]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-2">
            Тапай на число, чтобы отметить выполненную тренировку
          </p>
        </div>
      )}
    </div>
  );
}
