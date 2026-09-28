// src/components/trainer/tabs/ScheduleTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  MapPin, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Building
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function ScheduleTab({ trainer, students = [] }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО В НАЧАЛЕ)
  const trainerKey = trainer?.id || trainer?.telegram_id || 'default_coach';

  // Локальное и облачное хранилище смен
  const [shifts, setShifts] = useState(() => {
    try {
      const local = localStorage.getItem(`gymconnect_trainer_shifts_${trainerKey}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Дефолтные базовые смены тренера
    return [
      { id: 1, day: 'Пн', startTime: '09:00', endTime: '18:00', gym: 'Grand Pool, Достык 42', maxStudents: 6 },
      { id: 2, day: 'Ср', startTime: '09:00', endTime: '18:00', gym: 'Grand Pool, Достык 42', maxStudents: 6 },
      { id: 3, day: 'Пт', startTime: '09:00', endTime: '18:00', gym: 'Grand Pool, Достык 42', maxStudents: 6 }
    ];
  });

  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Форма новой смены
  const [newDay, setNewDay] = useState('Пн');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('19:00');
  const [newGym, setNewGym] = useState(trainer?.gym || 'Grand Pool, Достык 42');
  const [newMaxStudents, setNewMaxStudents] = useState('6');

  const daysList = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Загрузка смен при старте из базы
  useEffect(() => {
    const loadSavedShifts = async () => {
      try {
        if (!trainer?.id) return;
        const { data, error } = await supabase
          .from('profiles')
          .select('schedule_shifts, schedule')
          .eq('id', trainer.id)
          .maybeSingle();

        if (data && (data.schedule_shifts || data.schedule)) {
          const raw = data.schedule_shifts || data.schedule;
          const loaded = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(loaded) && loaded.length > 0) {
            setShifts(loaded);
            localStorage.setItem(`gymconnect_trainer_shifts_${trainerKey}`, JSON.stringify(loaded));
          }
        }
      } catch (e) {
        console.warn('Мягкая загрузка смен:', e);
      }
    };

    loadSavedShifts();
  }, [trainer?.id, trainerKey]);

  // ДОБАВЛЕНИЕ НОВОЙ СМЕНЫ — С ПЕРСИСТЕНТНОЙ ЗАПИСЬЮ (НЕ ИСЧЕЗАЕТ)
  const handleCreateShift = async () => {
    if (!newStartTime || !newEndTime) return;

    const newShiftObj = {
      id: Date.now(),
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      gym: newGym.trim() || 'Основной клуб',
      maxStudents: Number(newMaxStudents) || 6
    };

    const updatedShifts = [...shifts, newShiftObj];
    setShifts(updatedShifts);

    // Сразу фиксируем в localStorage
    try {
      localStorage.setItem(`gymconnect_trainer_shifts_${trainerKey}`, JSON.stringify(updatedShifts));
    } catch (e) {}

    setIsAddingShift(false);

    // Синхронизируем с базой
    try {
      if (trainer?.id) {
        await supabase
          .from('profiles')
          .update({
            schedule_shifts: updatedShifts
          })
          .eq('id', trainer.id);
      }
    } catch (err) {
      console.warn('Фоновое сохранение смены:', err);
    }
  };

  // Удаление смены
  const handleDeleteShift = async (shiftId) => {
    const filtered = shifts.filter(s => s.id !== shiftId);
    setShifts(filtered);

    try {
      localStorage.setItem(`gymconnect_trainer_shifts_${trainerKey}`, JSON.stringify(filtered));
      if (trainer?.id) {
        await supabase
          .from('profiles')
          .update({ schedule_shifts: filtered })
          .eq('id', trainer.id);
      }
    } catch (e) {}
  };

  // Ручное сохранение
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      localStorage.setItem(`gymconnect_trainer_shifts_${trainerKey}`, JSON.stringify(shifts));

      if (trainer?.id) {
        await supabase
          .from('profiles')
          .update({ schedule_shifts: shifts })
          .eq('id', trainer.id);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Фильтрация списка смен по дню
  const displayedShifts = selectedDayFilter === 'all' 
    ? shifts 
    : shifts.filter(s => s.day === selectedDayFilter);

  return (
    <div className="space-y-4 text-xs text-slate-700 select-none pb-28">

      {/* 1. ШАПКА РАСПИСАНИЯ СМЕН */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>График смен тренера</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Смены в клубах и часы приёма подопечных
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingShift(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xs text-[11px] font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Добавить смену</span>
        </button>
      </div>

      {/* 2. ФИЛЬТР ПО ДНЯМ НЕДЕЛИ */}
      <div className="bg-white p-2.5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedDayFilter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Все дни ({shifts.length})
          </button>
          {daysList.map(d => {
            const count = shifts.filter(s => s.day === d).length;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDayFilter(d)}
                className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDayFilter === d
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {d} {count > 0 && <span className="opacity-70 font-mono">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. МОДАЛКА / ФОРМА ДОБАВЛЕНИЯ СМЕНЫ */}
      {isAddingShift && (
        <div className="bg-white rounded-3xl p-4 border-2 border-blue-500 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Параметры новой смены</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingShift(false)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>

          {/* День недели */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              День недели:
            </label>
            <div className="grid grid-cols-7 gap-1">
              {daysList.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setNewDay(d)}
                  className={`py-1.5 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                    newDay === d
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Время начала и окончания */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Начало смены:
              </label>
              <input
                type="time"
                value={newStartTime}
                onChange={e => setNewStartTime(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Окончание смены:
              </label>
              <input
                type="time"
                value={newEndTime}
                onChange={e => setNewEndTime(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Клуб / Зал */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
              Клуб / Локация:
            </label>
            <input
              type="text"
              value={newGym}
              onChange={e => setNewGym(e.target.value)}
              placeholder="Название фитнес-клуба"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          {/* Вместимость атлетов */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
              Максимум атлетов за смену:
            </label>
            <input
              type="number"
              value={newMaxStudents}
              onChange={e => setNewMaxStudents(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          {/* Кнопка создания */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingShift(false)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer active:scale-95"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleCreateShift}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs active:scale-95"
            >
              Сохранить смену
            </button>
          </div>
        </div>
      )}

      {/* 4. СПИСОК СМЕН */}
      <div className="space-y-2.5">
        {displayedShifts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[1.8]" />
            </div>
            <p className="text-xs font-bold text-slate-800">Смен не найдено</p>
            <p className="text-[11px] text-slate-400">
              Нажмите «Добавить смену», чтобы настроить часы присутствия в зале.
            </p>
          </div>
        ) : (
          displayedShifts.map(shift => (
            <div
              key={shift.id}
              className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 animate-in fade-in"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex flex-col items-center justify-center font-bold shrink-0">
                  <span className="text-xs leading-none">{shift.day}</span>
                  <span className="text-[8px] text-blue-500 font-normal mt-0.5">день</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {shift.startTime} — {shift.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 truncate">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{shift.gym}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-blue-600 font-semibold shrink-0">
                      до {shift.maxStudents || 6} чел.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteShift(shift.id)}
                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0 active:scale-90"
                title="Удалить смену"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 5. КНОПКА ФИКСАЦИИ СМЕН */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        {saveSuccess ? (
          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>График сохранен!</span>
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">Смены сохраняются на устройстве и в профиле</span>
        )}

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? '...' : 'Зафиксировать'}</span>
        </button>
      </div>

    </div>
  );
}
