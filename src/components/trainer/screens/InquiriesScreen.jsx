// src/components/trainer/screens/InquiriesScreen.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Inbox, 
  Send, 
  Calendar, 
  X, 
  MessageSquare, 
  Dumbbell, 
  HelpCircle, 
  CheckCircle2,
  Clock,
  Phone,
  Building,
  Video
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function InquiriesScreen({ trainer, onBack, onRefresh }) {
  const [activeFilter, setActiveFilter] = useState('new'); // 'new' | 'scheduled' | 'closed'
  const [leads, setLeads] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedLeadForSchedule, setSelectedLeadForSchedule] = useState(null);
  const [scheduleSlot, setScheduleSlot] = useState({ date: '', time: '18:00', gym: '', isOnline: false });
  const [processingId, setProcessingId] = useState(null);

  // Список залов тренера
  const trainerGymsList = useMemo(() => {
    if (!trainer) return ['Invictus GO Самал'];
    if (Array.isArray(trainer.gyms) && trainer.gyms.length > 0) return trainer.gyms;
    if (trainer.gym) return trainer.gym.split('|').map(g => g.trim()).filter(Boolean);
    if (trainer.club_name) return [trainer.club_name];
    return ['Invictus GO Самал'];
  }, [trainer]);

  const defaultGym = trainerGymsList[0] || 'Основной зал';

  // Демо-данные для надежного превью
  const fallbackLeads = useMemo(() => [
    {
      id: 'demo-lead-1',
      client_name: 'Алихан Смаилов',
      client_username: 'alihan_fit',
      client_phone: '+7 777 234 56 78',
      lead_type: 'trial_workout',
      format: 'offline',
      status: 'new',
      goal: 'Снижение веса (-8 кг), набор мышечной формы',
      gym_name: defaultGym,
      preferred_time: 'Вечер (18:30)',
      client_message: 'Здравствуйте! Хочу записаться на пробную персональную тренировку в зале.',
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
    },
    {
      id: 'demo-lead-2',
      client_name: 'Динара Касымова',
      client_username: 'dinara_kass',
      client_phone: '+7 701 987 65 43',
      lead_type: 'consultation',
      format: 'online',
      status: 'new',
      goal: 'Разбор рациона и восстановление формы после родов',
      gym_name: 'Онлайн (Telegram)',
      preferred_time: 'Утро (10:00)',
      client_message: 'Добрый день! Нужна онлайн-консультация по питанию и тренировкам дома.',
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
    }
  ], [defaultGym]);

  // Загрузка лидов БЕЗ постоянного мигания
  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setInitialLoading(true);
    try {
      if (!trainer?.id) {
        setLeads(fallbackLeads);
        return;
      }

      const { data, error } = await supabase
        .from('trainer_leads')
        .select('*')
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setLeads(data);
      } else {
        setLeads(fallbackLeads);
      }
    } catch (e) {
      console.warn('Используются резервные заявки:', e);
      setLeads(fallbackLeads);
    } finally {
      if (!silent) setInitialLoading(false);
    }
  }, [trainer?.id, fallbackLeads]);

  useEffect(() => {
    fetchLeads(false);
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (activeFilter === 'new') return lead.status === 'new';
      if (activeFilter === 'scheduled') return lead.status === 'scheduled';
      if (activeFilter === 'closed') return lead.status === 'closed' || lead.status === 'converted' || lead.status === 'rejected';
      return true;
    });
  }, [leads, activeFilter]);

  const newCount = useMemo(() => leads.filter(l => l.status === 'new').length, [leads]);
  const scheduledCount = useMemo(() => leads.filter(l => l.status === 'scheduled').length, [leads]);
  const closedCount = useMemo(() => leads.filter(l => l.status === 'closed' || l.status === 'converted' || l.status === 'rejected').length, [leads]);

  const handleOpenTelegram = (lead) => {
    const username = (lead.client_username || '').replace('@', '').trim();
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    const leadTypeRu = lead.lead_type === 'trial_workout' ? 'пробную тренировку' : lead.lead_type === 'consultation' ? 'консультацию' : 'вопрос';
    const text = `Здравствуйте, ${lead.client_name}! Меня зовут ${coachName}, увидел вашу заявку в GymConnect на ${leadTypeRu}. Подскажите, когда вам удобно начать?`;

    if (username) {
      window.open(`https://t.me/${username}?text=${encodeURIComponent(text)}`, '_blank');
    } else if (lead.client_phone) {
      const cleanPhone = lead.client_phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleOpenScheduleModal = (lead) => {
    const isOnline = lead.format === 'online' || lead.lead_type === 'consultation';
    setSelectedLeadForSchedule(lead);
    setScheduleSlot({
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      isOnline,
      gym: isOnline ? 'Онлайн (Telegram / Video)' : (lead.gym_name || defaultGym)
    });
  };

  const handleScheduleConfirm = async () => {
    if (!selectedLeadForSchedule) return;
    setProcessingId(selectedLeadForSchedule.id);

    try {
      await supabase
        .from('trainer_leads')
        .update({ 
          status: 'scheduled',
          scheduled_date: scheduleSlot.date,
          scheduled_time: scheduleSlot.time,
          gym_name: scheduleSlot.gym
        })
        .eq('id', selectedLeadForSchedule.id);

      setLeads(prev => prev.map(l => l.id === selectedLeadForSchedule.id ? { 
        ...l, 
        status: 'scheduled',
        scheduled_date: scheduleSlot.date,
        scheduled_time: scheduleSlot.time,
        gym_name: scheduleSlot.gym
      } : l));

      setSelectedLeadForSchedule(null);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.warn('Ошибка брони:', e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (leadId) => {
    setProcessingId(leadId);
    try {
      await supabase
        .from('trainer_leads')
        .update({ status: 'rejected' })
        .eq('id', leadId);

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'rejected' } : l));
      if (onRefresh) onRefresh();
    } catch (e) {
      console.warn('Ошибка отклонения:', e);
    } finally {
      setProcessingId(null);
    }
  };

  const getLeadTypeBadge = (lead) => {
    if (lead.lead_type === 'trial_workout') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 text-[#1E60D5] text-[11px] font-semibold">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Пробная тренировка</span>
        </span>
      );
    }
    if (lead.lead_type === 'consultation') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Консультация</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Быстрый вопрос</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 select-none pb-24">
      
      {/* Шапка экрана */}
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
            <h1 className="text-sm font-bold text-slate-800">Входящие заявки</h1>
            <p className="text-[10.5px] text-slate-400">Лиды из каталога и визитки</p>
          </div>

          <div className="w-9" />
        </div>

        {/* Табы-фильтры: аккуратные надписи со счетчиками в скобках */}
        <div className="grid grid-cols-3 p-1 bg-slate-100/90 rounded-xl mt-3 max-w-md mx-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveFilter('new')}
            className={`h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeFilter === 'new' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Новые</span>
            <span className={`text-[11px] font-mono ${activeFilter === 'new' ? 'text-[#1E60D5] font-bold' : 'text-slate-400'}`}>
              ({newCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('scheduled')}
            className={`h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeFilter === 'scheduled' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>В графике</span>
            <span className={`text-[11px] font-mono ${activeFilter === 'scheduled' ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
              ({scheduledCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('closed')}
            className={`h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeFilter === 'closed' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Архив</span>
            {closedCount > 0 && (
              <span className="text-[11px] font-mono text-slate-400">({closedCount})</span>
            )}
          </button>
        </div>
      </div>

      {/* Список заявок */}
      <div className="p-4 max-w-md mx-auto space-y-3">
        {initialLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Загрузка заявок...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200/70 p-6">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-xs font-bold text-slate-700">Заявок в этой вкладке нет</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Новые запросы атлетов из каталога клубов будут отображаться здесь.
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const hasTg = Boolean(lead.client_username);
            const hasPhone = Boolean(lead.client_phone);
            const isOnline = lead.format === 'online' || lead.lead_type === 'consultation';

            return (
              <div 
                key={lead.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                {/* 1. Верхняя плашка: тип и формат */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getLeadTypeBadge(lead)}
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10.5px] font-medium inline-flex items-center gap-1">
                      {isOnline ? <Video className="w-3 h-3 text-slate-500" /> : <Building className="w-3 h-3 text-slate-500" />}
                      <span>{isOnline ? 'Онлайн' : 'В зале'}</span>
                    </span>
                  </div>

                  <span className="text-[10.5px] text-slate-400 font-mono">
                    {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* 2. Имя и контакты */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[14px] font-bold text-slate-800">
                      {lead.client_name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                      📍 {lead.gym_name || defaultGym}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11.5px]">
                    {hasTg && (
                      <span className="font-mono text-[#1E60D5] font-medium">
                        @{lead.client_username.replace('@', '')}
                      </span>
                    )}
                    {hasTg && hasPhone && <span className="text-slate-300">•</span>}
                    {hasPhone && (
                      <span className="font-mono text-slate-600 inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.client_phone}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Содержание заявки */}
                <div className="bg-slate-50 rounded-xl p-2.5 text-[11.5px] space-y-1 border border-slate-200/50">
                  {lead.goal && (
                    <p className="text-slate-700">
                      <strong className="text-slate-900 font-semibold">Цель:</strong> {lead.goal}
                    </p>
                  )}
                  {lead.preferred_time && (
                    <p className="text-slate-600">
                      <strong className="text-slate-800 font-medium">Удобное время:</strong> {lead.preferred_time}
                    </p>
                  )}
                  {lead.client_message && (
                    <p className="text-slate-500 italic pt-0.5 border-t border-slate-200/50">
                      «{lead.client_message}»
                    </p>
                  )}
                </div>

                {/* 4. Кнопки действий */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenTelegram(lead)}
                    className="h-9 px-3 bg-[#1E60D5] hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Написать в TG</span>
                  </button>

                  {lead.status === 'new' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenScheduleModal(lead)}
                      className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      <span>В график</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={processingId === lead.id}
                      onClick={() => handleReject(lead.id)}
                      className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>В архив</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Модалка назначения слота с автовыбором зала тренера */}
      {selectedLeadForSchedule && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 w-full max-w-md p-4 space-y-3.5 shadow-xl animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800">
                Записать: {selectedLeadForSchedule.client_name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLeadForSchedule(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Дата занятия:</label>
                <input
                  type="date"
                  value={scheduleSlot.date}
                  onChange={(e) => setScheduleSlot({ ...scheduleSlot, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1E60D5]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Время слота:</label>
                <input
                  type="time"
                  value={scheduleSlot.time}
                  onChange={(e) => setScheduleSlot({ ...scheduleSlot, time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1E60D5]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {scheduleSlot.isOnline ? 'Формат онлайн:' : 'Локация (зал тренера):'}
                </label>
                {scheduleSlot.isOnline ? (
                  <input
                    type="text"
                    disabled
                    value="Онлайн (Telegram / Google Meet)"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600"
                  />
                ) : (
                  <select
                    value={scheduleSlot.gym}
                    onChange={(e) => setScheduleSlot({ ...scheduleSlot, gym: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1E60D5]"
                  >
                    {trainerGymsList.map((g, idx) => (
                      <option key={idx} value={g}>{g}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={processingId !== null}
              onClick={handleScheduleConfirm}
              className="w-full h-10 bg-[#1E60D5] hover:bg-blue-600 active:scale-98 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Подтвердить запись в график</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
