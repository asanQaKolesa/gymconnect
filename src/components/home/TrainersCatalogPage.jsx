// src/components/home/TrainersCatalogPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Dumbbell 
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import TrainerCatalogCard from './TrainerCatalogCard';
import TrainerPublicDetailPage from './TrainerPublicDetailPage';

export default function TrainersCatalogPage({ onBack, userProfile }) {
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | 'gym' | 'online'
  const [selectedGymFilter, setSelectedGymFilter] = useState('all');
  
  // Состояние выбранного тренера для открытия его полной визитки
  const [selectedTrainerForDetail, setSelectedTrainerForDetail] = useState(null);

  // Резервные проверенные тренеры для наполнения каталога
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
      has_free_trial: true,
      pricing: { personal_single: 8000, personal_block: 70000, personal_count: 12 },
      bio: 'Основатель GymConnect. Специализируюсь на постановке идеальной биомеханики в базовых упражнениях и наборе чистой мышечной массы без травм.',
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
      has_free_consultation: true,
      pricing: { personal_single: 9000, personal_block: 80000, personal_count: 12 },
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
      has_free_trial: false,
      pricing: { personal_single: 7000, personal_block: 60000, personal_count: 12 },
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
      if (t.gym) set.add(t.gym?.split('|')[0].trim());
    });
    return Array.from(set);
  }, [trainers]);

  // Фильтрация
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
        const isVipA = a.is_vip || a.username === 'asanali_kk';
        const isVipB = b.is_vip || b.username === 'asanali_kk';
        if (isVipA && !isVipB) return -1;
        if (!isVipA && isVipB) return 1;
        return (b.experience_years || 0) - (a.experience_years || 0);
      });
  }, [trainers, searchQuery, formatFilter, selectedGymFilter]);

  // ЕСЛИ АТЛЕТ НАЖАЛ «ПОДРОБНЕЕ» — ОТКРЫВАЕМ ПОЛНУЮ ВИЗИТКУ ТРЕНЕРА
  if (selectedTrainerForDetail) {
    return (
      <TrainerPublicDetailPage 
        trainer={selectedTrainerForDetail}
        userProfile={userProfile}
        onBack={() => setSelectedTrainerForDetail(null)}
        onLinkedSuccess={() => {
          setSelectedTrainerForDetail(null);
          if (onBack) onBack();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col min-h-screen w-full overflow-y-auto select-none animate-in fade-in duration-150">
      
      {/* 1. ВЕРХНИЙ БАР */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
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
              Каталог наставников
            </h1>
            <p className="text-[10px] text-slate-400 truncate">
              Алматы • База тренеров CoachOS
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
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs shadow-xs focus:outline-none focus:border-blue-600 text-slate-900"
          />
        </div>

        {/* Переключатель формата: Все / В зале / Онлайн */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => setFormatFilter('all')}
            className={`py-1.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              formatFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Все
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('gym')}
            className={`py-1.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              formatFilter === 'gym' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            В залах
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('online')}
            className={`py-1.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              formatFilter === 'online' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Онлайн
          </button>
        </div>

        {/* Быстрые чипсы клубов */}
        {uniqueGyms.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedGymFilter('all')}
              className={`py-1.5 px-3 rounded-xl text-[10.5px] font-semibold shrink-0 transition-all border cursor-pointer ${
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
                className={`py-1.5 px-3 rounded-xl text-[10.5px] font-semibold shrink-0 transition-all border truncate max-w-[160px] cursor-pointer ${
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

        {/* 3. СПИСОК КОМПАКТНЫХ КАРТОЧЕК */}
        <div className="space-y-3">
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map((coach, index) => (
              <TrainerCatalogCard
                key={coach.id || index}
                trainer={coach}
                onSelect={(selected) => setSelectedTrainerForDetail(selected)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <Dumbbell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-xs text-slate-800">По вашему запросу тренеров не найдено</p>
              <p className="text-[11px] text-slate-400">Попробуйте сбросить фильтры клубов или формат занятий.</p>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
