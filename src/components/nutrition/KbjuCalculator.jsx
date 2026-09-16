import React, { useState } from 'react';

export default function KbjuCalculator({ initialWeight = 75, initialGoal = 'recomp', onSaveKbju, isSaving }) {
  const [weight, setWeight] = useState(initialWeight);
  const [goal, setGoal] = useState(initialGoal); // 'muscle' | 'cut' | 'relief' | 'recomp'
  const [activity, setActivity] = useState(1.4); // 1.2, 1.4, 1.6

  // Коэффициенты под цели
  const getGoalData = () => {
    switch (goal) {
      case 'muscle':
        return { label: 'Набор чистой массы', mult: 35, p: 2.0, f: 0.9 };
      case 'cut':
        return { label: 'Агрессивная сушка', mult: 25, p: 2.3, f: 0.8 };
      case 'relief':
        return { label: 'Плавный рельеф / Дефицит', mult: 28, p: 2.2, f: 0.9 };
      case 'recomp':
      default:
        return { label: 'Рекомпозиция (сжигание жира + тонус)', mult: 31, p: 2.1, f: 0.9 };
    }
  };

  const currentConf = getGoalData();
  const calories = Math.round(weight * currentConf.mult * (activity / 1.4));
  const protein = Math.round(weight * currentConf.p);
  const fat = Math.round(weight * currentConf.f);
  const carbs = Math.max(50, Math.round((calories - (protein * 4 + fat * 9)) / 4));

  const handleSave = () => {
    if (onSaveKbju) {
      onSaveKbju({
        weight,
        goal,
        calories,
        protein,
        fat,
        carbs
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Параметры атлета</h3>
          <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
            {weight} кг
          </span>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Вес тела (кг)</label>
          <input
            type="range"
            min="50"
            max="125"
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Тренировочная цель</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGoal('muscle')}
              className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                goal === 'muscle'
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              💪 Набор массы
            </button>
            <button
              type="button"
              onClick={() => setGoal('relief')}
              className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                goal === 'relief'
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              ⚡ Плавный рельеф
            </button>
            <button
              type="button"
              onClick={() => setGoal('recomp')}
              className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                goal === 'recomp'
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              ⚖️ Рекомпозиция
            </button>
            <button
              type="button"
              onClick={() => setGoal('cut')}
              className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                goal === 'cut'
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              🔥 Сушка
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Уровень активности в залах</label>
          <select
            value={activity}
            onChange={e => setActivity(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value={1.2}>3 тренировки в неделю (умеренно)</option>
            <option value={1.4}>4-5 силовых тренировок (активно)</option>
            <option value={1.6}>Тяжелые тренировки + кардио (высокая)</option>
          </select>
        </div>
      </div>

      {/* Результаты расчета */}
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Суточная норма:</h3>
          <span className="text-[10px] text-slate-400">{currentConf.label}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Ккал</p>
            <p className="text-base font-black text-amber-400 mt-0.5">{calories}</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Белки</p>
            <p className="text-base font-black text-emerald-400 mt-0.5">{protein}г</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Жиры</p>
            <p className="text-base font-black text-sky-400 mt-0.5">{fat}г</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Углеводы</p>
            <p className="text-base font-black text-purple-400 mt-0.5">{carbs}г</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg shadow-amber-500/20"
        >
          {isSaving ? 'Сохранение...' : '💾 Сохранить расчет в Личный кабинет'}
        </button>
      </div>
    </div>
  );
}
