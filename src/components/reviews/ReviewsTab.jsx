import React, { useState } from 'react';
import { appleTheme } from '../../ui/AppleTheme';

export default function ReviewsTab() {
  const [activeTab, setActiveTab] = useState('gyms'); // 'gyms' или 'trainers'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false);

  // Форма нового отзыва
  const [reviewType, setReviewType] = useState('gym');
  const [targetName, setTargetName] = useState('Invictus Go (Навои)');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hasCardProof, setHasCardProof] = useState(true);

  // База отзывов
  const [reviews, setReviews] = useState([
    {
      id: 1,
      type: 'gym',
      name: 'Invictus Go (Навои)',
      author: 'Тимур К.',
      rating: 5,
      date: 'Сегодня, 14:20',
      text: 'Отличный зал! Тренажеры новые, атмосфера рабочая. Много силовых рам, очередей на базу почти нет.',
      verified: true,
      sentiment: 'positive',
      likes: 14
    },
    {
      id: 2,
      type: 'gym',
      name: 'Workout (Достык)',
      author: 'Алия М.',
      rating: 3,
      date: 'Вчера, 19:40',
      text: 'Зал неплохой, но в часы пик (после 18:00) вентиляция не справляется, душно, и в зоне свободного веса тесновато.',
      verified: true,
      sentiment: 'neutral',
      likes: 9
    },
    {
      id: 3,
      type: 'trainer',
      name: 'Алексей Цой (Кроссфит)',
      author: 'Максим Б.',
      rating: 5,
      date: '18 сентября',
      text: 'Занимаюсь у Алексея 3 месяца. Технику поставил с нуля, спина не болит, силовые выросли на 25%. Рекомендую!',
      verified: true,
      sentiment: 'positive',
      likes: 21
    },
    {
      id: 4,
      type: 'trainer',
      name: 'Динара К. (Stretching)',
      author: 'Асель Ж.',
      rating: 5,
      date: '17 сентября',
      text: 'Лучший тренер по растяжке в Алматы. За 2 месяца села на шпагат, хотя думала, что в 26 лет это уже нереально.',
      verified: true,
      sentiment: 'positive',
      likes: 18
    }
  ]);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReviewObj = {
      id: Date.now(),
      type: reviewType,
      name: targetName,
      author: 'Вы (Атлет Алматы)',
      rating: rating,
      date: 'Только что',
      text: reviewText,
      verified: hasCardProof,
      sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative',
      likes: 0
    };

    setReviews([newReviewObj, ...reviews]);
    setReviewText('');
    setIsAddModalOpen(false);
    alert('Спасибо! Ваш честный отзыв опубликован.');
  };

  const filteredReviews = reviews.filter(item => {
    const matchesTab = (activeTab === 'gyms' ? item.type === 'gym' : item.type === 'trainer');
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] text-[${appleTheme.colors.primaryText}] px-4 pt-3 pb-28 flex flex-col max-w-md mx-auto ${appleTheme.styles.fontFamily}`}>
      
      {/* 1. Блок шапки (ReviewHeader) */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[24px] p-4 text-white shadow-lg mb-4 space-y-1.5 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest uppercase text-blue-400">GymConnect Reviews</span>
          <span className="bg-emerald-500/20 text-[#34C759] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            100% честно
          </span>
        </div>
        <h1 className="text-[18px] font-extrabold tracking-tight">Народный рейтинг Алматы</h1>
        <p className="text-[11px] text-zinc-300 leading-snug">
          Реальные отзывы без накрутки. Подтвержденные клубные карты атлетов и проверенные тренеры.
        </p>
      </div>

      {/* 2. Две большие плашки выбора категории */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          onClick={() => setActiveTab('gyms')}
          className={`py-3 px-3 rounded-[20px] font-bold text-left transition-all border flex flex-col gap-1 ${
            activeTab === 'gyms'
              ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-[0_4px_16px_rgba(0,122,255,0.3)]'
              : 'bg-white text-zinc-800 border-black/[0.06] hover:bg-zinc-50'
          }`}
        >
          <span className="text-[18px]">🏋️‍♂️</span>
          <div>
            <div className="text-[14px] leading-tight">Фитнес-залы</div>
            <div className={`text-[10px] font-medium ${activeTab === 'gyms' ? 'text-blue-100' : 'text-zinc-400'}`}>Оборудование и сервис</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('trainers')}
          className={`py-3 px-3 rounded-[20px] font-bold text-left transition-all border flex flex-col gap-1 ${
            activeTab === 'trainers'
              ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-[0_4px_16px_rgba(0,122,255,0.3)]'
              : 'bg-white text-zinc-800 border-black/[0.06] hover:bg-zinc-50'
          }`}
        >
          <span className="text-[18px]">👤</span>
          <div>
            <div className="text-[14px] leading-tight">Тренеры</div>
            <div className={`text-[10px] font-medium ${activeTab === 'trainers' ? 'text-blue-100' : 'text-zinc-400'}`}>Результаты клиентов</div>
          </div>
        </button>
      </div>

      {/* 3. Поисковая строка */}
      <div className="relative mb-4">
        <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'gyms' ? "Поиск зала по названию..." : "Поиск тренера по имени..."}
          className="w-full bg-white border border-black/[0.08] rounded-[16px] pl-10 pr-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#007AFF] shadow-sm"
        />
      </div>

      {/* 4. Лента свежих отзывов */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[14px] font-extrabold tracking-tight text-zinc-900">Свежие отзывы</h2>
          <button 
            onClick={() => setIsAllReviewsOpen(true)}
            className="text-[12px] font-bold text-[#007AFF] hover:underline flex items-center gap-1"
          >
            Посмотреть все ({reviews.length}) →
          </button>
        </div>

        {filteredReviews.slice(0, 3).map((item) => (
          <div key={item.id} className="bg-white rounded-[22px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/[0.05] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold tracking-tight text-zinc-900">{item.name}</h3>
                <p className="text-[11px] text-[#007AFF] font-medium">{item.author}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'}`} 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>

            <p className="text-[13px] text-zinc-700 leading-snug">{item.text}</p>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                {item.sentiment === 'positive' && (
                  <span className="bg-emerald-50 text-[#34C759] font-bold px-2 py-0.5 rounded-full border border-emerald-100">Рекомендует</span>
                )}
                {item.sentiment === 'neutral' && (
                  <span className="bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-100">Есть замечания</span>
                )}
                {item.verified && (
                  <span className="bg-blue-50 text-[#007AFF] font-medium px-2 py-0.5 rounded-full border border-blue-100">Верифицировано</span>
                )}
                <span>• {item.date}</span>
              </div>
              <button className="flex items-center gap-1 text-zinc-500 font-semibold hover:text-[#007AFF]">
                ♥ {item.likes}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка оставить отзыв */}
      <div className="mt-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-[22px] p-4 text-center space-y-2.5 shadow-sm">
        <p className="text-[12px] text-blue-900 font-semibold leading-snug">
          💡 Твой реальный отзыв поможет другим атлетам сделать правильный выбор без разочарования.
        </p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-[#007AFF] text-white text-[13px] font-bold py-3 rounded-[16px] shadow-[0_4px_14px_rgba(0,122,255,0.3)] hover:bg-[#0062cc] transition-all flex items-center justify-center gap-2"
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-[14px]">+</span>
          Оставить свой отзыв
        </button>
      </div>

      {/* Модальное окно: Посмотреть все отзывы */}
      {isAllReviewsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-md mx-auto h-[85vh] sm:h-[80vh] rounded-t-[32px] sm:rounded-[32px] p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h2 className="text-[18px] font-extrabold tracking-tight">Все отзывы ({reviews.length})</h2>
              <button 
                onClick={() => setIsAllReviewsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
              {reviews.map((item) => (
                <div key={item.id} className="bg-zinc-50 rounded-[20px] p-3.5 border border-black/[0.04] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-zinc-900">{item.name}</span>
                    <span className="text-[12px] font-bold text-amber-500">{item.rating} ★</span>
                  </div>
                  <p className="text-[12px] text-zinc-600">{item.text}</p>
                  <div className="text-[10px] text-zinc-400 flex justify-between">
                    <span>{item.author} • {item.date}</span>
                    <span className="text-[#007AFF] font-medium">{item.type === 'gym' ? 'Фитнес-зал' : 'Тренер'}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsAllReviewsOpen(false)}
              className="w-full py-3 bg-zinc-900 text-white text-[13px] font-bold rounded-[16px] mt-2"
            >
              Закрыть список
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно создания отзыва */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold tracking-tight">Честный отзыв атлета</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Что оцениваем?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setReviewType('gym'); setTargetName('Invictus Go (Навои)'); }}
                    className={`py-2 rounded-[12px] text-[12px] font-bold border transition-all ${
                      reviewType === 'gym' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-700 border-black/[0.06]'
                    }`}
                  >
                    Фитнес-зал
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReviewType('trainer'); setTargetName('Алексей Цой'); }}
                    className={`py-2 rounded-[12px] text-[12px] font-bold border transition-all ${
                      reviewType === 'trainer' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-700 border-black/[0.06]'
                    }`}
                  >
                    Тренер
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Название / Имя</label>
                <input 
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full bg-zinc-50 border border-black/[0.08] rounded-[14px] px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#007AFF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Оценка</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className={`flex-1 py-2 rounded-[12px] text-[13px] font-bold border transition-all ${
                        rating === num ? 'bg-amber-400 text-white border-amber-400 shadow-sm' : 'bg-zinc-50 text-zinc-700 border-black/[0.06]'
                      }`}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Текст отзыва</label>
                <textarea 
                  rows="3"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Опишите плюсы и минусы объективно..."
                  className="w-full bg-zinc-50 border border-black/[0.08] rounded-[14px] p-3 text-[13px] font-medium outline-none focus:border-[#007AFF] resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#007AFF] text-white text-[14px] font-bold rounded-[16px] shadow-[0_4px_16px_rgba(0,122,255,0.3)] hover:bg-[#0062cc] transition-all"
              >
                Опубликовать отзыв
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
