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
  CheckCircle2, 
  Link as LinkIcon, 
  RefreshCw,
  Send,
  Award,
  MessageCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { sendTrainerAttendanceNotification } from '../../utils/telegramNotifications';

export default function AthleteCoachWorkoutsPage({ user: initialUser, onBack, onUpdate }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [athleteData, setAthleteData] = useState(initialUser || {});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('program'); // 'program' | 'finance' | 'coach'
  const [trainerData, setTrainerData] = useState(null);

  // Выбранный тренировочный день программы
  const [selectedDay, setSelectedDay] = useState(1);

  // Отметка явки на сегодня
  const [attendanceToday, setAttendanceToday] = useState(() => {
    try {
      return localStorage.getItem(`gymconnect_attendance_${initialUser?.id || 'me'}`) || null;
    } catch {
      return null;
    }
  });
  const [isChangingAttendance, setIsChangingAttendance] = useState(false);

  // Стейты привязки тренера для атлетов без наставника
  const [linkCoachInput, setLinkCoachInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  // 2. ФОНОВАЯ ЗАГРУЗКА ДАННЫХ АТЛЕТА ИЗ SUPABASE
  const fetchFreshProfile = async () => {
    const targetId = initialUser?.id || initialUser?.telegram_id || localStorage.getItem('gymconnect_telegram_id');
    if (!targetId) return;

    setIsRefreshing(true);
    try {
      let query = supabase.from('profiles').select('*');
      if (initialUser?.id) {
        query = query.eq('id', initialUser.id);
      } else {
        query = query.eq('telegram_id', targetId);
      }
      
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        setAthleteData(data);
        try {
          localStorage.setItem('gymconnect_user_profile', JSON.stringify(data));
        } catch (e) {}

        if (data.attendance_today) {
          setAttendanceToday(data.attendance_today);
        }
      }
    } catch (e) {
      console.warn('Ошибка фоновой загрузки профиля атлета:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFreshProfile();
  }, [initialUser?.id]);

  const trainerUsername = athleteData?.trainer_username || athleteData?.trainer_telegram || '';
  const cleanTrainerUsername = trainerUsername.replace('@', '').trim().toLowerCase();
  const hasLinkedCoach = Boolean(cleanTrainerUsername);

  // 3. ПОЛНАЯ ЗАГРУЗКА ПУБЛИЧНОГО ПРОФИЛЯ ТРЕНЕРА
  useEffect(() => {
    async function fetchTrainerInfo() {
      if (!cleanTrainerUsername) return;
      try {
        const { data, error } = await supabase
          .from('trainer_profiles')
          .select('*')
          .or(`username.ilike.${cleanTrainerUsername},username.ilike.@${cleanTrainerUsername}`)
          .maybeSingle();

        if (!error && data) {
          setTrainerData(data);
        }
      } catch (err) {
        console.warn('Ошибка загрузки данных тренера:', err);
      }
    }

    fetchTrainerInfo();
  }, [cleanTrainerUsername]);

  // БЕЗОПАСНАЯ ОБРАБОТКА РАСПИСАНИЯ СМЕН ТРЕНЕРА (БЕЗ ПАДЕНИЙ В БЕЛЫЙ ЭКРАН)
  const getParsedScheduleSlots = () => {
    if (!trainerData?.schedule_slots) return null;
    let slots = trainerData.schedule_slots;
    if (typeof slots === 'string') {
      try {
        slots = JSON.parse(slots);
      } catch (e) {
        return null;
      }
    }
    return typeof slots === 'object' ? slots : null;
  };

  const parsedScheduleSlots = getParsedScheduleSlots();

  // Определение смены тренера на сегодня
  const getCoachTodayShift = () => {
    if (!parsedScheduleSlots) return null;
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = daysMap[new Date().getDay()];
    const todaySlots = parsedScheduleSlots[todayKey] || [];
    
    if (Array.isArray(todaySlots) && todaySlots.length > 0) {
      const formatted = todaySlots
        .filter(s => s && s.start && s.end)
        .map(s => `${s.start} - ${s.end}`)
        .join(', ');

      return {
        isInGym: true,
        text: formatted ? `В зале: ${formatted}` : 'В зале по графику'
      };
    }

    return {
      isInGym: false,
      text: 'Сегодня выходной день'
    };
  };

  const coachShift = getCoachTodayShift();

  // БЕЗОПАСНАЯ ОБРАБОТКА СПЕЦИАЛИЗАЦИЙ ТРЕНЕРА
  const getTrainerSpecializations = () => {
    if (!trainerData) return [];
    const specs = trainerData.specializations || trainerData.specialization;
    if (Array.isArray(specs)) return specs;
    if (typeof specs === 'string') {
      return specs.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const specializationsList = getTrainerSpecializations();

  // 4. ФИКСАЦИЯ ЯВКИ
  const handleSetAttendance = async (status) => {
    setAttendanceToday(status);
    setIsChangingAttendance(false);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      localStorage.setItem(`gymconnect_attendance_${athleteData?.id || 'me'}`, status);
    } catch (e) {}

    // Фиксируем в базе данных
    if (athleteData?.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            attendance_today: status,
            attendance_date: todayStr
          })
          .eq('id', athleteData.id);
      } catch (err) {
        console.warn('Ошибка сохранения явки в Supabase:', err);
      }
    }

    // Отправка уведомления тренеру
    const studentFullName = `${athleteData?.first_name || 'Атлет'} ${athleteData?.last_name || ''}`.trim();
    const trainingTime = athleteData?.workout_time_slot || 'Сегодня';
    const trainingGym = athleteData?.gym || trainerData?.gym || 'Зал в Алматы';

    sendTrainerAttendanceNotification({
      trainerTelegramId: trainerData?.telegram_id,
      trainerUsername: cleanTrainerUsername,
      studentName: studentFullName,
      timeSlot: trainingTime,
      gymName: trainingGym,
      isAttending: status === 'attending'
    }).catch(e => console.warn(e));
  };

  // 5. ПРИВЯЗКА ТРЕНЕРА
  const handleLinkCoach = async (e) => {
    e.preventDefault();
    if (!linkCoachInput.trim()) return;

    setIsLinking(true);
    setLinkError('');

    const cleanInput = linkCoachInput.replace(/[@\s]/g, '').trim().toLowerCase();

    try {
      const { data: foundCoach, error: searchErr } = await supabase
        .from('trainer_profiles')
        .select('*')
        .or(`username.ilike.${cleanInput},username.ilike.@${cleanInput}`)
        .maybeSingle();

      if (searchErr || !foundCoach) {
        setLinkError(`Тренер @${cleanInput} пока не зарегистрирован в базе CoachOS.`);
        setIsLinking(false);
        return;
      }

      if (athleteData?.id) {
        await supabase
          .from('profiles')
          .update({
            trainer_username: cleanInput,
            trainer_telegram: cleanInput
          })
          .eq('id', athleteData.id);
      }

      const updatedProfile = {
        ...athleteData,
        trainer_username: cleanInput,
        trainer_telegram: cleanInput
      };
      setAthleteData(updatedProfile);
      localStorage.setItem('gymconnect_user_profile', JSON.stringify(updatedProfile));

      alert(`🎉 Вы успешно привязаны к тренеру ${foundCoach.first_name || ''} (@${cleanInput})!`);
      if (onUpdate) onUpdate();
      fetchFreshProfile();
    } catch (err) {
      setLinkError('Ошибка привязки: ' + err.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Программа от тренера
  const programData = athleteData?.assigned_program?.days || athleteData?.assigned_program || {
    1: {
      title: 'День 1: Базовый тренировочный комплекс',
      exercises: [
        { name: 'Приседания со штангой на плечах', sets: 4, reps: 10, weight: 60, notes: 'Контроль коленей', isBodyweight: false },
        { name: 'Жим штанги лежа на горизонтальной скамье', sets: 4, reps: 8, weight: 55, notes: 'Пауза внизу 1 сек', isBodyweight: false },
        { name: 'Подтягивания на перекладине широким хватом', sets: 3, reps: 8, weight: 0, notes: 'Свой вес', isBodyweight: true }
      ]
    },
    2: {
      title: 'День 2: Объем и функционал',
      exercises: [
        { name: 'Румынская становая тяга с гантелями', sets: 4, reps: 10, weight: 18, notes: 'Растяжка бедра', isBodyweight: false },
        { name: 'Жим гантелей на наклонной скамье (30°)', sets: 4, reps: 10, weight: 20, notes: 'Верх груди', isBodyweight: false },
        { name: 'Классическая планка на предплечьях', sets: 3, reps: 45, weight: 0, notes: 'Свой вес', isBodyweight: true }
      ]
    }
  };

  const programDayKeys = Object.keys(programData);
  const currentDayProgram = programData[selectedDay] || programData[programDayKeys[0]];

  // Финансы
  const leftTrainings = athleteData?.left_trainings !== undefined 
    ? athleteData.left_trainings 
    : (athleteData?.remaining_workouts !== undefined ? athleteData.remaining_workouts : 12);
  const totalTrainings = athleteData?.total_trainings || 12;
  const isPaid = athleteData?.payment_status === 'paid' || !athleteData?.payment_status;

  const coachPhone = trainerData?.phone ? String(trainerData.phone).replace(/\D/g, '') : '';
  const coachUsername = trainerData?.username ? String(trainerData.username).replace('@', '').trim() : cleanTrainerUsername;

  return (
    <div className="min-h-screen w-full bg-[#F2F2F7] flex flex-col select-none animate-in fade-in duration-150">
      
      {/* Верхний бар */}
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

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={fetchFreshProfile}
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg active:scale-90 transition-all cursor-pointer"
              title="Обновить данные"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {hasLinkedCoach && (
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-mono">
                {leftTrainings} зан.
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="p-3.5 space-y-3.5 max-w-md mx-auto w-full pb-20">
        
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
                      {trainerData?.gym ? trainerData.gym.split('|')[0] : (athleteData?.gym ? athleteData.gym.split('|')[0] : 'Алматы')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {coachUsername && (
                    <a
                      href={`https://t.me/${coachUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center border border-[#229ED9]/25 shadow-2xs active:scale-90 transition-transform"
                      title="Telegram"
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
                      title="WhatsApp"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.67-1.4 1.23-1.92 1.31-.5.08-1.15.11-3.69-.94-3.25-1.34-5.32-4.66-5.48-4.88-.16-.22-1.31-1.74-1.31-3.32 0-1.58.83-2.35 1.12-2.67.3-.32.65-.4.87-.4.22 0 .44 0 .63.01.2.01.47-.08.73.57.27.67.92 2.24 1 2.4.08.16.13.35.03.57-.1.22-.16.35-.31.54-.16.19-.34.42-.48.56-.16.16-.33.33-.14.66.19.33.85 1.4 1.82 2.26 1.25 1.11 2.3 1.46 2.63 1.62.33.16.52.14.71-.08.2-.22.84-.98 1.06-1.32.22-.34.44-.28.74-.17.3.11 1.9.9 2.23 1.06.33.16.55.24.63.38.08.14.08.81-.16 1.48z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Статус тренера сегодня */}
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

            {/* 3 ТАБА */}
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
                
                {/* Фиксация явки (кнопки исчезают после отметки) */}
                <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Тренировка сегодня</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Статус посещения</span>
                  </div>

                  {attendanceToday && !isChangingAttendance ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {attendanceToday === 'attending' ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                            <X className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {attendanceToday === 'attending' ? 'Вы подтвердили: Буду на тренировке 👍' : 'Вы отметили: Не смогу прийти ✕'}
                          </p>
                          <p className="text-[10px] text-slate-400">Тренер видит ваш статус в расписании</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsChangingAttendance(true)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-[10.5px] font-semibold text-slate-700 active:scale-95 cursor-pointer shadow-2xs"
                      >
                        Изменить
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Отметьте статус, чтобы тренер заранее знал о вашей явке:
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSetAttendance('attending')}
                          className="py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>Буду на тренировке</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetAttendance('missed')}
                          className="py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer active:scale-95 transition-all"
                        >
                          <X className="w-4 h-4" />
                          <span>Не смогу прийти</span>
                        </button>
                      </div>
                    </>
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
                    {currentDayProgram?.exercises && Array.isArray(currentDayProgram.exercises) && currentDayProgram.exercises.length > 0 ? (
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

                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-sans block">Стоимость блока</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {athleteData?.monthly_price ? `${Number(athleteData.monthly_price).toLocaleString()} ₸` : '70 000 ₸'}
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

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block">Срок действия:</span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {athleteData?.is_expiring === false 
                      ? 'Несгораемый абонемент: тренировки не сгорают по времени.' 
                      : 'Блок активен в течение 35 дней с момента первого занятия.'}
                  </p>
                </div>
              </div>
            )}

            {/* ================= ВКЛАДКА 3: БЕЗОПАСНЫЙ ПОЛНЫЙ ПРОФАЙЛ ТРЕНЕРА ================= */}
            {activeTab === 'coach' && (
              <div className="space-y-3.5 text-xs text-slate-700 animate-in fade-in">
                
                {/* 1. Главная визитка наставника */}
                <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden shadow-2xs">
                      {trainerData?.photo_url || trainerData?.avatar_url ? (
                        <img src={trainerData.photo_url || trainerData.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{cleanTrainerUsername[0]?.toUpperCase() || 'C'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {trainerData?.full_name || `${trainerData?.first_name || 'Тренер'} ${trainerData?.last_name || ''}`.trim() || `@${cleanTrainerUsername}`}
                      </h3>
                      <p className="text-xs text-blue-600 font-mono mt-0.5">@{cleanTrainerUsername}</p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Опыт работы: <b>{trainerData?.experience_years || 3} года</b></span>
                      </p>
                    </div>
                  </div>

                  {/* Быстрые контакты */}
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    {coachPhone && (
                      <a
                        href={`https://wa.me/7${coachPhone.slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-all active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {coachUsername && (
                      <a
                        href={`https://t.me/${coachUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] rounded-xl font-bold flex items-center justify-center gap-1.5 border border-[#229ED9]/20 transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegram</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. Залы и специализации */}
                <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <p className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2">Локации и направления</p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{trainerData?.gym || 'Зал в Алматы'}</span>
                    </div>
                    {trainerData?.secondary_gym && (
                      <p className="text-[10.5px] text-slate-500 pl-5">Второй зал: {trainerData.secondary_gym}</p>
                    )}
                  </div>

                  {/* Безопасный вывод специализаций */}
                  {specializationsList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Специализации тренера:</span>
                      <div className="flex flex-wrap gap-1">
                        {specializationsList.map((spec, sIdx) => (
                          <span key={sIdx} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl font-semibold text-[10.5px]">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. О себе */}
                {trainerData?.bio && (
                  <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
                    <p className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2">О тренере и методике</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {trainerData.bio}
                    </p>
                  </div>
                )}

                {/* 4. Безопасное расписание смен тренера */}
                <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-slate-900">График присутствия в клубе</span>
                    <span className="text-[10px] text-slate-400">Алматы</span>
                  </div>

                  <div className="space-y-1.5">
                    {parsedScheduleSlots ? (
                      Object.entries(parsedScheduleSlots).map(([dayKey, slots]) => {
                        const dayLabels = {
                          monday: 'Понедельник', tuesday: 'Вторник', wednesday: 'Среда',
                          thursday: 'Четверг', friday: 'Пятница', saturday: 'Суббота', sunday: 'Воскресенье'
                        };
                        const hasShift = Array.isArray(slots) && slots.length > 0;
                        return (
                          <div key={dayKey} className="flex justify-between items-center p-2 bg-slate-50 rounded-xl text-[11px]">
                            <span className="text-slate-700 font-medium">{dayLabels[dayKey] || dayKey}:</span>
                            <span className={`font-mono font-bold ${hasShift ? 'text-blue-700' : 'text-slate-400'}`}>
                              {hasShift 
                                ? slots.filter(s => s && s.start && s.end).map(s => `${s.start} - ${s.end}`).join(', ') 
                                : 'Выходной'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 text-xs italic">График уточняется у наставника.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        ) : (
          /* ================= СЦЕНАРИЙ Б: ТРЕНЕР НЕ ПРИВЯЗАН ================= */
          <div className="space-y-3.5">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs text-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                <Dumbbell className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">У вас пока не привязан тренер</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Привяжите наставника по его Telegram никнейму, чтобы получать персональную программу тренировок, расписание и баланс занятий.
              </p>
            </div>

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
          </div>
        )}

      </main>

    </div>
  );
}
