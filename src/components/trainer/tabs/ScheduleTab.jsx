import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  MapPin, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Building,
  User,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function ScheduleTab({ trainerProfile, trainer, onUpdate, students = [] }) {
  const trainerToUse = trainerProfile || trainer || {};
  const trainerKey = trainerToUse?.id || trainerToUse?.telegram_id || 'default_coach';

  const [events, setEvents] = useState(() => {
    try {
      const local = localStorage.getItem(`gymconnect_trainer_events_${trainerKey}`);
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {}
    return [];
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlotHour, setSelectedSlotHour] = useState(null);

  const [bookingStudentId, setBookingStudentId] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00');
  const [bookingDuration, setBookingDuration] = useState('60');
  const [bookingNote, setBookingNote] = useState('');

  const [actionMenuEvent, setActionMenuEvent] = useState(null);

  const [rescheduleEventId, setRescheduleEventId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(new Date());
  const [rescheduleTime, setRescheduleTime] = useState('09:00');

  useEffect(() => {
    const loadSavedEvents = async () => {
      try {
        if (!trainer?.id) return;
        const { data, error } = await supabase
          .from('profiles')
          .select('schedule_events')
          .eq('id', trainerToUse.id)
          .maybeSingle();

        if (data && data.schedule_events) {
          const raw = data.schedule_events;
          const loaded = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(loaded)) {
            setEvents(loaded);
            localStorage.setItem(`gymconnect_trainer_events_${trainerKey}`, JSON.stringify(loaded));
          }
        }
      } catch (e) {
        console.warn('Ошибка загрузки расписания:', e);
      }
    };
    loadSavedEvents();
  }, [trainer?.id, trainerKey]);

  const weekDays = useMemo(() => {
    const days = [];
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [currentDate]);

  const daysNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getEventsForDate = (date) => {
    return events.filter(e => {
      if (!e.date) return false;
      const eDate = new Date(e.date);
      return isSameDay(eDate, date);
    });
  };

  const todayEvents = getEventsForDate(currentDate);

  const hoursGrid = Array.from({ length: 16 }, (_, i) => i + 7);

  const saveEventsToDb = async (updatedEvents) => {
    setEvents(updatedEvents);
    try {
      localStorage.setItem(`gymconnect_trainer_events_${trainerKey}`, JSON.stringify(updatedEvents));
      if (trainer?.id) {
        await supabase
          .from('profiles')
          .update({ schedule_events: updatedEvents })
          .eq('id', trainerToUse.id);
      }
    } catch (e) {
      console.warn('Ошибка сохранения:', e);
    }
  };

  const handleBookSlotClick = (hour) => {
    const formattedHour = hour.toString().padStart(2, '0') + ':00';
    setSelectedSlotHour(hour);
    setBookingTime(formattedHour);
    setBookingStudentId(students.length > 0 ? students[0].id : '');
    setBookingDuration('60');
    setBookingNote('');
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingStudentId) {
      alert('Выберите ученика');
      return;
    }

    const isConflict = todayEvents.some(e => {
      const eHour = parseInt(e.time.split(':')[0], 10);
      const bHour = parseInt(bookingTime.split(':')[0], 10);
      return eHour === bHour;
    });

    if (isConflict) {
      alert('На этот час уже есть запись. Выберите другое время.');
      return;
    }

    const student = students.find(s => s.id === bookingStudentId);

    const newEvent = {
      id: Date.now().toString(),
      date: currentDate.toISOString(),
      time: bookingTime,
      studentId: bookingStudentId,
      studentName: student ? (student.first_name + ' ' + (student.last_name || '')) : 'Атлет',
      packageType: student?.package_type || 'Индивидуальная',
      duration: bookingDuration,
      note: bookingNote,
      status: 'scheduled'
    };

    const updated = [...events, newEvent];
    await saveEventsToDb(updated);
    setIsBookingModalOpen(false);
  };

  const handleActionMenuClick = (eventObj) => {
    setActionMenuEvent(eventObj);
  };

  const updateEventStatus = async (eventId, newStatus) => {
    const updated = events.map(e => {
      if (e.id === eventId) {
        return { ...e, status: newStatus };
      }
      return e;
    });

    await saveEventsToDb(updated);

    if (newStatus === 'completed') {
      const eventObj = events.find(e => e.id === eventId);
      if (eventObj && eventObj.studentId) {
        const student = students.find(s => s.id === eventObj.studentId);
        const leftTrainings = student.left_trainings !== undefined ? student.left_trainings : 12;
        if (student && leftTrainings > 0) {
          try {
            await supabase
              .from('profiles')
              .update({ left_trainings: leftTrainings - 1 })
              .eq('id', student.id);
            alert(`Тренировка списана! У ${student.first_name} осталось ${leftTrainings - 1} зан.`);
            if (onUpdate) onUpdate();
          } catch(e) {
            console.error('Ошибка списания', e);
          }
        } else {
          alert('У ученика закончились тренировки!');
        }
      }
    } else if (newStatus === 'no_show') {
        alert('Отмечено как неявка/отмена.');
    }

    setActionMenuEvent(null);
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Точно удалить запись?')) {
      const updated = events.filter(e => e.id !== eventId);
      await saveEventsToDb(updated);
      setActionMenuEvent(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">

      {/* Шапка календаря */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 7);
              setCurrentDate(d);
            }}
            className="p-1.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="font-bold text-sm text-slate-900 text-center flex-1">
            {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </div>

          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 7);
              setCurrentDate(d);
            }}
            className="p-1.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center gap-1">
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, currentDate);
            const hasEvents = getEventsForDate(day).length > 0;

            return (
              <div
                key={idx}
                onClick={() => setCurrentDate(day)}
                className={`flex flex-col items-center p-2 rounded-2xl min-w-[42px] cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : isToday
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold mb-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {daysNames[day.getDay()]}
                </span>
                <span className="text-sm font-black mb-1">
                  {day.getDate()}
                </span>
                <div className="h-1 flex items-center justify-center">
                  {hasEvents && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Вернуться в "Сегодня"
          </button>
        </div>
      </div>

      {/* Почасовая сетка */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-blue-600" />
          Расписание на {currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
        </h3>

        {events.length === 0 && todayEvents.length === 0 ? (
           <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 mb-4">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-3">
                <Calendar className="w-6 h-6 text-slate-400" />
             </div>
             <h4 className="text-sm font-bold text-slate-800 mb-1">На сегодня тренировок не запланировано</h4>
             <p className="text-xs text-slate-500">Нажмите на любой свободный слот ниже, чтобы записать клиента.</p>
           </div>
        ) : null}

        <div className="space-y-0 text-xs">
          {hoursGrid.map(hour => {
            const eventForHour = todayEvents.find(e => {
              const eHour = parseInt(e.time.split(':')[0], 10);
              return eHour === hour;
            });

            const hourStr = `${hour.toString().padStart(2, '0')}:00`;

            return (
              <div key={hour} className="flex min-h-[70px] border-b border-slate-100 last:border-0 relative">
                <div className="w-14 pt-3 flex flex-col items-center border-r border-slate-100 text-slate-400 font-mono font-bold shrink-0">
                  {hourStr}
                </div>

                <div className="flex-1 p-2">
                  {eventForHour ? (
                    <div
                      onClick={() => handleActionMenuClick(eventForHour)}
                      className={`rounded-2xl p-3 border cursor-pointer transition-all active:scale-95 ${
                        eventForHour.status === 'completed' ? 'bg-emerald-50 border-emerald-200 shadow-sm' :
                        eventForHour.status === 'cancelled' || eventForHour.status === 'no_show' ? 'bg-slate-100 border-slate-200 opacity-70' :
                        'bg-blue-50 border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-slate-900 truncate pr-2">
                          {eventForHour.studentName}
                        </div>
                        {eventForHour.status === 'completed' && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">
                            Проведена
                          </span>
                        )}
                        {eventForHour.status === 'scheduled' && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">
                            Запланирована
                          </span>
                        )}
                        {(eventForHour.status === 'cancelled' || eventForHour.status === 'no_show') && (
                          <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">
                            Отменена
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {eventForHour.packageType}
                        </span>
                        <span>•</span>
                        <span>{eventForHour.duration} мин</span>
                      </div>

                      {eventForHour.note && (
                        <div className="text-[10px] text-slate-600 bg-white/50 p-1.5 rounded-lg border border-white/40">
                          <span className="font-semibold text-slate-400">Заметка:</span> {eventForHour.note}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => handleBookSlotClick(hour)}
                      className="h-full rounded-2xl border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors group p-2 min-h-[50px]"
                    >
                      <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-blue-500 font-semibold text-[11px]">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Свободно</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Новая запись ({bookingTime})
              </h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Атлет (Ученик)</label>
                {students.length > 0 ? (
                  <select
                    value={bookingStudentId}
                    onChange={(e) => setBookingStudentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-900 outline-none focus:border-blue-500"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name || ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-[11px]">
                    У вас пока нет активных учеников в базе.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Время</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold font-mono text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Длительность</label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="45">45 мин</option>
                    <option value="60">60 мин</option>
                    <option value="90">90 мин</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Заметка (опционально)</label>
                <input
                  type="text"
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder="Например: Вводная тренировка, День ног..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={!bookingStudentId}
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                Подтвердить запись
              </button>
            </div>
          </div>
        </div>
      )}

      {actionMenuEvent && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{actionMenuEvent.studentName}</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {new Date(actionMenuEvent.date).toLocaleDateString('ru-RU')} • {actionMenuEvent.time}
                </p>
              </div>
              <button
                onClick={() => setActionMenuEvent(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {actionMenuEvent.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => updateEventStatus(actionMenuEvent.id, 'completed')}
                    className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Отметить как проведенную
                  </button>
                  <button
                    onClick={() => updateEventStatus(actionMenuEvent.id, 'no_show')}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" /> Не пришел / Отмена
                  </button>
                </>
              )}

              <button
                onClick={() => {
                   setRescheduleEventId(actionMenuEvent.id);
                   setRescheduleDate(new Date(actionMenuEvent.date));
                   setRescheduleTime(actionMenuEvent.time);
                   setActionMenuEvent(null);
                }}
                className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Clock className="w-4 h-4" /> Перенести
              </button>

              <button
                onClick={() => deleteEvent(actionMenuEvent.id)}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4"
              >
                <Trash2 className="w-4 h-4" /> Удалить запись
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка переноса записи */}
      {rescheduleEventId && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Перенос записи
              </h3>
              <button
                onClick={() => setRescheduleEventId(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Новая дата</label>
                <input
                  type="date"
                  value={rescheduleDate.toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleDate(new Date(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Новое время</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold font-mono text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={async () => {
                  const updated = events.map(e => {
                    if (e.id === rescheduleEventId) {
                      return { ...e, date: rescheduleDate.toISOString(), time: rescheduleTime };
                    }
                    return e;
                  });
                  await saveEventsToDb(updated);
                  setRescheduleEventId(null);
                  alert('Запись перенесена!');
                }}
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
