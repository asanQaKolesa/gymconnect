// src/components/trainer/screens/TrainerProductsLaunchScreen.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  FileCheck, 
  BookOpen, 
  Flame, 
  Video, 
  Check, 
  Clock, 
  CreditCard, 
  ChevronRight, 
  Layers, 
  Rocket, 
  Send 
} from 'lucide-react';
import { 
  DIGITAL_PRODUCT_TYPES, 
  GYMCONNECT_STUDIO_BENEFITS 
} from '../../../data/digitalProductsConfig';
import TrainerProductRequestModal from '../components/modals/TrainerProductRequestModal';

export default function TrainerProductsLaunchScreen({ 
  trainer, 
  onBack,
  onNavigateToPreview 
}) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState('checklist');

  const handleOpenRequest = (typeId) => {
    setPreselectedType(typeId || 'checklist');
    setIsRequestModalOpen(true);
  };

  const getProductIcon = (iconName) => {
    switch (iconName) {
      case 'FileCheck': return <FileCheck className="w-5 h-5 stroke-[2.2]" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 stroke-[2.2]" />;
      case 'Flame': return <Flame className="w-5 h-5 stroke-[2.2]" />;
      case 'Video': return <Video className="w-5 h-5 stroke-[2.2]" />;
      default: return <Sparkles className="w-5 h-5 stroke-[2.2]" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-between overflow-hidden select-none pb-28">
      
      {/* 1. ШАПКА APPLE LIGHT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 shadow-xs shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-neutral-200/60 shrink-0"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-extrabold text-neutral-900 tracking-tight truncate">
              Launch Studio под ключ
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium truncate">
              Цифровые продукты и марафоны
            </p>
          </div>

          <div className="w-9" />
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ СЕРЕДИНА */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5">
        
        {/* Баннер запуска */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Rocket className="w-4 h-4 stroke-[2.2]" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-neutral-900">
                Запуск ваших знаний на автопилоте
              </h2>
              <p className="text-[10.5px] text-neutral-400 font-medium">
                От идеи до первых продаж в Telegram за 3 дня
              </p>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed pt-1">
            Вам не нужно быть маркетологом или дизайнером. Запишите мысли в голосовых заметках — студия GymConnect оформит методику, настроит авто-выдачу в боте и подключит прием платежей.
          </p>
        </div>

        {/* 4 Категории продуктов */}
        <div className="space-y-3">
          <span className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block px-1">
            Каталог решений под ключ:
          </span>

          {DIGITAL_PRODUCT_TYPES.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                    {getProductIcon(product.icon)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                        {product.name}
                      </h3>
                    </div>
                    <p className="text-[10.5px] text-neutral-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>Срок: {product.packagingTimelineDays}</span>
                    </p>
                  </div>
                </div>

                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${product.badgeColor}`}>
                  {product.badge}
                </span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                {product.description}
              </p>

              {/* Что входит */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60 space-y-1.5 text-xs text-neutral-700">
                <span className="font-bold text-[10.5px] text-neutral-900 block">
                  Что входит в упаковку:
                </span>
                {product.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-[11px] leading-snug">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Тариф и кнопка действия */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">Упаковка под ключ:</span>
                  <span className="text-xs font-mono font-bold text-neutral-900">
                    от {product.packagingPrice.toLocaleString()} ₸
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenRequest(product.id)}
                  className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Заказать</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Преимущества запуска в GymConnect */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
          <span className="text-xs font-bold text-neutral-900 block border-b border-neutral-100 pb-2">
            Что дает размещение в GymConnect
          </span>

          <div className="space-y-2.5">
            {GYMCONNECT_STUDIO_BENEFITS.map((b, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-emerald-200/60">
                  ✓
                </span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{b.title}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* 3. ЖЕСТКО ЗАФИКСИРОВАННЫЙ НИЖНИЙ БАР */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,20px))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={() => handleOpenRequest('checklist')}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-blue-600/25 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Оставить заявку на упаковку продукта</span>
          </button>
        </div>
      </footer>

      {/* Модалка подачи заявки */}
      <TrainerProductRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialType={preselectedType}
        trainer={trainer}
      />

    </div>
  );
}
