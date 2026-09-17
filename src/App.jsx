{/* Единое модальное окно подписки GymConnect PRO */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-5 space-y-4 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Icons.Crown />
                <h3 className="text-sm font-bold text-white tracking-tight">Подписка GymConnect PRO</h3>
              </div>
              <button
                onClick={() => setShowPaywallModal(false)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-center">
              <div className="py-2">
                <span className="text-3xl font-black text-white tracking-tight">3 000 ₸</span>
                <span className="text-xs text-slate-400 font-medium"> / месяц</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Единая подписка активирует полный доступ сразу ко всем модулям платформы:
              </p>

              <div className="space-y-2 text-left text-xs text-slate-200">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[#FF5A1F] font-black">✓</span>
                  <span><strong>GymBro</strong> — Безлимитный поиск напарников и прямые контакты</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[#FF5A1F] font-black">✓</span>
                  <span><strong>Лента зала</strong> — Публикация пруфов формы, комментарии и реакции</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[#FF5A1F] font-black">✓</span>
                  <span><strong>Рационы и КБЖУ</strong> — Индивидуальные меню, корзина и расчет калорий</span>
                </div>
              </div>

              <a
                href="https://t.me/asanali_kk"
                target="_blank"
                rel="noreferrer"
                className="w-full gymshark-btn-electric py-3 text-xs font-bold flex items-center justify-center gap-2 no-underline cursor-pointer shadow-lg shadow-[#FF5A1F]/20 mt-3"
              >
                <span>Оформить доступ (Kaspi Pay)</span>
                <span>➔</span>
              </a>

              <p className="text-[10px] text-slate-500">
                Доступ открывается автоматически после проверки оплаты
              </p>
            </div>
          </div>
        </div>
      )}
