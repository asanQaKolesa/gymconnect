{/* Хедер поста */}
                <div className="p-3.5 flex justify-between items-center">
                  <div 
                    onClick={() => {
                      if (post.user_id) {
                        // Переход на диалог или просмотр
                        window.open(`https://t.me/${post.author_name}`, '_blank');
                      }
                    }}
                    className="flex items-center gap-2.5 cursor-pointer active:opacity-80"
                  >
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
