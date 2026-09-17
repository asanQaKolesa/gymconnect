const [totalLikes, setTotalLikes] = useState(user?.likes_count || 0);
  const [friendsCount, setFriendsCount] = useState(user?.friends_count || 0);

  React.useEffect(() => {
    async function syncCommunityStats() {
      if (!user?.telegram_id) return;
      
      // Считаем все полученные реакции из постов
      const { data: postsData } = await supabase
        .from('feed_posts')
        .select('likes_count')
        .eq('user_id', user.telegram_id);

      if (postsData) {
        const sum = postsData.reduce((acc, curr) => acc + (curr.likes_count || 0), 0);
        setTotalLikes(sum);
      }

      // Считаем друзей
      const { count } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${user.telegram_id},friend_id.eq.${user.telegram_id}`);

      if (count !== null) {
        setFriendsCount(count);
      }
    }

    syncCommunityStats();
  }, [user?.telegram_id]);
