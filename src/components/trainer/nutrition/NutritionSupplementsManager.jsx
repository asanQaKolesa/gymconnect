// src/components/trainer/nutrition/NutritionSupplementsManager.jsx
import React, { useState } from 'react';
import { Pill, Plus, Trash2, AlertTriangle, ShieldCheck, Clock, Check } from 'lucide-react';

export default function NutritionSupplementsManager({ supplements = [], setSupplements }) {
  const [activeCategory, setActiveCategory] = useState('sportpit'); // 'sportpit' | 'bady'

  // Каталог пресетов спортпита
  const sportpitCatalog = [
    { name: 'Креатин моногидрат', dosage: '5 г', timing: 'Утром после завтрака или после тренировки', duration: '30 дней приём / 30 дней перерыв' },
    { name: 'Сывороточный протеин (WHEY)', dosage: '30 г (1 порция)', timing: 'Между приёмами пищи или после тренировки', duration: 'Постоянно в дни недобора белка' },
    { name: 'Аминокислоты BCAA / EAA', dosage: '10 г', timing: 'Во время тренировки с водой', duration: 'В период интенсивных тренировок' },
    { name: 'Цитруллин малат', dosage: '6-8 г', timing: 'За 30 минут до тренировки', duration: 'Курс 4-6 недель' },
    { name: 'Бета-аланин', dosage: '3-4 г', timing: 'Перед тренировкой (курсом)', duration: 'Курс 6-8 недель' },
    { name: 'L-карнитин', dosage: '1500-2000 мг', timing: 'За 20 минут до кардиотренировки', duration: 'В период снижения жировой массы' },
    { name: 'Глютамин', dosage: '5 г', timing: 'После тренировки или перед сном', duration: 'Курс 30 дней для иммунитета и ЖКТ' },
    { name: 'L-аргинин', dosage: '3000 мг', timing: 'За 30 минут до нагрузки', duration: 'Курс 30 дней' }
  ];

  // Каталог пресетов витаминов и БАД
  const badyCatalog = [
    { name: 'Омега-3 (EPA/DHA)', dosage: '1000 мг активных EPA/DHA', timing: 'Утром во время или сразу после еды', duration: 'Курс 60-90 дней' },
    { name: 'Витамин D3', dosage: '2000-5000 ME', timing: 'Утром с жиросодержащей пищей', duration: 'По результатам анализа 25-OH' },
    { name: 'Магний хелат (бисглицинат)', dosage: '400 мг', timing: 'Вечером за 40 минут до сна', duration: 'Курс 30-45 дней' },
    { name: 'Цинк пиколинат', dosage: '25 мг', timing: 'После еды (не натощак)', duration: 'Курс 30 дней' },
    { name: 'Мультивитаминный комплекс', dosage: '1 порция по инструкции', timing: 'Утром после завтрака', duration: 'Курс 30 дней' },
    { name: 'Коэнзим Q10', dosage: '100 мг', timing: 'Утром во время еды', duration: 'Курс 60 дней' },
    { name: 'Ашваганда KSM-66', dosage: '500 мг', timing: 'Вечером для снижения кортизола', duration: 'Курс 30-45 дней' }
  ];

  const currentPresets = activeCategory === 'sportpit' ? sportpitCatalog : badyCatalog;

  const [formSupplement, setFormSupplement] = useState({
    name: sportpitCatalog[0].name,
    dosage: sportpitCatalog[0].dosage,
    timing: sportpitCatalog[0].timing,
    duration: sportpitCatalog[0].duration,
    category: 'sportpit'
  });

  const handleSelectPreset = (item) => {
    setFormSupplement({
      name: item.name,
      dosage: item.dosage,
      timing: item.timing,
      duration: item.duration,
      category: activeCategory
    });
  };

  const handleAddSupplement = (e) => {
    e.preventDefault();
    if (!formSupplement.name.trim()) return;

    setSupplements([
      ...supplements,
      {
        id: Date.now(),
        ...formSupplement
      }
    ]);
  };

  const handleRemove = (id) => {
    setSupplements(supplements.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 select-none">
      
      {/* Шапка блока */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Спортпит и БАДы (Курсы и дозировки)</h3>
          <p className="text-[10px] text-slate-400 font-medium">Протоколы приёма и паузы между курсами</p>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
          {supplements.length} назн.
        </span>
      </div>

      {/* КЛИНИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ: НЕ ПРИНИМАТЬ НАТОЩАК */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-800">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
            Важное правило приёма добавок:
          </span>
          <p className="text-[10.5px] text-slate-600 font-normal">
            Креатин, цитруллин, витамины и жирные кислоты <b>нельзя принимать на голодный желудок</b> во избежание раздражения слизистой ЖКТ. Приём строго во время или после еды.
          </p>
        </div>
      </div>

      {/* Список уже назначенных добавок */}
      <div className="space-y-2">
        {supplements.length > 0 ? (
          supplements.map(item => (
            <div 
              key={item.id}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                    {item.category === 'bady' ? 'Витамины / БАД' : 'Спортпит'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Удалить назначение"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-600 pt-0.5">
                <p><b>Дозировка:</b> {item.dosage}</p>
                <p><b>Курс:</b> {item.duration}</p>
              </div>

              <p className="text-[10.5px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                <b>Когда принимать:</b> {item.timing}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center py-4 text-slate-400 text-xs">
            Добавки ещё не назначены. Выберите из каталога ниже.
          </p>
        )}
      </div>

      {/* Переключатель категорий: Спортпит vs БАДы */}
      <div className="pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Каталог добавок наставника:
        </span>
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveCategory('sportpit');
              handleSelectPreset(sportpitCatalog[0]);
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'sportpit' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            Спортивное питание ({sportpitCatalog.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('bady');
              handleSelectPreset(badyCatalog[0]);
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'bady' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            Витамины и БАДы ({badyCatalog.length})
          </button>
        </div>
      </div>

      {/* Быстрые чипсы готовых добавок */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {currentPresets.map(preset => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className={`px-2.5 py-1 rounded-xl text-[10.5px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
              formSupplement.name === preset.name
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Форма назначения добавки */}
      <form onSubmit={handleAddSupplement} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
        <div>
          <label className="text-[10px] text-slate-400 font-medium block mb-1">Название добавки:</label>
          <input
            type="text"
            required
            value={formSupplement.name}
            onChange={(e) => setFormSupplement({ ...formSupplement, name: e.target.value })}
            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 font-medium block mb-1">Порция / Дозировка:</label>
            <input
              type="text"
              required
              value={formSupplement.dosage}
              onChange={(e) => setFormSupplement({ ...formSupplement, dosage: e.target.value })}
              placeholder="5 г / 1 порция"
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-medium block mb-1">Длительность курса:</label>
            <input
              type="text"
              required
              value={formSupplement.duration}
              onChange={(e) => setFormSupplement({ ...formSupplement, duration: e.target.value })}
              placeholder="30 дней приём / 30 дней пауза"
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-medium block mb-1">Тайминг приёма:</label>
          <input
            type="text"
            required
            value={formSupplement.timing}
            onChange={(e) => setFormSupplement({ ...formSupplement, timing: e.target.value })}
            placeholder="Утром после еды, за 30 мин до тренировки..."
            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Назначить добавку подопечному</span>
        </button>
      </form>

    </div>
  );
}
