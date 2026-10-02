import React from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { SPLIT_ARCHITECTURES } from '../student-detail/exercisesData';

export default function SplitDaysTabs({
  daysCount,
  setDaysCount,
  activeDayIndex,
  setActiveDayIndex,
  daysWorkouts,
  setDaysWorkouts
}) {
  const handleSplitPresetChange = (presetId) => {
    const preset = SPLIT_ARCHITECTURES.find(p => p.id === presetId);
    if (!preset) return;

    setDaysCount(preset.days);
    setActiveDayIndex(0);

    // Resize array
    setDaysWorkouts(prev => {
      const newWorkouts = [...prev];
      if (newWorkouts.length < preset.days) {
        for (let i = newWorkouts.length; i < preset.days; i++) {
          newWorkouts.push({ title: `День ${i + 1}`, exercises: [] });
        }
      } else if (newWorkouts.length > preset.days) {
        newWorkouts.length = preset.days;
      }
      return newWorkouts;
    });
  };

  const handleCustomDaysCount = (delta) => {
    const newCount = Math.max(1, Math.min(7, daysCount + delta));
    if (newCount === daysCount) return;

    setDaysCount(newCount);
    if (activeDayIndex >= newCount) setActiveDayIndex(newCount - 1);

    setDaysWorkouts(prev => {
      const newWorkouts = [...prev];
      if (newWorkouts.length < newCount) {
        for (let i = newWorkouts.length; i < newCount; i++) {
          newWorkouts.push({ title: `День ${i + 1}`, exercises: [] });
        }
      } else if (newWorkouts.length > newCount) {
        newWorkouts.length = newCount;
      }
      return newWorkouts;
    });
  };

  const updateDayTitle = (newTitle) => {
    setDaysWorkouts(prev => {
      const nw = [...prev];
      nw[activeDayIndex] = { ...nw[activeDayIndex], title: newTitle };
      return nw;
    });
  };

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 p-4 space-y-4">
      {/* Split Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <select
            className="w-full appearance-none pl-3 pr-8 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors"
            onChange={(e) => handleSplitPresetChange(e.target.value)}
            defaultValue="custom"
          >
            <option value="custom" disabled className="text-neutral-500">Выберите сплит-систему...</option>
            {SPLIT_ARCHITECTURES.map(split => (
              <option key={split.id} value={split.id}>{split.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Custom Days Stepper */}
        <div className="flex items-center gap-3 shrink-0 bg-neutral-800 p-1 rounded-xl border border-neutral-700">
          <span className="text-xs text-neutral-400 pl-2">Дней:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCustomDaysCount(-1)}
              className="w-7 h-7 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold text-white">{daysCount}</span>
            <button
              onClick={() => handleCustomDaysCount(1)}
              className="w-7 h-7 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {Array.from({ length: daysCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveDayIndex(i)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex-1 min-w-[100px] text-center ${
              activeDayIndex === i
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-neutral-700'
            }`}
          >
            День {i + 1}
          </button>
        ))}
      </div>

      {/* Editable Day Title */}
      <div>
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
          Название тренировочного дня:
        </label>
        <input
          type="text"
          value={daysWorkouts[activeDayIndex]?.title || ''}
          onChange={(e) => updateDayTitle(e.target.value)}
          placeholder={`Например: Спина + Бицепс`}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
}
