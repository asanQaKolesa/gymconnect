// src/components/home/TrainerDigitalProductCard.jsx
import React from 'react';
import { 
  FileCheck, 
  BookOpen, 
  Flame, 
  Video, 
  ChevronRight, 
  Check, 
  Sparkles 
} from 'lucide-react';

export default function TrainerDigitalProductCard({ 
  product, 
  onAction,
  isUnlocked = false 
}) {
  if (!product) return null;

  const getProductIcon = (type) => {
    switch (type) {
      case 'checklist': return <FileCheck className="w-4 h-4 text-blue-600 stroke-[2.2]" />;
      case 'guide': return <BookOpen className="w-4 h-4 text-emerald-600 stroke-[2.2]" />;
      case 'marathon': return <Flame className="w-4 h-4 text-amber-500 stroke-[2.2]" />;
      case 'course': return <Video className="w-4 h-4 text-purple-600 stroke-[2.2]" />;
      default: return <Sparkles className="w-4 h-4 text-blue-600 stroke-[2.2]" />;
    }
  };

  const formattedPrice = Number(product.price || 2990).toLocaleString();

  return (
    <div className="bg-white rounded-3xl p-3.5 border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-2.5 transition-all select-none min-w-[240px] max-w-[280px] shrink-0">
      
      {/* Шапка: Тип и иконка */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60 uppercase tracking-wider">
          {product.categoryTitle || 'Материал'}
        </span>

        <div className="w-7 h-7 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-center shrink-0">
          {getProductIcon(product.type)}
        </div>
      </div>

      {/* Название и ценность */}
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
          {product.title}
        </h4>
        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed font-normal">
          {product.subtitle || product.benefit || 'Пошаговая методика и разбор рациона'}
        </p>
      </div>

      {/* Цена и кнопка покупки/доступа */}
      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[9.5px] text-neutral-400 font-medium block">
            {isUnlocked ? 'Статус' : 'Стоимость:'}
          </span>
          <span className="text-xs font-mono font-bold text-neutral-900 block truncate">
            {isUnlocked ? 'Доступ открыт' : `${formattedPrice} ₸`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAction && onAction(product)}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs ${
            isUnlocked
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
          }`}
        >
          {isUnlocked ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Открыть</span>
            </>
          ) : (
            <>
              <span>Купить</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
