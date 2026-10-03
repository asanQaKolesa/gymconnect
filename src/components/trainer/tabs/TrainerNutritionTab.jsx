// src/components/trainer/tabs/TrainerNutritionTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { Save, CheckCircle2, Send } from 'lucide-react';
import { sendStudentNotification } from '../../../utils/telegramNotifications';

import NutritionAthleteHeader from '../nutrition/NutritionAthleteHeader';
import NutritionMacrosCalculator from '../nutrition/NutritionMacrosCalculator';
import NutritionDietBuilder from '../nutrition/NutritionDietBuilder';
import NutritionSupplementsManager from '../nutrition/NutritionSupplementsManager';
import NutritionBloodworkTracker from '../nutrition/NutritionBloodworkTracker';

export default function TrainerNutritionTab({ students = [], trainer, onUpdate }) {
  const activeStudents = students.filter(s => {
    const st = (s.status || '').toLowerCase().trim();
    return st !== 'left' && st !== 'archived';
  });

  const [selectedStudentId, setSelectedStudentId] = useState(activeStudents[0]?.id || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Стейты макронутриентов
  const [calories, setCalories] = useState(2250);
  const [protein, setProtein] = useState(160);
  const [fat, setFat] = useState(70);
  const [carbs, setCarbs] = useState(245);
  const [waterMl, setWaterMl] = useState(2600);

  // Приёмы пищи
  const [meals, setMeals] = useState([
    { id: 1, name: 'Завтрак', time: '08:00', desc: 'Овсяная каша 80г + 3 яйца + банан', protein: 28, fat: 16, carbs: 68, calories: 525 },
    { id: 2, name: 'Обед', time: '13:00', desc: 'Филе индейки 180г + рис бурый 80г + овощи', protein: 46, fat: 12, carbs: 58, calories: 530 },
    { id: 3, name: 'Полдник', time: '16:30', desc: 'Сывороточный протеин 30г + горсть миндаля 25г', protein: 27, fat: 14, carbs: 18, calories: 310 },
    { id: 4, name: 'Ужин', time: '19:30', desc: 'Филе белой рыбы 200г + брокколи + оливковое масло 1 ч.л.', protein: 42, fat: 10, carbs: 16, calories: 320 }
  ]);

  // Спортпит и БАДы
  const [supplements, setSupplements] = useState([
    { id: 1, name: 'Креатин моногидрат', dosage: '5 г', timing: 'Утром после завтрака', duration: '30 дней курс / 30 дней пауза', category: 'sportpit' },
    { id: 2, name: 'Омега-3 (EPA/DHA)', dosage: '1000 мг', timing: 'Утром во время еды', duration: 'Курс 60 дней', category: 'bady' },
    { id: 3, name: 'Магний хелат (бисглицинат)', dosage: '400 мг', timing: 'Вечером за 40 мин до сна', duration: 'Курс 45 дней', category: 'bady' }
  ]);

  const currentStudent = activeStudents.find(s => s.id === selectedStudentId);

  // Синхронизация при выборе другого ученика
  useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].id);
    }

    if (currentStudent) {
      const weight = Number(currentStudent.current_weight || currentStudent.weight) || 75;
      const height = Number(currentStudent.height) || 178;
      const age = Number(currentStudent.age) || 25;
      const goal = (currentStudent.goal || 'Набор массы').toLowerCase();

      // Автоматический базовый расчёт при первичном входе
      let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      let multiplier = goal.includes('похуд') ? 1.25 : goal.includes('набор') ? 1.6 : 1.4;
      const autoCals = Math.round(bmr * multiplier);
      const autoProt = Math.round(weight * 2.0);
      const autoFat = Math.round(weight * 0.9);
      const autoCarbs = Math.max(80, Math.round((autoCals - (autoProt * 4 + autoFat * 9)) / 4));
      const autoWater = Math.round(weight * 35);

      setCalories(autoCals);
      setProtein(autoProt);
      setFat(autoFat);
      setCarbs(autoCarbs);
      setWaterMl(autoWater);

      // Если у ученика уже есть сохранённый план — подтягиваем его
      if (currentStudent.assigned_nutrition && typeof currentStudent.assigned_nutrition === 'object') {
        const nut = currentStudent.assigned_nutrition;
        if (nut.calories) setCalories(nut.calories);
        if (nut.protein) setProtein(nut.protein);
        if (nut.fat) setFat(nut.fat);
        if (nut.carbs) setCarbs(nut.carbs);
        if (nut.waterMl) setWaterMl(nut.waterMl);
        if (Array.isArray(nut.meals) && nut.meals.length > 0) setMeals(nut.meals);
        if (Array.isArray(nut.supplements) && nut.supplements.length > 0) setSupplements(nut.supplements);
      }
    }
    setSaveSuccess(false);
  }, [selectedStudentId, currentStudent]);

  const handleGoalChange = async (newGoal) => {
    if (!currentStudent) return;
    currentStudent.goal = newGoal;
    try {
      await supabase
        .from('profiles')
        .update({ goal: newGoal })
        .eq('id', currentStudent.id);
    } catch (e) {}
  };

  // Сохранение плана в базу и отправка пуша в Telegram
  const handleSaveNutritionPlan = async () => {
    if (!selectedStudentId) {
      alert('Выберите ученика!');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        assigned_nutrition: {
          calories: Number(calories),
          protein: Number(protein),
          fat: Number(fat),
          carbs: Number(carbs),
          waterMl: Number(waterMl),
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

      // Отправляем пуш подопечному в Telegram от имени бота
      if (currentStudent?.telegram_id) {
        await sendStudentNotification({
          studentTelegramId: currentStudent.telegram_id,
          studentUsername: currentStudent.username,
          studentId: currentStudent.id,
          title: 'Персональный рацион и КБЖУ',
          message: `Ваш тренер обновил рацион питания!\nНорма: ${calories} ккал (Белки: ${protein}г, Жиры: ${fat}г, Углеводы: ${carbs}г).\nВода: ${waterMl} мл.\n\nВсе приёмы пищи и назначенные добавки доступны в вашем профиле GymConnect.`
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3.5 select-none pb-28 text-xs text-slate-900">
      
      {/* 1. Карточка выбора атлета, веса, цели и аллергий */}
      <NutritionAthleteHeader
        students={activeStudents}
        selectedStudentId={selectedStudentId}
        onSelectStudent={setSelectedStudentId}
        currentStudent={currentStudent}
        onGoalChange={handleGoalChange}
      />

      {/* 2. Калькулятор КБЖУ (строго 1 строка) и гидратация */}
      <NutritionMacrosCalculator
        student={currentStudent}
        calories={calories}
        setCalories={setCalories}
        protein={protein}
        setProtein={setProtein}
        fat={fat}
        setFat={setFat}
        carbs={carbs}
        setCarbs={setCarbs}
        waterMl={waterMl}
        setWaterMl={setWaterMl}
      />

      {/* 3. Рацион приёмов пищи дня (базовый vs детальный) */}
      <NutritionDietBuilder
        meals={meals}
        setMeals={setMeals}
      />

      {/* 4. Спортпит и БАДы (дозировки, курсы, тайминг, безопасность) */}
      <NutritionSupplementsManager
        supplements={supplements}
        setSupplements={setSupplements}
      />

      {/* 5. Лабораторные чекапы и анализы крови атлета */}
      <NutritionBloodworkTracker
        student={currentStudent}
        trainer={trainer}
      />

      {/* Главная кнопка сохранения рациона */}
      <div className="pt-1">
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveNutritionPlan}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-600/25 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 stroke-[2.2]" />
          <span>{saving ? 'Сохранение...' : saveSuccess ? 'Рацион сохранён и отправлен в Telegram!' : 'Сохранить план питания и отправить атлету'}</span>
        </button>
      </div>

    </div>
  );
}
