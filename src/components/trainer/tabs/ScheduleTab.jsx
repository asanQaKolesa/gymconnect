import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Calendar, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function ScheduleTab({ trainerProfile, onUpdate }) {
  const daysOfWeek = [
    { id: 'monday', label: 'Понедельник' },
    { id: 'tuesday', label: 'Вторник' },
    { id: 'wednesday', label: 'Среда' },
    { id: 'thursday', label: 'Четверг' },
    { id: 'friday', label: 'Пятница' },
    { id: 'saturday', label: 'Суббота' },
    { id: 'sunday', label: 'Воскресенье' }
  ];

  const [schedule, setSchedule] = useState(trainerProfile?.schedule_slots || {
    monday: [{ start: '07:00', end: '12:00', type: 'personal' }],
    tuesday: [],
    wednesday: [{ start: '07:00', end: '12:00', type: 'personal' }],
    thursday: [],
    friday: [{ start: '07:00', end: '12:00', type: 'personal' }],
    saturday: [],
    sunday: []
  });

  const [saving, setSaving] = useState(false);

  const handleAddSlot = (dayId) => {
    const daySlots = schedule[dayId] || [];
    setSchedule({
      ...schedule,
      [dayId]: [...daySlots, { start: '14:00', end: '18:00', type: 'personal' }]
    });
  };

  const handleUpdateSlot = (dayId, index, field, value) => {
    const daySlots = [...(schedule[dayId] || [])];
    daySlots[index][field] = value;
    setSchedule({
      ...schedule,
      [dayId]: daySlots
    });
  };

  const handleRemoveSlot = (dayId, index) => {
    const daySlots = (schedule[dayId] || []).filter((_, i) => i !== index);
    setSchedule({
      ...schedule,
      [dayId]: daySlots
    });
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('trainer_profiles')
      .update({ schedule_slots: schedule })
      .eq('id', trainerProfile.id);

    setSaving(false);
    if (error) {
      alert('Ошибка сохранения графика: ' + error.message);
    } else {
      alert('График работы в зале успешно сохранен!');
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">График присутствия в фитнес-зале</h3>
              <p className="text-[10px] text-slate-500">Укажите дни, время смен и тип занятий</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {daysOfWeek.map((day) => {
            const slots = schedule[day.id] || [];
            return (
              <div key={day.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {day.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddSlot(day.id)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
                  >
                    <Plus className="w-3 h-3" /> Добавить смену
                  </button>
                </div>

                {slots.length > 0 ? (
                  <div className="space-y-2">
                    {slots.map((slot, index) => (
                      <div key={index} className="flex flex-col md:flex-row items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-1.5 w-full md:w-auto">
                          <span className="text-[10px] text-slate-400">С</span>
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleUpdateSlot(day.id, index, 'start', e.target.value)}
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                          />
                          <span className="text-[10px] text-slate-400">До</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleUpdateSlot(day.id, index, 'end', e.target.value)}
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                          />
                        </div>

                        <div className="flex-1 w-full md:w-auto">
                          <select
                            value={slot.type}
                            onChange={(e) => handleUpdateSlot(day.id, index, 'type', e.target.value)}
                            className="w-full md:w-48 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                          >
                            <option value="personal">Персональные занятия</option>
                            <option value="group">Мини-группы</option>
                            <option value="split">Сплит тренировки</option>
                            <option value="free">Свободный график / Зал</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(day.id, index)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-auto md:ml-0"
                          title="Удалить смену"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">Выходной (нет смен в зале)</p>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleSaveSchedule}
          disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-xs"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{saving ? 'Сохранение расписания...' : 'Сохранить график работы в зале'}</span>
        </button>
      </div>
    </div>
  );
}
