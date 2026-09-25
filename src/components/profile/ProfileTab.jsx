import React, { useState } from 'react';
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
  ShieldCheck, 
  BookOpen, 
  LogOut, 
  Trash2, 
  Check, 
  MapPin, 
  Calendar 
} from 'lucide-react';

export default function ProfileTab({ user, onEdit, onLogout, onDeleteAccount }) {
  const [gymStatus, setGymStatus] = useState('in_gym');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  const handleOpenDocument = (title) => {
    alert(`Открытие документа: "${title}". Данный раздел содержит официальные положения сервиса.`);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 pt-3 px-4 select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        
        {/* Плашка шапки: Личный кабинет */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/80">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Личный кабинет</h1>
          <p className="text-xs text-slate-500 mt-0.5">Управление подпиской, профилем и целями</p>
        </div>

        {/* Карточка профиля атлета */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Аватар */}
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/60 shadow-inner">
                {user?.photo_url || user?.avatar_url ? (
                  <img 
                    src={user?.photo_url || user?.avatar_url} 
                    alt="Аватар" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg bg-slate-50">
                    {user?.first_name?.[0] || 'A'}
                  </div>
                )}
              </div>

              {/* Имя, статус PRO и статус активности */}
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Award className="w-3 h-3 text-emerald-600" />
                  <span>PRO Атлет</span>
                </div>
                
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {user?.first_name || 'Assanali'} {user?.last_name || 'Kussainov'} , {calculateAge(user?.birth_date)}
                </h2>

                {/* Селектор статуса */}
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

            {/* Быстрые кнопки: Telegram, Instagram, Редактировать */}
            <div className="flex items-center gap-1.5 flex-shrink-0 self-start">
              <button 
                onClick={handleOpenTelegram}
                className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-all shadow-xs"
                title="Telegram профиль"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
              <button 
                onClick={handleOpenInstagram}
                className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 border border-rose-100/80 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition-all shadow-xs"
                title="Instagram профиль"
              >
                <Instagram className="w-4 h-4" />
              </button>
              <button 
                onClick={onEdit}
                className="w-9 h-9 rounded-full bg-slate-50 text-slate-600 border border-slate-200/80 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
                title="Редактировать анкету"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Био */}
          <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-2xl text-xs text-slate-600">
            {user?.bio || 'Gymrat'}
          </div>

          {/* Интерактивная шторка деталей абонемента и целей */}
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
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Текущий вес / Рост</p>
                    <p className="font-bold text-slate-800 mt-0.5">{user?.weight || 78} кг / {user?.height || 182} см</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Главная цель</p>
                    <p className="font-bold text-slate-800 mt-0.5">{user?.goal || 'Набор массы'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Клуб: <b>{user?.gym || 'Invictus Go (Almaty)'}</b></span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span>Дни тренировок: <b>{Array.isArray(user?.workout_days) ? user.workout_days.join(', ') : 'Пн, Ср, Пт'}</b></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Секция: Основное меню */}
        <div className="space-y-1.5">
          <p className="px-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ОСНОВНОЕ МЕНЮ</p>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm divide-y divide-slate-100">
            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Моя статистика</h4>
                  <p className="text-[10px] text-slate-400">Посещения, дни в зале</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Подписка GymConnect</h4>
                  <p className="text-[10px] text-emerald-600 font-medium">Активна до конца октября</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Target className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Персональная программа</h4>
                  <p className="text-[10px] text-slate-400">Настройка целей и дней тренировок</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Tag className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Ввести промокод</h4>
                  <p className="text-[10px] text-slate-400">Активация бонусов</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">История платежей</h4>
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
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm divide-y divide-slate-100">
            {/* Кнопка 1: Кабинет тренера */}
            <button 
              onClick={() => { window.location.href = '?trainer=true'; }}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Briefcase className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Кабинет фитнес-тренера</h4>
                  <p className="text-[10px] text-slate-400">CRM, аналитика, клиенты и календарь</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            {/* Кнопка 2: Сотрудничество для фитнес-залов */}
            <button 
              onClick={handleOpenGymPartnership}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Сотрудничество для фитнес-залов</h4>
                  <p className="text-[10px] text-slate-400">Интеграция клубов Алматы и партнерская программа</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Секция: Информационная помощь и документация */}
        <div className="space-y-1.5">
          <p className="px-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ИНФОРМАЦИОННАЯ ПОМОЩЬ</p>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm divide-y divide-slate-100">
            {/* Поддержка */}
            <button 
              onClick={() => window.open('https://t.me/gymconnect_support', '_blank')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Поддержка пользователей</h4>
                  <p className="text-[10px] text-slate-400">Чат службы заботы в Telegram</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            {/* Документация */}
            <button 
              onClick={() => handleOpenDocument('Документация сервиса GymConnect')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Документация и база знаний</h4>
                  <p className="text-[10px] text-slate-400">Руководство пользователя и инструкции</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            {/* Публичная оферта */}
            <button 
              onClick={() => handleOpenDocument('Публичная оферта и договор оказания услуг')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Публичная оферта (договор)</h4>
                  <p className="text-[10px] text-slate-400">Условия подписки и правила сервиса</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            {/* Политика конфиденциальности */}
            <button 
              onClick={() => handleOpenDocument('Политика конфиденциальности и защиты данных')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Политика конфиденциальности</h4>
                  <p className="text-[10px] text-slate-400">Обработка персональных данных</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Секция: Зона опасности (Danger Zone) */}
        <div className="space-y-1.5 pt-0.5">
          <p className="px-2 text-[11px] font-bold text-rose-400 tracking-wider uppercase">ЗОНА ОПАСНОСТИ</p>
          <div className="bg-white rounded-3xl overflow-hidden border border-rose-100/80 shadow-sm divide-y divide-rose-50">
            <button 
              onClick={onLogout}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-rose-50/40 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <LogOut className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-600">Выйти из аккаунта</h4>
                  <p className="text-[10px] text-slate-400">Завершить сессию на этом устройстве</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-400 transition-colors" />
            </button>

            <button 
              onClick={onDeleteAccount}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-rose-50/60 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-700">Удалить профиль</h4>
                  <p className="text-[10px] text-rose-400">Безвозвратное удаление всех данных</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
