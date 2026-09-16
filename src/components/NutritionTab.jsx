import React, { useState } from 'react';

export default function NutritionTab({ onOpenDoc }) {
  // Внутренние разделы: 'calc' (КБЖУ) | 'basket' (Корзина) | 'supps' (Спортпит)
  const [subTab, setSubTab] = useState('calc');

  // Базовые параметры атлета
  const [weight, setWeight] = useState(75);
  const [goal, setGoal] = useState('muscle'); // 'muscle' | 'cut' | 'maintain'

  // Расчет КБЖУ
  const getMultiplier = () => {
    if (goal === 'muscle') return 36;
    if (goal === 'cut') return 27;
    return 32;
  };

  const calories = Math.round(weight * getMultiplier());
  const protein = Math.round(weight * (goal === 'cut' ? 2.3 : 2.0));
  const fat = Math.round(weight * 0.9);
  const carbs = Math.max(50, Math.round((calories - (protein * 4 + fat * 9)) / 4));

  // Расчет корзины продуктов на день
  const meatGrams = Math.round(weight * 5.0); // граммы филе грудки / индейки в сыром весе
  const dryCarbsGrams = Math.round(carbs * 1.35); // крупы в сухом виде (чечевица, рис, гречка)
  const eggsCount = goal === 'muscle' ? 3 : 2;
  const waterLiters = (weight * 0.035).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Бейдж PRO Доступа */}
      <div className="bg-gradient-to-r from-amber-500/20 to-slate-900 p-3 rounded-2xl border border-amber-500/30 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-amber-400">🥗 Нутрициология & Спортпит PRO</p>
          <p className="text-[10px] text-slate-400">Персональный рацион под вес и тренировочные цели</p>
        </div>
        <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">PRO Тест</span>
      </div>

      {/* Навигация по 3 подразделам */}
      <div className="flex gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          onClick={() => setSubTab('calc')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition cursor-pointer ${
            subTab === 'calc'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🧮 КБЖУ
        </button>
        <button
          onClick={() => setSubTab('basket')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition cursor-pointer ${
            subTab === 'basket'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🛒 Корзина
        </button>
        <button
          onClick={() => setSubTab('supps')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition cursor-pointer ${
            subTab === 'supps'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚡ Спортпит
        </button>
      </div>

      {/* Выбор веса и цели (общий для всех вкладок) */}
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Текущий вес</span>
          <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
            {weight} кг
          </span>
        </div>

        <input
          type="range"
          min="50"
          max="125"
          value={weight}
          onChange={e => setWeight(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => setGoal('muscle')}
            className={`py-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
              goal === 'muscle'
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            💪 Набор массы
          </button>
          <button
            onClick={() => setGoal('maintain')}
            className={`py-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
              goal === 'maintain'
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            ⚖️ Баланс
          </button>
          <button
            onClick={() => setGoal('cut')}
            className={`py-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
              goal === 'cut'
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            🔥 Сушка
          </button>
        </div>
      </div>

      {/* ================= 1. ПОДРАЗДЕЛ: РАСЧЕТ КБЖУ ================= */}
      {subTab === 'calc' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Суточная норма КБЖУ</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Калории</p>
                <p className="text-base font-black text-amber-400 mt-0.5">{calories}</p>
                <p className="text-[9px] text-slate-500">ккал</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Белки</p>
                <p className="text-base font-black text-emerald-400 mt-0.5">{protein}г</p>
                <p className="text-[9px] text-slate-500">~2г/кг</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Жиры</p>
                <p className="text-base font-black text-sky-400 mt-0.5">{fat}г</p>
                <p className="text-[9px] text-slate-500">~0.9г/кг</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Углеводы</p>
                <p className="text-base font-black text-purple-400 mt-0.5">{carbs}г</p>
                <p className="text-[9px] text-slate-500">энергия</p>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">💡 Рекомендация по приему:</p>
              <p>• Разделите полученные белки и углеводы на <b>3–4 основных приема пищи</b>.</p>
              <p>• Основную часть углеводов съедайте на завтрак и за 1.5–2 часа до силовой тренировки.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. ПОДРАЗДЕЛ: ПРОДУКТОВАЯ КОРЗИНА ================= */}
      {subTab === 'basket' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Граммовки на день (сырой вес)
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                На {weight} кг
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">🍗 Филе курицы / индейки</p>
                  <p className="text-[11px] text-slate-400">Идеально в аэрогриле или на пару</p>
                </div>
                <span className="text-sm font-black text-amber-400">~{meatGrams} г</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">🍚 Зеленая чечевица / Рис / Гречка</p>
                  <p className="text-[11px] text-slate-400">Взвешивать в сухом виде до варки</p>
                </div>
                <span className="text-sm font-black text-emerald-400">~{dryCarbsGrams} г</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">🥚 Куриные яйца (C0 / C1)</p>
                  <p className="text-[11px] text-slate-400">Яичница, омлет или вареные</p>
                </div>
                <span className="text-sm font-black text-sky-400">{eggsCount} шт</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">💧 Чистая питьевая вода</p>
                  <p className="text-[11px] text-slate-400">Без учета чая, кофе и супов</p>
                </div>
                <span className="text-sm font-black text-blue-400">~{waterLiters} л</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. ПОДРАЗДЕЛ: СПОРТИВНЫЕ ДОБАВКИ ================= */}
      {subTab === 'supps' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Рекомендуемый стек и тайминг
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Утро */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-400">🌅 Утром (после завтрака)</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">База</span>
                </div>
                <p className="text-slate-300">
                  • <b>Креатин моногидрат:</b> 5–10 г. Накопительный эффект, повышает АТФ и силовую выносливость.<br/>
                  • <b>Омега-3 + Витамин D3:</b> поддержка суставов, связок и сердечно-сосудистой системы.
                </p>
              </div>

              {/* До тренировки */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-400">⚡ За 30 мин до тренировки</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Сила и памп</span>
                </div>
                <p className="text-slate-300">
                  • <b>L-Цитруллин малат:</b> 6–8 г (расширяет сосуды, дает мощный памп и доставку нутриентов).<br/>
                  • <b>Бета-аланин:</b> 3–4 г (буферизует молочную кислоту, отодвигает мышечный отказ).<br/>
                  • <b>L-Карнитин:</b> 1.5–2 г (транспорт жирных кислот и выносливость).
                </p>
              </div>

              {/* После тренировки */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-400">💪 Сразу после тренировки</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Восстановление</span>
                </div>
                <p className="text-slate-300">
                  • <b>Сывороточный протеин (Whey) + BCAA:</b> 1 мерный скуп (25–30г белка) для закрытия белкового окна.<br/>
                  • <b>Глютамин:</b> 5 г (ускорение регенерации мышечных волокон и поддержка иммунитета).
                </p>
              </div>

              {/* Перед сном */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-400">🌙 Перед сном</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Антистресс</span>
                </div>
                <p className="text-slate-300">
                  • <b>Ашваганда (KSM-66):</b> 300–600 мг (снижение кортизола, глубокий сон и восстановление ЦНС).<br/>
                  • <b>Магний (хелат / глицинат):</b> 400 мг (снятие мышечного тонуса и судорог).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Медицинский дисклеймер */}
      <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60 text-[11px] text-slate-400 text-center">
        ⚠️ Расчет и стек добавок носят ознакомительный характер.{' '}
        <button
          type="button"
          onClick={() => onOpenDoc('disclaimer')}
          className="text-amber-400 underline font-medium cursor-pointer"
        >
          Медицинский отказ от ответственности
        </button>.
      </div>
    </div>
  );
}
