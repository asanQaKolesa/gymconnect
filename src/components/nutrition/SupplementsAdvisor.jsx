import React, { useState } from 'react';

export default function SupplementsAdvisor({ onOpenDoc }) {
  // Цели атлета в спортпите
  const [goals, setGoals] = useState({
    strength: true, // Сила и наполненность
    pump: false,    // Памп и выносливость
    recovery: true, // Быстрое восстановление
    antiStress: false // Глубокий сон и ЦНС
  });

  const toggleGoal = (key) => {
    setGoals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {/* Интерактивная анкета целей */}
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Выбери свои приоритеты:
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => toggleGoal('strength')}
            className={`p-2.5 text-xs font-bold rounded-2xl border text-left flex items-center gap-2 transition ${
              goals.strength
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <span>💥</span> Сила & АТФ
          </button>

          <button
            type="button"
            onClick={() => toggleGoal('pump')}
            className={`p-2.5 text-xs font-bold rounded-2xl border text-left flex items-center gap-2 transition ${
              goals.pump
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <span>⚡</span> Памп & Сосуды
          </button>

          <button
            type="button"
            onClick={() => toggleGoal('recovery')}
            className={`p-2.5 text-xs font-bold rounded-2xl border text-left flex items-center gap-2 transition ${
              goals.recovery
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <span>🛡</span> Восстановление
          </button>

          <button
            type="button"
            onClick={() => toggleGoal('antiStress')}
            className={`p-2.5 text-xs font-bold rounded-2xl border text-left flex items-center gap-2 transition ${
              goals.antiStress
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <span>🌙</span> Сон & Снижение стресса
          </button>
        </div>
      </div>

      {/* Персональный протокол приема */}
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Персональный протокол добавок:
        </h3>

        <div className="space-y-2.5 text-xs">
          {goals.strength && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400">Креатин моногидрат</span>
                <span className="text-[10px] text-slate-500">Каждое утро</span>
              </div>
              <p className="text-slate-300">
                • <b>Дозировка:</b> 5–10 г ежедневно (запивать теплой водой или соком).<br/>
                • <b>Курс:</b> Непрерывно 2–3 месяца, далее перерыв 3 недели.
              </p>
            </div>
          )}

          {goals.pump && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400">L-Цитруллин + Бета-аланин</span>
                <span className="text-[10px] text-slate-500">За 30 мин до зала</span>
              </div>
              <p className="text-slate-300">
                • <b>Цитруллин:</b> 6–8 г (расширение сосудов, мощный приток крови к мышцам).<br/>
                • <b>Бета-аланин:</b> 3–4 г (блокирует мышечное закисление, +2-3 повтора в подходе).
              </p>
            </div>
          )}

          {goals.recovery && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400">Whey Протеин + Глютамин</span>
                <span className="text-[10px] text-slate-500">После тренировки</span>
              </div>
              <p className="text-slate-300">
                • <b>Сывороточный протеин:</b> 1 скуп (30г чистого белка).<br/>
                • <b>Глютамин:</b> 5 г (ускоряет регенерацию микроразрывов волокон).
              </p>
            </div>
          )}

          {goals.antiStress && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400">Ашваганда (KSM-66) + Магний</span>
                <span className="text-[10px] text-slate-500">За 40 мин до сна</span>
              </div>
              <p className="text-slate-300">
                • <b>Ашваганда:</b> 500 мг (снижает кортизол, предотвращает катаболизм).<br/>
                • <b>Магний глицинат:</b> 400 мг (глубокая фаза сна, расслабление мышц).
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60 text-[11px] text-slate-400 text-center">
        ⚠️ Не является лекарственным средством.{' '}
        <button
          type="button"
          onClick={() => onOpenDoc('disclaimer')}
          className="text-amber-400 underline font-medium cursor-pointer"
        >
          Медицинский дисклеймер
        </button>.
      </div>
    </div>
  );
}
