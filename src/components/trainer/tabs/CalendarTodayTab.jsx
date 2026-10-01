import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { Calendar, CheckCircle2, Clock, User, XCircle, MoreVertical } from 'lucide-react';

export default function CalendarTodayTab({ students, trainerProfile, onUpdate }) {
  const [loadingId, setLoadingId] = useState(null);
  const [events, setEvents] = useState([]);

  const trainer = trainerProfile || {};
  const trainerKey = trainer?.id || trainer?.telegram_id || 'default_coach';

  const daysMap = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayName = daysMap[new Date().getDay()];
  const today = new Date();

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        let loaded = [];
        const local = localStorage.getItem(`gymconnect_trainer_events_${trainerKey}`);
        if (local) {
            loaded = JSON.parse(local);
        }

        if (trainer?.id) {
          const { data } = await supabase
            .from('profiles')
            .select('schedule_events')
            .eq('id', trainer.id)
            .maybeSingle();

          if (data && data.schedule_events) {
            const raw = data.schedule_events;
            loaded = typeof raw === 'string' ? JSON.parse(raw) : raw;
            localStorage.setItem(`gymconnect_trainer_events_${trainerKey}`, JSON.stringify(loaded));
          }
        }

        if (Array.isArray(loaded)) {
            const todays = loaded.filter(e => {
                if (!e.date) return false;
                return isSameDay(new Date(e.date), today);
            });
            todays.sort((a, b) => {
                return parseInt(a.time.replace(':','')) - parseInt(b.time.replace(':',''));
            });
            setEvents(todays);
        }
      } catch (e) {
          console.error(e);
      }
    };
    loadEvents();
  }, [trainer?.id, trainerKey]);

  const handleAttendTraining = async (eventObj) => {
    const student = students.find(s => s.id === eventObj.studentId);
    if (!student) {
        alert('Ученик не найден в базе.');
        return;
    }

    const currentLeft = student.left_trainings !== undefined ? student.left_trainings : 12;
    if (currentLeft <= 0) {
      alert('У ученика закончились тренировки в абонементе!');
      return;
    }

    setLoadingId(eventObj.id);
    const newLeft = currentLeft - 1;

    try {
        const { error } = await supabase
          .from('profiles')
          .update({ left_trainings: newLeft })
          .eq('id', student.id);

        if (error) throw error;

        let allEvents = [];
        const local = localStorage.getItem(`gymconnect_trainer_events_${trainerKey}`);
        if (local) allEvents = JSON.parse(local);

        const updatedEvents = allEvents.map(e => {
            if (e.id === eventObj.id) {
                return { ...e, status: 'completed' };
            }
            return e;
        });

        localStorage.setItem(`gymconnect_trainer_events_${trainerKey}`, JSON.stringify(updatedEvents));

        if (trainer?.id) {
            await supabase
              .from('profiles')
              .update({ schedule_events: updatedEvents })
              .eq('id', trainer.id);
        }

        setEvents(events.map(e => e.id === eventObj.id ? { ...e, status: 'completed' } : e));
        if (onUpdate) onUpdate();
    } catch (e) {
        alert('Ошибка списания тренировки: ' + e.message);
    } finally {
        setLoadingId(null);
    }
  };

  const handleNoShow = async (eventObj) => {
        let allEvents = [];
        const local = localStorage.getItem(`gymconnect_trainer_events_${trainerKey}`);
        if (local) allEvents = JSON.parse(local);

        const updatedEvents = allEvents.map(e => {
            if (e.id === eventObj.id) {
                return { ...e, status: 'no_show' };
            }
            return e;
        });

        localStorage.setItem(`gymconnect_trainer_events_${trainerKey}`, JSON.stringify(updatedEvents));

        if (trainer?.id) {
            await supabase
              .from('profiles')
              .update({ schedule_events: updatedEvents })
              .eq('id', trainer.id);
        }

        setEvents(events.map(e => e.id === eventObj.id ? { ...e, status: 'no_show' } : e));
  }

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Расписание на сегодня ({todayName})</h3>
              <p className="text-[10px] text-slate-500">Отмечайте посещения атлетов в один клик для списания занятий</p>
            </div>
          </div>
          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl font-bold text-[10px]">
            {events.length} записей
          </span>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <p className="font-medium text-slate-600">На сегодня тренировок нет.</p>
            <p className="text-[10px]">Используйте вкладку "Расписание", чтобы добавить записи.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {events.map((eventObj) => {
              const student = students.find(s => s.id === eventObj.studentId);
              const isCompleted = eventObj.status === 'completed';
              const isCancelled = eventObj.status === 'cancelled' || eventObj.status === 'no_show';

              return (
                <div
                  key={eventObj.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isCompleted ? 'bg-emerald-50/50 border-emerald-100' :
                    isCancelled ? 'bg-slate-50 border-slate-100 opacity-70' :
                    'bg-slate-50 border-slate-200 hover:border-blue-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 font-bold font-mono ${
                      isCompleted ? 'bg-emerald-100 text-emerald-700' :
                      isCancelled ? 'bg-slate-200 text-slate-500' :
                      'bg-blue-600 text-white'
                    }`}>
                      {eventObj.time}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-slate-900 text-[13px]">{eventObj.studentName}</h4>
                        {isCompleted && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Проведена</span>}
                        {isCancelled && <span className="bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Отмена</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        {student && (
                            <span className="flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Остаток: {student.left_trainings || 0}
                            </span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span>{eventObj.duration} мин</span>
                      </div>
                    </div>
                  </div>

                  {!isCompleted && !isCancelled && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAttendTraining(eventObj)}
                        disabled={loadingId === eventObj.id}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        {loadingId === eventObj.id ? '...' : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Отметить</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleNoShow(eventObj)}
                        className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
