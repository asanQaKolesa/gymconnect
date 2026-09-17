// Отправка заявки в друзья со статусом pending
  async function handleAddFriend(authorId) {
    if (!myTgId) return alert('Войдите в профиль через бота');
    if (Number(authorId) === myTgId) return alert('Это твой собственный пост!');

    // Проверяем, есть ли уже заявка или дружба
    const { data: existing } = await supabase
      .from('friendships')
      .select('status')
      .or(`and(user_id.eq.${myTgId},friend_id.eq.${authorId}),and(user_id.eq.${authorId},friend_id.eq.${myTgId})`)
      .maybeSingle();

    if (existing?.status === 'accepted') {
      return alert('Вы уже в друзьях с этим атлетом! 🤝');
    }
    if (existing?.status === 'pending') {
      return alert('Заявка в друзья уже ожидает подтверждения ⏳');
    }
    if (existing?.status === 'blocked') {
      return alert('Пользователь недоступен.');
    }

    const { error } = await supabase.from('friendships').upsert([
      { user_id: myTgId, friend_id: Number(authorId), status: 'pending' }
    ], { onConflict: 'user_id,friend_id' });

    if (!error) {
      alert('Заявка в друзья отправлена атлету! Ждем подтверждения ⏳');
    } else {
      alert('Не удалось отправить заявку: ' + error.message);
    }
  }
