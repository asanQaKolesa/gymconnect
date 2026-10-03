// src/components/trainer/nutrition/NutritionBloodworkTracker.jsx
import React, { useState } from 'react';
import { Activity, Send, CheckCircle2, AlertCircle, FileText, Check } from 'lucide-react';
import { sendStudentNotification } from '../../../utils/telegramNotifications';

export default function NutritionBloodworkTracker({ student, trainer }) {
  const [taskSent, setTaskSent] = useState(false);

  // Список базовых лабораторных чекапов для силового атлета
  const [labTests, setLabTests] = useState(() => [
    { id: 'vit_d', title: 'Витамин D (25-OH)', status: 'normal', result: '48 нг/мл (Оптимум)', date: '12 сен' },
    { id: 'ferritin', title: 'Ферритин и железо сыворотки', status: 'normal', result: '95 мкг/л (Норма)', date: '12 сен' },
    { id: 'thyroid', title: 'Щитовидная железа (ТТГ, Т3, Т4)', status: 'normal', result: 'ТТГ 1.8 мЕд/л', date: '12 сен' },
    { id: 'biochem', title: 'Биохимия: АЛТ, АСТ, билирубин, креатинин', status: 'normal', result: 'Печёночные пробы в норме', date: '12 сен' },
    { id: 'lipid', title: 'Липидный профиль (холестерин, ЛПВП/ЛПНП)', status: 'pending', result: 'Требуется пересдача', date: 'Запланировано' },
    { id: 'testo', title: 'Гормональный профиль (тестостерон общий/свободный)', status: 'normal', result: '24 нмоль/л (Высокий уровень)', date: '12 сен' }
  ]);

  const toggleTestStatus = (id) => {
    setLabTests(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'normal' ? 'pending' : 'normal';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleSendLabTaskToStudent = async () => {
    const studentName = student?.full_name || student?.first_name || 'Атлет';
    const message = `📋 Задание от наставника по анализам:\n\nПривет, ${studentName}! Для точной корректировки питания и назначения добавок (витамин D, омега, ферритин) необходимо сдать базовый лабораторный чекап.\n\nСписок анализов:\n• Общий анализ крови + Ферритин\n• Витамин D (25-OH)\n• Биохимия (АЛТ, АСТ, креатинин)\n• Гормоны щитовидной железы (ТТГ)\n\nСдавать строго натощак. Результаты прикрепите в чат!`;

    setTaskSent(true);

    if (student?.telegram_id) {
      await sendStudentNotification({
        studentTelegramId: student.telegram_id,
        studentUsername: student.username,
        studentId: student.id,
        title: 'Задание: Сдать лабораторные анализы',
        message
      });
    }

    setTimeout(() => setTaskSent(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 select-none">
      
      {/* Шапка блока */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Лабораторные анализы и чекап крови</h3>
          <p className="text-[10px] text-slate-400 font-medium">Безопасность здоровья и персонализация плана</p>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
          Чекап
        </span>
      </div>

      {/* Список анализов */}
      <div className="space-y-2">
        {labTests.map(test => (
          <div
            key={test.id}
            onClick={() => toggleTestStatus(test.id)}
            className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 transition-all cursor-pointer"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 block">{test.title}</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5 font-mono">
                {test.result} ({test.date})
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                test.status === 'normal' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {test.status === 'normal' ? 'В норме' : 'Сдать / Контроль'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка отправки задачи ученику в Telegram */}
      <button
        type="button"
        onClick={handleSendLabTaskToStudent}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{taskSent ? 'Список отправлен ученику в Telegram!' : 'Отправить список анализов ученику в Telegram'}</span>
      </button>

    </div>
  );
}
