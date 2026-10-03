// src/components/trainer/screens/AthletesScreen.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Users, 
  ChevronRight, 
  Copy, 
  Check, 
  X,
  Send,
  PauseCircle,
  Building
} from 'lucide-react';

export default function AthletesScreen({ 
  students = [], 
  trainer,
  onBack, 
  onSelectStudent 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'expiring' | 'paused' | 'archived'
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cleanCoachNick = (trainer?.username || 'coach').replace(/[@\s]/g, '').trim().toLowerCase();
  const botUsername = 'gymconnect_ala_bot';
  const inviteLink = `https://t.me/${botUsername}?start=c_${cleanCoachNick}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // KPI метрики базы
  const metrics = useMemo(() => {
    const total = (students || []).length;
    const active = (students || []).filter(s => (s?.status || 'active').toLowerCase() === 'active').length;
    const paused = (students || []).filter(s => (s?.status || '').toLowerCase() === 'paused').length;
    const archived = (students || []).filter(s => {
      const st = (s?.status || '').toLowerCase();
      return st === 'left' || st === 'archived';
    }).length;

    const expiring = (students || []).filter(s => {
      const left = Number(s?.left_trainings ?? s?.remaining_workouts ?? 12);
      const isPending = s?.payment_status === 'pending';
      const isActive = (s?.status || 'active').toLowerCase() === 'active';
      return isActive && (left <= 2 || isPending);
    }).length;

    return { total, active, paused, archived, expiring };
  }, [students]);

  // Фильтрация и живой поиск
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return (students || []).filter(s => {
      const fullName = (s?.full_name || `${s?.first_name || ''} ${s?.last_name || ''}`).toLowerCase();
      const tg = (s?.username || s?.telegram_username || '').toLowerCase();
      const phone = (s?.phone || s?.whatsapp || '').replace(/\D/g, '');
      const gym = (s?.gym || s?.custom_gym || '').toLowerCase();

      const matchesSearch = !q || fullName.includes(q) || tg.includes(q) || phone.includes(q) || gym.includes(q);
      if (!matchesSearch) return false;

      const st = (s?.status || 'active').toLowerCase();
      const left = Number(s?.left_trainings ?? s?.remaining_workouts ?? 12);
      const isPending = s?.payment_status === 'pending';

      if (statusFilter === 'active') return st === 'active';
      if (statusFilter === 'paused') return st === 'paused';
      if (statusFilter === 'archived') return st === 'left' || st === 'archived';
      if (statusFilter === 'expiring') return st === 'active' && (left <= 2 || isPending);

      return true;
    });
  }, [students, searchQuery, statusFilter]);

  const getFormatLabel = (s) => {
    const f = (s?.training_format || s?.package_type || 'individual').toLowerCase();
    if (f.includes('online')) return 'Онлайн';
    if (f.includes('split')) return 'Сплит';
    if (f.includes('group')) return 'Мини-группа';
    return 'Индивидуально';
  };

  return (
    <div className="min-h-screen bg-slate-50 select-none pb-24">
      
      {/* ШАПКА РАЗДЕЛА */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-slate-800">База атлетов</h1>
            <p className="text-[10.5px] text-slate-400 font-medium">Досье, абонементы и замеры</p>
          </div>

          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="w-9 h-9 rounded-xl bg-[#1E60D5] hover:bg-blue-600 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Пригласить атлета"
          >
            <UserPlus className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* ЖИВОЙ ПОИСК */}
        <div className="mt-3 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по имени, @телеграм, телефону или залу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-slate-100/90 border border-slate-200/70 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E60D5] focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-3.5">
        
        {/* KPI ПЛАШКА БАЗЫ */}
        <div className="grid grid-cols-4 gap-2 bg-white rounded-2xl p-3 border border-slate-200/70 shadow-xs text-center">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium block">Всего</span>
            <span className="text-sm font-bold font-mono text-slate-800">{metrics.total}</span>
          </div>
          <div className="space-y-0.5 border-l border-slate-100">
            <span className="text-[10px] text-emerald-600 font-medium block">Активны</span>
            <span className="text-sm font-bold font-mono text-emerald-700">{metrics.active}</span>
          </div>
          <div className="space-y-0.5 border-l border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium block">Заканчивают</span>
            <span className="text-sm font-bold font-mono text-slate-700">{metrics.expiring}</span>
          </div>
          <div className="space-y-0.5 border-l border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium block">Пауза</span>
            <span className="text-sm font-bold font-mono text-slate-500">{metrics.paused}</span>
          </div>
        </div>

        {/* ЧИПСЫ ФИЛЬТРАЦИИ */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`h-7 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            Все ({metrics.total})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`h-7 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'active' 
                ? 'bg-[#1E60D5] text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            Активные ({metrics.active})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('expiring')}
            className={`h-7 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'expiring' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            Заканчивают ({metrics.expiring})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('paused')}
            className={`h-7 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'paused' 
                ? 'bg-slate-700 text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            Пауза ({metrics.paused})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('archived')}
            className={`h-7 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'archived' 
                ? 'bg-slate-700 text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            Архив ({metrics.archived})
          </button>
        </div>

        {/* СПИСОК АТЛЕТОВ */}
        <div className="space-y-2.5">
          {(filteredStudents || []).length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200/70 p-6 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700">Атлеты не найдены</h3>
              <p className="text-[11px] text-slate-400">
                Попробуйте изменить поисковый запрос или отправьте ссылку-приглашение новому атлету.
              </p>
            </div>
          ) : (
            (filteredStudents || []).map((student, index) => {
              const fullName = student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Атлет';
              const leftWorkouts = Number(student?.left_trainings ?? student?.remaining_workouts ?? 12);
              const totalWorkouts = Number(student?.total_trainings || 12);
              const formatLabel = getFormatLabel(student);
              const hasHealthWarning = Boolean(student?.injury_notes || student?.parq_notes || student?.has_injuries);
              const isPaused = (student?.status || '').toLowerCase() === 'paused';
              const isLowBalance = leftWorkouts <= 2;

              return (
                <div
                  key={student?.id || index}
                  onClick={() => onSelectStudent(student)}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer active:scale-[0.99] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 text-sm">
                        {student?.avatar_url || student?.photo_url ? (
                          <img src={student?.avatar_url || student?.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{fullName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[13.5px] font-bold text-slate-800 truncate">
                            {fullName}
                          </h4>
                          {hasHealthWarning && (
                            <span className="px-1.5 py-0.2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[9px] font-bold shrink-0">
                              PAR-Q
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {student?.username && (
                            <span className="font-mono text-[#1E60D5]">
                              @{student.username.replace('@', '')}
                            </span>
                          )}
                          {student?.gym && (
                            <span className="truncate">
                              📍 {student.gym.split('|')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {formatLabel}
                      </span>
                      {student?.current_weight && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-medium">
                          {student.current_weight} кг
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isPaused ? (
                        <span className="text-slate-500 font-semibold inline-flex items-center gap-1">
                          <PauseCircle className="w-3.5 h-3.5" /> На паузе
                        </span>
                      ) : (
                        <span className={`font-mono font-semibold ${isLowBalance ? 'text-amber-600' : 'text-slate-800'}`}>
                          Осталось: {leftWorkouts} из {totalWorkouts}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ШТОРКА ССЫЛКИ-ПРИГЛАШЕНИЯ ДЛЯ АВТОРЕГИСТРАЦИИ */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 w-full max-w-md p-4 space-y-3.5 shadow-xl animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800">
                Пригласить подопечного в CRM
              </h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Отправьте эту ссылку ученику в Telegram. Он откроет бота, заполнит анкету (цели, график, замеры) и <strong>автоматически появится в вашей CRM</strong>. Вручную ничего заполнять не нужно!
            </p>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-700 truncate">{inviteLink}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-9 px-3.5 bg-[#1E60D5] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer active:scale-95 transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
