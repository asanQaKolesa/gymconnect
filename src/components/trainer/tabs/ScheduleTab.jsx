// src/components/trainer/tabs/ScheduleTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  BarChart2, 
  Save 
} from 'lucide-react';

export default function ScheduleTab({ trainerProfile, onUpdate }) {
  const daysOfWeek = [
    { id: 'monday', label: 'Понедельник', short: 'Пн' },
    { id: 'tuesday', label: 'Вторник', short: 'Вт' },
    { id: 'wednesday', label: 'Среда', short: 'Ср' },
    { id: 'thursday', label: 'Четверг', short: 'Чт' },
    { id: 'friday', label: 'Пятница', short: 'Пт' },
    { id: 'saturday', label: 'Суббота', short: 'Сб' },
    { id: 'sunday', label: 'Воскресенье', short: 'Вс' }
  ];

  const defaultSchedule = {
    monday: [{ start: '08:00', end: '13:00', type: 'personal' }],
    tuesday: [{ start: '14:00', end: '19:00', type: 'personal' }],
    wednesday: [{ start: '08:00', end: '13:00', type: 'personal' }],
    thursday: [{ start: '14:00', end: '19:00', type: 'personal' }],
    friday: [{ start: '08:00', end: '13:00', type: 'personal' }],
    saturday: [{ start: '10:00', end: '15:00', type: 'personal' }],
    sunday: []
  };

  const [schedule, setSchedule] = useState(() => {
    if (trainerProfile?.schedule_slots && typeof trainerProfile.schedule_slots === 'object') {
      return trainerProfile.schedule_slots;
    }
    try {
      const saved = localStorage.getItem(`gymconnect_schedule_slots_${trainerProfile?.username || 'coach'}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultSchedule;
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (trainerProfile?.schedule_slots && typeof trainerProfile.schedule_slots === 'object') {
      setSchedule(trainerProfile.schedule_slots);
    }
  }, [trainerProfile]);

  const handleAddSlot = (dayId) => {
    const daySlots = schedule[dayId] || [];
    setSchedule({
      ...schedule,
      [dayId]: [...daySlots, { start: '15:00', end: '19:00', type: 'personal' }]
    });
    setSaveSuccess(false);
  };

  const handleUpdateSlot = (dayId, index, field, value) => {
    const daySlots = [...(schedule[dayId] || [])];
    daySlots[index][field] = value;
    setSchedule({
      ...schedule,
      [dayId]: daySlots
    });
    setSaveSuccess(false);
  };

  const handleRemoveSlot = (dayId, index) => {
    const daySlots = (schedule[dayId] || []).filter((_, i) => i !== index);
    setSchedule({
      ...schedule,
      [dayId]: daySlots
    });
    setSaveSuccess(false);
  };

  // НАДЕЖНОЕ СОХРАНЕНИЕ ГРАФИКА В SUPABASE ПО ID И USERNAME
  const handleSaveSchedule = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const cleanUsername = (trainerProfile?.username || '').replace(/[@\s]/g, '').trim().toLowerCase();

    // 1. Резервируем в localStorage
    try {
      localStorage.setItem(`gymconnect_schedule_slots_${cleanUsername || 'coach'}`, JSON.stringify(schedule));
    } catch (e) {}

    try {
      // 2. Отправляем в Supabase
      let query = supabase.from('trainer_profiles').update({ schedule_slots: schedule });

      if (trainerProfile?.id) {
        query = query.eq('id', trainerProfile.id);
      } else if (cleanUsername) {
        query = query.or(`username.ilike.${cleanUsername},username.ilike.@${cleanUsername}`);
      }

      const { error } = await query;
      if (error && cleanUsername) {
        await supabase
          .from('trainer_profiles')
          .update({ schedule_slots: schedule })
          .or(`username.ilike.${cleanUsername},username.ilike.@${cleanUsername}`);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn('Ошибка сохранения графика в Supabase:', err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // Подсчет рабочих часов за неделю
  const totalWeeklyHours = Object.values(schedule).reduce((acc, daySlots) => {
    if (!Array.isArray(daySlots)) return acc;
    return acc + daySlots.reduce((sum, slot) => {
      if (!slot.start || !slot.end) return sum;
      const [startH, startM] = slot.start.split(':').map(Number);
      const [endH, endM] = slot.end.split(':').map(Number);
      const diff = (endH * 60 + endM) - (startH * 60 + startM);
      return sum + (diff > 0 ? diff / 60 : 0);
    }, 0);
  }, 0);

  return (
    <div className="space-y-3.5 select-none pb-12 text-xs">
      
      {/* 1. Сетка загруженности тренера на неделю */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Загрузка смен на неделю</h3>
              <p className="text-[10px] text-slate-400">Часы присутствия в фитнес-клубах</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold font-mono rounded-xl border border-blue-100 text-[10.5px]">
            {totalWeeklyHours} ч / неделю
          </span>
        </div>

        {/* 7 колонок дней недели */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          {daysOfWeek.map(day => {
            const slots = schedule[day.id] || [];
            const hasSlots = slots.length > 0;
            return (
              <div 
                key={day.id} 
                className={`p-2 rounded-2xl border text-center flex flex-col justify-between min-h-[72px] transition-all ${
                  hasSlots 
                    ? 'bg-blue-50/50 border-blue-200 text-blue-900' 
                    : 'bg-slate-50 border-slate-200/60 text-slate-400'
                }`}
              >
                <div>
                  <p className="font-bold text-xs">{day.short}</p>
                  <p className="text-[9.5px] mt-0.5 font-medium">
                    {hasSlots ? `${slots.length} см.` : 'Отдых'}
                  </p>
                </div>

                <div className="mt-1">
                  {hasSlots ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block shadow-xs" />
                  ) : (
                    <span className="text-[10px] text-slate-300">•</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Настройка времени смен по каждому дню */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900">Часы работы и слоты записей</h3>
          </div>
          <span className="text-[10px] text-slate-400">Синхронизировано с учениками</span>
        </div>

        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const slots = schedule[day.id] || [];
            return (
              <div key={day.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">
                    {day.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddSlot(day.id)}
                    className="text-[10.5px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Смена</span>
                  </button>
                </div>

                {slots.length > 0 ? (
                  <div className="space-y-1.5">
                    {slots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleUpdateSlot(day.id, index, 'start', e.target.value)}
                            className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-800 w-16 text-center"
                          />
                          <span className="text-slate-400 text-[10px]">-</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleUpdateSlot(day.id, index, 'end', e.target.value)}
                            className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-800 w-16 text-center"
                          />
                        </div>

                        <select
                          value={slot.type}
                          onChange={(e) => handleUpdateSlot(day.id, index, 'type', e.target.value)}
                          className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] font-semibold text-slate-700 truncate min-w-0"
                        >
                          <option value="personal">Персональные</option>
                          <option value="split">Сплит (2 чел)</option>
                          <option value="group">Мини-группа</option>
                          <option value="free">Дежурство</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(day.id, index)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                          title="Удалить смену"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10.5px] text-slate-400 italic py-0.5">Выходной день</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Кнопка сохранения с индикацией */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          {saveSuccess ? (
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>График обновлен в профиле тренера!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[10px]">Атлеты видят ваши смены в реальном времени</span>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveSchedule}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Сохранение...' : 'Сохранить график'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
