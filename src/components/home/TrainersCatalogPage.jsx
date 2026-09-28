// src/components/home/TrainersCatalogPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Award, 
  CheckCircle2, 
  MapPin, 
  Dumbbell, 
  Send, 
  MessageCircle, 
  Crown, 
  X, 
  Sparkles, 
  UserCheck,
  Calendar,
  Check
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function TrainersCatalogPage({ onBack, userProfile }) {
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | 'gym' | 'online'
  const [selectedGymFilter, setSelectedGymFilter] = useState('all');
  const [selectedTrainerForAction, setSelectedTrainerForAction] = useState(null);
  const [linkingSuccess, setLinkingSuccess] = useState(false);

  // Резервные проверенные тренеры для идеального наполнения каталога
  const fallbackTrainers = [
    {
      id: 'coach_founder',
      first_name: 'Асанали',
      last_name: 'Кусайынов',
      username: 'asanali_kk',
      phone: '7011234567',
      gym: 'Invictus Go (Mega Park)',
      experience_years: 4,
      specializations: ['Набор массы и гипертрофия', 'Пауэрлифтинг и сила'],
      work_format: 'hybrid',
      pricing: { personal_single: 8000, personal_block: 70000 },
      bio: 'Основатель GymConnect. Специализируюсь на постановке идеальной биомеханики в базовых упражнениях и наборе чистой мышечной массы.',
      is_vip: true,
      status: 'approved'
    },
    {
      id: 'coach_daniyar',
      first_name: 'Данияр',
      last_name: 'Сериков',
      username: 'daniyar_fit',
      phone: '7771234567',
      gym: 'FitnessBlitz (Достык Плаза)',
      experience_years: 5,
      specializations: ['Снижение веса и сушка', 'Рекомпозиция тела и тонус'],
      work_format: 'gym',
      pricing: { personal_single: 9000, personal_block: 80000 },
      bio: 'Мастер спорта, дипломированный наставник. Помогаю избавиться от лишнего веса без жестких голодовок и вреда для здоровья.',
      is_vip: true,
      status: 'approved'
    },
    {
      id: 'coach_alina',
      first_name: 'Алина',
      last_name: 'Ким',
      username: 'alina_coach',
      phone: '7051234567',
      gym: '1Fit Pass (Все клубы)',
      experience_years: 3,
      specializations: ['Осанка и здоровая спина', 'Реабилитация и ЛФК'],
      work_format: 'online',
      pricing: { personal_single: 7000, personal_block: 60000 },
      bio: 'Сертифицированный специалист по здоровому движению, растяжке и укреплению мышечного корсета. Веду онлайн по всему Казахстану.',
      is_vip: false,
      status: 'approved'
    }
  ];

  // Загрузка реальных тренеров из Supabase
  const fetchTrainersList = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trainer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Объединяем базу с гарантией присутствия основателя на 1-м месте
        const merged = [...data];
        fallbackTrainers.forEach(fb => {
          const exists = merged.some(t => (t.username || '').toLowerCase() === fb.username.toLowerCase());
          if (!exists) merged.push(fb);
        });
        setTrainers(merged);
      } else {
        setTrainers(fallbackTrainers);
      }
    } catch (e) {
      console.warn('Ошибка загрузки каталога тренеров:', e);
      setTrainers(fallbackTrainers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainersList();
  }, []);

  // Уникальные клубы для фильтра
  const uniqueGyms = useMemo(() => {
    const set = new Set();
    trainers.forEach(t => {
      if (t.gym) set.add(t.gym.split('|')[0].trim());
    });
    return Array.from(set);
  }, [trainers]);

  // Фильтрация и ранжирование (VIP и основатель всегда на самых первых позициях!)
  const filteredTrainers = useMemo(() => {
    return trainers
      .filter(t => {
        const matchesSearch = 
          `${t.first_name || ''} ${t.last_name || ''} ${t.gym || ''} ${t.bio || ''}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesFormat = 
          formatFilter === 'all' 
            ? true 
            : formatFilter === 'online' 
              ? (t.work_format === 'online' || t.work_format === 'hybrid')
              : (t.work_format === 'gym' || t.work_format === 'hybrid');

        const matchesGym = 
          selectedGymFilter === 'all' 
            ? true 
            : (t.gym || '').toLowerCase().includes(selectedGymFilter.toLowerCase());

        return matchesSearch && matchesFormat && matchesGym;
      })
      .sort((a, b) => {
        // VIP-тренеры и аккаунт основателя всегда идут первыми
        const isVipA = a.is_vip || a.username === 'asanali_kk';
        const isVipB = b.is_vip || b.username === 'asanali_kk';
        if (isVipA && !isVipB) return -1;
        if (!isVipA && isVipB) return 1;
        return (b.experience_years || 0) - (a.experience_years || 0);
      });
  }, [trainers, searchQuery, formatFilter, selectedGymFilter]);

  // Привязка тренера к текущему атлету
  const handleLinkTrainerToAthlete = async (coach) => {
    const coachNick = (coach.username || '').replace(/[@\s]/g, '').trim().toLowerCase();
    if (!coachNick) return;

    try {
      const tgId = userProfile?.telegram_id || localStorage.getItem('gymconnect_telegram_id');
      const userId = userProfile?.id;

      let query = supabase.from('profiles').update({
        trainer_username: coachNick,
        trainer_telegram: coachNick
      });

      if (userId) {
        query = query.eq('id', userId);
      } else if (tgId) {
        query = query.eq('telegram_id', tgId);
      }

      await query;

      // Обновляем локальный профиль
      const saved = localStorage.getItem('gymconnect_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorage.setItem('gymconnect_user_profile', JSON.stringify({
          ...parsed,
          trainer_username: coachNick,
          trainer_telegram: coachNick
        }));
      }

      setLinkingSuccess(true);
      setTimeout(() => {
        setLinkingSuccess(false);
        setSelectedTrainerForAction(null);
      }, 2000);
    } catch (e) {
      alert('Ошибка привязки: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col min-h-screen w-full overflow-y-auto select-none animate-in fade-in duration-150">
      
      {/* 1. ВЕРХНИЙ БАР */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Назад</span>
          </button>

          <div className="text-center overflow-hidden flex-1 px-1">
            <h1 className="text-xs font-bold text-slate-900 truncate">
              Каталог тренеров
            </h1>
            <p className="text-[10px] text-slate-400 truncate">
              Алматы • База наставников CoachOS
            </p>
          </div>

          <span className="text-[10.5px] font-bold font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100 shrink-0">
            {filteredTrainers.length} трен.
          </span>

        </div>
      </header>

      {/* 2. ПОИСК И ФИЛЬТРЫ */}
      <main className="p-3.5 space-y-3.5 max-w-md mx-auto w-full pb-28">
        
        {/* Поисковая строка */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск тренера по имени или залу..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs shadow-xs focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Переключатель формата: Все / В зале / Онлайн */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => setFormatFilter('all')}
            className={`py-1.5 rounded-xl font-bold transition-all text-center ${
              formatFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Все наставники
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('gym')}
            className={`py-1.5 rounded-xl font-bold transition-all text-center ${
              formatFilter === 'gym' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            В залах Алматы
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('online')}
            className={`py-1.5 rounded-xl font-bold transition-all text-center ${
              formatFilter === 'online' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Онлайн-ведение
          </button>
        </div>

        {/* Быстрые чипсы клубов */}
        {uniqueGyms.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedGymFilter('all')}
              className={`py-1.5 px-3 rounded-xl text-[10.5px] font-semibold shrink-0 transition-all border ${
                selectedGymFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200/80'
              }`}
            >
              Все клубы
            </button>
            {uniqueGyms.map(gymName => (
              <button
                key={gymName}
                type="button"
                onClick={() => setSelectedGymFilter(gymName)}
                className={`py-1.5 px-3 rounded-xl text-[10.5px] font-semibold shrink-0 transition-all border truncate max-w-[160px] ${
                  selectedGymFilter === gymName
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200/80'
                }`}
              >
                {gymName}
              </button>
            ))}
          </div>
        )}

        {/* 3. КАРТОЧКИ ТРЕНЕРОВ */}
        <div className="space-y-3">
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map((coach, index) => {
              const cleanUsername = (coach.username || '').replace(/[@\s]/g, '').trim();
              const isVip = coach.is_vip || coach.username === 'asanali_kk';
              const cleanPhone = (coach.phone || '').replace(/\D/g, '');
              const singlePrice = coach.pricing?.personal_single || 8000;
              const blockPrice = coach.pricing?.personal_block || 70000;
              const specs = Array.isArray(coach.specializations) && coach.specializations.length > 0
                ? coach.specializations
                : (typeof coach.specialization === 'string' ? coach.specialization.split(',') : ['Фитнес и тонус']);

              return (
                <div
                  key={coach.id || index}
                  className={`bg-white rounded-3xl p-4 border transition-all space-y-3 shadow-xs relative ${
                    isVip 
                      ? 'border-amber-300/80 bg-gradient-to-b from-amber-50/20 via-white to-white' 
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* VIP / ТОП бейдж (монетизация закрепления) */}
                  {isVip && (
                    <div className="flex items-center justify-between pb-1 border-b border-amber-100">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                        <span>ТОП НАСТАВНИК • РЕКОМЕНДАЦИЯ GYMCONNECT</span>
                      </span>
                      <span className="text-[9.5px] font-bold text-amber-700 font-mono">№{index + 1}</span>
                    </div>
                  )}

                  {/* Шапка тренера */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-2xs">
                        {coach.avatar_url || coach.photo_url ? (
                          <img src={coach.avatar_url || coach.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{coach.first_name ? coach.first_name[0] : 'T'}</span>
                        )}
                      </div>

                      <div className="overflow-hidden space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
                            {coach.first_name} {coach.last_name || ''}
                          </h3>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> CoachOS
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{coach.gym ? coach.gym.split('|')[0] : 'Алматы'}</span>
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Стаж: <b>{coach.experience_years || 3} года</b> • {coach.work_format === 'online' ? 'Онлайн' : 'В зале'}
                        </p>
                      </div>
                    </div>

                    {/* Цены */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-normal">Разовая</span>
                      <span className="text-xs font-bold font-mono text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 inline-block mt-0.5">
                        {Number(singlePrice).toLocaleString()} ₸
                      </span>
                    </div>
                  </div>

                  {/* Специализации */}
                  <div className="flex flex-wrap gap-1">
                    {specs.slice(0, 3).map((s, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]">
                        {typeof s === 'string' ? s.trim() : s}
                      </span>
                    ))}
                  </div>

                  {coach.bio && (
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 italic">
                      «{coach.bio}»
                    </p>
                  )}

                  {/* Кнопки связи и записи */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedTrainerForAction(coach)}
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Записаться</span>
                    </button>

                    {cleanUsername && (
                      <a
                        href={`https://t.me/${cleanUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-[#229ED9]/20 active:scale-95 transition-all cursor-pointer"
                        title="Написать в Telegram"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegram</span>
                      </a>
                    )}

                    {cleanPhone && (
                      <a
                        href={`https://wa.me/7${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Здравствуйте, ${coach.first_name}! Увидел вашу анкету в GymConnect, хочу узнать насчет персональных тренировок.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200 active:scale-95 transition-all cursor-pointer"
                        title="Написать в WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <Dumbbell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-xs text-slate-800">По вашему запросу тренеров не найдено</p>
              <p className="text-[11px] text-slate-400">Попробуйте сбросить фильтры клубов или формат занятий.</p>
            </div>
          )}
        </div>

      </main>

      {/* МОДАЛЬНОЕ ОКНО ЗАПИСИ К ТРЕНЕРУ */}
      {selectedTrainerForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Запись к тренеру {selectedTrainerForAction.first_name}
                  </h3>
                  <p className="text-[10.5px] text-slate-400">
                    {selectedTrainerForAction.gym ? selectedTrainerForAction.gym.split('|')[0] : 'Алматы'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTrainerForAction(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-900">Условия занятий:</p>
                <p className="text-slate-600">Разовая тренировка: <b>{Number(selectedTrainerForAction.pricing?.personal_single || 8000).toLocaleString()} ₸</b></p>
                <p className="text-slate-600">Блок занятий: <b>{Number(selectedTrainerForAction.pricing?.personal_block || 70000).toLocaleString()} ₸</b></p>
              </div>

              {linkingSuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Вы успешно привязаны к тренеру! Теперь вы в его системе CoachOS.</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-snug">
                  Вы можете привязать наставника прямо в свой профиль приложения либо связаться с ним напрямую для обсуждения графика:
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleLinkTrainerToAthlete(selectedTrainerForAction)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Выбрать моим наставником в приложении</span>
              </button>

              <div className="flex gap-2">
                {selectedTrainerForAction.username && (
                  <a
                    href={`https://t.me/${selectedTrainerForAction.username.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-[#229ED9] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>
                )}

                {selectedTrainerForAction.phone && (
                  <a
                    href={`https://wa.me/7${selectedTrainerForAction.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Здравствуйте, ${selectedTrainerForAction.first_name}! Увидел вашу анкету в каталоге GymConnect, хочу начать персональные тренировки.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
