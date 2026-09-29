// src/components/ui/DesignSystemShowcase.jsx
import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Users, 
  Flame, 
  ArrowLeft,
  Zap, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Minus, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  Share2
} from 'lucide-react';

export default function DesignSystemShowcase({ onBack }) {
  // Список учеников для живого радара
  const studentsMock = [
    { id: '1', name: 'Асанали К.', status: 'in_gym', time: 'Сейчас', avatar: 'АК', goal: 'Набор массы', currentWeight: 60, sets: 4, reps: 10 },
    { id: '2', name: 'Данияр С.', status: 'upcoming', time: '19:00', avatar: 'ДС', goal: 'Сушка и рельеф', currentWeight: 45, sets: 3, reps: 12 },
    { id: '3', name: 'Ольга М.', status: 'rest', time: 'Завтра', avatar: 'ОМ', goal: 'Тонус и ягодицы', currentWeight: 30, sets: 4, reps: 15 },
    { id: '4', name: 'Темирлан Б.', status: 'in_gym', time: 'Сейчас', avatar: 'ТБ', goal: 'Сила (Пауэр)', currentWeight: 100, sets: 5, reps: 5 }
  ];

  const [selectedStudent, setSelectedStudent] = useState(studentsMock[0]);
  const [sets, setSets] = useState(selectedStudent.sets);
  const [reps, setReps] = useState(selectedStudent.reps);
  const [weight, setWeight] = useState(selectedStudent.currentWeight);
  const [rpe, setRpe] = useState(8);
  const [activeDay, setActiveDay] = useState(1);
  const [isExerciseDone, setIsExerciseDone] = useState(false);

  // Живой таймер отдыха
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Haptic фидбек Telegram, если доступен
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Подсчёт телеметрии тоннажа за упражнение
  const totalVolume = Math.round((sets || 0) * (reps || 0) * (weight || 0));

  const handleSelectStudent = (st) => {
    setSelectedStudent(st);
    setSets(st.sets);
    setReps(st.reps);
    setWeight(st.currentWeight);
    setIsExerciseDone(false);
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 pb-36 font-sans select-none antialiased">
      
      {/* 1. ФУТУРИСТИЧЕСКИЙ ХЕДЕР ТЕЛЕМЕТРИИ */}
      <div className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-xl active:scale-90 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>CoachOS Kinetic</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
              </h1>
              <span className="text-[9.5px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30">
                Live Engine
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">Телеметрия нагрузок в реальном времени</p>
          </div>
        </div>

        {/* Индикатор связи с Telegram */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-300">
          <Zap className="w-3 h-3 text-[#CCFF00]" />
          <span>TG Synced</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* 2. ЖИВОЙ РАДАР УЧЕНИКОВ (АТЛЕТЫ В ЗАЛЕ ПРЯМО СЕЙЧАС) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Радар учеников</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Свайп для выбора</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {studentsMock.map((st) => {
              const isSelected = selectedStudent.id === st.id;
              const isLive = st.status === 'in_gym';

              return (
                <div
                  key={st.id}
                  onClick={() => handleSelectStudent(st)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 flex items-center gap-2.5 min-w-[145px] active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/30 to-blue-900/40 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-white/[0.08] text-slate-300'
                    }`}>
                      {st.avatar}
                    </div>
                    {isLive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#CCFF00] border-2 border-[#0B0F17] rounded-full shadow-xs" title="В зале" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate leading-tight">{st.name}</p>
                    <p className={`text-[10px] font-mono mt-0.5 truncate ${isLive ? 'text-[#CCFF00] font-bold' : 'text-slate-400'}`}>
                      {isLive ? '• В зале' : st.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ТЕЛЕМЕТРИЧЕСКИЙ ДАШБОРД НАГРУЗКИ (VOLUME LOAD TELEMETRY) */}
        <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-3xl p-4 border border-white/[0.1] backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-3 border-b border-white/[0.07] pb-2.5">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Текущий атлет:</span>
              <h3 className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
                <span>{selectedStudent.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {selectedStudent.goal}
                </span>
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Расчетный тоннаж</span>
              <span className="text-base font-black font-mono text-[#CCFF00] tracking-tight">
                {totalVolume.toLocaleString()} кг
              </span>
            </div>
          </div>

          {/* 3 микро-виджета телеметрии */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-2xl bg-black/40 border border-white/[0.05]">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Сеты</span>
              <span className="text-sm font-black font-mono text-white">{sets}</span>
            </div>
            <div className="p-2 rounded-2xl bg-black/40 border border-white/[0.05]">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Повторы</span>
              <span className="text-sm font-black font-mono text-white">{reps}</span>
            </div>
            <div className="p-2 rounded-2xl bg-black/40 border border-white/[0.05]">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">RPE Нагрузка</span>
              <span className="text-sm font-black font-mono text-amber-400">{rpe}/10</span>
            </div>
          </div>
        </div>

        {/* 4. КИНЕТИЧЕСКАЯ КАРТОЧКА УПРАЖНЕНИЯ Со СТЕППЕРАМИ */}
        <div className="bg-white/[0.04] rounded-3xl p-4 border border-white/[0.08] backdrop-blur-xl space-y-3.5 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Жим штанги лежа</h4>
                <p className="text-[10px] text-slate-400 font-mono">Грудные • Базовое упражнение</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsExerciseDone(!isExerciseDone);
                try {
                  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
                } catch (e) {}
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                isExerciseDone
                  ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/30 font-black'
                  : 'bg-white/[0.08] text-slate-300 hover:bg-white/[0.12] border border-white/[0.08]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isExerciseDone ? 'Зачтено' : 'Зачесть'}</span>
            </button>
          </div>

          {/* СТЕППЕРЫ: СЕТЫ, ПОВТОРЫ, ВЕС */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Повторы */}
            <div className="p-3 bg-black/40 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Повторения</span>
                <span className="text-[10px] font-mono font-bold text-slate-400">×{reps}</span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setReps(r => Math.max(1, (Number(r) || 0) - 1))}
                  className="w-8 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-black text-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-black font-mono text-white">{reps}</span>
                <button
                  type="button"
                  onClick={() => setReps(r => (Number(r) || 0) + 1)}
                  className="w-8 h-8 rounded-xl bg-white/[0.15] hover:bg-white/[0.25] text-white font-black text-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Вес */}
            <div className="p-3 bg-black/40 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Вес (кг)</span>
                <span className="text-[10px] font-mono font-bold text-[#CCFF00]">+{weight} кг</span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWeight(w => Math.max(0, Math.round(((Number(w) || 0) - 2.5) * 10) / 10))}
                  className="w-8 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-black text-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => {
                    const clean = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                    setWeight(clean === '' ? '' : parseFloat(clean));
                  }}
                  className="w-14 text-center text-base font-black font-mono text-[#CCFF00] bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setWeight(w => Math.round(((Number(w) || 0) + 2.5) * 10) / 10)}
                  className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* ШКАЛА RPE (ОТКАЗ / ЗАПАС СИЛ) */}
          <div className="p-3 bg-black/30 rounded-2xl border border-white/[0.05] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Шкала интенсивности RPE:
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {rpe === 10 ? 'Максимум (Отказ)' : rpe >= 8 ? `Тяжело (${10 - rpe} в запасе)` : 'Умеренно'}
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-1.5">
              {[6, 7, 8, 9, 10].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRpe(val)}
                  className={`py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    rpe === val
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                      : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.1]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. ИНТЕРАКТИВНЫЙ ТАЙМЕР ОТДЫХА С ПУЛЬСАЦИЕЙ */}
        <div className="bg-gradient-to-r from-blue-900/30 via-slate-900/40 to-emerald-900/20 rounded-3xl p-4 border border-blue-500/30 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-mono font-black text-sm transition-all ${
              isTimerRunning 
                ? 'bg-[#CCFF00] text-black border-[#CCFF00] animate-pulse shadow-lg shadow-[#CCFF00]/30' 
                : 'bg-white/[0.08] text-white border-white/[0.1]'
            }`}>
              {timerSeconds}с
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Таймер отдыха</span>
                {isTimerRunning && <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {isTimerRunning ? 'Идёт отсчет восстановления' : 'Пауза между подходами'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md ${
                isTimerRunning 
                  ? 'bg-amber-500 text-black' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(90);
              }}
              className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 font-bold active:scale-90 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 6. ПАРЯЩИЙ DYNAMIC DOCK (ФУТУРИСТИЧЕСКАЯ ПАНЕЛЬ ДЕЙСТВИЙ) */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
        <div className="bg-[#121824]/90 backdrop-blur-2xl border border-white/[0.15] rounded-3xl p-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block leading-tight">План атлета</span>
              <span className="text-xs font-bold text-white leading-tight">День 1: Готов</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              try {
                window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
              } catch (e) {}
              alert('⚡ План тренировки отправлен подопечному в Telegram!');
            }}
            className="py-3 px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs rounded-2xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg shadow-blue-600/40"
          >
            <Zap className="w-4 h-4 text-[#CCFF00] fill-current" />
            <span>Синхронизировать</span>
          </button>
        </div>
      </div>

    </div>
  );
}
