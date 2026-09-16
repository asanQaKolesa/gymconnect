import React, { useState } from 'react';

export default function GroceryBasket({ weight = 75 }) {
  // Расчет суммарной потребности на 7 дней
  const meatKg = (weight * 0.035).toFixed(1); // ~2.5 - 3 кг мяса в неделю
  const carbsKg = (weight * 0.02).toFixed(1); // ~1.5 кг круп в сухом весе

  // Интерактивный список покупок с чекбоксами
  const [items, setItems] = useState([
    { id: 1, title: `Филе грудки курицы / индейки — ${meatKg} кг`, checked: false, cat: 'Белок' },
    { id: 2, title: 'Яйца куриные (C0/C1) — 2 десятка', checked: false, cat: 'Белок' },
    { id: 3, title: 'Зеленая чечевица / гречка / рис — 2 упаковки (~1.5 кг)', checked: false, cat: 'Углеводы' },
    { id: 4, title: 'Овсяные хлопья (долгой варки 15+ мин) — 1 пачка', checked: false, cat: 'Углеводы' },
    { id: 5, title: 'Овощи (брокколи, огурцы, помидоры, кабачки) — 2.5 кг', checked: false, cat: 'Клетчатка' },
    { id: 6, title: 'Оливковое масло Extra Virgin — 1 бут.', checked: false, cat: 'Жиры' },
    { id: 7, title: 'Миндаль или грецкие орехи (сырые) — 200 г', checked: false, cat: 'Жиры' },
    { id: 8, title: 'Бутилированная питьевая вода (5-6 л)', checked: false, cat: 'Гидратация' },
  ]);

  const toggleCheck = (id) => {
    setItems(items.map(it => it.id === id ? { ...it, checked: !it.checked } : it));
  };

  const boughtCount = items.filter(i => i.checked).length;

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Закупка продуктов на 7 дней
            </h3>
            <p className="text-[11px] text-slate-400">
              Куплено: <b className="text-amber-400">{boughtCount}</b> из {items.length}
            </p>
          </div>
          <span className="text-xl">🛒</span>
        </div>

        {/* Прогресс-бар покупок */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${(boughtCount / items.length) * 100}%` }}
          />
        </div>

        {/* Чек-лист */}
        <div className="space-y-2 pt-2 text-xs">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                item.checked
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  className="accent-amber-500 rounded cursor-pointer"
                />
                <span className={item.checked ? 'line-through text-slate-500' : 'text-slate-200'}>
                  {item.title}
                </span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                {item.cat}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
