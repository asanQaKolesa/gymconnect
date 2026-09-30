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
  PenTool
} from 'lucide-react';

export default function DesignSystemShowcase({ onBack }) {
  const [activeSplit, setActiveSplit] = useState('fullbody');
  const [activeDaysCount, setActiveDaysCount] = useState(3);
  
  // 9 анатомических зон
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
      { name: 'Болгарские сплит-приседания с гантелями', equipment: 'Гантели' },
      { name: 'Разгибания голени в тренажере сидя', equipment: 'Тренажер' }
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
      { name: 'Сгибания рук с гантелями с супинацией', equipment: 'Гантели' },
      { name: 'Молотковые сгибания с гантелями', equipment: 'Гантели' }
    ],
    'Трицепс': [
      { name: 'Французский жим с EZ-грифом лежа', equipment: 'EZ-гриф' },
      { name: 'Разгибание на блоке вниз с канатом', equipment: 'Блок' },
      { name: 'Жим штанги узким хватом лежа', equipment: 'Штанга' }
    ],
    'Пресс и кор': [
      { name: 'Скручивания на наклонной скамье', equipment: 'Свой вес' },
      { name: 'Подъем ног в висе на перекладине', equipment: 'Свой вес' },
      { name: 'Классическая планка на локтях', equipment: 'Время' }
    ],
    'Кардио и функционал': [
      { name: 'Беговая дорожка (интервалы в горку)', equipment: 'Время' },
      { name: 'Эллиптический тренажер (пульс 130)', equipment: 'Время' },
      { name: 'Гребной тренажер Concept2', equipment: 'Время' }
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastText, setToastText] = useState(null);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkoutPlanOpen, setIsWorkoutPlanOpen] = useState(false);
  const [activePushPreview, setActivePushPreview] = useState('workout');

  const showToast = (text) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2600);
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
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 pb-36 font-sans select-none antialiased relative overflow-hidden">
      
      {/* Мягкие световые пятна для глассморфизма */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-blue-300/25 to-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[480px] -right-20 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* 1. ТОСТ DYNAMIC ISLAND (СВЕТЛОЕ МАТОВОЕ СТЕКЛО) */}
      {toastText && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm w-full px-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-2xl text-slate-900 px-4 py-3 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.1)] border border-white/80 flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>{toastText}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setToastText(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. ШАПКА */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-white/60 px-4 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">CoachOS Design System</h1>
              <span className="text-[10.5px] font-bold text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded-md border border-blue-200/70">
                v3.7
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">Выверенный спокойный стиль</p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center font-bold text-xs shadow-2xs">
          GC
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 relative z-10">

        {/* ================= 1. КАРТОЧКА АТЛЕТА В РАСПИСАНИИ ================= */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3">
          <div className="border-b border-slate-100/80 pb-2">
            <h3 className="text-xs font-bold text-slate-800">
              Расписание на сегодня
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Вся информация в карточке атлета</p>
          </div>

          <div className="bg-slate-50/70 rounded-2xl p-3 border border-slate-200/60 space-y-3">
            
            {/* ЯРУС 1: Профиль атлета (Без зеленой точки, имя целиком) */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center justify-between gap-3 cursor-pointer group active:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Фото атлета без онлайн-точек */}
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Асанали"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-xs shrink-0"
                />

                <div className="min-w-0 flex-1">
                  {/* Строка 1: Имя целиком */}
                  <h4 className="text-[14px] font-bold text-slate-900 leading-snug">
                    Асанали Кусайынов
                  </h4>

                  {/* Строка 2: Цель • Время 18:30 • Остаток (без синих рамок) */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 flex-wrap font-medium">
                    <span className="text-slate-800 font-semibold">Набор массы</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700 font-mono">18:30</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">
                      Остаток: {isCompleted ? '9' : '10'} занятий
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-2xs">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* ЯРУС 2: Панель действий */}
            <div className="pt-2.5 border-t border-slate-200/70 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWorkoutPlanOpen(!isWorkoutPlanOpen)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isWorkoutPlanOpen
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs active:scale-95'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                <span>План дня</span>
              </button>

              <div className="flex-1">
                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompleted(false);
                      showToast('↩ Списание отменено • Баланс восстановлен');
                    }}
                    className="w-full py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <span>Вернуть (+1)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompleted(true);
                      showToast('✅ Тренировка проведена • Списано 1 занятие');
                    }}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/25"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Проведено</span>
                  </button>
                )}
              </div>
            </div>

            {/* РАСКРЫТИЕ ПЛАНА ДНЯ: 60 КГ БОЛЬШЕ НЕ СИНИЙ */}
            {isWorkoutPlanOpen && (
              <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                  <span className="text-xs">День 1: Грудь и Трицепс</span>
                  <span className="text-[10.5px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                    3 упражнения
                  </span>
                </div>

                {/* Упражнение 1 */}
                <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-1.5">
                  <p className="text-xs font-bold text-slate-900">1. Жим штанги на наклонной скамье</p>
                  <div className="flex items-center gap-1.5">
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
                  <p className="text-xs font-bold text-slate-900">2. Жим гантелей под углом 30°</p>
                  <div className="flex items-center gap-1.5">
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

                {/* Упражнение 3 */}
                <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-1.5">
                  <p className="text-xs font-bold text-slate-900">3. Французский жим с EZ-грифом</p>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      3 подхода
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      12 повторений
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10.5px] font-mono font-bold rounded-lg shadow-2xs">
                      25 кг
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= 2. КАРТОЧКА УПРАЖНЕНИЯ: СТРОГО КВАДРАТНЫЕ КНОПКИ (w-8 h-8) ================= */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Карточка упражнения и нагрузки
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Квадратные кнопки степперов • 9 групп мышц</p>
            </div>
            
            <button 
              type="button" 
              className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title="Удалить карточку"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-3">
            
            {/* Группа мышц */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600">Группа мышц:</span>
                <span className="text-[10px] text-slate-400 font-medium">9 зон</span>
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
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>{selectedMuscle}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMuscleDropdownOpen ? 'rotate-180' : ''}`} />
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
                        className={`p-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer truncate ${
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

            {/* Название упражнения */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600">Упражнение:</span>
                <button
                  type="button"
                  onClick={() => setIsCustomExerciseMode(!isCustomExerciseMode)}
                  className="text-[10.5px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <PenTool className="w-3 h-3" />
                  <span>{isCustomExerciseMode ? 'Выбрать из базы' : '+ Своё название'}</span>
                </button>
              </div>

              {isCustomExerciseMode ? (
                <input
                  type="text"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder="Введите авторское название упражнения..."
                  className="w-full px-3 py-2 bg-white border border-blue-400 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
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
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="truncate">{selectedExercise}</span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
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
                          <span className="truncate">{item.name}</span>
                          <span className="text-[9.5px] text-slate-400 font-mono ml-2 shrink-0">{item.equipment}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* СТЕППЕРЫ: СТРОГО КВАДРАТНЫЕ КНОПКИ 32x32px (aspect-square) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              
              {/* Сеты */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-[10.5px] font-semibold text-slate-400 block text-center mb-1.5">
                  Сеты
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSets(s => Math.max(1, (Number(s) || 0) - 1))}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={sets}
                    onChange={(e) => handleNumberInput(setSets, e.target.value)}
                    className="w-7 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSets(s => (Number(s) || 0) + 1)}
                    className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Повторы */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-[10.5px] font-semibold text-slate-400 block text-center mb-1.5">
                  Повторы
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReps(r => Math.max(1, (Number(r) || 0) - 1))}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={reps}
                    onChange={(e) => handleNumberInput(setReps, e.target.value)}
                    className="w-7 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setReps(r => (Number(r) || 0) + 1)}
                    className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Вес */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-[10.5px] font-semibold text-slate-400 block text-center mb-1.5">
                  Вес (кг)
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWeight(w => Math.max(0, Math.round(((Number(w) || 0) - 2.5) * 10) / 10))}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weight}
                    placeholder="0"
                    onChange={(e) => handleNumberInput(setWeight, e.target.value)}
                    className="w-8 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setWeight(w => Math.round(((Number(w) || 0) + 2.5) * 10) / 10)}
                    className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

            </div>

            {/* Быстрый выбор времени отдыха */}
            <div className="pt-0.5 flex items-center justify-between">
              <span className="text-[10.5px] font-medium text-slate-500 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-blue-600" />
                <span>Отдых между сетами:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {[60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRestTime(sec)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                      restTime === sec
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sec}с
                  </button>
                ))}
              </div>
            </div>

            {/* Заметка по технике для атлета */}
            <input
              type="text"
              placeholder="Заметка тренера: локти под 45°, пауза в нижней точке 1 сек..."
              className="w-full px-3 py-2 bg-white border border-slate-200/70 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* ================= 3. ЦЕНТР ПУШ-УВЕДОМЛЕНИЙ (LIVE BOT В 1 СТРОКУ, КОМПАКТНЫЙ ШРИФТ) ================= */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Быстрые пуши ученику в Telegram</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Мгновенная отправка через бота</p>
            </div>

            {/* Live Bot строго в одну строку */}
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap shrink-0">
              Live Bot
            </span>
          </div>

          {/* 3 кнопки с уменьшенным аккуратным текстом */}
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
              <span className="text-[11.5px] truncate block font-bold">План дня</span>
              <span className="text-[9.5px] text-slate-400 truncate block mt-0.5 font-medium">Отправить в бот</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePushPreview('reminder');
                showToast('Напоминание о тренировке отправлено');
              }}
              className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center h-15 ${
                activePushPreview === 'reminder'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11.5px] truncate block font-bold">Напоминание</span>
              <span className="text-[9.5px] text-slate-400 truncate block mt-0.5 font-medium">Через 30 минут</span>
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
              <span className="text-[11.5px] truncate block font-bold">Счет на оплату</span>
              <span className="text-[9.5px] text-slate-400 truncate block mt-0.5 font-medium">Осталось 1 зан.</span>
            </button>
          </div>

          {/* Превью сообщения Telegram */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-200/60 pb-1">
              <span>Сообщение в боте атлета:</span>
              <span>@gymconnect_ala_bot</span>
            </div>

            {activePushPreview === 'workout' && (
              <p className="text-[11.5px] text-slate-800 leading-snug pt-0.5">
                🏋️ <b>Ваш тренер назначил план тренировки!</b><br />
                День 1: Грудь и Трицепс (3 упражнения, рабочий вес 60 кг).<br />
                <span className="text-blue-600 font-semibold">Откройте приложение, чтобы посмотреть схему.</span>
              </p>
            )}

            {activePushPreview === 'reminder' && (
              <p className="text-[11.5px] text-slate-800 leading-snug pt-0.5">
                ⏰ <b>Напоминание о тренировке!</b><br />
                Жду тебя сегодня в зале к 18:30. Не опаздывай, начнем с разминки! 💪
              </p>
            )}

            {activePushPreview === 'payment' && (
              <p className="text-[11.5px] text-slate-800 leading-snug pt-0.5">
                💳 <b>Продление абонемента</b><br />
                У вас осталось 1 занятие в текущем блоке. Продлите абонемент, чтобы зафиксировать слот!
              </p>
            )}
          </div>
        </div>

        {/* ================= 4. РАЗДЕЛЫ УПРАВЛЕНИЯ ================= */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-2">
          <div className="border-b border-slate-100/80 pb-2">
            <h3 className="text-xs font-bold text-slate-800">
              Разделы управления
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Быстрый переход по функциям</p>
          </div>

          <div className="divide-y divide-slate-100/80">
            <div 
              onClick={() => showToast('Открыта база учеников')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">База подопечных атлетов</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">14 учеников в залах Алматы</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>

            <div 
              onClick={() => showToast('Открыта касса')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">Касса и абонементы</h4>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">840 000 ₸ за текущий месяц</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                Оплачено
              </span>
            </div>

            <div 
              onClick={() => showToast('Стрик дисциплины: 44 недели')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">Дисциплина (Streak)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Рекорд тренера: 44 недели в строю 🔥</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>

            <div 
              onClick={() => showToast('Внимание: у атлета есть травмы')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">Ограничения по здоровью</h4>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">Без осевой нагрузки на спину</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>
          </div>
        </div>

        {/* ================= 5. ДНЕЙ В НЕДЕЛЮ (1–7) И СХЕМА СПЛИТА ================= */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              Дней тренировок в неделю
            </h3>
            <span className="text-xs font-mono font-bold text-blue-600">{activeDaysCount} дня / нед.</span>
          </div>

          <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1 rounded-2xl">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDaysCount(d)}
                className={`py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                  activeDaysCount === d 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
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
                  className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center truncate ${
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
            className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(37,99,235,0.22)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current text-white" />
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
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Асанали"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900">Асанали Кусайынов</h4>
                  <p className="text-[11px] text-slate-400">Анкета подопечного атлета</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-semibold">Рост</span>
                <span className="text-xs font-bold text-slate-900 font-mono">178 см</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-semibold">Вес</span>
                <span className="text-xs font-bold text-slate-900 font-mono">75 кг</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-semibold">Возраст</span>
                <span className="text-xs font-bold text-slate-900 font-mono">24 года</span>
              </div>
            </div>

            <div className="p-3 bg-rose-50/80 border border-rose-200/70 rounded-2xl space-y-1">
              <span className="text-[10.5px] font-bold text-rose-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Ограничения PAR-Q:</span>
              </span>
              <p className="text-xs text-rose-950 font-medium">Без осевой нагрузки на позвоночник, беречь поясницу.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs cursor-pointer active:scale-95 shadow-sm shadow-blue-600/20"
            >
              Закрыть карточку
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
