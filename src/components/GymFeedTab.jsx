import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function GymFeedTab({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Список id постов, которые лайкнул текущий пользователь
  const [myLikedPostIds, setMyLikedPostIds] = useState(new Set());

  // Форма нового поста
  const [postPhoto, setPostPhoto] = useState('');
  const [caption, setCaption] = useState('');
  const [gymName, setGymName] = useState('Invictus Go');

  // Модалка комментариев
  const [activePostComments, setActivePostComments] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [user?.telegram_id]);

  async function loadFeed() {
    setLoading(true);
    const { data: postsData } = await supabase
      .from('feed_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsData) setPosts(postsData);

    // Загружаем посты, которые лайкнул текущий пользователь
    if (user?.telegram_id) {
      const { data: myLikes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.telegram_id);

      if (myLikes) {
        setMyLikedPostIds(new Set(myLikes.map(l => l.post_id)));
      }
    }

    setLoading(false);
  }

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Сжатие фото поста до 800px
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setPostPhoto(compressed);
      };
      img.src = event.target.result;
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
      likes_count: 0,
      comments_count: 0
    };

    try {
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
      } else {
        alert('Ошибка при публикации: ' + (error?.message || 'Попробуйте позже'));
      }
    } finally {
      setUploading(false);
    }
  }

  // ОДНА РЕАКЦИЯ НА ПОЛЬЗОВАТЕЛЯ (TOGGLE LIKE)
  async function handleToggleLike(post) {
    const tgId = user?.telegram_id;
    if (!tgId) return alert('Войдите через Telegram');

    const isAlreadyLiked = myLikedPostIds.has(post.id);
    const newLikedSet = new Set(myLikedPostIds);

    if (isAlreadyLiked) {
      // Снимаем реакцию
      newLikedSet.delete(post.id);
      setMyLikedPostIds(newLikedSet);
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes_count: Math.max(0, (p.likes_count || 1) - 1) } : p));

      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', tgId);
    } else {
      // Ставим реакцию
      newLikedSet.add(post.id);
      setMyLikedPostIds(newLikedSet);
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));

      await supabase
        .from('post_likes')
        .insert([{ post_id: post.id, user_id: tgId }]);
    }
  }

  async function handleAddFriend(authorId) {
    if (!user?.telegram_id) return alert('Войдите в профиль');
    if (authorId === user?.telegram_id) return alert('Это твой собственный профиль!');

    await supabase.from('friendships').insert([
      { user_id: user.telegram_id, friend_id: authorId }
    ]);
    alert('Запрос в друзья отправлен атлету! 🤝');
  }

  async function openComments(post) {
    setActivePostComments(post);
    setCommentsList([]);
    const { data } = await supabase
      .from('feed_comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (data) setCommentsList(data);
  }

  async function handleSendComment(e) {
    e.preventDefault();
    if (!newCommentText.trim() || !activePostComments) return;
    setSendingComment(true);

    const commentPayload = {
      post_id: activePostComments.id,
      user_id: user?.telegram_id || 0,
      author_name: user?.name || 'Атлет',
      author_avatar: user?.avatar_url || null,
      text: newCommentText.trim()
    };

    const { data, error } = await supabase
      .from('feed_comments')
      .insert([commentPayload])
      .select()
      .single();

    if (!error && data) {
      setCommentsList([...commentsList, data]);
      setNewCommentText('');

      const nextCount = (activePostComments.comments_count || 0) + 1;
      setPosts(posts.map(p => p.id === activePostComments.id ? { ...p, comments_count: nextCount } : p));
      await supabase.from('feed_posts').update({ comments_count: nextCount }).eq('id', activePostComments.id);
    } else {
      alert('Не удалось отправить комментарий');
    }
    setSendingComment(false);
  }

  return (
    <div className="space-y-4">
      {/* Шапка ленты */}
      <div className="apple-glass p-4 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white tracking-tight">Лента тренировок</h2>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Free Beta
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">
            Делись пруфами из зала и поддерживай напарников
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gymshark-btn-electric px-3 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>{isCreating ? '✕' : '+ Пруф'}</span>
        </button>
      </div>

      {/* Окно публикации фото */}
      {isCreating && (
        <form onSubmit={handlePublishPost} className="apple-glass-card p-5 space-y-3.5 border border-[#FF5A1F]/30">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Опубликовать тренировку</h3>

          <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
            {postPhoto ? (
              <img src={postPhoto} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition p-4 text-center">
                <span className="text-3xl">📸</span>
                <span className="text-xs font-semibold">Нажми, чтобы загрузить фото из зала</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </label>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Фитнес-клуб / Зал</label>
            <input
              type="text"
              value={gymName}
              onChange={e => setGymName(e.target.value)}
              placeholder="Название зала"
              className="w-full apple-input"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Сплит / Достижение</label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Например: Закрыл тяжелый день спины 🔥"
              className="w-full apple-input"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full gymshark-btn-electric py-3 text-xs font-bold cursor-pointer"
          >
            {uploading ? 'Публикуем...' : 'Выложить в клубную ленту 🚀'}
          </button>
        </form>
      )}

      {/* Список постов ленты */}
      {loading ? (
        <div className="apple-glass p-8 text-center text-xs text-slate-400">
          Загрузка ленты...
        </div>
      ) : posts.length === 0 ? (
        <div className="apple-glass p-8 text-center space-y-2">
          <span className="text-3xl">🏋️‍♂️</span>
          <h3 className="text-sm font-bold text-white">В ленте пока пусто</h3>
          <p className="text-xs text-slate-400">Будь первым, кто выложит пруф сегодняшней тренировки!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const isLiked = myLikedPostIds.has(post.id);
            return (
              <div key={post.id} className="apple-glass overflow-hidden shadow-xl border border-white/[0.08]">
                {/* Автор */}
                <div className="p-3.5 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt="Author" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white">{post.author_name?.[0] || 'A'}</span>
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
                <div className="w-full aspect-square bg-black/60 overflow-hidden">
                  <img src={post.photo_url} alt="Workout" className="w-full h-full object-cover" />
                </div>

                {/* Действия и комментарии */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Кнопка реакции: 1 пользователь = 1 лайк */}
                    <button
                      onClick={() => handleToggleLike(post)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer ${
                        isLiked
                          ? 'bg-[#FF5A1F]/25 border-[#FF5A1F] text-[#FF8C38]'
                          : 'bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <span>🔥</span>
                      <span>{post.likes_count || 0}</span>
                    </button>

                    {/* Комментарии */}
                    <button
                      onClick={() => openComments(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white active:scale-95 transition cursor-pointer"
                    >
                      <span>💬</span>
                      <span>{post.comments_count || 0}</span>
                    </button>
                  </div>

                  {/* Подпись */}
                  {post.caption && (
                    <p className="text-xs text-slate-200 leading-relaxed font-normal pt-1">
                      <span className="font-bold text-white mr-1.5">{post.author_name}</span>
                      {post.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО КОММЕНТАРИЕВ */}
      {activePostComments && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="apple-glass w-full max-w-md h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0C101A]/90">
              <div>
                <h3 className="text-xs font-bold text-white tracking-tight">
                  Комментарии к посту
                </h3>
                <p className="text-[10px] text-slate-400">
                  Атлет: {activePostComments.author_name}
                </p>
              </div>
              <button
                onClick={() => setActivePostComments(null)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {commentsList.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  Пока нет комментариев. Напиши первое слово поддержки! 💪
                </div>
              ) : (
                commentsList.map(c => (
                  <div key={c.id} className="flex gap-2.5 items-start bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      {c.author_avatar ? (
                        <img src={c.author_avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        c.author_name?.[0] || 'A'
                      )}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[11px] font-bold text-white">{c.author_name}</span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendComment} className="p-3 border-t border-white/10 bg-[#0C101A]/95 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Написать комментарий..."
                className="flex-1 apple-input text-xs"
              />
              <button
                type="submit"
                disabled={sendingComment || !newCommentText.trim()}
                className="gymshark-btn-electric px-4 text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {sendingComment ? '...' : '➔'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
