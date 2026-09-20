import React, { useState } from 'react';
import { ShieldX, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function NutritionAllergies() {
  const [isOpen, setIsOpen] = useState(true);
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

  const activeCount = allergens.filter(a => a.active).length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
            <ShieldX className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Аллергии и исключения</h2>
            <p className="text-xs text-slate-400">Исключено продуктов: {activeCount}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-50 animate-in fade-in duration-200">
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Укажите продукты, которые вы хотите исключить. Они автоматически не будут учитываться при составлении плана питания и в продуктовой корзине.
          </p>

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

          <form onSubmit={addCustomAllergen} className="flex gap-2">
            <input 
              type="text"
              placeholder="Свой продукт (например, грибы)..."
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
      )}
    </div>
  );
}
