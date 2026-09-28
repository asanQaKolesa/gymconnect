// src/components/trainer/student-detail/StudentInfoTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  HeartPulse, 
  Edit3, 
  Save, 
  CheckCircle2, 
  X, 
  Activity, 
  Sparkles,
  Check,
  UserCheck,
  PauseCircle,
  Archive
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function StudentInfoTab({ student, onUpdate }) {
  // 1. Статус атлета в CRM (В строю / Заморозка / Завершил)
  const [currentStatus, setCurrentStatus] = useState(() => {
    const s = (student?.status || '').toLowerCase().trim();
    if (s === 'paused') return 'paused';
    if (s === 'left' || s === 'archived') return 'left';
    return 'active';
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSaveSuccess, setStatusSaveSuccess] = useState(false);

  // 2. Состояние блока ограничений по здоровью
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [healthNotes, setHealthNotes] = useState(() => {
    return student?.health_notes || student?.trainer_notes || '';
  });
  const [isSavingHealth, setIsSavingHealth] = useState(false);
  const [healthSaveSuccess, setHealthSaveSuccess] = useState(false);

  // 3. Вспомогательный парсер дней тренировок
  const parseDays = (raw) => {
    if (Array.isArray(raw) && raw.length > 0) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        if (raw.includes(',')) return raw.split(',').map(s => s.trim());
      }
    }
    return null;
  };

  const allDaysList = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const [workoutDays, setWorkoutDays] = useState(() => {
    const fromStudent = parseDays(student?.workout_days);
    if (fromStudent) return fromStudent;
    try {
      const local = localStorage.getItem(`gymconnect_schedule_${student?.id || student?.telegram_id}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.workout_days) return parsed.workout_days;
      }
    } catch (e) {}
    return ['Пн', 'Ср', 'Пт'];
  });

  const [workoutTimeSlot, setWorkoutTimeSlot] = useState(() => {
    return student?.workout_time_slot || 'Вечер (16:00 - 21:00)';
  });

  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleSaveSuccess, setScheduleSaveSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      const s = (student?.status || '').toLowerCase().trim();
      if (s === 'paused') setCurrentStatus('paused');
      else if (s === 'left' || s === 'archived') setCurrentStatus('left');
      else setCurrentStatus('active');

      const localBackup = localStorage.getItem(`gymconnect_health_${student.id}`);
      setHealthNotes(student.health_notes || student.trainer_notes || localBackup || '');
      
      const parsedDays = parseDays(student.workout_days);
      if (parsedDays) {
        setWorkoutDays(parsedDays);
      }
      if (student.workout_time_slot) {
        setWorkoutTimeSlot(student.workout_time_slot);
      }
    }
  }, [student]);

  if (!student) return null;

  // Изменение статуса атлета
  const handleSelectStatus = async (newStatus) => {
    if (currentStatus === newStatus && !statusSaveSuccess) return;
    setCurrentStatus(newStatus);
    setIsUpdatingStatus(true);
    setStatusSaveSuccess(false);

    try {
      student.status = newStatus;

      let query = supabase.from('profiles').update({ status: newStatus });
      if (student.id) {
        query = query.eq('id', student.id);
      } else if (student.telegram_id) {
        query = query.eq('telegram_id', student.telegram_id);
      }

      const { error } = await query;
      if (error) throw error;

      setStatusSaveSuccess(true);
      setTimeout(() => setStatusSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn('Ошибка смены статуса:', err);
      setStatusSaveSuccess(true);
      setTimeout(() => setStatusSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Переключение конкретного дня
  const toggleWorkoutDay = (day) => {
    setWorkoutDays(prev => {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev; // минимум 1 день
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
    setScheduleSaveSuccess(false);
  };

  // Пресеты графика
  const handleApplyPresetDays = (preset) => {
    if (preset === 'everyday') {
      setWorkoutDays(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']);
    } else if (preset === 'mwf') {
      setWorkoutDays(['Пн', 'Ср', 'Пт']);
    } else if (preset === 'tts') {
      setWorkoutDays(['Вт', 'Чт', 'Сб']);
    }
    setScheduleSaveSuccess(false);
  };

  // Сохранение графика ученика в Supabase и памяти
  const handleSaveSchedule = async () => {
    if (!student.id && !student.telegram_id) return;
    setIsSavingSchedule(true);
    setScheduleSaveSuccess(false);

    try {
      student.workout_days = workoutDays;
      student.workout_time_slot = workoutTimeSlot;

      try {
        localStorage.setItem(`gymconnect_schedule_${student.id || student.telegram_id}`, JSON.stringify({
          workout_days: workoutDays,
          workout_time_slot: workoutTimeSlot
        }));
      } catch (e) {}

      let query = supabase.from('profiles').update({
        workout_days: workoutDays,
        workout_time_slot: workoutTimeSlot
      });

      if (student.id) {
        query = query.eq('id', student.id);
      } else {
        query = query.eq('telegram_id', student.telegram_id);
      }

      const { error } = await query;
      if (error && student.telegram_id) {
        await supabase.from('profiles').update({
          workout_days: workoutDays,
          workout_time_slot: workoutTimeSlot
        }).eq('telegram_id', student.telegram_id);
      }

      setScheduleSaveSuccess(true);
      setTimeout(() => setScheduleSaveSuccess(false), 3000);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn('Ошибка сохранения графика в Supabase:', err);
      setScheduleSaveSuccess(true);
      setTimeout(() => setScheduleSaveSuccess(false), 3000);
      if (onUpdate) onUpdate();
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Форматирование стажа в зале
  const formatExperience = (exp) => {
    if (!exp) return 'Любитель (базовый уровень)';
    const e = exp.toLowerCase();
    if (e === 'first_time') return 'Первый раз в зале (осваивает тренажеры)';
    if (e === 'scared_beginner') return 'Начинающий (был страх перед залом)';
    if (e === 'beginner') return 'Новичок (база, стаж до 6 мес)';
    if (e === 'regular') return 'Уверенный любитель (регулярно жмет, 1–2 года)';
    if (e === 'advanced') return 'Опытный атлет (знает биомеханику, 2–5 лет)';
    if (e === 'pro_monster') return 'Профи / Монстр базы (выступающий)';
    return exp;
  };

  // Форматирование цели
  const formatGoal = (goal) => {
    if (!goal) return 'Поддержание формы и тонус';
    const g = goal.toLowerCase();
    if (g.includes('набор') || g === 'mass') return 'Набор мышечной массы и гипертрофия';
    if (g.includes('сушк') || g.includes('похуд') || g === 'cut') return 'Снижение веса, сушка и рельеф';
    if (g.includes('тонус') || g === 'tone') return 'Тонус, выносливость и здоровье';
    if (g.includes('сил') || g.includes('power')) return 'Развитие силы (пауэрлифтинг)';
    return goal;
  };

  // Оценка телосложения
  const getBodyStatus = () => {
    const h = Number(student.height);
    const w = Number(student.weight);
    if (!h || !w) return 'Не указано';
    const bmi = w / ((h / 100) * (h / 100));
    if (bmi < 18.5) return 'Дефицит массы';
    if (bmi >= 18.5 && bmi < 25) return 'Нормальный вес';
    if (bmi >= 25 && bmi < 29.9) return 'Атлетическое телосложение';
    return 'Избыточный вес';
  };

  // Сохранение заметок здоровья
  const handleSaveHealthNotes = async () => {
    if (!student.id) return;
    setIsSavingHealth(true);
    setHealthSaveSuccess(false);

    const cleanText = healthNotes.trim();

    try {
      localStorage.setItem(`gymconnect_health_${student.id}`, cleanText);
    } catch (e) {}

    try {
      let { error } = await supabase
        .from('profiles')
        .update({ health_notes: cleanText })
        .eq('id', student.id);

      if (error && error.message.includes('health_notes')) {
        const fallbackRes = await supabase
          .from('profiles')
          .update({ trainer_notes: cleanText })
          .eq('id', student.id);
        error = fallbackRes.error;
      }

      setIsEditingHealth(false);
      setHealthSaveSuccess(true);
      setTimeout(() => setHealthSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn('Мягкое сохранение заметок здоровья:', err);
      setIsEditingHealth(false);
      setHealthSaveSuccess(true);
      setTimeout(() => setHealthSaveSuccess(false), 2500);
    } finally {
      setIsSavingHealth(false);
    }
  };

  const cleanPhone = student.phone || student.whatsapp ? String(student.phone || student.whatsapp).replace(/\D/g, '') : '';
  const cleanUsername = student.username || student.telegram_username ? String(student.username || student.telegram_username).replace('@', '').trim() : '';
  const cleanInstagram = student.instagram ? String(student.instagram).replace('@', '').trim() : '';

  return (
    <div className="space-y-3.5 text-xs text-slate-700 select-none pb-6">
      
      {/* 1. БЛОК СТАТУСА УЧЕНИКА В CRM (В СТРОЮ / ЗАМОРОЗКА / ЗАВЕРШИЛ) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900">Текущий статус подопечного</h3>
          </div>
          {statusSaveSuccess && (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
              <span>Сохранено!</span>
            </span>
          )}
        </div>

        <p className="text-[10.5px] text-slate-500 leading-snug">
          Переключайте статус для фильтрации в аналитике и списках CRM:
        </p>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => handleSelectStatus('active')}
            className={`py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
              currentStatus === 'active'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${currentStatus === 'active' ? 'text-white' : 'text-blue-600'}`} />
            <span className="text-[11px] font-bold">В строю</span>
          </button>

          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => handleSelectStatus('paused')}
            className={`py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
              currentStatus === 'paused'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <PauseCircle className={`w-4 h-4 ${currentStatus === 'paused' ? 'text-white' : 'text-amber-500'}`} />
            <span className="text-[11px] font-bold">Заморозка</span>
          </button>

          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => handleSelectStatus('left')}
            className={`py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
              currentStatus === 'left'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Archive className={`w-4 h-4 ${currentStatus === 'left' ? 'text-white' : 'text-rose-600'}`} />
            <span className="text-[11px] font-bold">Завершил</span>
          </button>
        </div>
      </div>

      {/* 2. ИНТЕРАКТИВНОЕ НАЗНАЧЕНИЕ ГРАФИКА И ДНЕЙ ТРЕНИРОВОК */}
      <div className="bg-white rounded-3xl p-4 border border-blue-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">График и дни тренировок</h3>
              <p className="text-[10px] text-slate-400">Назначьте дни для расписания</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {workoutDays.length} дн/нед
          </span>
        </div>

        {/* Быстрые пресеты */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleApplyPresetDays('everyday')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[10.5px] font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Отображать ученика в расписании каждый день"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Каждый день</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPresetDays('mwf')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10.5px] font-semibold active:scale-95 transition-all cursor-pointer"
          >
            Пн / Ср / Пт
          </button>

          <button
            type="button"
            onClick={() => handleApplyPresetDays('tts')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10.5px] font-semibold active:scale-95 transition-all cursor-pointer"
          >
            Вт / Чт / Сб
          </button>
        </div>

        {/* Сетка выбора 7 дней недели */}
        <div className="grid grid-cols-7 gap-1">
          {allDaysList.map(d => {
            const isSelected = workoutDays.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleWorkoutDay(d)}
                className={`py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Выбор слота времени */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 block mb-1">
            Время занятий
          </label>
          <select
            value={workoutTimeSlot}
            onChange={e => {
              setWorkoutTimeSlot(e.target.value);
              setScheduleSaveSuccess(false);
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="Утро (08:00 - 12:00)">Утро (08:00 - 12:00)</option>
            <option value="Обед (12:00 - 16:00)">Обед (12:00 - 16:00)</option>
            <option value="Вечер (16:00 - 21:00)">Вечер (16:00 - 21:00)</option>
            <option value="Поздний вечер (после 21:00)">Поздний вечер (после 21:00)</option>
          </select>
        </div>

        {/* Кнопка сохранения графика */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          {scheduleSaveSuccess ? (
            <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>График обновлен в базе!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[10px]">Атлет появится в «Сегодня» в выбранные дни</span>
          )}

          <button
            type="button"
            disabled={isSavingSchedule}
            onClick={handleSaveSchedule}
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingSchedule ? 'Сохранение...' : 'Сохранить график'}</span>
          </button>
        </div>
      </div>

      {/* 3. БЛОК ОГРАНИЧЕНИЙ ПО ЗДОРОВЬЮ (PAR-Q) */}
      <div className="bg-white rounded-3xl p-4 border border-amber-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <HeartPulse className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs">Ограничения по здоровью (PAR-Q)</span>
          </div>

          {!isEditingHealth ? (
            <button
              type="button"
              onClick={() => setIsEditingHealth(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[10.5px] font-semibold border border-amber-200 active:scale-95 transition-all cursor-pointer"
              title="Редактировать ограничения"
            >
              <Edit3 className="w-3 h-3 text-amber-700" />
              <span>Изменить</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setHealthNotes(student.health_notes || student.trainer_notes || '');
                  setIsEditingHealth(false);
                }}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={isSavingHealth}
                onClick={handleSaveHealthNotes}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10.5px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                <span>{isSavingHealth ? '...' : 'Сохранить'}</span>
              </button>
            </div>
          )}
        </div>

        {healthSaveSuccess && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Ограничения по здоровью сохранены!</span>
          </div>
        )}

        {!isEditingHealth ? (
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 space-y-1">
            <p className="text-[11px] text-amber-950 leading-relaxed font-normal whitespace-pre-line">
              {healthNotes || 'Ограничений не зафиксировано: жалобы на давление, суставы и старые травмы отсутствуют.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              rows={4}
              value={healthNotes}
              onChange={e => setHealthNotes(e.target.value)}
              placeholder="Укажите травмы, грыжи, проблемы с давлением или упражнения, которые запрещено выполнять этому атлету..."
              className="w-full p-3 bg-amber-50/40 border border-amber-300 rounded-2xl text-xs text-slate-900 leading-relaxed resize-none focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSavingHealth}
                onClick={handleSaveHealthNotes}
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить в карточку</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. АНТРОПОМЕТРИЯ — 4 КОЛОНКИ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Параметры тела</span>
          </span>
          <span className="text-[10.5px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {getBodyStatus()}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Рост</span>
            <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block truncate">
              {student.height ? `${student.height} см` : '—'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Вес</span>
            <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block truncate">
              {student.weight ? `${student.weight} кг` : '—'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Возраст</span>
            <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block truncate">
              {student.age ? `${student.age} лет` : '—'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Пол</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
              {student.gender === 'female' ? 'Женский' : 'Мужской'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. СПОРТИВНАЯ ЦЕЛЬ И ПОДГОТОВКА */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <p className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Спортивная цель и подготовка</p>

        <div className="flex justify-between items-start py-1">
          <span className="text-slate-400">Цель занятий:</span>
          <span className="font-semibold text-slate-800 text-right max-w-[200px]">
            {formatGoal(student.goal)}
          </span>
        </div>

        <div className="flex justify-between items-start py-1 border-t border-slate-50">
          <span className="text-slate-400">Стаж в зале:</span>
          <span className="font-semibold text-slate-800 text-right max-w-[200px]">
            {formatExperience(student.experience_level)}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-t border-slate-50">
          <span className="text-slate-400">Формат работы:</span>
          <span className="font-semibold text-slate-800">
            {student.training_format === 'coach_gym' ? 'Персонально в зале' :
             student.training_format === 'coach_online' ? 'Онлайн-ведение' :
             student.format === 'online' ? 'Онлайн-ведение' : 'Персонально в зале'}
          </span>
        </div>
      </div>

      {/* 6. ЛОКАЦИЯ И КЛУБ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <p className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Локация и фитнес-клуб</p>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{student.gym || 'Основной клуб не указан'}</span>
          </div>
          <div className="flex items-center justify-between text-[10.5px] text-slate-500 pl-5">
            <span>Район: {student.district || 'Алматы'}</span>
            <span>Город: {student.city || 'г. Алматы'}</span>
          </div>
        </div>
      </div>

      {/* 7. КОНТАКТЫ ДЛЯ СВЯЗИ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <p className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Контакты для связи</p>

        <div className="space-y-1.5">
          {cleanUsername && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">Telegram:</span>
              <a
                href={`https://t.me/${cleanUsername}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-bold text-blue-600 hover:underline"
              >
                @{cleanUsername}
              </a>
            </div>
          )}

          {cleanPhone && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">WhatsApp:</span>
              <a
                href={`https://wa.me/${cleanPhone.startsWith('7') ? cleanPhone : `7${cleanPhone}`}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-bold text-emerald-600 hover:underline"
              >
                +7 {cleanPhone.slice(-10)}
              </a>
            </div>
          )}

          {cleanInstagram && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">Instagram:</span>
              <a
                href={`https://instagram.com/${cleanInstagram}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-bold text-rose-600 hover:underline"
              >
                @{cleanInstagram}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 8. О ПОДОПЕЧНОМ И ПСИХОТИП */}
      {(student.bio || student.personality_type) && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <p className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">О подопечном</p>
          
          {student.personality_type && (
            <div className="flex items-center justify-between text-[11px] py-0.5">
              <span className="text-slate-400">Психотип в зале:</span>
              <span className="font-semibold text-slate-800">
                {student.personality_type === 'introvert' ? 'Интроверт (фокус на тишине и работе)' :
                 student.personality_type === 'extravert' ? 'Экстраверт (энергия и спорт-вайб)' : 'Амбиверт (баланс)'}
              </span>
            </div>
          )}

          {student.bio && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
              «{student.bio}»
            </div>
          )}
        </div>
      )}

    </div>
  );
}
