import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Instagram, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  BarChart2, 
  Award, 
  Target, 
  Tag, 
  CreditCard, 
  Briefcase, 
  Building2, 
  HelpCircle, 
  FileText, 
  LogOut, 
  Trash2, 
  Check, 
  MapPin, 
  Calendar,
  X,
  Save,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function ProfileTab({ user: initialUser, onLogout, onDeleteAccount }) {
  const [user, setUser] = useState(initialUser || {});
  const [gymStatus, setGymStatus] = useState('in_gym');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Модалка редактирования профиля
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    gym: '',
    goal: '',
    height: '',
    weight: '',
    telegram_username: '',
    instagram: '',
    workout_days: []
  });

  // Модалка списка документов и отдельного документа
  const [isDocsListOpen, setIsDocsListOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);

  const almatyGyms = [
    'Invictus Go (Almaty)',
    'Invictus Fitness (Dostyk Plaza)',
    'Fitness Blitz (Абая-Гагарина)',
    'Fitness Blitz (Mega Park)',
    'World Class Almaty',
    'Fidelity Club',
    'Grand Pool Gym',
    'Royal Club Fitness'
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Реестр 7 документов из базы сайта
  const legalDocs = [
    {
      id: 'privacy',
      title: 'Политика обработки и защиты персональных данных',
      slug: '/privacy-ru',
      content: 'Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сервиса GymConnect в соответствии с Законом Республики Казахстан "О персональных данных и их защите". Мы гарантируем конфиденциальность, безопасность передачи и нераспространение информации третьим лицам.'
    },
    {
      id: 'offer',
      title: 'Публичный договор-оферта',
      slug: '/offer-ru',
      content: 'Официальное предложение (публичная оферта) платформы GymConnect для физических лиц на оказание информационных услуг, предоставление доступа к CRM-системе тренеров, подбору тренировочных программ и сервису поиска напарников.'
    },
    {
      id: 'consent',
      title: 'Согласие на сбор и обработку персональных данных',
      slug: '/consent-ru',
      content: 'Регистрируясь в приложении, субъект персональных данных дает безусловное согласие ТОО "GymConnect" на сбор, накопление, хранение, уточнение и использование данных (ФИО, контакты, параметры тела) исключительно в целях функционирования сервиса.'
    },
    {
      id: 'payment',
      title: 'Регламент оплаты и возврата (Kaspi Pay Terms)',
      slug: '/payment-terms-ru',
      content: 'Все платежи за PRO-подписки и пакеты тренировок осуществляются в тенге (KZT) через защищенный шлюз Kaspi Pay / Kaspi QR. Возврат денежных средств регламентируется Законом РК "О защите прав потребителей". Неиспользованный период подписки подлежит перерасчету по запросу в поддержку.'
    },
    {
      id: 'rules',
      title: 'Правила сообщества и безопасности GymConnect',
      slug: '/rules-ru',
      content: 'Нормы этичного поведения в фитнес-клубах и внутреннем чате GymBro. Запрещены спам, агрессия, навязывание запрещенных добавок и коммерческая реклама без согласования с администрацией.'
    },
    {
      id: 'disclaimer',
      title: 'Медицинский отказ от ответственности (Medical Disclaimer)',
      slug: '/disclaimer-ru',
      content: 'Материалы приложения, калькулятор КБЖУ и программы тренировок носят исключительно информационно-рекомендательный характер и не заменяют консультацию квалифицированного врача. Перед началом интенсивных физических нагрузок обязательно проконсультируйтесь со специалистом.'
    },
    {
      id: 'marketing',
      title: 'Согласие на получение рекламных и информационных рассылок',
      slug: '/marketing-consent-ru',
      content: 'Пользователь соглашается получать сервисные пуш-уведомления через Telegram-бота о статусах тренировок, акциях клубов Алматы и обновлениях приложения. От рассылки можно отказаться в любой момент.'
    }
  ];

  // Гарантированное подтягивание аватара из Telegram WebApp API
  const getAvatarUrl = () => {
    if (user?.photo_url) return user.photo_url;
    if (user?.avatar_url) return user.avatar_url;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url) {
      return window.Telegram.WebApp.initDataUnsafe.user.photo_url;
    }
    return null;
  };

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setEditForm({
        first_name: initialUser.first_name || '',
        last_name: initialUser.last_name || '',
        bio: initialUser.bio || 'Gymrat',
        gym: initialUser.gym || 'Invictus Go (Almaty)',
        goal: initialUser.goal || 'Набор массы',
        height: initialUser.height || '182',
        weight: initialUser.weight || '78',
        telegram_username: initialUser.telegram_username || initialUser.username || '',
        instagram: initialUser.instagram || 'gymconnect.kz',
        workout_days: Array.isArray(initialUser.workout_days) ? initialUser.workout_days : ['Пн', 'Ср', 'Пт']
      });
    }
  }, [initialUser]);

  const statuses = [
    { id: 'in_gym', label: 'В зале (Invictus Go)', color: 'bg-emerald-500' },
    { id: 'resting', label: 'Отдыхаю', color: 'bg-amber-500' },
    { id: 'seeking', label: 'Ищу напарника', color: 'bg-blue-500' },
  ];

  const currentStatus = statuses.find(s => s.id === gymStatus) || statuses[0];

  const calculateAge = (birthDate) => {
    if (!birthDate) return user?.age || 27;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const handleOpenTelegram = () => {
    const username = user?.telegram_username || user?.username || 'assanali';
    const clean = username.replace('@', '');
    window.open(`https://t.me/${clean}`, '_blank');
  };

  const handleOpenInstagram = () => {
    const insta = user?.instagram || 'gymconnect.kz';
    const clean = insta.replace('@', '').replace('https://instagram.com/', '');
    window.open(`https://instagram.com/${clean}`, '_blank');
  };

  const handleOpenGymPartnership = () => {
    window.open('https://t.me/gymconnect_support?text=' + encodeURIComponent('Здравствуйте! Интересует сотрудничество и подключение фитнес-зала к GymConnect.'), '_blank');
  };

  const handleOpenEdit = () => {
    setEditForm({
      first_name: user?.first_name || 'Assanali',
      last_name: user?.last_name || 'Kussainov',
      bio: user?.bio || 'Gymrat',
      gym: user?.gym || 'Invictus Go (Almaty)',
      goal: user?.goal || 'Набор массы',
      height: user?.height || '182',
      weight: user?.weight || '78',
      telegram_username: user?.telegram_username || user?.username || 'assanali',
      instagram: user?.instagram || 'gymconnect.kz',
      workout_days: Array.isArray(user?.workout_days) ? user.workout_days : ['Пн', 'Ср', 'Пт']
    });
    setIsEditModalOpen(true);
  };

  const toggleDay = (day) => {
    if (editForm.workout_days.includes(day)) {
      setEditForm({ ...editForm, workout_days: editForm.workout_days.filter(d => d !== day) });
    } else {
      setEditForm({ ...editForm, workout_days: [...editForm.workout_days, day] });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedData = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        bio: editForm.bio,
        gym: editForm.gym,
        goal: editForm.goal,
        height: Number(editForm.height),
        weight: Number(editForm.weight),
        telegram_username: editForm.telegram_username,
        instagram: editForm.instagram,
        workout_days: editForm.workout_days
      };

      if (user?.id) {
        await supabase
          .from('profiles')
          .update(updatedData)
          .eq('id', user.id);
      }

      setUser(prev => ({ ...prev, ...updatedData }));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setUser(prev => ({ ...prev, ...editForm }));
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const avatar = getAvatarUrl();

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 pt-2.5 px-4 select-none">
      <div className="max-w-md mx-auto space-y-3">
        
        {/* Плашка шапки: Личный кабинет */}
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Личный кабинет</h1>
          <p className="text-xs text-slate-400 mt-0.5">Управление подпиской, профилем и целями</p>
        </div>

        {/* Карточка профиля атлета */}
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Аватар */}
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/60 shadow-xs">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="Аватар" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg bg-slate-50">
                    {user?.first_name?.[0] || 'A'}
                  </div>
                )}
              </div>

              {/* Имя, бейдж PRO и статус активности */}
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-bold tracking-wide mb-1">
                  <Award className="w-3 h-3 text-emerald-600" />
                  <span>PRO Атлет</span>
                </div>
                
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {user?.first_name || 'Assanali'} {user?.last_name || 'Kussainov'} , {calculateAge(user?.birth_date)}
                </h2>

                {/* Селектор статуса в зале */}
                <div className="relative mt-1">
                  <button 
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${currentStatus.color}`} />
                    <span className="text-[11px] font-medium max-w-[150px] truncate">{currentStatus.label}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </button>

                  {isStatusOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 space-y-0.5">
                      {statuses.map(st => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setGymStatus(st.id);
                            setIsStatusOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                            gymStatus === st.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${st.color}`} />
                            <span>{st.label}</span>
                          </div>
                          {gymStatus === st.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Аккуратные круглые кнопки в стиле iOS */}
            <div className="flex items-center gap-1.5 flex-shrink-0 self-start">
              <button 
                onClick={handleOpenTelegram}
                className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center border border-blue-100"
                title="Telegram"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
              <button 
                onClick={handleOpenInstagram}
                className="w-9 h-9 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center border border-slate-200"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </button>
              <button 
                onClick={handleOpenEdit}
                className="w-9 h-9 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center border border-slate-200"
                title="Редактировать анкету"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Плашка Bio */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600">
            {user?.bio || 'Gymrat'}
          </div>

          {/* Интерактивная шторка абонемента */}
          <div className="border border-slate-200/70 rounded-2xl overflow-hidden bg-slate-50/50">
            <button 
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors"
            >
              <span>Детали абонемента и целей</span>
              {isDetailsOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isDetailsOpen && (
              <div className="px-3.5 pb-3 pt-1 text-xs space-y-2 border-t border-slate-200/60 bg-white">
                <div className="grid grid-cols-2 gap-2 pt-2 text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium">Текущий вес / Рост</p>
                    <p className="font-bold text-slate-800 mt-0.5">{user?.weight || 78} кг / {user?.height || 182} см</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium">Главная цель</p>
                    <p className="font-bold text-slate-800 mt-0.5">{user?.goal || 'Набор массы'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">Клуб: <b>{user?.gym || 'Invictus Go (Almaty)'}</b></span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Дни тренировок: <b>{Array.isArray(user?.workout_days) ? user.workout_days.join(', ') : 'Пн, Ср, Пт'}</b></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Секция: Основное меню (Легкие иконки Apple HIG без квадратных коробок) */}
        <div className="space-y-1.5">
          <p className="px-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ОСНОВНОЕ МЕНЮ</p>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Моя статистика</h4>
                  <p className="text-[10px] text-slate-400">Посещения, дни в зале</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Подписка GymConnect</h4>
                  <p className="text-[10px] text-slate-400">Активна до конца октября</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Персональная программа</h4>
                  <p className="text-[10px] text-slate-400">Настройка целей и дней тренировок</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Ввести промокод</h4>
                  <p className="text-[10px] text-slate-400">Активация бонусов</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">История платежей</h4>
                  <p className="text-[10px] text-slate-400">Чеки и транзакции</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Секция: Партнёрам и сотрудничество */}
        <div className="space-y-1.5">
          <p className="px-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ПАРТНЁРАМ И СОТРУДНИЧЕСТВО</p>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
            <button 
              onClick={() => { window.location.href = '?trainer=true'; }}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Кабинет фитнес-тренера</h4>
                  <p className="text-[10px] text-slate-400">CRM, аналитика, клиенты и календарь</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button 
              onClick={handleOpenGymPartnership}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Сотрудничество для фитнес-залов</h4>
                  <p className="text-[10px] text-slate-400">Подключение клубов Алматы и партнерство</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Секция: Информационная помощь (Компактно и аккуратно) */}
        <div className="space-y-1.5">
          <p className="px-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ИНФОРМАЦИОННАЯ ПОМОЩЬ</p>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
            <button 
              onClick={() => window.open('https://t.me/gymconnect_support', '_blank')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Поддержка пользователей</h4>
                  <p className="text-[10px] text-slate-400">Чат службы заботы в Telegram</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            {/* Аккуратная единая кнопка для всех 7 документов */}
            <button 
              onClick={() => setIsDocsListOpen(true)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Официальные документы и оферта</h4>
                  <p className="text-[10px] text-slate-400">Политика, регламент Kaspi Pay и правила</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">7 актов</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </button>
          </div>
        </div>

        {/* Секция: Зона опасности */}
        <div className="space-y-1.5 pt-0.5">
          <p className="px-2 text-[11px] font-bold text-rose-500 tracking-wider uppercase">ЗОНА ОПАСНОСТИ</p>
          <div className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-xs divide-y divide-rose-50">
            <button 
              onClick={onLogout}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-rose-600">Выйти из аккаунта</h4>
                  <p className="text-[10px] text-slate-400">Завершить сессию на этом устройстве</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-400 transition-colors" />
            </button>

            <button 
              onClick={onDeleteAccount}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-rose-50/70 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-rose-700">Удалить профиль</h4>
                  <p className="text-[10px] text-rose-400">Безвозвратное удаление данных</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>

      </div>

      {/* ШТОРКА СПИСКА ВСЕХ 7 ДОКУМЕНТОВ */}
      {isDocsListOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Правовые документы</h3>
                <p className="text-xs text-slate-400">Официальные положения платформы GymConnect</p>
              </div>
              <button 
                onClick={() => setIsDocsListOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto divide-y divide-slate-100">
              {legalDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setActiveDoc(doc);
                    setIsDocsListOpen(false);
                  }}
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 pr-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-medium text-slate-800 leading-snug">{doc.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.slug}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА ПРОСМОТРА КОНКРЕТНОГО ДОКУМЕНТА */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">{activeDoc.title}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{activeDoc.slug}</p>
              </div>
              <button 
                onClick={() => setActiveDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed text-slate-600">
              <p className="font-semibold text-slate-800">Редакция от 2026 года • Алматы, Казахстан</p>
              <p>{activeDoc.content}</p>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex gap-2">
              <button
                onClick={() => {
                  setActiveDoc(null);
                  setIsDocsListOpen(true);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Все документы
              </button>
              <button
                onClick={() => setActiveDoc(null)}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ПРОФИЛЯ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Редактирование профиля</h3>
                <p className="text-xs text-slate-400">Изменения синхронизируются с базой данных</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Имя</label>
                  <input 
                    type="text" 
                    value={editForm.first_name} 
                    onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Фамилия</label>
                  <input 
                    type="text" 
                    value={editForm.last_name} 
                    onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">О себе (Био)</label>
                <input 
                  type="text" 
                  value={editForm.bio} 
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                  placeholder="Gymrat"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Основной зал в Алматы</label>
                <select 
                  value={editForm.gym} 
                  onChange={e => setEditForm({...editForm, gym: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                >
                  {almatyGyms.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Рост (см)</label>
                  <input 
                    type="number" 
                    value={editForm.height} 
                    onChange={e => setEditForm({...editForm, height: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Вес (кг)</label>
                  <input 
                    type="number" 
                    value={editForm.weight} 
                    onChange={e => setEditForm({...editForm, weight: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Главная цель</label>
                <select 
                  value={editForm.goal} 
                  onChange={e => setEditForm({...editForm, goal: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                >
                  <option value="Набор массы">Набор массы</option>
                  <option value="Сушка и рельеф">Сушка и рельеф</option>
                  <option value="Поддержание тонуса">Поддержание тонуса</option>
                  <option value="Силовые показатели">Силовые показатели</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">Дни тренировок</label>
                <div className="flex gap-1.5">
                  {daysOfWeek.map(d => {
                    const isSelected = editForm.workout_days.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Telegram @username</label>
                  <input 
                    type="text" 
                    value={editForm.telegram_username} 
                    onChange={e => setEditForm({...editForm, telegram_username: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                    placeholder="assanali"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Instagram аккаунт</label>
                  <input 
                    type="text" 
                    value={editForm.instagram} 
                    onChange={e => setEditForm({...editForm, instagram: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                    placeholder="gymconnect.kz"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Сохранение...' : 'Сохранить изменения'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
