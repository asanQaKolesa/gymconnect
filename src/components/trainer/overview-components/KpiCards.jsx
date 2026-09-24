import React from 'react';

export default function KpiCards({ activeCount, pausedCount, leftCount, lowBalanceCount, totalEarnings }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Активных</p>
        <h3 className="text-2xl font-black text-blue-600 mt-1">{activeCount}</h3>
      </div>
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">На паузе</p>
        <h3 className="text-2xl font-black text-amber-600 mt-1">{pausedCount}</h3>
      </div>
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Ушли</p>
        <h3 className="text-2xl font-black text-rose-600 mt-1">{leftCount}</h3>
      </div>
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Мало занятий (≤2)</p>
        <h3 className={`text-2xl font-black mt-1 ${lowBalanceCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {lowBalanceCount}
        </h3>
      </div>
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm col-span-2 md:col-span-1">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Доход / мес</p>
        <h3 className="text-xl font-black text-emerald-600 mt-1">{totalEarnings.toLocaleString()} ₸</h3>
      </div>
    </div>
  );
}
