// src/components/ui/DesignSystemShowcase.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  Users, 
  Flame, 
  ArrowLeft, 
  DollarSign, 
  Zap, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Minus, 
  Search, 
  X, 
  Check, 
  RotateCcw, 
  Clock, 
  ExternalLink, 
  ClipboardList, 
  Trash2,
  ChevronDown,
  Send,
  Timer,
  PenTool,
  Palette,
  Type,
  AlignLeft,
  CheckCircle2
} from 'lucide-react';

export default function DesignSystemShowcase({ onBack }) {
  const [activeSplit, setActiveSplit] = useState('fullbody');
  const [activeDaysCount, setActiveDaysCount] = useState(3);
  
  // 9 анатомических зон мышц
  const muscleGroups = [
    'Грудь', 
    'Спина', 
    'Квадрицепс', 
    'Ягодицы и бицепс бедра', 
    'Плечи (Дельты)', 
    'Бицепс', 
    'Трицепс', 
    'Пресс и кор', 
    'Кардио и функционал'
  ];

  const exercisesByMuscle = {
    'Грудь': [
      { name: 'Жим штанги на наклонной скамье 30°', equipment: 'Штанга' },
      { name: 'Жим гантелей на горизонтальной скамье', equipment: 'Гантели' },
      { name: 'Сведение рук в кроссовере на блоках', equipment: 'Блок' },
      { name: 'Отжимания на брусьях с весом', equipment: 'Свой вес' }
    ],
    'Спина': [
      { name: 'Тяга верхнего блока широким хватом к груди', equipment: 'Блок' },
      { name: 'Подтягивания на перекладине', equipment: 'Свой вес' },
      { name: 'Тяга штанги в наклоне к поясу', equipment: 'Штанга' },
      { name: 'Горизонтальная тяга блока к животу', equipment: 'Блок' }
    ],
    'Квадрицепс': [
      { name: 'Классические приседания со штангой', equipment: 'Штанга' },
      { name: 'Жим ногами в платформе 45°', equipment: 'Тренажер' },
      { name: 'Болгарские сплит-приседания с гантелями', equipment: 'Гантели' }
    ],
    'Ягодицы и бицепс бедра': [
      { name: 'Ягодичный мост со штангой на скамье', equipment: 'Штанга' },
      { name: 'Румынская тяга со штангой или гантелями', equipment: 'Штанга' },
      { name: 'Сгибания ног лежа в тренажере', equipment: 'Тренажер' }
    ],
    'Плечи (Дельты)': [
      { name: 'Жим штанги стоя (Армейский жим)', equipment: 'Штанга' },
      { name: 'Махи гантелями через стороны стоя', equipment: 'Гантели' },
      { name: 'Тяга каната к лицу (Face Pull)', equipment: 'Блок' }
    ],
    'Бицепс': [
      { name: 'Подъем штанги на бицепс стоя', equipment: 'Штанга' },
      { name: 'Сгибания рук с гантелями с супинацией', equipment: 'Гантели' }
    ],
    'Трицепс': [
      { name: 'Французский жим с EZ-грифом лежа', equipment: 'EZ-гриф' },
      { name: 'Разгибание на блоке вниз с канатом', equipment: 'Блок' }
    ],
    'Пресс и кор': [
      { name: 'Скручивания на наклонной скамье', equipment: 'Свой вес' },
      { name: 'Подъем ног в висе на перекладине', equipment: 'Свой вес' },
      { name: 'Классическая планка на локтях', equipment: 'Время' }
    ],
    'Кардио и функционал': [
      { name: 'Беговая дорожка (интервалы в горку)', equipment: 'Время' },
      { name: 'Эллиптический тренажер (пульс 130)', equipment: 'Время' }
    ]
  };

  const [selectedMuscle, setSelectedMuscle] = useState('Грудь');
  const [selectedExercise, setSelectedExercise] = useState('Жим штанги на наклонной скамье 30°');
  const [selectedEquipment, setSelectedEquipment] = useState('Штанга');
  const [isMuscleDropdownOpen, setIsMuscleDropdownOpen] = useState(false);
  const [isExerciseDropdownOpen, setIsExerciseDropdownOpen] = useState(false);
  const [isCustomExerciseMode, setIsCustomExerciseMode] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');

  // Параметры нагрузки
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(60);
  const [restTime, setRestTime] = useState(90);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastText, setToastText] = useState(null);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkoutPlanOpen, setIsWorkoutPlanOpen] = useState(false);
  const [activePushPreview, setActivePushPreview] = useState('workout');

  const showToast = (text) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2500);
  };

  const handleNumberInput = (setter, raw) => {
    if (raw === '') {
      setter('');
      return;
    }
    const clean = raw.replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    setter(isNaN(num) ? '' : num);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 pb-36 font-sans select-none antialiased relative">
      
      {/* 1. ТОСТ DYNAMIC ISLAND */}
      {toastText && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm w-full px-4 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-2xl text-slate-900 px-4 py-3 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.1)] border border-slate-200 flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2.5 text-xs font-semibold whitespace-nowrap min-w-0">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <span className="truncate">{toastText}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setToastText(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. ШАПКА */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap truncate">
                GymConnect UI Standards
              </h1>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70 whitespace-nowrap shrink-0">
                1-Line Law
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5 truncate whitespace-nowrap">
              Строгое правило одной строки для заголовков
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          GC
        </div>
      </div>

      <div className="max-w-md mx-auto p-3.5 space-y-4">

        {/* ================= РАЗДЕЛ 0: ДЕМОНСТРАЦИЯ ПРАВИЛ ВЁРСТКИ ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <AlignLeft className="w-4 h-4 text-blue-600 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800 whitespace-nowrap truncate">
              Правила вёрстки: Заголовок vs Описание
            </h3>
          </div>

          {/* Пример правила 1 */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-bold text-blue-700 whitespace-nowrap shrink-0">
                Правило 1 (Строго 1 строка):
              </span>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                truncate
              </span>
            </div>
            {/* Даже гигантское название не ломает строку */}
            <p className="text-[13.5px] font-bold text-slate-900 truncate whitespace-nowrap">
              Жим штанги на наклонной скамье 30° с широкой постановкой рук и медленной фазой
            </p>
          </div>

          {/* Пример правила 2 */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-bold text-emerald-700 whitespace-nowrap shrink-0">
                Правило 2 (Разрешено 2–3 строки):
              </span>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                leading-relaxed
              </span>
            </div>
            {/* Описание спокойно занимает несколько строк с красивым отступом */}
            <p className="text-[11.5px] text-slate-600 font-normal leading-relaxed">
              Локти под 45 градусов к корпусу. Пауза в нижней точке 1 секунда для растяжения грудных. Подъем на выдохе без резкого отбива от груди.
            </p>
          </div>
        </div>

        {/* ================= 1. КАРТОЧКА АТЛЕТА В РАСПИСАНИИ (БЕЗ ЗАЛА, БЕЗ ТОЧЕК) ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 whitespace-nowrap truncate">
              Расписание на сегодня
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap truncate">
              Имя атлета и бейджи строго в своих рядах
            </p>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70 space-y-3">
            
            {/* Профиль атлета */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center justify-between gap-3 cursor-pointer group active:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Асанали"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                />

                <div className="min-w-0 flex-1">
                  {/* Имя целиком в 1 строку */}
                  <h4 className="text-[14px] font-bold text-slate-900 leading-snug whitespace-nowrap truncate">
                    Асанали Кусайынов
                  </h4>

                  {/* Бейджи времени и цели в 1 строку (без точек и без зала) */}
                  <div className="flex items-center gap-1.5 mt-1.5 whitespace-nowrap overflow-hidden">
                    <span className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 shadow-2xs">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>18:30</span>
                    </span>

                    <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-lg truncate shrink-0">
                      Набор массы
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-2xs">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Панель действий в 1 строку */}
            <div className="pt-2.5 border-t border-slate-200/70 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWorkoutPlanOpen(!isWorkoutPlanOpen)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isWorkoutPlanOpen
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs active:scale-95'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="whitespace-nowrap">План дня</span>
              </button>

              <div className="flex-1 min-w-0">
                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompleted(false);
                      showToast('↩ Списание отменено');
                    }}
                    className="w-full py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Вернуть (+1)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompleted(true);
                      showToast('✅ Тренировка проведена');
                    }}
                    className="w-full py-2.5 px-3 bg-[#1D4ED8] hover:bg-blue-800 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/25 whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                    <span>Проведено</span>
                  </button>
                )}
              </div>
            </div>

            {/* Раскрывающийся план дня */}
            {isWorkoutPlanOpen && (
              <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                  <span className="text-xs whitespace-nowrap truncate">День 1: Грудь и Трицепс</span>
                  <span className="text-[10.5px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                    3 упражнения
                  </span>
                </div>

                {/* Упражнение 1 */}
                <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-1.5">
                  <p className="text-xs font-bold text-slate-900 whitespace-nowrap truncate">
                    1. Жим штанги на наклонной скамье 30°
                  </p>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      4 подхода
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      10 повторений
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      60 кг
                    </span>
                  </div>
                </div>

                {/* Упражнение 2 */}
                <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-1.5">
                  <p className="text-xs font-bold text-slate-900 whitespace-nowrap truncate">
                    2. Жим гантелей под углом
                  </p>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      3 подхода
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      12 повторений
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      18 кг
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= 2. КАРТОЧКА УПРАЖНЕНИЯ: ПРОСТОРНЫЕ КВАДРАТНЫЕ КНОПКИ ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 whitespace-nowrap truncate">
                Карточка упражнения и нагрузки
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap truncate">
                Кнопки квадратные 36×36px • ничего не накладывается
              </p>
            </div>
            
            <button 
              type="button" 
              className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3">
            
            {/* Группа мышц */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Группа мышц:</span>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">9 зон анатомии</span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMuscleDropdownOpen(!isMuscleDropdownOpen);
                    setIsExerciseDropdownOpen(false);
                  }}
                  className="w-full py-2.5 px-3 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span className="truncate whitespace-nowrap">{selectedMuscle}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isMuscleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMuscleDropdownOpen && (
                  <div className="mt-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl grid grid-cols-2 gap-1 animate-in fade-in z-20 max-h-52 overflow-y-auto">
                    {muscleGroups.map(mg => (
                      <button
                        key={mg}
                        type="button"
                        onClick={() => {
                          setSelectedMuscle(mg);
                          const firstEx = exercisesByMuscle[mg]?.[0];
                          setSelectedExercise(firstEx?.name || 'Новое упражнение');
                          setSelectedEquipment(firstEx?.equipment || 'Штанга');
                          setIsMuscleDropdownOpen(false);
                          setIsCustomExerciseMode(false);
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer truncate whitespace-nowrap ${
                          selectedMuscle === mg ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {mg}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Название упражнения (Строго в 1 строку с троеточием) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Упражнение:</span>
                <button
                  type="button"
                  onClick={() => setIsCustomExerciseMode(!isCustomExerciseMode)}
                  className="text-[10.5px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <PenTool className="w-3 h-3 shrink-0" />
                  <span>{isCustomExerciseMode ? 'Из базы' : '+ Своё'}</span>
                </button>
              </div>

              {isCustomExerciseMode ? (
                <input
                  type="text"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder="Введите авторское название упражнения..."
                  className="w-full px-3 py-2 bg-white border border-blue-400 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs whitespace-nowrap truncate"
                />
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExerciseDropdownOpen(!isExerciseDropdownOpen);
                      setIsMuscleDropdownOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-2xs text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      <span className="truncate whitespace-nowrap">{selectedExercise}</span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                        {selectedEquipment}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isExerciseDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isExerciseDropdownOpen && (
                    <div className="mt-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-0.5 animate-in fade-in z-20 max-h-48 overflow-y-auto">
                      {(exercisesByMuscle[selectedMuscle] || []).map(item => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setSelectedExercise(item.name);
                            setSelectedEquipment(item.equipment);
                            setIsExerciseDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                            selectedExercise === item.name ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate whitespace-nowrap flex-1">{item.name}</span>
                          <span className="text-[9.5px] text-slate-400 font-mono ml-2 shrink-0">{item.equipment}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* СЕТЫ И ПОВТОРЫ В 2 КОЛОНКИ: КВАДРАТНЫЕ КНОПКИ 36×36px */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              
              {/* Сеты */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-500 block text-center mb-2 whitespace-nowrap">
                  Подходы (сеты)
                </span>
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setSets(s => Math.max(1, (Number(s) || 0) - 1))}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shrink-0"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={sets}
                    onChange={(e) => handleNumberInput(setSets, e.target.value)}
                    className="w-10 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSets(s => (Number(s) || 0) + 1)}
                    className="w-9 h-9 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Повторы */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-500 block text-center mb-2 whitespace-nowrap">
                  Повторения
                </span>
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setReps(r => Math.max(1, (Number(r) || 0) - 1))}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shrink-0"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={reps}
                    onChange={(e) => handleNumberInput(setReps, e.target.value)}
                    className="w-10 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setReps(r => (Number(r) || 0) + 1)}
                    className="w-9 h-9 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

            </div>

            {/* Рабочий вес отдельной строкой */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block whitespace-nowrap">Рабочий вес</span>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Шаг 2.5 кг</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setWeight(w => Math.max(0, Math.round(((Number(w) || 0) - 2.5) * 10) / 10))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shrink-0"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weight}
                    placeholder="0"
                    onChange={(e) => handleNumberInput(setWeight, e.target.value)}
                    className="w-12 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <span className="text-xs font-mono font-bold text-slate-500">кг</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWeight(w => Math.round(((Number(w) || 0) + 2.5) * 10) / 10)}
                  className="w-9 h-9 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Время отдыха */}
            <div className="pt-0.5 flex items-center justify-between">
              <span className="text-[10.5px] font-medium text-slate-500 flex items-center gap-1 whitespace-nowrap">
                <Timer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Отдых между сетами:</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {[60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRestTime(sec)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                      restTime === sec
                        ? 'bg-[#1D4ED8] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sec}с
                  </button>
                ))}
              </div>
            </div>

            {/* Заметка тренера (Правило 2: Разрешено 2-3 строки) */}
            <textarea
              rows={2}
              placeholder="Подсказка по технике: локти под 45 градусов, пауза в нижней точке 1 секунда для растяжения..."
              className="w-full px-3 py-2 bg-white border border-slate-200/70 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-500 shadow-2xs resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* ================= 3. ЦЕНТР ПУШ-УВЕДОМЛЕНИЙ (БЕЗ СМИНАНИЯ) ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 whitespace-nowrap truncate">
                <Send className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Быстрые пуши ученику в Telegram</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap truncate">
                Мгновенная отправка через бота
              </p>
            </div>

            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap shrink-0">
              Live Bot
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setActivePushPreview('workout');
                showToast('План дня отправлен ученику в бот');
              }}
              className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center h-15 ${
                activePushPreview === 'workout'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs truncate block font-bold whitespace-nowrap">План дня</span>
              <span className="text-[10px] text-slate-400 truncate block mt-0.5 font-medium whitespace-nowrap">Отправить</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePushPreview('reminder');
                showToast('Напоминание отправлено');
              }}
              className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center h-15 ${
                activePushPreview === 'reminder'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs truncate block font-bold whitespace-nowrap">Напоминание</span>
              <span className="text-[10px] text-slate-400 truncate block mt-0.5 font-medium whitespace-nowrap">30 минут</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePushPreview('payment');
                showToast('Счет на оплату отправлен');
              }}
              className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center h-15 ${
                activePushPreview === 'payment'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs truncate block font-bold whitespace-nowrap">Оплата</span>
              <span className="text-[10px] text-slate-400 truncate block mt-0.5 font-medium whitespace-nowrap">Остаток 1</span>
            </button>
          </div>

          {/* Превью пуша */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-200/60 pb-1">
              <span>Сообщение в боте атлета:</span>
              <span>@gymconnect_ala_bot</span>
            </div>

            {activePushPreview === 'workout' && (
              <p className="text-[11.5px] text-slate-800 leading-relaxed pt-0.5">
                🏋️ <b>Ваш тренер назначил план тренировки!</b><br />
                День 1: Грудь и Трицепс (3 упражнения, рабочий вес 60 кг).<br />
                <span className="text-blue-600 font-semibold">Откройте приложение, чтобы посмотреть схему.</span>
              </p>
            )}

            {activePushPreview === 'reminder' && (
              <p className="text-[11.5px] text-slate-800 leading-relaxed pt-0.5">
                ⏰ <b>Напоминание о тренировке!</b><br />
                Жду тебя сегодня в зале к 18:30. Не опаздывай, начнем с разминки! 💪
              </p>
            )}

            {activePushPreview === 'payment' && (
              <p className="text-[11.5px] text-slate-800 leading-relaxed pt-0.5">
                💳 <b>Продление абонемента</b><br />
                У вас осталось 1 занятие в текущем блоке. Продлите абонемент, чтобы зафиксировать слот!
              </p>
            )}
          </div>
        </div>

        {/* ================= 4. РАЗДЕЛЫ УПРАВЛЕНИЯ ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-2">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 whitespace-nowrap truncate">
              Разделы управления
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap truncate">
              Быстрый переход по функциям
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <div 
              onClick={() => showToast('Открыта база учеников')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight whitespace-nowrap truncate">
                    База подопечных атлетов
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap truncate">
                    14 учеников в залах Алматы
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>

            <div 
              onClick={() => showToast('Открыта касса')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight whitespace-nowrap truncate">
                    Касса и абонементы
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 whitespace-nowrap truncate">
                    840 000 ₸ за текущий месяц
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap">
                Оплачено
              </span>
            </div>

            <div 
              onClick={() => showToast('Стрик дисциплины: 44 недели')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight whitespace-nowrap truncate">
                    Дисциплина (Streak)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap truncate">
                    Рекорд тренера: 44 недели в строю 🔥
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>

            <div 
              onClick={() => showToast('Внимание: у атлета есть травмы')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight whitespace-nowrap truncate">
                    Ограничения по здоровью
                  </h4>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5 whitespace-nowrap truncate">
                    Без осевой нагрузки на спину
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>
          </div>
        </div>

        {/* ================= 5. ДНЕЙ В НЕДЕЛЮ (1–7) ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 whitespace-nowrap truncate">
              Дней тренировок в неделю
            </h3>
            <span className="text-xs font-mono font-bold text-blue-600 whitespace-nowrap shrink-0">{activeDaysCount} дня / нед.</span>
          </div>

          <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1 rounded-2xl">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDaysCount(d)}
                className={`py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                  activeDaysCount === d 
                    ? 'bg-[#1D4ED8] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 whitespace-nowrap">
              Схема тренировочного сплита:
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'fullbody', label: 'Full Body' },
                { id: 'upper_lower', label: 'Верх / Низ' },
                { id: 'ppl', label: 'PPL' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSplit(item.id)}
                  className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center truncate whitespace-nowrap ${
                    activeSplit === item.id 
                      ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= 6. КНОПКА ДЕЙСТВИЯ ================= */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => showToast('План тренировок назначен подопечному!')}
            className="w-full py-3.5 px-5 bg-[#1D4ED8] hover:bg-blue-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(29,78,216,0.22)] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-4 h-4 fill-current text-white shrink-0" />
            <span>Сохранить и отправить план в Telegram</span>
          </button>
        </div>

      </div>

      {/* МИНИ-ШТОРКА АНКЕТЫ АТЛЕТА */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-0 animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl w-full max-w-md p-4 space-y-3.5 shadow-2xl border-t border-white animate-in slide-in-from-bottom-5 duration-200">
            
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Асанали"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-slate-900 whitespace-nowrap truncate">Асанали Кусайынов</h4>
                  <p className="text-[11px] text-slate-400 whitespace-nowrap truncate">Анкета подопечного атлета</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-semibold whitespace-nowrap">Рост</span>
                <span className="text-xs font-bold text-slate-900 font-mono">178 см</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-semibold whitespace-nowrap">Вес</span>
                <span className="text-xs font-bold text-slate-900 font-mono">75 кг</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-semibold whitespace-nowrap">Возраст</span>
                <span className="text-xs font-bold text-slate-900 font-mono">24 года</span>
              </div>
            </div>

            <div className="p-3 bg-rose-50/80 border border-rose-200/70 rounded-2xl space-y-1">
              <span className="text-[10.5px] font-bold text-rose-800 flex items-center gap-1 whitespace-nowrap">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Ограничения PAR-Q:</span>
              </span>
              <p className="text-xs text-rose-950 font-medium leading-relaxed">
                Без осевой нагрузки на позвоночник, беречь поясницу после травмы.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-3 bg-[#1D4ED8] hover:bg-blue-800 text-white rounded-2xl font-bold text-xs cursor-pointer active:scale-95 shadow-sm shadow-blue-600/20 whitespace-nowrap"
            >
              Закрыть карточку
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
