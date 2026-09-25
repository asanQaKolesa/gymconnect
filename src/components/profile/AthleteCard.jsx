import React, { useState } from 'react';
import { 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Instagram, 
  Edit3, 
  MapPin, 
  Calendar, 
  Check, 
  Users, 
  Heart 
} from 'lucide-react';

export default function AthleteCard({ user, onOpenEdit }) {
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

  const getAvatarUrl = () => {
    if (user?.photo_url) return user.photo_url;
    if (user?.avatar_url) return user.avatar_url;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url) {
      return window.Telegram.WebApp.initDataUnsafe.user.photo_url;
    }
    return null;
  };

  const handleOpenTelegram = () => {
    const username = user?.telegram_username || user?.username || 'assanali';
    window.open(`https://t.me/${username.replace('@', '')}`, '_blank');
  };

  const handleOpenInstagram = () => {
    const insta = user?.instagram || 'gymconnect.kz';
    const clean = insta.replace('@', '').replace('https://instagram.com/', '');
    window.open(`https://instagram.com/${clean}`, '_blank');
  };

  const avatar = getAvatarUrl();

  return (
    <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 space-y-3">
      
      {/* Верх: Аватар и данные атлета */}
      <div className="flex items-start gap-3">
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
            <div className="w-full h-full flex items-center justify-center font-semibold text-slate-400 text-lg bg-slate-50">
              {user?.first_name?.[0] || 'A'}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-semibold tracking-wide mb-1">
            <Award className="w-3 h-3 text-emerald-600" />
            <span>PRO Атлет</span>
          </div>
          
          <h2 className="text-sm font-semibold text-slate-900 leading-snug">
            {user?.first_name || 'Assanali'} {user?.last_name || 'Kussainov'}, {calculateAge(user?.birth_date)} лет
          </h2>

          {/* Выпадающий статус */}
          <div className="relative mt-1">
            <button 
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${currentStatus.color}`} />
              <span className="text-[11px] font-normal">{currentStatus.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {isStatusOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 space-y-0.5">
                {statuses.map(st => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => {
                      setGymStatus(st.id);
                      setIsStatusOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      gymStatus === st.id ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
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

      {/* Монохромные кнопки действий */}
      <div className="flex items-center gap-2 pt-0.5">
        <button 
          type="button"
          onClick={handleOpenTelegram}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 flex items-center justify-center gap-1.5 text-xs font-medium active:scale-95 transition-all shadow-xs"
        >
          <Send className="w-3.5 h-3.5 text-slate-500" />
          <span>Telegram</span>
        </button>
        <button 
          type="button"
          onClick={handleOpenInstagram}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 flex items-center justify-center gap-1.5 text-xs font-medium active:scale-95 transition-all shadow-xs"
        >
          <Instagram className="w-3.5 h-3.5 text-slate-500" />
          <span>Instagram</span>
        </button>
        <button 
          type="button"
          onClick={onOpenEdit}
          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 flex items-center justify-center gap-1.5 text-xs font-medium active:scale-95 transition-all shadow-xs"
          title="Редактировать анкету"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>Анкета</span>
        </button>
      </div>

      {/* Био */}
      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 font-normal">
        {user?.bio || 'Gymrat'}
      </div>

      {/* Развернутая интерактивная шторка всех целей и деталей */}
      <div className="border border-slate-200/70 rounded-2xl overflow-hidden bg-slate-50/50">
        <button 
          type="button"
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
              <span>Дни: <span className="font-medium text-slate-800">{Array.isArray(user?.workout_days) ? user.workout_days.join(', ') : 'Пн, Ср, Пт'}</span></span>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Поиск напарника GymBro:</span>
              </div>
              <span className={`font-medium ${user?.gymbro_search !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                {user?.gymbro_search !== false ? 'Активен' : 'Отключен'}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
