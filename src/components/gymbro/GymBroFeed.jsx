import React, { useState } from 'react';

export default function GymBroFeed({
  cards = [],
  myCard,
  onRefresh,
  onOpenPaywall,
  isProTrial = true
}) {
  const [selectedCity, setSelectedCity] = useState(myCard?.city || 'Алматы');
  const [filterMatchOnly, setFilterMatchOnly] = useState(true);
  const [filterGender, setFilterGender] = useState('all');

  // Фильтрация анкет
  const displayed = cards.filter(card => {
    // Город
    if ((card.city || 'Алматы') !== selectedCity) return false;

    // Кого ищет пользователь
    if (filterGender === 'bro' && card.gender !== 'Парень' && card.gender !== 'GymBro') return false;
    if (filterGender === 'girl' && card.gender !== 'Девушка' && card.gender !== 'GymGirl') return false;

    // Фильтр по залу
    if (filterMatchOnly && myCard) {
      const matchWeekday = card.weekday_gym === myCard.weekday_gym || card.weekend_gym === myCard.weekday_gym;
      const matchWeekend = card.weekday_gym === myCard.weekend_gym || card.weekend_gym === myCard.weekend_gym;
      return matchWeekday || matchWeekend;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* ПЕРЕКЛЮЧАТЕЛЬ ГОРОДА */}
      <div className="flex gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setSelectedCity('Алматы')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            selectedCity === 'Алматы'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🍎 Алматы
        </button>
        <button
          type="button"
          onClick={() => setSelectedCity('Астана')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            selectedCity === 'Астана'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏛 Астана
        </button>
      </div>

      {/* ТРИАЛ-ПЛАШКА */}
      <div className="bg-gradient-to-r from-amber-500/20 to-slate-900 p-3 rounded-2xl border border-amber-500/30 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-amber-400">🔥 Доступ GymBro PRO открыт</p>
          <p className="text-[10px] text-slate-400">Тестовый период для первых атлетов {selectedCity}</p>
        </div>
        <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">Free Trial</span>
      </div>

      {/* ФИЛЬТРЫ */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterMatchOnly(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition ${
              filterMatchOnly
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            🎯 Мои залы ({myCard?.weekday_gym ? myCard.weekday_gym.replace('Invictus Go — ', '') : 'Мой зал'})
          </button>
          <button
            onClick={() => setFilterMatchOnly(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition ${
              !filterMatchOnly
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            🌍 Все залы ({selectedCity})
          </button>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterGender('all')}
            className={`flex-1 py-1 text-[11px] rounded-lg border transition ${
              filterGender === 'all'
                ? 'bg-slate-800 text-white border-slate-600'
                : 'bg-slate-950 text-slate-500 border-slate-900'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilterGender('bro')}
            className={`flex-1 py-1 text-[11px] rounded-lg border transition ${
              filterGender === 'bro'
                ? 'bg-slate-800 text-amber-400 border-slate-600'
                : 'bg-slate-950 text-slate-500 border-slate-900'
            }`}
          >
            🧔 GymBro
          </button>
          <button
            onClick={() => setFilterGender('girl')}
            className={`flex-1 py-1 text-[11px] rounded-lg border transition ${
              filterGender === 'girl'
                ? 'bg-slate-800 text-amber-400 border-slate-600'
                : 'bg-slate-950 text-slate-500 border-slate-900'
            }`}
          >
            👩 GymGirl
          </button>
        </div>
      </div>

      {/* ШАПКА СПИСКА */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Напарники в {selectedCity} ({displayed.length}):
        </h3>
        <button
          onClick={onRefresh}
          className="text-[11px] text-amber-400 active:scale-95 transition"
        >
          🔄 Обновить
        </button>
      </div>

      {/* КАРТОЧКИ */}
      <div className="space-y-3">
        {displayed.length > 0 ? (
          displayed.map(card => (
            <div key={card.id} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {card.name}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                      {card.gender}
                    </span>
                  </h4>
                  <p className="text-xs text-amber-400 font-medium">{card.level}</p>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {card.split}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
                <p><span className="text-slate-500">🏢 Будни:</span> {card.weekday_gym}</p>
                <p><span className="text-slate-500">🏙 Выходные:</span> {card.weekend_gym}</p>
                <p><span className="text-slate-500">⏰ Время:</span> {card.time_slot}</p>
                {card.looking_for && (
                  <p><span className="text-slate-500">🎯 Ищет:</span> {
                    card.looking_for === 'bro' ? 'Парня (GymBro)' :
                    card.looking_for === 'girl' ? 'Девушку (GymGirl)' : 'Без разницы'
                  }</p>
                )}
                {card.bio && <p className="text-slate-400 italic">«{card.bio}»</p>}
              </div>

              {/* КОНТАКТЫ */}
              {isProTrial ? (
                <div className="flex gap-2 pt-1">
                  {card.telegram_username ? (
                    <a
                      href={`https://t.me/${card.telegram_username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 no-underline shadow-md shadow-amber-500/10"
                    >
                      Telegram (@{card.telegram_username}) 🤝
                    </a>
                  ) : (
                    <button
                      onClick={() => alert(`У ${card.name} не указан публичный username в Telegram`)}
                      className="flex-1 bg-slate-800 text-slate-400 text-xs py-2.5 rounded-xl"
                    >
                      Username скрыт
                    </button>
                  )}
                  {card.instagram && (
                    <a
                      href={`https://instagram.com/${card.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-pink-400 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center justify-center no-underline border border-slate-700"
                    >
                      📸
                    </a>
                  )}
                </div>
              ) : (
                <div
                  onClick={onOpenPaywall}
                  className="p-2.5 bg-slate-950/80 rounded-2xl border border-amber-500/20 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>🔒</span>
                    <div>
                      <p className="text-xs font-bold text-white blur-[3px]">@hidden_username</p>
                      <p className="text-[10px] text-amber-400">Нажмите, чтобы открыть контакт</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded-lg">PRO</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-4 space-y-1">
            <p className="text-sm text-slate-300">В {selectedCity} пока нет подходящих карточек</p>
            <p className="text-xs text-slate-500">Переключи на «Все залы» или пригласи знакомых!</p>
          </div>
        )}
      </div>
    </div>
  );
}
