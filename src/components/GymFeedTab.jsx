import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function GymFeedTab({ user, onOpenPaywall }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Форма нового поста
  const [postPhoto, setPostPhoto] = useState('');
  const [caption, setCaption] = useState('');
  const [gymName, setGymName] = useState('Invictus Go');

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    setLoading(true);
    const { data } = await supabase
      .from('feed_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  }

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handlePublishPost(e) {
    e.preventDefault();
    if (!postPhoto) return alert('Выбери фото тренировки!');
    setUploading(true);

    const newPost = {
      user_id: user?.telegram_id || 0,
      author_name: user?.name || 'Атлет',
      author_avatar: user?.avatar_url || null,
      gym_name: gymName,
      photo_url: postPhoto,
      caption: caption.trim() || 'Тренировка закрыта 💪',
      likes_count: 0
    };

    const { data, error } = await supabase
      .from('feed_posts')
      .insert([newPost])
      .select()
      .single();

    if (!error && data) {
      setPosts([data, ...posts]);
      setIsCreating(false);
      setPostPhoto('');
      setCaption('');
      // Увеличиваем общий счетчик постов / реакций в users
      await supabase.rpc('increment_likes', { x: 1 }).catch(() => {});
    } else {
      alert('Ошибка при публикации: ' + (error?.message || 'Попробуйте позже'));
    }
    setUploading(false);
  }

  async function handleLike(postId, currentLikes) {
    const nextLikes = currentLikes + 1;
    setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: nextLikes } : p));
    await supabase.from('feed_posts').update({ likes_count: nextLikes }).eq('id', postId);
  }

  async function handleAddFriend(authorId) {
    if (!user?.telegram_id) return;
    await supabase.from('friendships').insert([
      { user_id: user.telegram_id, friend_id: authorId }
    ]);
    alert('Запрос в друзья отправлен атлету! 🤝');
  }

  // ================= 1. ЕСЛИ НЕТ PRO: APPLE PAYWALL =================
  if (!user?.is_pro) {
    return (
      <div className="space-y-4">
        {/* Заблюренный тизер ленты на фоне */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 apple-glass p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] flex items-center justify-center mx-auto text-3xl shadow-xl shadow-[#FF5A1F]/30">
            🔥
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A1F]">
              Закрытый клуб атлетов
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              GymConnect Feed PRO
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Публикуй форму после тренировки, находи фитнес-друзей в своем городе, обменивайся реакциями и держи дисциплину.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-lg">📸</span>
              <p className="text-[10px] font-bold text-slate-300 mt-1">Пруфы зала</p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-lg">🤝</span>
              <p className="text-[10px] font-bold text-slate-300 mt-1">Друзья</p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-lg">⚡</span>
              <p className="text-[10px] font-bold text-slate-300 mt-1">Рейтинг</p>
            </div>
          </div>

          <button
            onClick={onOpenPaywall}
            className="w-full gymshark-btn-electric py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#FF5A1F]/25"
          >
            <span>Активировать доступ PRO</span>
            <span>➔</span>
          </button>
          
          <p className="text-[10px] text-slate-500">
            Доступно по подписке GymConnect Club • Отмена в любой момент
          </p>
        </div>
      </div>
    );
  }

  // ================= 2. ЕСЛИ ЕСТЬ PRO: ПОЛНОЦЕННАЯ ЛЕНТА =================
  return (
    <div className="space-y-4">
      {/* Шапка ленты с кнопкой создания поста */}
      <div className="apple-glass p-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A1F]">
            Комьюнити • {user?.city || 'Алматы'}
          </span>
          <h2 className="text-base font-black text-white tracking-tight">Лента тренировок</h2>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gymshark-btn-electric px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <span>{isCreating ? '✕ Отмена' : '+ Выложить пруф'}</span>
        </button>
      </div>

      {/* Окно публикации фото дня */}
      {isCreating && (
        <form onSubmit={handlePublishPost} className="apple-glass-card p-5 space-y-3.5 border border-[#FF5A1F]/30">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Новый пруф тренировки</h3>
          
          {/* Превью фото */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
            {postPhoto ? (
              <img src={postPhoto} alt="Upload preview" className="w-full h-full object-cover" />
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition">
                <span className="text-3xl">📸</span>
                <span className="text-xs font-semibold">Нажми, чтобы загрузить фото зала</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </label>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Зал</label>
            <input
              type="text"
              value={gymName}
              onChange={e => setGymName(e.target.value)}
              placeholder="Название зала"
              className="w-full apple-input"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Подпись / Сплит</label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Например: Закрыл тяжелый присед 140 кг 🔥"
              className="w-full apple-input"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full gymshark-btn-electric py-3 text-xs font-bold cursor-pointer"
          >
            {uploading ? 'Публикуем...' : 'Опубликовать в клубную ленту 🚀'}
          </button>
        </form>
      )}

      {/* Список постов */}
      {loading ? (
        <div className="apple-glass p-8 text-center text-xs text-slate-400">
          Загрузка ленты...
        </div>
      ) : posts.length === 0 ? (
        <div className="apple-glass p-8 text-center space-y-2">
          <span className="text-3xl">🏋️‍♂️</span>
          <h3 className="text-sm font-bold text-white">Будь первым сегодня!</h3>
          <p className="text-xs text-slate-400">Выложи фото тренировки и получи первые реакции клуба.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="apple-glass overflow-hidden shadow-xl border border-white/[0.08]">
              {/* Автор */}
              <div className="p-3.5 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">{post.author_name?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{post.author_name}</h4>
                    <p className="text-[10px] text-[#FF8C38] font-medium">{post.gym_name}</p>
                  </div>
                </div>

                {post.user_id !== user?.telegram_id && (
                  <button
                    onClick={() => handleAddFriend(post.user_id)}
                    className="text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 active:scale-95 transition cursor-pointer"
                  >
                    + В друзья
                  </button>
                )}
              </div>

              {/* Фото зала */}
              <div className="w-full aspect-square bg-black/60">
                <img src={post.photo_url} alt="Workout" className="w-full h-full object-cover" />
              </div>

              {/* Описание и реакции */}
              <div className="p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleLike(post.id, post.likes_count)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-bold text-white hover:bg-white/[0.08] active:scale-95 transition cursor-pointer"
                  >
                    <span>🔥</span>
                    <span>{post.likes_count}</span>
                  </button>

                  <span className="text-[10px] text-slate-500">
                    {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {post.caption && (
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    <span className="font-bold text-white mr-1.5">{post.author_name}</span>
                    {post.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
