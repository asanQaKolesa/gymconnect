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
  BookOpen, 
  LogOut, 
  Trash2, 
  Check, 
  MapPin, 
  Calendar, 
  X, 
  Save, 
  ArrowLeft,
  FileSignature,
  ShieldCheck,
  UserCheck,
  Wallet,
  Users,
  HeartPulse,
  Bell
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function ProfileTab({ user: initialUser, onLogout, onDeleteAccount }) {
  const [user, setUser] = useState(initialUser || {});
  const [gymStatus, setGymStatus] = useState('in_gym');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Режим полноценной отдельной страницы для документов
  const [isDocsPageOpen, setIsDocsPageOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

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

  // Реестр 7 документов: понятные описания, уникальные иконки, без технических URL
  const legalDocs = [
    {
      id: 'offer',
      title: 'Публичный договор-оферта',
      desc: 'Официальные условия использования сервиса и предоставления услуг',
      icon: FileSignature,
      content: 'Официальное предложение (публичная оферта) платформы GymConnect для физических лиц на оказание информационных услуг, предоставление доступа к CRM-системе тренеров, каталогу тренировочных программ и сервису поиска напарников.'
    },
    {
      id: 'privacy',
      title: 'Политика конфиденциальности',
      desc: 'Защита и безопасность персональных данных согласно закону РК',
      icon: ShieldCheck,
      content: 'Настоящая Политика определяет порядок сбора, систематизации и защиты персональных данных пользователей сервиса GymConnect в соответствии с Законом Республики Казахстан "О персональных данных и их защите". Мы гарантируем безопасность хранения информации.'
    },
    {
      id: 'consent',
      title: 'Согласие на обработку данных',
      desc: 'Разрешение на сбор контактных данных и физических параметров',
      icon: UserCheck,
      content: 'Регистрируясь в сервисе, субъект персональных данных дает согласие ТОО "GymConnect" на обработку параметров тела, истории занятий и контактов исключительно для корректной работы тренировочного профиля.'
    },
    {
      id: 'payment',
      title: 'Регламент оплаты и возвратов (Kaspi Pay)',
      desc: 'Условия проведения транзакций, безопасность платежей и гарантии',
      icon: Wallet,
      content: 'Все платежи за PRO-подписки и пакеты персональных тренировок производятся в тенге (KZT) через шлюз Kaspi Pay. Правила возврата и переноса занятий соответствуют Закону Республики Казахстан "О защите прав потребителей".'
    },
    {
      id: 'rules',
      title: 'Правила сообщества GymConnect',
      desc: 'Нормы этичного поведения в фитнес-клубах и внутреннем комьюнити',
      icon: Users,
      content: 'Базовые правила спортивного этикета в клубах Алматы и чатах GymBro. Запрещены оскорбления, спам, несанкционированная коммерческая деятельность и навязывание запрещенных фармакологических препаратов.'
    },
    {
      id: 'disclaimer',
      title: 'Медицинский отказ от ответственности',
      desc: 'Важные предупреждения о спортивных нагрузках для здоровья',
      icon: HeartPulse,
      content: 'Все методики, калькулятор КБЖУ и программы тренировок носят исключительно рекомендательный характер. Перед началом тренировок с высокой интенсивностью настоятельно рекомендуется пройти консультацию врача.'
    },
    {
      id: 'marketing',
      title: 'Согласие на информационные рассылки',
      desc: 'Уведомления о графике занятий, акциях клубов и скидках',
      icon: Bell,
      content: 'Пользователь соглашается на получение сервисных уведомлений в Telegram о статусах продления абонементов, напоминаниях о тренировках и персональных акциях партнерских залов.'
    }
  ];

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

  // ПОЛНОЭКРАННАЯ СТРАНИЦА ДОКУМЕНТАЦИИ (ОТДЕЛЬНЫЙ ЭКРАН)
  if (isDocsPageOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F2F2F7] overflow-y-auto pb-12 pt-3 px-4 select-none">
        <div className="max-w-md mx-auto space-y-3">
          
          {/* Верхняя навигационная панель */}
          <div className="bg-white rounded-2xl py-3 px-4 shadow-xs border border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                if (selectedDoc) {
                  setSelectedDoc(null);
                } else {
                  setIsDocsPageOpen(false);
                }
              }}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>{selectedDoc ? 'Все документы' : 'Назад в профиль'}</span>
            </button>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {selectedDoc ? 'Документ' : 'Правовой реестр'}
            </span>
          </div>

          {/* Содержимое: либо просмотр документа, либо список */}
          {selectedDoc ? (
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <selectedDoc.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-snug">{selectedDoc.title}</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedDoc.desc}</p>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-slate-600 space-y-3 pt-1">
                <p className="font-semibold text-slate-800">Редакция от 2026 года • Алматы, Казахстан</p>
                <p>{selectedDoc.content}</p>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] text-slate-500">
                  Документ имеет юридическую силу на территории Республики Казахстан в рамках электронной публичной оферты сервиса GymConnect.
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors mt-2"
              >
                Вернуться к списку документов
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
              {legalDocs.map((doc) => {
                const IconComponent = doc.icon;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug">{doc.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    );
  }

  // ГЛАВНЫЙ ЭКРАН ПРОФИЛЯ
  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 pt-2.5 px-4 select-none">
      <div className="max-w-md mx-auto space-y-3">
        
        {/* Аккуратная компактная плашка шапки */}
        <div className="bg-white rounded-2xl py-2.5 px-3.5 shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Личный кабинет</h1>
            <p className="text-[11px] text-slate-400">Управление подпиской, профилем и целями</p>
          </div>
        </div>

        {/* Пересобранная карточка профиля атлета: без обрезания ФИО, с возрастом */}
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 space-y-3">
          
          <div className="flex items-start gap-3">
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

            {/* Вся информация об атлете без ограничений по ширине */}
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-bold tracking-wide mb-1">
                <Award className="w-3 h-3 text-emerald-600" />
                <span>PRO Атлет</span>
              </div>
              
              {/* Полное ФИО и возраст без многоточия */}
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {user?.first_name || 'Assanali'} {user?.last_name || 'Kussainov'}, {calculateAge(user?.birth_date)} лет
              </h2>

              {/* Селектор статуса */}
              <div className="relative mt-1">
                <button 
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${currentStatus.color}`} />
                  <span className="text-[11px] font-medium">{currentStatus.label}</span>
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
                          gymStatus === st.id ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${st.color}`} />
                          <span>{st.label}</span>
                        </div>
                        {gymStatus === st.id && <Check className="w-3.5 h-3.5 text-slate-800" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Строка монохромных кнопок действий */}
          <div className="flex items-center gap-2 pt-0.5">
            <button 
              onClick={handleOpenTelegram}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-slate-600" />
              <span>Telegram</span>
            </button>
            <button 
              onClick={handleOpenInstagram}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95 transition-all shadow-xs"
            >
              <Instagram className="w-3.5 h-3.5 text-slate-600" />
              <span>Instagram</span>
            </button>
            <button 
              onClick={handleOpenEdit}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95 transition-all shadow-xs"
              title="Редактировать профиль"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Анкета</span>
            </button>
          </div>

          {/* Био */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600">
            {user?.bio || 'Gymrat'}
          </div>

          {/* Интерактивная шторка: легкий аккуратный текст без перегруженной жирности */}
          <div className="border border-slate-200/70 rounded-2xl overflow-hidden bg-slate-50/50">
            <button 
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-slate-700 hover:bg-slate-100/70 transition-colors"
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
                    <p className="text-[10px] text-slate-400">Текущий вес / Рост</p>
                    <p className="font-medium text-slate-800 mt-0.5">{user?.weight || 78} кг / {user?.height || 182} см</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Главная цель</p>
                    <p className="font-medium text-slate-800 mt-0.5">{user?.goal || 'Набор массы'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">Клуб: <span className="font-medium text-slate-800">{user?.gym || 'Invictus Go (Almaty)'}</span></span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Дни тренировок: <span className="font-medium text-slate-800">{Array.isArray(user?.workout_days) ? user.workout_days.join(', ') : 'Пн, Ср, Пт'}</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Секция: Основное меню */}
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

        {/* Секция: Информационная помощь (Переход на отдельный экран) */}
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

            <button 
              onClick={() => {
                setSelectedDoc(null);
                setIsDocsPageOpen(true);
              }}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Документация</h4>
                  <p className="text-[10px] text-slate-400">Официальные правила, оферта и соглашения</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">7 актов</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </button>
          </div>
        </div>

        {/* Секция: Зона опасности (Оба пункта в едином опасном красном цвете) */}
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
                  <p className="text-[10px] text-rose-400">Завершить сессию на этом устройстве</p>
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
                  <p className="text-[10px] text-rose-400">Безвозвратное удаление всех данных</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>

      </div>

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
