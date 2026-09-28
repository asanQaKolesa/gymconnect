// src/components/trainer/student-detail/StudentInfoTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Edit3, 
  Save, 
  CheckCircle2, 
  X, 
  Activity, 
  User, 
  HeartPulse, 
  Sparkles,
  Award,
  Globe2
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function StudentInfoTab({ student, onUpdate }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [healthNotes, setHealthNotes] = useState(student?.health_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      setHealthNotes(student.health_notes || '');
    }
  }, [student]);

  if (!student) return null;

  // Форматирование уровня подготовки
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

  // Расчет индекса массы тела (ИМТ)
  const calcBMI = () => {
    const h = Number(student.height);
    const w = Number(student.weight);
    if (!h || !w) return null;
    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
    let category = 'Нормальный вес';
    if (bmi < 18.5) category = 'Дефицит веса';
    else if (bmi >= 25 && bmi < 30) category = 'Плотное телосложение / мышечная масса';
    else if (bmi >= 30) category = 'Избыточный вес';
    return { value: bmi, category };
  };

  const bmiData = calcBMI();

  // Сохранение отредактированных заметок по здоровью
  const handleSaveHealthNotes = async () => {
    if (!student.id) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ health_notes: healthNotes.trim() })
        .eq('id', student.id);

      if (error) throw error;

      setIsEditingHealth(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Очистка контактов
  const cleanPhone = student.phone || student.whatsapp ? String(student.phone || student.whatsapp).replace(/\D/g, '') : '';
  const cleanUsername = student.username || student.telegram_username ? String(student.username || student.telegram_username).replace('@', '').trim() : '';
  const cleanInstagram = student.instagram ? String(student.instagram).replace('@', '').trim() : '';

  return (
    <div className="space-y-3.5 text-xs text-slate-700 select-none pb-6">
      
      {/* 1. БЛОК ОГРАНИЧЕНИЙ ПО ЗДОРОВЬЮ (PAR-Q) С КАРАНДАШИКОМ ✏️ */}
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
                  setHealthNotes(student.health_notes || '');
                  setIsEditingHealth(false);
                }}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg active:scale-95 transition-all cursor-pointer"
                title="Отмена"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveHealthNotes}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10.5px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                <span>{isSaving ? '...' : 'Сохранить'}</span>
              </button>
            </div>
          )}
        </div>

        {saveSuccess && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Заметки по здоровью успешно сохранены в базе!</span>
          </div>
        )}

        {!isEditingHealth ? (
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 space-y-1">
            <p className="text-[11px] text-amber-950 leading-relaxed font-normal whitespace-pre-line">
              {healthNotes || 'Ограничений не зафиксировано: жалобы на давление, суставы и старые травмы отсутствуют.'}
            </p>
            <p className="text-[9.5px] text-amber-700/80 pt-1 border-t border-amber-200/50">
              💡 Нажмите «Изменить», чтобы зафиксировать диагнозы, противопоказания к осевым нагрузкам или рекомендации врачей.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              rows={4}
              value={healthNotes}
              onChange={e => setHealthNotes(e.target.value)}
              placeholder="Укажите диагнозы, грыжи, травмы суставов или упражнения, которые категорически запрещено делать этому атлету..."
              className="w-full p-3 bg-amber-50/40 border border-amber-300 rounded-2xl text-xs text-slate-900 leading-relaxed resize-none focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSaving}
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

      {/* 2. АНТРОПОМЕТРИЯ И ИМТ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Параметры тела и антропометрия</span>
          </span>
          {bmiData && (
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              ИМТ: {bmiData.value}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9.5px] text-slate-400 block font-normal">Рост</span>
            <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">
              {student.height ? `${student.height} см` : '—'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9.5px] text-slate-400 block font-normal">Текущий вес</span>
            <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">
              {student.weight ? `${student.weight} кг` : '—'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9.5px] text-slate-400 block font-normal">Возраст</span>
            <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">
              {student.age ? `${student.age} лет` : '—'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9.5px] text-slate-400 block font-normal">Пол</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">
              {student.gender === 'female' ? 'Женский' : 'Мужской'}
            </span>
          </div>
        </div>

        {bmiData && (
          <p className="text-[10px] text-slate-400 text-center font-medium">
            Категория телосложения: <span className="text-slate-700 font-semibold">{bmiData.category}</span>
          </p>
        )}
      </div>

      {/* 3. СПОРТИВНЫЕ ЦЕЛИ И ОПЫТ */}
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
          <span className="text-slate-400">График тренировок:</span>
          <span className="font-semibold text-slate-800">
            {Array.isArray(student.workout_days) && student.workout_days.length > 0 
              ? student.workout_days.join(', ') 
              : 'Пн, Ср, Пт'}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-t border-slate-50">
          <span className="text-slate-400">Время занятий:</span>
          <span className="font-semibold text-slate-800">
            {student.workout_time_slot || 'Вечер (16:00 - 21:00)'}
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

      {/* 4. ЛОКАЦИЯ И ОСНОВНОЙ КЛУБ */}
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

        {student.custom_gym && (
          <p className="text-[10.5px] text-slate-500 italic pl-1">
            Дополнительно: {student.custom_gym}
          </p>
        )}
      </div>

      {/* 5. КОНТАКТЫ И СОЦСЕТИ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <p className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Связь с атлетом</p>

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

      {/* 6. БИО И ПСИХОТИП АТЛЕТА */}
      {(student.bio || student.personality_type) && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <p className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Психотип и информация о себе</p>
          
          {student.personality_type && (
            <div className="flex items-center justify-between text-[11px] py-0.5">
              <span className="text-slate-400">Тренировочный психотип:</span>
              <span className="font-semibold text-slate-800">
                {student.personality_type === 'introvert' ? 'Интроверт (фокус на работе)' :
                 student.personality_type === 'extravert' ? 'Экстраверт (энергия и драйв)' : 'Амбиверт (баланс)'}
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
