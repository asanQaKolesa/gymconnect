import React from 'react';

export default function TrainersB2BGrid() {
  const handleFindTrainer = () => {
    alert('🏋️‍♂️ Сервис подбора тренеров по 230 залам Алматы скоро запустится!');
  };

  const handleIAmTrainer = () => {
    alert('💼 Регистрация для тренеров открыта. Напиши нам: @asanali_kk');
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Плашка: Клиентам */}
      <div
        onClick={handleFindTrainer}
        className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-[#FF5A1F]/50 transition cursor-pointer active:scale-95 space-y-0.5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-base">🏋️‍♂️</span>
          <span className="text-[8px] bg-[#FF5A1F]/15 text-[#FF8C38] font-bold px-1.5 py-0.5 rounded-md border border-[#FF5A1F]/30">
            Клиентам
          </span>
        </div>
        <div className="text-[11px] font-black text-white pt-0.5">Найти тренера</div>
        <p className="text-[9px] text-slate-400 leading-tight">
          Подбор под ваши запросы
        </p>
      </div>

      {/* Плашка: Тренерам */}
      <div
        onClick={handleIAmTrainer}
        className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-amber-500/50 transition cursor-pointer active:scale-95 space-y-0.5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-base">💼</span>
          <span className="text-[8px] bg-amber-500/15 text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30">
            Тренерам
          </span>
        </div>
        <div className="text-[11px] font-black text-white pt-0.5">Я тренер</div>
        <p className="text-[9px] text-slate-400 leading-tight">
          Привлечение новых клиентов
        </p>
      </div>
    </div>
  );
}
