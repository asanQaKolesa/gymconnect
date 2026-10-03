import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, UserCheck, UserX, Dumbbell } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function TodayScheduleWidget({ students, onSelectStudent, trainerProfile }) {
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [events, setEvents] = useState([]);

  const trainer = trainerProfile || {};
  const trainerKey = trainer?.id || trainer?.telegram_id || 'default_coach';

  const daysMap = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const today = new Date();
  const formattedDate = `${daysMap[today.getDay()]}, ${today.getDate()} ${today.toLocaleString('ru-RU', { month: 'long' })}`;

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
            try {
              loaded = typeof raw === 'string' ? JSON.parse(raw) : raw;
              localStorage.setItem(`gymconnect_trainer_events_${trainerKey}`, JSON.stringify(loaded));
            } catch (e) {
              console.error('Error parsing trainer schedule_events from db', e);
            }
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

  const morningEvents = (events || []).filter(e => {
      if (!e?.time) return false;
      const h = parseInt(e.time.split(':')[0], 10);
      return h < 12;
  });
  const afternoonEvents = (events || []).filter(e => {
      if (!e?.time) return false;
      const h = parseInt(e.time.split(':')[0], 10);
      return h >= 12 && h < 16;
  });
  const eveningEvents = (events || []).filter(e => {
      if (!e?.time) return false;
      const h = parseInt(e.time.split(':')[0], 10);
      return h >= 16;
  });

  const handleAttendanceYes = async (e, eventObj) => {
    e.stopPropagation();
    const student = (students || []).find(s => s?.id === eventObj?.studentId);
    if (!student) {
        alert('Ученик не найден'); return;
    }

    const currentLeft = student?.left_trainings !== undefined ? student.left_trainings : 12;
    if (currentLeft <= 0) {
      alert('У ученика закончились оплаченные тренировки!');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ left_trainings: currentLeft - 1 })
      .eq('id', student.id);

    if (error) {
      alert('Ошибка списания: ' + error.message);
    } else {
        let allEvents = [];
        try {
            const local = localStorage.getItem(`gymconnect_trainer_events_${trainerKey}`);
            if (local) allEvents = JSON.parse(local);
        } catch (e) {
            console.error('Error parsing trainer events from localStorage', e);
            allEvents = [];
        }

        const updatedEvents = (allEvents || []).map(ev => {
            if (ev?.id === eventObj?.id) {
                return { ...ev, status: 'completed' };
            }
            return ev;
        });

        localStorage.setItem(`gymconnect_trainer_events_${trainerKey}`, JSON.stringify(updatedEvents));

        if (trainer?.id) {
            await supabase
              .from('profiles')
              .update({ schedule_events: updatedEvents })
              .eq('id', trainer.id);
        }

      alert(`Занятие засчитано! У ${student?.first_name} осталось ${currentLeft - 1} зан.`);
      setEvents((events || []).map(ev => ev?.id === eventObj?.id ? { ...ev, status: 'completed' } : ev));
    }
  };

  const handleAttendanceNo = async (e, eventObj) => {
    e.stopPropagation();
    let allEvents = [];
    try {
        const local = localStorage.getItem(`gymconnect_trainer_events_${trainerKey}`);
        if (local) allEvents = JSON.parse(local);
    } catch (e) {
        console.error('Error parsing trainer events from localStorage', e);
        allEvents = [];
    }

    const updatedEvents = (allEvents || []).map(ev => {
        if (ev?.id === eventObj?.id) {
            return { ...ev, status: 'no_show' };
        }
        return ev;
    });

    localStorage.setItem(`gymconnect_trainer_events_${trainerKey}`, JSON.stringify(updatedEvents));

    if (trainer?.id) {
        await supabase
          .from('profiles')
          .update({ schedule_events: updatedEvents })
          .eq('id', trainer.id);
    }
    setEvents((events || []).map(ev => ev?.id === eventObj?.id ? { ...ev, status: 'no_show' } : ev));
    alert(`Пропуск зафиксирован. Занятие для ${eventObj?.studentName} отмечено как прогул.`);
  };

  const renderEventCard = (eventObj, index) => {
    const isExpanded = eventObj && expandedEventId === eventObj.id;
    const student = (students || []).find(s => s?.id === eventObj?.studentId);
    const leftTr = student?.left_trainings !== undefined ? student.left_trainings : 0;
    const isCompleted = eventObj?.status === 'completed';
    const isCancelled = eventObj?.status === 'cancelled' || eventObj?.status === 'no_show';

    return (
      <div key={eventObj?.id || index} className={`border rounded-2xl p-3.5 transition-all space-y-2 ${
          isCompleted ? 'bg-emerald-50/30 border-emerald-100' :
          isCancelled ? 'bg-slate-50 border-slate-100 opacity-60' :
          'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm font-mono ${
                isCompleted ? 'bg-emerald-100 text-emerald-700' :
                isCancelled ? 'bg-slate-200 text-slate-500' :
                'bg-blue-600 text-white'
            }`}>
              {eventObj?.time}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs cursor-pointer hover:text-blue-600" onClick={() => student && onSelectStudent(student)}>
                {eventObj?.studentName}
              </h4>
              <p className="text-[10px] text-slate-500">
                <span className={`font-semibold ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>Остаток: {leftTr} зан.</span>
              </p>
            </div>
          </div>

          {!isCompleted && !isCancelled && (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); eventObj && setExpandedEventId(isExpanded ? null : eventObj.id); }}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 border border-blue-200"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isExpanded ? 'Скрыть' : 'Детали'}</span>
              </button>

              <button
                onClick={(e) => handleAttendanceYes(e, eventObj)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => handleAttendanceNo(e, eventObj)}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 border border-rose-200"
              >
                <UserX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {isCompleted && (
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-100 px-2 py-1 rounded">Проведена</span>
          )}
        </div>

        {isExpanded && (
          <div className="mt-2 p-3 bg-white border border-blue-100 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-blue-600" /> Тариф: {eventObj?.packageType}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Длит.: {eventObj?.duration} мин</span>
            </div>
            
            {eventObj?.note && (
                <div className="text-slate-600 space-y-1">
                <p><b>Заметка тренера:</b></p>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-1 text-slate-700">
                    <p>{eventObj?.note}</p>
                </div>
                </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">Тренировки на сегодня</h3>
        </div>
        <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-xl text-xs font-mono">
          Всего: {(events || []).length}
        </span>
      </div>

      <p className="text-[11px] text-slate-500 font-medium mb-2">{formattedDate}</p>

      {(events || []).length > 0 ? (
        <div className="space-y-4">
          {(morningEvents || []).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Утро (07:00 - 12:00)
              </h4>
              {(morningEvents || []).map((ev, idx) => renderEventCard(ev, idx))}
            </div>
          )}

          {(afternoonEvents || []).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Обед / День (12:00 - 16:00)
              </h4>
              {(afternoonEvents || []).map((ev, idx) => renderEventCard(ev, idx))}
            </div>
          )}

          {(eveningEvents || []).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Вечер (16:00 - 22:00)
              </h4>
              {(eveningEvents || []).map((ev, idx) => renderEventCard(ev, idx))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 space-y-1">
          <p className="font-medium text-slate-600 text-sm">На сегодня запланированных тренировок нет.</p>
          <p className="text-[11px]">Используйте раздел "Расписание", чтобы внести записи.</p>
        </div>
      )}
    </div>
  );
}
