import React, { useState } from 'react';
import { Droplet } from 'lucide-react';

export default function WaterTracker() {
  const [water, setWater] = useState(4);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
          <Droplet className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">Водный баланс</div>
          <div className="text-xs text-slate-400">{water * 250} мл из 2000 мл ({water} стаканов)</div>
        </div>
      </div>
      <div className="flex gap-1">
        <button 
          onClick={() => setWater(Math.max(0, water - 1))}
          className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-sm font-bold"
        >
          -
        </button>
        <button 
          onClick={() => setWater(water + 1)}
          className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white hover:bg-sky-600 text-sm font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
