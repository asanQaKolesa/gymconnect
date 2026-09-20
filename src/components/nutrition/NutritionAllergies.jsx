import React, { useState } from 'react';
import { ShieldX, Check, Plus, X } from 'lucide-react';

export default function NutritionAllergies() {
  const [allergens, setAllergens] = useState([
    { id: 'lactose', label: 'Лактоза (молочка)', active: true },
    { id: 'gluten', label: 'Глютен (пшеница)', active: false },
    { id: 'nuts', label: 'Орехи', active: true },
    { id: 'fish', label: 'Рыба и морепродукты', active: false },
    { id: 'eggs', label: 'Яйца', active: false },
  ]);
  const [customInput, setCustomInput] = useState('');

  const toggleAllergen = (id) => {
    setAllergens(allergens.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const addCustomAllergen = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      label: customInput.trim(),
      active: true
    };
    setAllergens([...allergens, newItem]);
    setCustomInput('');
  };

  const removeCustom = (id) => {
    setAllergens(allergens.filter(item => item.id !== id));
  };

  const activeCount = allergens.filter(a => a.active).length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
            <ShieldX className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Аллергии и исключения</h2>
            <p className="text-xs text-slate-400">Исключено продуктов: {activeCount}</p>
          </div>
        </div>
      </div>

      {/* Список чипсов-тегов для выбора */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {allergens.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleAllergen(item.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              item.active 
                ? 'bg-rose-50 text-rose-700 border border-rose-200/60 shadow-sm' 
                : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100'
            }`}
          >
            <span>{item.label}</span>
            {item.active ? (
              <Check className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <span className="text-slate-300">+</span>
            )}
          </button>
        ))}
      </div>

      {/* Форма добавления своего продукта */}
      <form onSubmit={addCustomAllergen} className="flex gap-2">
        <input 
          type="text"
          placeholder="Свой продукт (например, грибы, кинза)..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
        />
        <button 
          type="submit"
          className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить</span>
        </button>
      </form>
    </div>
  );
}
