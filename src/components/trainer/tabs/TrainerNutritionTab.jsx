// src/components/trainer/tabs/TrainerNutritionTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  Utensils, 
  Flame, 
  Droplet, 
  Pill, 
  CheckCircle2, 
  Save, 
  ExternalLink, 
  Plus, 
  Trash2, 
  User, 
  Check,
  Send
} from 'lucide-react';
import StudentDetailModal from '../components/StudentDetailModal';
import { sendStudentNotification } from '../../../utils/telegramNotifications';

export default function TrainerNutritionTab({ students = [], onUpdate }) {
  // Фильтрация активных атлетов
  const isStudentActive = (s) => {
    if (!s) return false;
    const st = (s.status || '').toLowerCase().trim();
    return st !== 'left' && st !== 'archived';
  };

  const activeStudents = students.filter(isStudentActive);
  const [selectedStudentId, setSelectedStudentId] = useState(activeStudents[0]?.id || '');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pushStatusFeedback, setPushStatusFeedback] = useState(null);

  // Параметры КБЖУ
  const [nutritionGoal, setNutritionGoal] = useState('deficit');
  const [calories, setCalories] = useState(2200);
  const [protein, setProtein] = useState(160);
  const [fat, setFat] = useState(70);
  const [carbs, setCarbs] = useState(230);
  const [waterMl, setWaterMl] = useState(2500);

  // Структура приемов пищи
  const [meals, setMeals] = useState([
    { id: 1, name: 'Завтрак', time: '08:30', desc: 'Овсяная каша на воде с ягодами + 3 яйца + кофе без сахара' },
    { id: 2, name: 'Обед', time: '13:30', desc: 'Куриное филе 180г + бурый рис 100г (сухой вес) + свежие овощи' },
    { id: 3, name: 'Перекус', time: '16:30', desc: 'Порция сывороточного изолята + банан или горсть миндаля' },
    { id: 4, name: 'Ужин', time: '19:30', desc: 'Рыба (минтай/лосось) 200г + стручковая фасоль + оливковое масло 1 ч.л.' }
  ]);

  // Рекомендованные добавки
  const [supplements, setSupplements] = useState([
    { name: 'Креатин моногидрат', dosage: '5г утром или после тренировки', active: true },
    { name: 'Сывороточный протеин', dosage: '1 порция (30г) в день между приемами', active: true },
    { name: 'Омега-3', dosage: '1000мг EPA/DHA во время еды', active: true },
    { name: 'Витамин D3', dosage: '2000-5000 ME утром', active: false },
    { name: 'Магний хелат/цитрат', dosage: '400мг за 40 мин до сна', active: true }
  ]);

  const [newMeal, setNewMeal] = useState({ name: '', time: '', desc: '' });

  // Синхронизация при выборе ученика
  useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].id);
    }
    const current = activeStudents.find(s => s.id === selectedStudentId);
    if (current) {
      const weight = Number(current.weight) || 75;
      const height = Number(current.height) || 178;
      const age = Number(current.age) || 25;
      const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      
      const mult = current.goal?.toLowerCase().includes('похуд') || current.goal?.toLowerCase().includes('сушк') 
        ? 1.25 
        : current.goal?.toLowerCase().includes('набор') 
          ? 1.6 
          : 1.4;

      const calcCals = Math.round(bmr * mult);
      setCalories(calcCals);
      setProtein(Math.round(weight * 2));
      setFat(Math.round(weight * 0.9));
      setCarbs(Math.round((calcCals - (weight * 2 * 4 + weight * 0.9 * 9)) / 4));
      setWaterMl(Math.round(weight * 35));

      if (current.assigned_nutrition && typeof current.assigned_nutrition === 'object') {
        const nut = current.assigned_nutrition;
        if (nut.calories) setCalories(nut.calories);
        if (nut.protein) setProtein(nut.protein);
        if (nut.fat) setFat(nut.fat);
        if (nut.carbs) setCarbs(nut.carbs);
        if (nut.waterMl) setWaterMl(nut.waterMl);
        if (nut.meals) setMeals(nut.meals);
        if (nut.supplements) setSupplements(nut.supplements);
      }
    }
    setSaveSuccess(false);
  }, [selectedStudentId, activeStudents]);

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!newMeal.name.trim()) return;
    setMeals([...meals, { id: Date.now(), ...newMeal }]);
    setNewMeal({ name: '', time: '', desc: '' });
  };

  const handleRemoveMeal = (id) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const toggleSupplement = (index) => {
    const updated = [...supplements];
    updated[index].active = !updated[index].active;
    setSupplements(updated);
  };

  // СОХРАНЕНИЕ ПЛАНА ПИТАНИЯ + ПУШ УЧЕНИКУ В TELEGRAM
  const handleSaveNutrition = async () => {
    if (!selectedStudentId) {
      alert('Выберите ученика!');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    setPushStatusFeedback(null);

    const targetStudent = activeStudents.find(s => s.id === selectedStudentId);

    try {
      const payload = {
        assigned_nutrition: {
          calories: Number(calories),
          protein: Number(protein),
          fat: Number(fat),
          carbs: Number(carbs),
          waterMl: Number(waterMl),
          goal: nutritionGoal,
          meals,
          supplements,
          updated_at: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', selectedStudentId);

      if (error) throw error;

      setSaveSuccess(true);

      // Отправляем пуш подопечному в Telegram от имени бота
      if (targetStudent) {
        const pushRes = await sendStudentNotification({
          studentTelegramId: targetStudent.telegram_id,
          studentUsername: targetStudent.username,
          studentId: targetStudent.id,
          title: 'План питания от тренера',
          message: `Ваш тренер назначил персональный рацион и норму КБЖУ: ${calories} ккал (Белки: ${protein}г, Жиры: ${fat}г, Углеводы: ${carbs}г). Все приемы пищи и добавки доступны в приложении!`
        });

        if (pushRes && pushRes.ok) {
          setPushStatusFeedback('✅ План сохранен и отправлен ученику в Telegram!');
        } else {
          setPushStatusFeedback('✅ Рацион сохранен в приложении!');
        }
      }

      setTimeout(() => {
        setSaveSuccess(false);
        setPushStatusFeedback(null);
      }, 5000);

      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка при сохранении рациона: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStudent = activeStudents.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-3.5 select-none pb-12 text-xs">
      
      {/* 1. Блок выбора подопечного */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Питание и КБЖУ подопечного</h3>
              <p className="text-[10px] text-slate-400">Индивидуальный расчет и рацион</p>
            </div>
          </div>

          {currentStudent && (
            <button
              type="button"
              onClick={() => setSelectedStudentForModal(currentStudent)}
              className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>Вся анкета</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-500 block mb-1">Подопечный атлет *</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
          >
            {activeStudents.length > 0 ? (
              activeStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name || ''} ({s.goal || 'Тонус'}) • Вес: {s.weight || '—'} кг
                </option>
              ))
            ) : (
              <option value="">Нет активных учеников</option>
            )}
          </select>
        </div>
      </div>

      {/* 2. Калькулятор целевого КБЖУ */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Целевые макронутриенты</span>
          </span>
          <span className="text-[10.5px] font-mono text-emerald-600 font-bold">{calories} ккал / день</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center font-mono">
          <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[9.5px] text-slate-400 font-sans block">Калории</span>
            <input 
              type="number"
              value={calories}
              onChange={e => setCalories(Number(e.target.value))}
              className="w-full text-center font-bold text-xs text-slate-900 bg-transparent mt-0.5"
            />
          </div>

          <div className="p-2 bg-blue-50/60 rounded-2xl border border-blue-200">
            <span className="text-[9.5px] text-blue-800 font-sans block">Белки (г)</span>
            <input 
              type="number"
              value={protein}
              onChange={e => setProtein(Number(e.target.value))}
              className="w-full text-center font-bold text-xs text-blue-700 bg-transparent mt-0.5"
            />
          </div>

          <div className="p-2 bg-amber-50/60 rounded-2xl border border-amber-200">
            <span className="text-[9.5px] text-amber-800 font-sans block">Жиры (г)</span>
            <input 
              type="number"
              value={fat}
              onChange={e => setFat(Number(e.target.value))}
              className="w-full text-center font-bold text-xs text-amber-700 bg-transparent mt-0.5"
            />
          </div>

          <div className="p-2 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <span className="text-[9.5px] text-emerald-800 font-sans block">Углеводы (г)</span>
            <input 
              type="number"
              value={carbs}
              onChange={e => setCarbs(Number(e.target.value))}
              className="w-full text-center font-bold text-xs text-emerald-700 bg-transparent mt-0.5"
            />
          </div>
        </div>

        <div className="p-3 bg-sky-50/60 border border-sky-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Норма гидратации</p>
              <p className="text-[10px] text-slate-500">35 мл на 1 кг массы тела</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={waterMl}
              onChange={e => setWaterMl(Number(e.target.value))}
              className="w-16 p-1 bg-white border border-sky-300 rounded-lg text-center font-mono font-bold text-xs text-sky-800"
            />
            <span className="text-[10px] font-bold text-sky-800">мл</span>
          </div>
        </div>
      </div>

      {/* 3. Меню по приемам пищи */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900">Рацион дня (Приемы пищи)</span>
          <span className="text-[10.5px] text-slate-400 font-mono">{meals.length} приема</span>
        </div>

        <div className="space-y-2">
          {meals.map((meal) => (
            <div key={meal.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{meal.name}</span>
                  {meal.time && (
                    <span className="text-[9.5px] bg-white px-2 py-0.5 rounded-md font-mono text-slate-600 border border-slate-200">
                      {meal.time}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMeal(meal.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{meal.desc}</p>
            </div>
          ))}
        </div>

        {/* Добавление приема пищи */}
        <form onSubmit={handleAddMeal} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 pt-2.5 text-xs">
          <span className="font-bold text-slate-800 text-[11px] block">+ Добавить прием пищи:</span>
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newMeal.name}
              onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
              placeholder="Название (Полдник)"
              className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
            />
            <input
              type="text"
              value={newMeal.time}
              onChange={e => setNewMeal({ ...newMeal, time: e.target.value })}
              placeholder="Время (17:00)"
              className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
            />
          </div>

          <textarea
            rows={2}
            value={newMeal.desc}
            onChange={e => setNewMeal({ ...newMeal, desc: e.target.value })}
            placeholder="Продукты и граммовки (например: Творог 5% 150г + орехи 20г)"
            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs resize-none"
          />

          <button
            type="submit"
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
          >
            Добавить прием в план
          </button>
        </form>
      </div>

      {/* 4. Спортивное питание и БАДы */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Pill className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-900">Рекомендованный спортпит и добавки</span>
        </div>

        <div className="space-y-1.5">
          {supplements.map((item, idx) => (
            <div
              key={idx}
              onClick={() => toggleSupplement(idx)}
              className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                item.active 
                  ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950 font-semibold' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div>
                <p className="text-xs leading-tight">{item.name}</p>
                <p className={`text-[10px] mt-0.5 ${item.active ? 'text-indigo-700' : 'text-slate-400'}`}>
                  {item.dosage}
                </p>
              </div>

              <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ml-2 transition-colors ${
                item.active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {item.active && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка сохранения с индикацией и пушем */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        {pushStatusFeedback ? (
          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{pushStatusFeedback}</span>
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">Атлет сразу увидит рацион в своём приложении</span>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveNutrition}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Сохранение...' : 'Сохранить план питания'}</span>
        </button>
      </div>

      {/* Полноэкранный профиль ученика */}
      <StudentDetailModal 
        isOpen={Boolean(selectedStudentForModal)}
        onClose={() => setSelectedStudentForModal(null)}
        student={selectedStudentForModal}
        onUpdate={onUpdate}
      />

    </div>
  );
}
