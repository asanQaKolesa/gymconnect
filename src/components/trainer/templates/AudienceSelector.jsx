// src/components/trainer/templates/AudienceSelector.jsx
import React, { useMemo } from 'react';
import { 
  Users, 
  User, 
  Check, 
  Search 
} from 'lucide-react';

export default function AudienceSelector({ 
  students = [], 
  recipientMode, 
  setRecipientMode, 
  selectedStudentId, 
  setSelectedStudentId, 
  selectedStudentIds = [], 
  setSelectedStudentIds, 
  quickFilter, 
  setQuickFilter, 
  searchQuery, 
  setSearchQuery 
}) {
  const currentDayShort = useMemo(() => {
    const map = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return map[new Date().getDay()];
  }, []);

  const parseDays = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) return p;
      } catch (e) {
        if (raw.includes(',')) return raw.split(',').map(s => s.trim());
      }
    }
    return ['Пн', 'Ср', 'Пт'];
  };

  // Фильтрация списка при выборочном режиме
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const name = (st.full_name || `${st.first_name || ''} ${st.last_name || ''}`).toLowerCase();
      const tg = (st.username || st.telegram_username || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || name.includes(q) || tg.includes(q);
      if (!matchesSearch) return false;

      const left = Number(st.left_trainings ?? st.remaining_workouts ?? 12);
      const isOnline = (st.training_format || st.package_type || '').toLowerCase().includes('online');
      const workoutDays = parseDays(st.workout_days);
      const isToday = workoutDays.includes(currentDayShort);

      if (quickFilter === 'today') return isToday;
      if (quickFilter === 'expiring') return left <= 2;
      if (quickFilter === 'gym') return !isOnline;
      if (quickFilter === 'online') return isOnline;

      return true;
    });
  }, [students, searchQuery, quickFilter, currentDayShort]);

  const toggleSelectStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(i => i !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredStudents.map(s => s.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedStudentIds.includes(id));
    if (areAllSelected) {
      setSelectedStudentIds(selectedStudentIds.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedStudentIds(Array.from(new Set([...selectedStudentIds, ...allFilteredIds])));
    }
  };

  const totalRecipientsCount = useMemo(() => {
    if (recipientMode === 'individual') return selectedStudentId ? 1 : 0;
    if (recipientMode === 'all') return students.length;
    if (recipientMode === 'custom') return selectedStudentIds.length;
    return 0;
  }, [recipientMode, selectedStudentId, students.length, selectedStudentIds.length]);

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 select-none">
      
      {/* Шапка сегментации */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Кому отправить уведомление</h3>
          <p className="text-[10px] text-slate-400 font-medium">Выберите формат охвата базы</p>
        </div>

        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
          Получателей: {totalRecipientsCount}
        </span>
      </div>

      {/* 3 режима отправки */}
      <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl gap-1">
        {[
          { id: 'individual', label: 'Индивидуально' },
          { id: 'all', label: 'Всем ученикам' },
          { id: 'custom', label: 'Выборочно' }
        ].map(mode => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setRecipientMode(mode.id)}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center truncate ${
              recipientMode === mode.id 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* РЕЖИМ 1: ИНДИВИДУАЛЬНО */}
      {recipientMode === 'individual' && (
        <div className="space-y-1.5 animate-in fade-in">
          <label className="text-[10.5px] font-semibold text-slate-600 block">
            Выберите конкретного ученика:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.full_name || `${s.first_name || 'Атлет'} ${s.last_name || ''}`.trim()} • {s.gym ? s.gym.split('|')[0] : 'Зал'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* РЕЖИМ 2: ВСЕМ УЧЕНИКАМ */}
      {recipientMode === 'all' && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1 animate-in fade-in">
          <span className="font-bold text-slate-900 block text-[11px]">Массовая персонализированная рассылка</span>
          <p className="text-[10.5px] text-slate-500 leading-snug">
            Уведомление будет отправлено каждому из <b>{students.length} учеников</b>. Имя, зал и время подставятся автоматически для каждого получателя.
          </p>
        </div>
      )}

      {/* РЕЖИМ 3: ВЫБОРОЧНО (С ФИЛЬТРАМИ И ЧЕКБОКСАМИ) */}
      {recipientMode === 'custom' && (
        <div className="space-y-2.5 animate-in fade-in">
          {/* Быстрые фильтры */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'all', label: 'Все' },
              { id: 'today', label: `Сегодня (${currentDayShort})` },
              { id: 'expiring', label: 'Остаток ≤ 2' },
              { id: 'gym', label: 'В зале' },
              { id: 'online', label: 'Онлайн' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setQuickFilter(f.id)}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  quickFilter === f.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Строка поиска и кнопка «Выбрать всех» */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск атлета..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10.5px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              Выбрать всех ({filteredStudents.length})
            </button>
          </div>

          {/* Список атлетов с галочками */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
            {filteredStudents.map(st => {
              const fullName = st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim();
              const isChecked = selectedStudentIds.includes(st.id);
              const left = Number(st.left_trainings ?? st.remaining_workouts ?? 12);

              return (
                <div
                  key={st.id}
                  onClick={() => toggleSelectStudent(st.id)}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked 
                      ? 'bg-blue-50/70 border-blue-300' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {fullName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {st.gym ? st.gym.split('|')[0] : 'Зал'} • Остаток: {left} зан.
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                    isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
