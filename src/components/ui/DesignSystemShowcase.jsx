// src/components/ui/DesignSystemShowcase.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  Users, 
  Flame, 
  Calendar, 
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
  Tag,
  PenTool,
  MessageCircle
} from 'lucide-react';

export default function DesignSystemShowcase({ onBack }) {
  const [activeSplit, setActiveSplit] = useState('fullbody');
  const [activeDaysCount, setActiveDaysCount] = useState(3);
  
  // База упражнений по группам мышц для интерактивного выбора
  const muscleGroups = ['Грудь', 'Спина', 'Ноги', 'Плечи', 'Руки', 'Пресс и кор'];
  const exercisesByMuscle = {
    'Грудь': [
      { name: 'Жим штанги на наклонной скамье', equipment: 'Штанга' },
      { name: 'Жим гантелей на горизонтальной', equipment: 'Гантели' },
      { name: 'Сведение в кроссовере на блоках', equipment: 'Блок' },
      { name: 'Отжимания на брусьях', equipment: 'Свой вес' }
    ],
    'Спина': [
      { name: 'Тяга верхнего блока к груди', equipment: 'Блок' },
      { name: 'Подтягивания широким хватом', equipment: 'Свой вес' },
      { name: 'Тяга штанги в наклоне', equipment: 'Штанга' },
      { name: 'Горизонтальная тяга блока', equipment: 'Блок' }
    ],
    'Ноги': [
      { name: 'Приседания со штангой', equipment: 'Штанга' },
      { name: 'Жим ногами в платформе', equipment: 'Тренажер' },
      { name: 'Болгарские сплит-приседания', equipment: 'Гантели' },
      { name: 'Румынская тяга', equipment: 'Штанга' }
    ],
    'Плечи': [
      { name: 'Жим штанги стоя (Армейский)', equipment: 'Штанга' },
      { name: 'Махи гантелями в стороны', equipment: 'Гантели' },
      { name: 'Тяга каната к лицу (Face Pull)', equipment: 'Блок' }
    ],
    'Руки': [
      { name: 'Подъем штанги на бицепс', equipment: 'Штанга' },
      { name: 'Французский жим лежа', equipment: 'EZ-гриф' },
      { name: 'Молотковые сгибания', equipment: 'Гантели' }
    ],
    'Пресс и кор': [
      { name: 'Скручивания на наклонной скамье', equipment: 'Свой вес' },
      { name: 'Подъем ног в висе на турнике', equipment: 'Свой вес' },
      { name: 'Классическая планка на локтях', equipment: 'Время' }
    ]
  };

  // Стейты раскрытия карточек выбора
  const [selectedMuscle, setSelectedMuscle] = useState('Грудь');
  const [selectedExercise, setSelectedExercise] = useState('Жим штанги на наклонной скамье');
  const [selectedEquipment, setSelectedEquipment] = useState('Штанга');
  const [isMuscleDropdownOpen, setIsMuscleDropdownOpen] = useState(false);
  const [isExerciseDropdownOpen, setIsExerciseDropdownOpen] = useState(false);
  const [isCustomExerciseMode, setIsCustomExerciseMode] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');

  // Параметры нагрузки (Сеты, повторы, вес) — все в едином цвете
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(60);
  const [restTime, setRestTime] = useState(90); // секунды отдыха
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastText, setToastText] = useState(null);
  
  // Модалка анкеты и раскрытие плана
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkoutPlanOpen, setIsWorkoutPlanOpen] = useState(false);

  // Стейт превью пуш-уведомления Telegram
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
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 pb-36 font-sans select-none antialiased">
      
      {/* 1. ВСПЛЫВАЮЩИЙ ТОСТ DYNAMIC ISLAND */}
      {toastText && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm w-full px-4 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastText}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setToastText(null)}
              className="text-white/50 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. ШАПКА ВИЗУАЛЬНОЙ СИСТЕМЫ */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 px-4 py-3.5 flex items-center justify-between">
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
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70">
                v3.5 Final
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">Выверенный баланс типографики и степперов</p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          GC
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* ================= 1. КАРТОЧКА АТЛЕТА В РАСПИСАНИИ ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Расписание на сегодня
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Вся информация в одну чистую строку без зала</p>
            </div>

            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>18:30</span>
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70 space-y-3">
            
            {/* ЯРУС 1: Профиль атлета (Кликабелен) */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center justify-between gap-3 cursor-pointer group active:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/20">
                  АК
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13.5px] font-bold text-slate-900 truncate">
                      Асанали Кусайынов
                    </h4>
                    <span className="text-[10.5px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-lg shrink-0">
                      {isCompleted ? '9 зан.' : '10 зан.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10.5px] font-semibold text-blue-800 bg-blue-50/90 border border-blue-200/60 px-2 py-0.5 rounded-md shrink-0">
                      Набор массы
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Слот 18:30
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
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-extrabold shadow-2xs'
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
                      showToast('↩ Списание отменено • Баланс 10 зан.');
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
                    className="w-full py-2.5 px-3.5 bg-[#165DFB] hover:bg-[#1150DC] text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/25"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Проведено</span>
                  </button>
                )}
              </div>
            </div>

            {/* Раскрывающийся план тренировки */}
            {isWorkoutPlanOpen && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1">
                  <span>День 1: Грудь и Трицепс</span>
                  <span className="text-[10.5px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                    3 упр.
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 text-[11.5px]">
                  <p>1. Жим штанги на наклонной — <b>4 × 10 (60 кг)</b></p>
                  <p>2. Жим гантелей под углом — <b>3 × 12 (18 кг)</b></p>
                  <p>3. Французский жим — <b>3 × 12 (25 кг)</b></p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= 2. КАРТОЧКА УПРАЖНЕНИЯ: ШИРОКИЕ СТЕППЕРЫ + СНАРЯД + ОТДЫХ ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Карточка упражнения и нагрузки
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Широкие степперы • единый цвет цифр</p>
            </div>
            
            <button 
              type="button" 
              className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title="Удалить карточку"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3">
            
            {/* Группа мышц */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500">Группа мышц:</span>
                <span className="text-[10px] text-slate-400 font-medium">6 зон</span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMuscleDropdownOpen(!isMuscleDropdownOpen);
                    setIsExerciseDropdownOpen(false);
                  }}
                  className="w-full py-2 px-3 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>{selectedMuscle}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMuscleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMuscleDropdownOpen && (
                  <div className="mt-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-lg grid grid-cols-2 gap-1 animate-in fade-in z-20">
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
                        className={`p-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
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

            {/* Название упражнения + тег снаряда */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500">Упражнение:</span>
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
                    className="w-full py-2 px-3 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-2xs text-left"
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
                    <div className="mt-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-0.5 animate-in fade-in z-20 max-h-48 overflow-y-auto">
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

            {/* СТЕППЕРЫ: ГОРИЗОНТАЛЬНО ШИРОКИЕ (w-9 h-7) + ЕДИНЫЙ ЧЁРНЫЙ ЦВЕТ ЦИФР */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              
              {/* Сеты */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-[10.5px] font-semibold text-slate-400 block text-center mb-1.5">
                  Сеты
                </span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSets(s => Math.max(1, (Number(s) || 0) - 1))}
                    className="w-9 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={sets}
                    onChange={(e) => handleNumberInput(setSets, e.target.value)}
                    className="w-8 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSets(s => (Number(s) || 0) + 1)}
                    className="w-9 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-2xs"
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
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setReps(r => Math.max(1, (Number(r) || 0) - 1))}
                    className="w-9 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={reps}
                    onChange={(e) => handleNumberInput(setReps, e.target.value)}
                    className="w-8 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setReps(r => (Number(r) || 0) + 1)}
                    className="w-9 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Вес — ТЕПЕРЬ СТРОГО В ЦВЕТЕ text-slate-900 */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-[10.5px] font-semibold text-slate-400 block text-center mb-1.5">
                  Вес (кг)
                </span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setWeight(w => Math.max(0, Math.round(((Number(w) || 0) - 2.5) * 10) / 10))}
                    className="w-9 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weight}
                    placeholder="0"
                    onChange={(e) => handleNumberInput(setWeight, e.target.value)}
                    className="w-9 text-center text-sm font-bold font-mono text-slate-900 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setWeight(w => Math.round(((Number(w) || 0) + 2.5) * 10) / 10)}
                    className="w-9 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

            </div>

            {/* Быстрый выбор времени отдыха */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10.5px] font-medium text-slate-400 flex items-center gap-1">
                <Timer className="w-3 h-3 text-slate-400" />
                <span>Отдых между сетами:</span>
              </span>
              <div className="flex items-center gap-1">
                {[60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRestTime(sec)}
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                      restTime === sec
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
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
              className="w-full px-3 py-2 bg-white border border-slate-200/70 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* ================= 3. ЦЕНТР ПУШ-УВЕДОМЛЕНИЙ TELEGRAM (НОВЫЙ БЛОК) ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Быстрые пуши ученику в Telegram</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Мгновенные триггеры бота @gymconnect_ala_bot</p>
            </div>

            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Live Bot
            </span>
          </div>

          {/* 3 кнопки быстрых сценариев */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActivePushPreview('workout');
                showToast('Пуш: «План на сегодня назначен» отправлен!');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activePushPreview === 'workout'
                  ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-bold shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs">🏋️ План дня</span>
              <span className="text-[10px] text-slate-400 font-normal mt-1">Отправить тренировку</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePushPreview('reminder');
                showToast('Пуш: «Напоминание о тренировке» отправлено!');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activePushPreview === 'reminder'
                  ? 'bg-amber-50/80 border-amber-300 text-amber-900 font-bold shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs">⏰ Напоминание</span>
              <span className="text-[10px] text-slate-400 font-normal mt-1">Жду через 30 мин</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePushPreview('payment');
                showToast('Пуш: «Продление абонемента» отправлено!');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activePushPreview === 'payment'
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs">💳 Оплата</span>
              <span className="text-[10px] text-slate-400 font-normal mt-1">Осталось 1 занятие</span>
            </button>
          </div>

          {/* Превью сообщения Telegram */}
          <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-200 pb-1">
              <span>Сообщение в боте ученика:</span>
              <span>@gymconnect_ala_bot</span>
            </div>

            {activePushPreview === 'workout' && (
              <p className="text-[11.5px] text-slate-800 leading-snug">
                🏋️ <b>Ваш тренер обновил план тренировок!</b><br />
                День 1: Грудь и Трицепс (3 упр., 60 кг).<br />
                <span className="text-blue-600 font-semibold">Откройте приложение для просмотра подходов.</span>
              </p>
            )}

            {activePushPreview === 'reminder' && (
              <p className="text-[11.5px] text-slate-800 leading-snug">
                ⏰ <b>Напоминание о тренировке!</b><br />
                Жду тебя сегодня в зале к 18:30. Не опаздывай, разомнись перед базой! 💪
              </p>
            )}

            {activePushPreview === 'payment' && (
              <p className="text-[11.5px] text-slate-800 leading-snug">
                💳 <b>Продление абонемента</b><br />
                У вас осталось 1 занятие в текущем блоке. Продлите тренировки, чтобы сохранить график и время!
              </p>
            )}
          </div>
        </div>

        {/* ================= 4. РАЗДЕЛЫ УПРАВЛЕНИЯ ================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-2">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">
              Разделы управления
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Быстрый переход по ключевым функциям</p>
          </div>

          <div className="divide-y divide-slate-100">
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
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
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
                    ? 'bg-[#165DFB] text-white shadow-xs' 
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
            onClick={() => showToast('🎉 План тренировок успешно назначен ученику!')}
            className="w-full py-3.5 px-5 bg-[#165DFB] hover:bg-[#1150DC] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(22,93,251,0.25)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current text-white" />
            <span>Сохранить и отправить план в Telegram</span>
          </button>
        </div>

      </div>

      {/* МИНИ-ШТОРКА АНКЕТЫ АТЛЕТА */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-4 space-y-3.5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  АК
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Асанали Кусайынов</h4>
                  <p className="text-[11px] text-slate-400">Анкета подопечного атлета</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsProfileModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
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

            <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-2xl space-y-1">
              <span className="text-[10.5px] font-bold text-rose-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Ограничения PAR-Q:</span>
              </span>
              <p className="text-xs text-rose-950 font-medium">Без осевой нагрузки на позвоночник, беречь поясницу.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer active:scale-95"
            >
              Закрыть карточку
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
