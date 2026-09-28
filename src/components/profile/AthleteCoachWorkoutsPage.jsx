// src/components/profile/AthleteCoachWorkoutsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Dumbbell, 
  Calendar, 
  CreditCard, 
  User, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  MessageCircle, 
  Link as LinkIcon, 
  ShieldCheck, 
  Flame,
  Search,
  Send
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function AthleteCoachWorkoutsPage({ user, onBack, onUpdate }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [activeTab, setActiveTab] = useState('program'); // 'program' | 'finance' | 'coach'
  const [trainerData, setTrainerData] = useState(null);
  const [loadingTrainer, setLoadingTrainer] = useState(false);

  // Выбранный тренировочный день программы
  const [selectedDay, setSelectedDay] = useState(1);

  // Отметка явки на сегодня
  const [attendanceToday, setAttendanceToday] = useState(() => {
    try {
      return localStorage.getItem(`gymconnect_attendance_${user?.id || 'me'}`) || null;
    } catch {
      return null;
    }
  });
  const [attendanceNotice, setAttendanceNotice] = useState(false);

  // Стейты привязки тренера для атлетов без наставника
  const [linkCoachInput, setLinkCoachInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  const trainerUsername = user?.trainer_username || user?.trainer_telegram || '';
  const cleanTrainerUsername = trainerUsername.replace('@', '').trim();
  const hasLinkedCoach = Boolean(cleanTrainerUsername);

  // Загрузка данных тренера и его расписания смен
  useEffect(() => {
    async function fetchTrainerInfo() {
      if (!cleanTrainerUsername) return;
      setLoadingTrainer(true);
      try {
        const { data, error } = await supabase
          .from('trainer_profiles')
          .select('*')
          .or(`username.eq.${cleanTrainerUsername},username.eq.@${cleanTrainerUsername}`)
          .maybeSingle();

        if (!error && data) {
          setTrainerData(data);
        }
      } catch (err) {
        console.warn('Ошибка загрузки данных тренера:', err);
      } finally {
        setLoadingTrainer(false);
      }
    }

    fetchTrainerInfo();
  }, [cleanTrainerUsername]);

  // Определение смены тренера на сегодня
  const getCoachTodayShift = () => {
    if (!trainerData?.schedule_slots) return null;
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = daysMap[new Date().getDay()];
    const todaySlots = trainerData.schedule_slots[todayKey] || [];
    
    if (todaySlots.length > 0) {
      return {
        isInGym: true,
        text: `В зале: ${todaySlots.map(s => `${s.start} - ${s.end}`).join(', ')}`
      };
    }
    return {
      isInGym: false,
      text: 'Сегодня выходной день'
    };
  };

  const coachShift = getCoachTodayShift();

  // Отметка явки ученика на сегодня
  const handleSetAttendance = (status) => {
    setAttendanceToday(status);
    try {
      localStorage.setItem(`gymconnect_attendance_${user?.id || 'me'}`, status);
    } catch (e) {
      console.warn(e);
    }
    setAttendanceNotice(true);
    setTimeout(() => setAttendanceNotice(false), 3000);
  };

  // Привязка тренера по Telegram нику
  const handleLinkCoach = async (e) => {
    e.preventDefault();
    if (!linkCoachInput.trim()) return;

    setIsLinking(true);
    setLinkError('');

    const cleanInput = linkCoachInput.replace(/[@\s]/g, '').trim();

    try {
      // Проверяем, существует ли такой тренер в базе
      const { data: foundCoach, error: searchErr } = await supabase
        .from('trainer_profiles')
        .select('*')
        .or(`username.eq.${cleanInput},username.eq.@${cleanInput}`)
        .maybeSingle();

      if (searchErr || !foundCoach) {
        setLinkError(`Тренер @${cleanInput} пока не зарегистрирован в базе CoachOS. Проверьте правильность ника.`);
        setIsLinking(false);
        return;
      }

      // Обновляем профиль атлета
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({
            trainer_username: cleanInput,
            trainer_telegram: cleanInput
          })
          .eq('id', user.id);
      }

      // Обновляем локальный профиль
      const savedUser = localStorage.getItem('gymconnect_user_profile');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        localStorage.setItem('gymconnect_user_profile', JSON.stringify({
          ...parsed,
          trainer_username: cleanInput,
          trainer_telegram: cleanInput
        }));
      }

      alert(`🎉 Вы успешно привязаны к тренеру ${foundCoach.first_name || ''} (@${cleanInput})!`);
      if (onUpdate) onUpdate();
      window.location.reload();
    } catch (err) {
      setLinkError('Ошибка привязки: ' + err.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Программа от тренера из профиля атлета
  const programData = user?.assigned_program?.days || user?.assigned_program || {
    1: {
      title: 'День 1: Базовая тренировка от тренера',
      exercises: [
        { name: 'Приседания со штангой', sets: 4, reps: 10, weight: 60, notes: 'Контроль коленей', isBodyweight: false },
        { name: 'Жим штанги лежа', sets: 4, reps: 8, weight: 55, notes: 'Пауза внизу 1 сек', isBodyweight: false },
        { name: 'Подтягивания на перекладине', sets: 3, reps: 8, weight: 0, notes: 'Свой вес', isBodyweight: true }
      ]
    },
    2: {
      title: 'День 2: Объем и функционал',
      exercises: [
        { name: 'Румынская тяга с гантелями', sets: 4, reps: 10, weight: 18, notes: 'Растяжка бедра', isBodyweight: false },
        { name: 'Жим гантелей на наклонной скамье', sets: 4, reps: 10, weight: 20, notes: 'Угол 30°', isBodyweight: false },
        { name: 'Планка на предплечьях', sets: 3, reps: 45, weight: 0, notes: 'Свой вес', isBodyweight: true }
      ]
    }
  };

  const programDayKeys = Object.keys(programData);
  const currentDayProgram = programData[selectedDay] || programData[programDayKeys[0]];

  // Финансовые показатели
  const leftTrainings = user?.left_trainings !== undefined 
    ? user.left_trainings 
    : (user?.remaining_workouts !== undefined ? user.remaining_workouts : 12);
  const totalTrainings = user?.total_trainings || 12;
  const isPaid = user?.payment_status === 'paid' || !user?.payment_status;

  // Очистка контактов тренера
  const coachPhone = trainerData?.phone ? String(trainerData.phone).replace(/\D/g, '') : '';
  const coachUsername = trainerData?.username ? String(trainerData.username).replace('@', '').trim() : cleanTrainerUsername;

  return (
    <div className="min-h-screen w-full bg-[#F2F2F7] flex flex-col select-none animate-in fade-in duration-150">
      
      {/* 1. ВЕРХНИЙ БАР Apple HIG */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Назад в профиль</span>
          </button>

          <div className="text-center overflow-hidden flex-1 px-1">
            <h1 className="text-xs font-bold text-slate-900 truncate">
              {hasLinkedCoach ? 'Тренировки с тренером' : 'Мои тренировки и наставник'}
            </h1>
            <p className="text-[10px] text-slate-400 truncate">
              {hasLinkedCoach ? `@${cleanTrainerUsername}` : 'GymConnect Алматы'}
            </p>
          </div>

          <div className="w-12 text-right">
            {hasLinkedCoach && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 font-mono">
                {leftTrainings} зан.
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 2. ОСНОВНОЙ КОНТЕНТ */}
      <main className="p-3.5 space-y-3.5 max-w-md mx-auto w-full pb-20">
        
        {/* ================= СЦЕНАРИЙ А: ТРЕНЕР ПРИВЯЗАН ================= */}
        {hasLinkedCoach ? (
          <>
            {/* Карточка-статус тренера на сегодня */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-2xs">
                    {trainerData?.photo_url || trainerData?.avatar_url ? (
                      <img src={trainerData.photo_url || trainerData.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{cleanTrainerUsername[0]?.toUpperCase() || 'C'}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {trainerData?.full_name || `${trainerData?.first_name || 'Тренер'} ${trainerData?.last_name || ''}`.trim() || `@${cleanTrainerUsername}`}
                    </h2>
                    <p className="text-[11px] text-blue-600 font-mono mt-0.5">@{cleanTrainerUsername}</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">
                      {trainerData?.gym ? trainerData.gym.split('|')[0] : (user?.gym ? user.gym.split('|')[0] : 'Алматы')}
                    </p>
                  </div>
                </div>

                {/* Быстрые контакты тренера */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {coachUsername && (
                    <a
                      href={`https://t.me/${coachUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center border border-[#229ED9]/25 shadow-2xs active:scale-90 transition-transform"
                      title="Написать тренеру в Telegram"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </a>
                  )}

                  {coachPhone && (
                    <a
                      href={`https://wa.me/7${coachPhone.slice(-10)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-2xs active:scale-90 transition-transform"
                      title="Написать в WhatsApp"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.67-1.4 1.23-1.92 1.31-.5.08-1.15.11-3.69-.94-3.25-1.34-5.32-4.66-5.48-4.88-.16-.22-1.31-1.74-1.31-3.32 0-1.58.83-2.35 1.12-2.67.3-.32.65-.4.87-.4.22 0 .44 0 .63.01.2.01.47-.08.73.57.27.67.92 2.24 1 2.4.08.16.13.35.03.57-.1.22-.16.35-.31.54-.16.19-.34.42-.48.56-.16.16-.33.33-.14.66.19.33.85 1.4 1.82 2.26 1.25 1.11 2.3 1.46 2.63 1.62.33.16.52.14.71-.08.2-.22.84-.98 1.06-1.32.22-.34.44-.28.74-.17.3.11 1.9.9 2.23 1.06.33.16.55.24.63.38.08.14.08.81-.16 1.48z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Статус присутствия тренера в зале сегодня */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Тренер сегодня:</span>
                <span className={`font-bold flex items-center gap-1.5 ${
                  coachShift?.isInGym ? 'text-emerald-700' : 'text-slate-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${coachShift?.isInGym ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span>{coachShift?.text || 'График уточняется'}</span>
                </span>
              </div>
            </div>

            {/* 3 ТАБА: Программа / Касса / Мой тренер */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-2xl">
              {[
                { id: 'program', label: 'Программа', icon: Dumbbell },
                { id: 'finance', label: 'Абонемент', icon: CreditCard },
                { id: 'coach', label: 'О тренере', icon: User }
              ].map(tab => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-white text-blue-600 font-bold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ================= ВКЛАДКА 1: ПРОГРАММА ТРЕНИРОВОК ================= */}
            {activeTab === 'program' && (
              <div className="space-y-3.5">
                
                {/* Интерактивная явка на сегодняшнюю тренировку */}
                <div className="bg-white rounded-3xl p-4 border border-blue-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Тренировка сегодня</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Подтвердите явку</span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    Отметьте статус, чтобы тренер в своей CRM заранее видел вашу готовность к занятию:
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSetAttendance('attending')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        attendanceToday === 'attending'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Буду на тренировке</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetAttendance('missed')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        attendanceToday === 'missed'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <span>Не смогу прийти</span>
                    </button>
                  </div>

                  {attendanceNotice && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[10.5px] font-semibold text-center animate-in fade-in">
                      Отметка передана тренеру в расписание!
                    </div>
                  )}
                </div>

                {/* Выбор дня программы */}
                <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {programDayKeys.map((dayNum, idx) => (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => setSelectedDay(dayNum)}
                        className={`py-2 px-3.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                          selectedDay === Number(dayNum) || selectedDay === dayNum
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        День {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <h4 className="font-bold text-xs text-slate-900">
                      {currentDayProgram?.title || `День ${selectedDay}: План тренировки`}
                    </h4>
                  </div>

                  {/* Список упражнений дня */}
                  <div className="space-y-2.5">
                    {currentDayProgram?.exercises && currentDayProgram.exercises.length > 0 ? (
                      currentDayProgram.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {exIdx + 1}. {ex.name}
                            </span>
                            <span className="text-xs font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                              {ex.isBodyweight ? 'Свой вес' : `${ex.weight || 0} кг`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                            <span>Подходы: <b>{ex.sets || 3}</b></span>
                            <span>Повторения: <b>{ex.reps || 10}</b></span>
                          </div>

                          {ex.notes && (
                            <p className="text-[10px] text-slate-400 italic pt-0.5">
                              Пометка тренера: {ex.notes}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-slate-400 text-xs">
                        Тренер пока наполняет программу для этого дня.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= ВКЛАДКА 2: АБОНЕМЕНТ И КАССА ================= */}
            {activeTab === 'finance' && (
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-bold text-xs text-slate-900">Баланс абонемента</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                    leftTrainings <= 2 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {leftTrainings <= 2 ? 'Пора продлевать' : 'Активен'}
                  </span>
                </div>

                {/* Баланс тренировок */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Остаток занятий</span>
                    <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                      {leftTrainings} <span className="text-xs text-slate-400 font-normal">из {totalTrainings} зан.</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {/* Финансовый расчет */}
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-sans block">Стоимость блока</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {user?.monthly_price ? `${Number(user.monthly_price).toLocaleString()} ₸` : '70 000 ₸'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-sans block">Статус оплаты</span>
                    <span className={`text-xs font-bold font-sans mt-0.5 block ${
                      isPaid ? 'text-emerald-700' : 'text-amber-600'
                    }`}>
                      {isPaid ? 'Оплачено' : 'Ожидает оплаты'}
                    </span>
                  </div>
                </div>

                {/* Правила сгорания */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block">Срок действия:</span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {user?.is_expiring === false 
                      ? 'Несгораемый абонемент: тренировки не сгорают по времени.' 
                      : 'Блок активен в течение 35 дней с момента первого занятия.'}
                  </p>
                </div>
              </div>
            )}

            {/* ================= ВКЛАДКА 3: О ТРЕНЕРЕ И СМЕНЫ ================= */}
            {activeTab === 'coach' && (
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
                <p className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2">График тренера в залах</p>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{trainerData?.gym || 'Invictus Go'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Опыт работы: <b>{trainerData?.experience_years || 3} года</b>
                  </p>
                  {trainerData?.specializations && (
                    <p className="text-[10.5px] text-slate-600">
                      Специализации: {trainerData.specializations.join(', ')}
                    </p>
                  )}
                </div>

                {/* Недельное расписание присутствия тренера */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 text-[11px] block">Часы смен в клубе на неделю:</span>
                  
                  {trainerData?.schedule_slots ? (
                    Object.entries(trainerData.schedule_slots).map(([dayKey, slots]) => {
                      const dayLabels = {
                        monday: 'Понедельник', tuesday: 'Вторник', wednesday: 'Среда',
                        thursday: 'Четверг', friday: 'Пятница', saturday: 'Суббота', sunday: 'Воскресенье'
                      };
                      return (
                        <div key={dayKey} className="flex justify-between items-center p-2 bg-slate-50 rounded-xl text-[11px]">
                          <span className="text-slate-700 font-medium">{dayLabels[dayKey] || dayKey}:</span>
                          <span className="font-mono font-bold text-blue-700">
                            {Array.isArray(slots) && slots.length > 0 
                              ? slots.map(s => `${s.start} - ${s.end}`).join(', ') 
                              : 'Выходной'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-400 text-xs italic">График уточняется на рецепции или в личном чате.</p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ================= СЦЕНАРИЙ Б: ТРЕНЕР ЕЩЕ НЕ ПРИВЯЗАН ================= */
          <div className="space-y-3.5">
            
            {/* Приветственный баннер */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs text-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                <Dumbbell className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">У вас пока не привязан тренер</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Привяжите своего персонального наставника по его Telegram никнейму, чтобы получать персональную программу тренировок, расписание и баланс занятий.
              </p>
            </div>

            {/* Блок быстрой привязки по нику */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <span className="font-bold text-xs text-slate-900 block border-b border-slate-100 pb-2">
                Привязать наставника
              </span>

              <form onSubmit={handleLinkCoach} className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Telegram Username вашего тренера
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={linkCoachInput}
                      onChange={e => setLinkCoachInput(e.target.value)}
                      placeholder="coach_nick"
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {linkError && (
                  <p className="text-xs text-rose-600 font-semibold">{linkError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLinking}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-98 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{isLinking ? 'Проверка...' : 'Привязать тренера к профилю'}</span>
                </button>
              </form>
            </div>

            {/* Блок подбора проверенного тренера от комьюнити */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900">Ищете тренера в своем зале?</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Куратор GymConnect бесплатно подберет проверенного наставника под ваш клуб, цель и бюджет:
              </p>

              <a
                href="https://t.me/asanali_kk"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Подобрать наставника в Telegram</span>
              </a>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
