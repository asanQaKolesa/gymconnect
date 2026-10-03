// src/components/home/TrainerCatalogCard.jsx
import React from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Award, 
  Dumbbell,
  Users
} from 'lucide-react';

function formatExperienceYears(years) {
  const n = Math.abs(Number(years)) || 0;
  if (n === 0) return 'Стаж до 1 года';
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 19) return `${n} лет стаж`;
  if (rem10 === 1) return `${n} год стаж`;
  if (rem10 >= 2 && rem10 <= 4) return `${n} года стаж`;
  return `${n} лет стаж`;
}

export default function TrainerCatalogCard({ 
  trainer, 
  onSelect,
  className = '' 
}) {
  if (!trainer) return null;

  const fullName = trainer.full_name || `${trainer.first_name || 'Тренер'} ${trainer.last_name || ''}`.trim();
  const avatar = trainer.avatar_url || trainer.photo_url;
  const isVerified = trainer.is_verified || trainer.status === 'approved' || trainer.verification_status === 'verified';
  
  // Локация
  const gymLocation = trainer.gym ? trainer.gym.split('|')[0].trim() : 'Алматы';

  // Формат ведения
  const formatLabel = 
    trainer.work_format === 'online' ? 'Онлайн-ведение' :
    trainer.work_format === 'hybrid' ? 'Зал + Онлайн' : 'Офлайн в зале';

  // Специализации (максимум 2-3 тега)
  const specs = Array.isArray(trainer.specializations) && trainer.specializations.length > 0
    ? trainer.specializations
    : (typeof trainer.specialization === 'string' ? trainer.specialization.split(',').map(s => s.trim()) : ['Силовой тренинг', 'Тонус']);

  const visibleSpecs = specs.slice(0, 2);
  const remainingCount = specs.length - visibleSpecs.length;

  // Оффер/бонус
  const hasTrial = Boolean(trainer.has_free_trial);
  const hasConsultation = Boolean(trainer.has_free_consultation);

  return (
    <div
      onClick={() => onSelect && onSelect(trainer)}
      className={`bg-white rounded-3xl p-3.5 border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-all cursor-pointer active:scale-[0.99] select-none space-y-2.5 ${className}`}
    >
      {/* 1. Верхний блок: Аватар, имя, локация и стрелка */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Аватар с индикатором верификации */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 overflow-hidden flex items-center justify-center font-bold text-neutral-700 text-sm shadow-2xs">
              {avatar ? (
                <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {isVerified && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-2xs" title="Верифицирован">
                <CheckCircle2 className="w-3 h-3 text-white stroke-[2.8]" />
              </span>
            )}
          </div>

          {/* Имя и локация */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="text-sm font-semibold text-neutral-900 leading-tight truncate">
              {fullName}
            </h3>

            <p className="text-[11px] text-neutral-500 flex items-center gap-1 truncate font-medium">
              <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
              <span className="truncate">{gymLocation}</span>
            </p>
          </div>
        </div>

        {/* Кнопка подробнее */}
        <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100/70 px-2.5 py-1.5 rounded-xl border border-blue-200/60 transition-colors">
          <span>Подробнее</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>

      {/* 2. Ключевые метрики в одну строку: стаж и формат (без лишней плашки "60 минут") */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
        <span className="inline-flex items-center gap-1 text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-lg border border-neutral-200/60">
          <Award className="w-3 h-3 text-neutral-500" />
          <span>{formatExperienceYears(trainer.experience_years || 1)}</span>
        </span>

        <span className="inline-flex items-center gap-1 text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-lg border border-neutral-200/60 truncate">
          <Dumbbell className="w-3 h-3 text-neutral-500 shrink-0" />
          <span className="truncate">{formatLabel}</span>
        </span>
      </div>

      {/* 3. Бейдж оффера (если активно бесплатное занятие или консультация) */}
      {(hasTrial || hasConsultation) && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10.5px] font-semibold leading-tight">
          <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>
            {hasTrial ? '🎁 Пробная вводная тренировка' : '🎁 Бесплатная консультация'}
          </span>
        </div>
      )}

      {/* 4. Чипсы специализаций (2-3 тега + счетчик остатка) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        {visibleSpecs.map((spec, idx) => (
          <span
            key={idx}
            className="text-[10.5px] font-medium bg-neutral-50 text-neutral-600 border border-neutral-200/60 px-2 py-0.5 rounded-lg truncate max-w-[150px]"
          >
            {spec}
          </span>
        ))}

        {remainingCount > 0 && (
          <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-md">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  );
}
