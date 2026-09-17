import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function GymFeedTab({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [likingId, setLikingId] = useState(null); // Блокиратор спам-кликов

  // Список ID постов, которые лайкнул текущий пользователь
  const [myLikedPostIds, setMyLikedPostIds] = useState(new Set());

  // Форма нового поста
  const [postPhoto, setPostPhoto] = useState('');
  const [caption, setCaption] = useState('');
  const [gymName, setGymName] = useState('Invictus Go');

  // Модалка комментариев к посту
  const [activePostComments, setActivePostComments] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Вычисляем надежный Telegram ID текущего пользователя
  const myTgId = Number(user?.telegram_id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0);

  useEffect(() => {
    loadFeed();
  }, [myTgId]);

  async function loadFeed() {
    setLoading(true);
    try {
      // 1. Загружаем все посты
      const { data: postsData, error: postsError } = await supabase
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsData) {
        setPosts(postsData);
      }

      // 2. Загружаем персональные лайки пользователя
      if (myTgId > 0) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', myTgId);

        if (likesData) {
          setMyLikedPostIds(new Set(likesData.map(l => l.post_id)));
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки ленты:', err);
    } finally {
      setLoading(false);
    }
  }

  // Сжатие фото перед публикацией
  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Публикация нового поста
  async function handlePublishPost(e) {
    e.preventDefault();
    if (!postPhoto) return alert('Выбери фото тренировки!');
    if (!myTgId) return alert('Не удалось определить Telegram ID. Открой бота заново.');

    setUploading(true);

    const newPost = {
      user_id: myTgId,
      author_name: user?.name || window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Атлет',
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

      if (error) throw error;

      if (data) {
        setPosts([data, ...posts]);
        setIsCreating(false);
        setPostPhoto('');
        setCaption('');
      }
    } catch (err) {
      alert('Ошибка при публикации: ' + (err.message || 'Попробуйте позже'));
    } finally {
      setUploading(false);
    }
  }

  // УДАЛЕНИЕ СВОЕГО ПОСТА
  async function handleDeletePost(postId) {
    const confirmed = window.confirm('Удалить эту публикацию из ленты?');
    if (!confirmed) return;

    try {
      // Оптимистичное удаление из UI
      setPosts(posts.filter(p => p.id !== postId));

      const { error } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', myTgId); // Защита: удалять может только автор

      if (error) {
        throw error;
      }
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
      loadFeed(); // Возвращаем, если в базе ошибка
    }
  }

  // СТРОГО 1 РЕАКЦИЯ НА ЧЕЛОВЕКА (TOGGLE)
  async function handleToggleLike(post) {
    if (!myTgId) {
      return alert('Войдите через Telegram бота, чтобы ставить реакции');
    }

    if (likingId === post.id) return; // Защита от спам-кликов
    setLikingId(post.id);

    const isAlreadyLiked = myLikedPostIds.has(post.id);
    const newLikedSet = new Set(myLikedPostIds);

    if (isAlreadyLiked) {
      // 1. Снимаем реакцию
      newLikedSet.delete(post.id);
      setMyLikedPostIds(newLikedSet);
      const updatedLikes = Math.max(0, (post.likes_count || 1) - 1);

      setPosts(posts.map(p => p.id === post.id ? { ...p, likes_count: updatedLikes } : p));

      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', myTgId);

      await supabase
        .from('feed_posts')
        .update({ likes_count: updatedLikes })
        .eq('id', post.id);

    } else {
      // 2. Ставим реакцию
      newLikedSet.add(post.id);
      setMyLikedPostIds(newLikedSet);
      const updatedLikes = (post.likes_count || 0) + 1;

      setPosts(posts.map(p => p.id === post.id ? { ...p, likes_count: updatedLikes } : p));

      await supabase
        .from('post_likes')
        .upsert([{ post_id: post.id, user_id: myTgId }], { onConflict: 'post_id,user_id' });

      await supabase
        .from('feed_posts')
        .update({ likes_count: updatedLikes })
        .eq('id', post.id);
    }

    setTimeout(() => setLikingId(null), 300);
  }

  // Добавление в друзья
  async function handleAddFriend(authorId) {
    if (!myTgId) return alert('Войдите в профиль');
    if (Number(authorId) === myTgId) return alert('Это твой собственный профиль!');

    await supabase.from('friendships').upsert([
      { user_id: myTgId, friend_id: Number(authorId) }
    ], { onConflict: 'user_id,friend_id' });

    alert('Запрос в друзья отправлен атлету! 🤝');
  }

  // Открытие комментариев
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

  // Отправка комментария
  async function handleSendComment(e) {
    e.preventDefault();
    if (!newCommentText.trim() || !activePostComments) return;
    if (!myTgId) return alert('Войдите через Telegram');

    setSendingComment(true);

    const commentPayload = {
      post_id: activePostComments.id,
      user_id: myTgId,
      author_name: user?.name || window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Атлет',
      author_avatar: user?.avatar_url || null,
      text: newCommentText.trim()
    };

    try {
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
      }
    } finally {
      setSendingComment(false);
    }
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

      {/* Окно создания поста */}
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

      {/* Список постов */}
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
            const isMyPost = Number(post.user_id) === myTgId;

            return (
              <div key={post.id} className="apple-glass overflow-hidden shadow-xl border border-white/[0.08]">
                {/* Хедер поста */}
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

                  <div className="flex items-center gap-2">
                    {/* Кнопка удаления для автора */}
                    {isMyPost && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        title="Удалить публикацию"
                        className="text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 active:scale-95 transition cursor-pointer"
                      >
                        🗑
                      </button>
                    )}

                    {/* Добавить в друзья (если чужой пост) */}
                    {!isMyPost && (
                      <button
                        onClick={() => handleAddFriend(post.user_id)}
                        className="text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 active:scale-95 transition cursor-pointer"
                      >
                        + В друзья
                      </button>
                    )}
                  </div>
                </div>

                {/* Фото тренировки */}
                <div className="w-full aspect-square bg-black/60 overflow-hidden">
                  <img src={post.photo_url} alt="Workout" className="w-full h-full object-cover" />
                </div>

                {/* Действия под фото */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Кнопка реакции (строго 1 раз) */}
                    <button
                      type="button"
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

                    {/* Кнопка комментариев */}
                    <button
                      type="button"
                      onClick={() => openComments(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white active:scale-95 transition cursor-pointer"
                    >
                      <span>💬</span>
                      <span>{post.comments_count || 0}</span>
                    </button>
                  </div>

                  {/* Описание поста */}
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

      {/* ШТОРКА КОММЕНТАРИЕВ В СТИЛЕ APPLE */}
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
