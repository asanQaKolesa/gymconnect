// src/components/profile/ProfileCard.jsx
import React, { useState } from 'react';
import { 
  Edit3, 
  MapPin, 
  Calendar, 
  Users, 
  UserCheck, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Instagram,
  Check
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function ProfileCard({ user, onOpenEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(user?.status || 'Хочу в зал 🔥');
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);

  // Креативные статусы атлета
  const statuses = [
    { id: 'in_gym', label: 'В зале 🏋️‍♂️' },
    { id: 'going_gym', label: 'Иду в зал 🚶‍♂️' },
    { id: 'want_gym', label: 'Хочу в зал 🔥' },
    { id: 'left_gym', label: 'Вышел из зала 🥤' },
    { id: 'home', label: 'Отдыхаю дома 🏠' },
    { id: 'sick', label: 'Болею 🤒' }
  ];

  // Расшифровка уровней подготовки
  const experienceLabels = {
    first_time: 'Первый раз в зале',
    scared_beginner: 'Пару раз заходил, было страшно',
    beginner: 'Новичок (до 6 мес)',
    regular: 'Уверенный любитель (1–2 года)',
    advanced: 'Опытный атлет (2–5 лет)',
    pro_monster: 'Профи / Монстр базы'
  };

  const experienceText = experienceLabels[user?.experience_level] || user?.experience_level || 'Любитель';
  const workoutDays = Array.isArray(user?.workout_days) ? user.workout_days : [];

  // Очистка контактов
  const cleanTelegram = typeof user?.telegram_username === 'string' ? user.telegram_username.replace('@', '').trim() : '';
  const cleanInstagram = typeof user?.instagram === 'string' ? user.instagram.replace('@', '').trim() : '';
  
  // Получение номера WhatsApp (с валидацией префикса)
  const rawWhatsapp = user?.whatsapp || user?.phone || '';
  const cleanWhatsappDigits = typeof rawWhatsapp === 'string' ? rawWhatsapp.replace(/\D/g, '') : '';
  const cleanWhatsapp = cleanWhatsappDigits ? (cleanWhatsappDigits.startsWith('7') ? cleanWhatsappDigits : `7${cleanWhatsappDigits}`) : '';

  // Быстрая смена статуса в базе и локально
  const handleSelectStatus = async (statusLabel) => {
    setCurrentStatus(statusLabel);
    setIsStatusPickerOpen(false);

    try {
      const tgId = user?.telegram_id || localStorage.getItem('gymconnect_telegram_id');
      if (tgId) {
        await supabase
          .from('profiles')
          .update({ status: statusLabel })
          .eq('telegram_id', tgId);
      }
      
      const local = localStorage.getItem('gymconnect_user_profile');
      if (local) {
        const parsed = JSON.parse(local);
        localStorage.setItem('gymconnect_user_profile', JSON.stringify({ ...parsed, status: statusLabel }));
      }
    } catch (e) {
      console.warn('Не удалось обновить статус:', e);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3 select-none">
      
      {/* 1. ВЕРХНИЙ БЛОК: Аватар, Имя, Статус, Метаданные и Кнопка редактирования */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          
          {/* Аватар атлета */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shadow-sm">
              {user?.photo_url || user?.avatar_url ? (
                <img 
                  src={user.photo_url || user.avatar_url} 
                  alt="Аватар" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Users className="w-8 h-8 text-slate-400 stroke-[1.5]" />
              )}
            </div>
            {user?.is_pro && (
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                PRO
              </span>
            )}
          </div>

          {/* Имя, статус и возраст */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {user?.first_name || 'Атлет'} {user?.last_name || ''}
            </h3>

            {/* Статус атлета прямо под именем */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/60 rounded-lg text-[11px] font-medium text-slate-700 active:scale-95 transition-all"
              >
                <span>{currentStatus}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Выпадающее окно статусов */}
              {isStatusPickerOpen && (
                <div className="absolute left-0 top-7 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-0.5 w-44 animate-in fade-in duration-150">
                  {statuses.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectStatus(st.label)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        currentStatus === st.label ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{st.label}</span>
                      {currentStatus === st.label && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Возраст и локация */}
            <p className="text-[11px] text-slate-400 font-normal">
              {user?.age ? `${user.age} лет` : '24 года'} • {user?.gender === 'female' ? 'Женский' : 'Мужской'} • {user?.city || 'Алматы'}
            </p>
          </div>
        </div>

        {/* Кнопка редактирования */}
        <button
          type="button"
          onClick={onOpenEdit}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200/70 active:scale-95 transition-all shadow-sm shrink-0"
          title="Редактировать анкету"
        >
          <Edit3 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* 2. ФИКСИРОВАННЫЕ КНОПКИ СОЦСЕТЕЙ В ОДИН РЯД (ТОЛЬКО ИКОНКИ, БЕЗ ТЕКСТА) */}
      <div className="flex items-center gap-2 pt-0.5">
        
        {/* Кнопка Telegram (всегда активна) */}
        {cleanTelegram ? (
          <a
            href={`https://t.me/${cleanTelegram}`}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center border border-[#229ED9]/25 shadow-sm active:scale-90 transition-transform shrink-0"
            title={`Telegram: @${cleanTelegram}`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </a>
        ) : null}

        {/* Кнопка Instagram (отображается только если заполнен) */}
        {cleanInstagram ? (
          <a
            href={`https://instagram.com/${cleanInstagram}`}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200/60 shadow-sm active:scale-90 transition-transform shrink-0"
            title={`Instagram: @${cleanInstagram}`}
          >
            <Instagram className="w-4 h-4 stroke-[2]" />
          </a>
        ) : null}

        {/* Кнопка WhatsApp (отображается только если заполнен телефон/WhatsApp) */}
        {cleanWhatsapp ? (
          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-sm active:scale-90 transition-transform shrink-0"
            title="WhatsApp"
          >
            {/* WhatsApp SVG иконка */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.67-1.4 1.23-1.92 1.31-.5.08-1.15.11-3.69-.94-3.25-1.34-5.32-4.66-5.48-4.88-.16-.22-1.31-1.74-1.31-3.32 0-1.58.83-2.35 1.12-2.67.3-.32.65-.4.87-.4.22 0 .44 0 .63.01.2.01.47-.08.73.57.27.67.92 2.24 1 2.4.08.16.13.35.03.57-.1.22-.16.35-.31.54-.16.19-.34.42-.48.56-.16.16-.33.33-.14.66.19.33.85 1.4 1.82 2.26 1.25 1.11 2.3 1.46 2.63 1.62.33.16.52.14.71-.08.2-.22.84-.98 1.06-1.32.22-.34.44-.28.74-.17.3.11 1.9.9 2.23 1.06.33.16.55.24.63.38.08.14.08.81-.16 1.48z"/>
            </svg>
          </a>
        ) : null}

      </div>

      {/* 3. БИО (О себе) */}
      {user?.bio ? (
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs text-slate-600 font-normal leading-relaxed italic">
          "{user.bio}"
        </div>
      ) : null}

      {/* 4. СТАТУС GYMBRO */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${user?.gymbro_search ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-xs font-medium text-slate-700">Поиск напарника GymBro</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          user?.gymbro_search 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-200 text-slate-500'
        }`}>
          {user?.gymbro_search ? 'Включен' : 'Отключен'}
        </span>
      </div>

      {/* 5. КНОПКА РАСКРЫТИЯ ПАРАМЕТРОВ */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-2xl text-xs font-semibold text-slate-700 flex items-center justify-between active:scale-98 transition-all"
      >
        <span>{isExpanded ? 'Скрыть параметры атлета' : 'Параметры атлета, клуб и график'}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* 6. РАСКРЫВАЮЩИЕСЯ ПАРАМЕТРЫ С МОНОХРОМНЫМИ АККУРАТНЫМИ ШРИФТАМИ */}
      {isExpanded && (
        <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
          
          {/* Рост, Вес, Цель (монохромные шрифты font-medium) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#F8F9FB] p-2 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-normal text-slate-400">Рост</p>
              <p className="text-xs font-semibold text-slate-700 font-mono mt-0.5">
                {user?.height ? `${user.height} см` : '—'}
              </p>
            </div>

            <div className="bg-[#F8F9FB] p-2 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-normal text-slate-400">Вес</p>
              <p className="text-xs font-semibold text-slate-700 font-mono mt-0.5">
                {user?.weight ? `${user.weight} кг` : '—'}
              </p>
            </div>

            {/* Цель теперь монохромная (text-slate-700 без синего) */}
            <div className="bg-[#F8F9FB] p-2 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-normal text-slate-400">Цель</p>
              <p className="text-[11px] font-medium text-slate-700 truncate mt-0.5">
                {user?.goal || 'Тонус'}
              </p>
            </div>
          </div>

          {/* Фитнес-клуб (монохромная карточка #F8F9FB и серый пин без синего) */}
          <div className="bg-[#F8F9FB] p-2.5 rounded-2xl border border-slate-100 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{user?.gym || 'Зал не выбран'}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pl-5 font-normal">
              <span>{user?.district ? `${user.district} район` : 'Алматы'}</span>
              <span>{user?.city || 'г. Алматы'}</span>
            </div>
          </div>

          {/* Уровень подготовки и тренер (монохромные шрифты) */}
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-normal text-slate-500">Уровень подготовки:</span>
              <span className="font-medium text-slate-700 text-[11px] text-right truncate max-w-[200px]">
                {experienceText}
              </span>
            </div>

            {user?.trainer_telegram && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1 text-[11px] font-normal text-slate-600">
                  <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                  <span>Личный тренер:</span>
                </div>
                <a 
                  href={`https://t.me/${String(user.trainer_telegram).replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium font-mono text-slate-700 hover:text-slate-900 hover:underline"
                >
                  @{String(user.trainer_telegram).replace('@', '')}
                </a>
              </div>
            )}
          </div>

          {/* График тренировок (монохромные бейджи) */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex gap-1">
                {workoutDays.length > 0 ? (
                  workoutDays.map(d => (
                    <span key={d} className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-medium rounded-lg text-[10px]">
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px] font-normal">Дни не выбраны</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">
                {typeof user?.workout_time_slot === 'string' ? user.workout_time_slot.split(' ')[0] : 'Вечер'}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
