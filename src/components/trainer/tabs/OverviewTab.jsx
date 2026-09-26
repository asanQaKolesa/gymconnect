// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Plus, 
  BellRing, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Phone, 
  AlertTriangle,
  Send,
  MessageCircle,
  Dumbbell,
  Check
} from 'lucide-react';

export default function OverviewTab({ trainer, onAddStudentClick }) {
  // Фильтр формата
  const [filterFormat, setFilterFormat] = useState('all'); // 'all' | 'gym' | 'online'

  // Модальные окна
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderType, setReminderType] = useState('today'); // 'today' | 'payment' | 'absence'
  const [isLocalAddModalOpen, setIsLocalAddModalOpen] = useState(false);

  // Форма добавления нового ученика
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    phone: '',
    format: 'gym',
    totalWorkouts: 12,
    pricePaid: 70000,
    firstSessionDate: '2026-09-26'
  });

  // Расписание на сегодняшний день (Суббота)
  const [todaySchedule, setTodaySchedule] = useState([
    { id: '1', time: '10:00', name: 'Данияр Аскаров', gym: 'Invictus Go', format: 'gym', status: 'completed', remaining: 6 },
    { id: '2', time: '12:00', name: 'Анель Мусина', gym: 'Онлайн ведение', format: 'online', status: 'pending', remaining: 3 },
    { id: '3', time: '15:30', name: 'Ерлан Сатыбалдиев', gym: 'Invictus Go', format: 'gym', status: 'pending', remaining: 1 },
    { id: '4', time: '18:00', name: 'Мадина Омарова', gym: 'Invictus Go', format: 'gym', status: 'pending', remaining: 8 }
  ]);

  // Демо-список подопечных для напоминаний
  const [studentsData, setStudentsData] = useState([
    { id: '1', name: 'Данияр Аскаров', phone: '+77771234567', format: 'gym', remaining: 6, status: 'active' },
    { id: '2', name: 'Анель Мусина', phone: '+77017654321', format: 'online', remaining: 3, status: 'active' },
    { id: '3', name: 'Ерлан Сатыбалдиев', phone: '+77059998877', format: 'gym', remaining: 1, status: 'active' },
    { id: '4', name: 'Мадина Омарова', phone: '+77473332211', format: 'gym', remaining: 8, status: 'active' },
    { id: '5', name: 'Азамат Темирханов', phone: '+77025554433', format: 'gym', remaining: 0, status: 'paused' },
    { id: '6', name: 'Камила Жумабаева', phone: '+77784443322', format: 'online', remaining: 0, status: 'finished' }
  ]);

  // Списание тренировки по расписанию
  const handleCompleteSession = (id) => {
    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'completed' ? 'pending' : 'completed',
          remaining: item.status === 'completed' ? item.remaining + 1 : Math.max(0, item.remaining - 1)
        };
      }
      return item;
    }));
  };

  // Сохранение нового ученика
  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!newStudentForm.name.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      name: newStudentForm.name,
      phone: newStudentForm.phone,
      format: newStudentForm.format,
      remaining: Number(newStudentForm.totalWorkouts),
      status: 'active'
    };

    setStudentsData([newEntry, ...studentsData]);
    setIsLocalAddModalOpen(false);
    setNewStudentForm({
      name: '',
      phone: '',
      format: 'gym',
      totalWorkouts: 12,
      pricePaid: 70000,
      firstSessionDate: '2026-09-26'
    });
    alert('Ученик успешно добавлен в вашу базу!');
  };

  // Отправка напоминания в WhatsApp
  const handleSendReminder = (phone, text) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Фильтрация расписания по формату
  const filteredSchedule = todaySchedule.filter(item => {
    if (filterFormat === 'gym') return item.format === 'gym';
    if (filterFormat === 'online') return item.format === 'online';
    return true;
  });

  return (
    <div className="space-y-4 pb-20 select-none">
      
      {/* 1. ФИЛЬТР ФОРМАТА (ВСЕ / В ЗАЛЕ / ОНЛАЙН) */}
      <div className="flex items-center justify-between gap-2 p-1 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setFilterFormat('all')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all ${
            filterFormat === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Все форматы
        </button>
        <button
          type="button"
          onClick={() => setFilterFormat('gym')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all ${
            filterFormat === 'gym' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          В зале
        </button>
        <button
          type="button"
          onClick={() => setFilterFormat('online')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all ${
            filterFormat === 'online' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Онлайн
        </button>
      </div>

      {/* 2. КНОПКИ ДЕЙСТВИЙ: ДОБАВИТЬ УЧЕНИКА И НАПОМНИТЬ */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAddStudentClick ? onAddStudentClick() : setIsLocalAddModalOpen(true)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span className="text-xs font-semibold">Добавить ученика</span>
        </button>

        <button
          type="button"
          onClick={() => setIsReminderModalOpen(true)}
          className="p-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
        >
          <BellRing className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold">Напомнить</span>
        </button>
      </div>

      {/* 3. ОСНОВНЫЕ KPI КАРТОЧКИ С ТОНКОЙ И ЧИСТОЙ ТИПОГРАФИКОЙ */}
      <div className="space-y-2.5">
        
        {/* КАРТОЧКА: ВЫРУЧКА ЗА МЕСЯЦ */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400">Выручка за сентябрь</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-semibold text-slate-900 font-mono tracking-tight">420 000 ₸</span>
              <span className="text-[10px] font-medium text-emerald-600">+14% к авг</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* СЕТКА: АКТИВНАЯ БАЗА И СРЕДНЯЯ ЯВКА */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* АКТИВНАЯ БАЗА С РАЗДЕЛЕНИЕМ ПАУЗА / ЗАВЕРШИЛИ */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400">Активная база</span>
              <p className="text-lg font-semibold text-slate-900 font-mono mt-0.5">14 атлетов</p>
            </div>

            {/* Аккуратные плашки снизу */}
            <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
              <div className="flex justify-between items-center text-amber-700 bg-amber-50/70 px-2 py-0.5 rounded-lg">
                <span>На паузе:</span>
                <span className="font-mono font-semibold">2</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                <span>Завершили:</span>
                <span className="font-mono font-semibold">1</span>
              </div>
            </div>
          </div>

          {/* ПОСЕЩАЕМОСТЬ И СРЕДНЯЯ ЯВКА */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400">Средняя явка</span>
              <p className="text-lg font-semibold text-blue-600 font-mono mt-0.5">92%</p>
            </div>

            {/* Детализация посещаемости */}
            <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
              <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded-lg">
                <span>По графику:</span>
                <span className="font-mono font-semibold">46 зан.</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                <span>Переносы:</span>
                <span className="font-mono font-semibold">4</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. РАСПИСАНИЕ НА СЕГОДНЯ (СУББОТА) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Суббота, расписание на сегодня</h3>
              <p className="text-[10px] text-slate-400">
                Запланировано: {filteredSchedule.length} тренировок
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
            26 сентября
          </span>
        </div>

        {/* Список занятий по таймлайну */}
        <div className="space-y-2">
          {filteredSchedule.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">На сегодня тренировок в этом формате нет</p>
          ) : (
            filteredSchedule.map((item) => {
              const isDone = item.status === 'completed';
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isDone 
                      ? 'bg-slate-50/70 border-slate-200/60 opacity-80' 
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center w-11 shrink-0 font-mono">
                      <span className="text-xs font-semibold text-slate-800 block">{item.time}</span>
                      <span className="text-[9px] text-slate-400">{item.format === 'gym' ? 'Зал' : 'Онлайн'}</span>
                    </div>

                    <div className="space-y-0.5 overflow-hidden">
                      <p className={`text-xs font-medium truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.gym} • остаток: <span className="font-mono font-semibold text-blue-600">{item.remaining} зан.</span>
                      </p>
                    </div>
                  </div>

                  {/* Кнопка списания тренировки */}
                  <button
                    type="button"
                    onClick={() => handleCompleteSession(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10.5px] font-semibold flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                    <span>{isDone ? 'Проведено' : 'Списать -1'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= МОДАЛКА: БЫСТРЫЕ НАПОМИНАНИЯ (3 СЦЕНАРИЯ) ================= */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold text-slate-900">Быстрые напоминания</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Выбор сценария */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setReminderType('today')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all ${
                  reminderType === 'today' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                О тренировке
              </button>
              <button
                type="button"
                onClick={() => setReminderType('payment')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all ${
                  reminderType === 'payment' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Об оплате
              </button>
              <button
                type="button"
                onClick={() => setReminderType('absence')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all ${
                  reminderType === 'absence' ? 'bg-white text-rose-600 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Не будет в зале
              </button>
            </div>

            {/* Список учеников по выбранному сценарию */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reminderType === 'today' && (
                <>
                  <p className="text-[10px] text-slate-400 px-1">Атлеты, записанные на сегодня (Суббота):</p>
                  {todaySchedule.map(st => (
                    <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-slate-400">Время: {st.time}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendReminder('+77771234567', `Привет, ${st.name}! Напоминаю о сегодняшней тренировке в ${st.time}. Жду вовремя! 💪`)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 active:scale-95"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  ))}
                </>
              )}

              {reminderType === 'payment' && (
                <>
                  <p className="text-[10px] text-slate-400 px-1">Ученики с остатком 1 или 0 занятий:</p>
                  {studentsData.filter(s => s.remaining <= 1).map(st => (
                    <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-amber-600 font-medium">Осталось: {st.remaining} зан.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendReminder(st.phone, `Привет, ${st.name}! По твоему абонементу осталось ${st.remaining} зан. Давай запланируем продление, чтобы сохранить график!`)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 active:scale-95"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Напомнить</span>
                      </button>
                    </div>
                  ))}
                </>
              )}

              {reminderType === 'absence' && (
                <>
                  <p className="text-[10px] text-rose-500 px-1">Предупреждение об отмене или форс-мажоре:</p>
                  <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-2">
                    <p className="text-[11px] text-rose-900">
                      Отправить всем ученикам на сегодня: «Уважаемые атлеты, по техническим причинам меня сегодня не будет в зале. Все занятия переносятся без сгорания».
                    </p>
                    <button
                      type="button"
                      onClick={() => alert('Уведомление отправлено всем подопечным на сегодня!')}
                      className="w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold active:scale-98"
                    >
                      Разослать всем на сегодня
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: ДОБАВИТЬ УЧЕНИКА ================= */}
      {isLocalAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold text-slate-900">Добавить нового ученика</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLocalAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">ФИО подопечного *</label>
                <input
                  type="text"
                  required
                  placeholder="Имя Фамилия"
                  value={newStudentForm.name}
                  onChange={e => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">WhatsApp номер (+7) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (777) 000-00-00"
                  value={newStudentForm.phone}
                  onChange={e => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Формат занятий</label>
                  <select
                    value={newStudentForm.format}
                    onChange={e => setNewStudentForm({ ...newStudentForm, format: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="gym">В зале</option>
                    <option value="online">Онлайн</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Кол-во занятий</label>
                  <input
                    type="number"
                    value={newStudentForm.totalWorkouts}
                    onChange={e => setNewStudentForm({ ...newStudentForm, totalWorkouts: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Сумма оплаты (₸)</label>
                <input
                  type="number"
                  value={newStudentForm.pricePaid}
                  onChange={e => setNewStudentForm({ ...newStudentForm, pricePaid: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs active:scale-98 transition-all mt-2"
              >
                Сохранить в базу
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
