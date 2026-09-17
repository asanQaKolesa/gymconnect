import React, { useState } from 'react';

export default function ProfileSettingsDrawer({ isOpen, onClose, user }) {
  const [docModal, setDocModal] = useState(null); // 'terms' | 'privacy' | 'sub' | null

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Затемняющий оверлей */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Выдвигающаяся справа панель */}
      <div className="absolute inset-y-0 right-0 max-w-[280px] w-full bg-[#0C101A] border-l border-white/10 p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-black text-white uppercase tracking-wider">Настройки & Инфо</span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Статус подписки */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Текущий тариф</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                {user?.is_pro ? '👑 VIP PRO' : 'Free Beta'}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {user?.is_pro ? 'Активен' : 'Бесплатно'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pt-0.5">
              {user?.is_pro ? 'Безлимитный доступ ко всем функциям' : 'Базовый функционал поиска'}
            </p>
          </div>

          {/* Список документов и ссылок */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setDocModal('terms')}
              className="w-full p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-left text-xs text-slate-300 flex justify-between items-center transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>📜</span>
                <span>Публичная оферта</span>
              </span>
              <span className="text-slate-500 text-[10px]">➔</span>
            </button>

            <button
              type="button"
              onClick={() => setDocModal('privacy')}
              className="w-full p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-left text-xs text-slate-300 flex justify-between items-center transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>🔒</span>
                <span>Конфиденциальность</span>
              </span>
              <span className="text-slate-500 text-[10px]">➔</span>
            </button>

            <a
              href="https://t.me/asanali_kk"
              target="_blank"
              rel="noreferrer"
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F]/15 to-amber-500/15 border border-[#FF5A1F]/30 text-left text-xs text-amber-300 hover:text-amber-200 flex justify-between items-center no-underline cursor-pointer"
            >
              <span className="flex items-center gap-2 font-semibold">
                <span>💬</span>
                <span>Техподдержка</span>
              </span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-500">GymConnect Kazakhstan</p>
          <p className="text-[9px] text-slate-600 mt-0.5">v1.2.0 • Almaty & Astana</p>
        </div>
      </div>

      {/* Модальное окно просмотра выбранного документа */}
      {docModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-4 space-y-3 border border-white/10 rounded-3xl max-h-[75vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {docModal === 'terms' ? 'Публичная оферта' : 'Политика конфиденциальности'}
              </h3>
              <button
                type="button"
                onClick={() => setDocModal(null)}
                className="text-slate-400 hover:text-white text-sm px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto text-[11px] text-slate-300 space-y-2 pr-1 leading-relaxed">
              {docModal === 'terms' ? (
                <>
                  <p><strong>1. Общие положения:</strong> GymConnect — цифровая платформа для поиска напарников по тренировкам и обмена прогрессом в клубах Казахстана.</p>
                  <p><strong>2. Ответственность:</strong> Атлет самостоятельно оценивает состояние своего здоровья и нагрузку во время занятий в тренажерных залах.</p>
                  <p><strong>3. VIP PRO:</strong> Предоставляет полный неограниченный доступ на 30 календарных дней.</p>
                </>
              ) : (
                <>
                  <p><strong>1. Данные:</strong> Собираются открытые параметры аккаунта Telegram и добровольно указанные пользователем данные анкеты.</p>
                  <p><strong>2. Безопасность:</strong> Данные хранятся в защищенной базе и не передаются третьим сторонам.</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDocModal(null)}
              className="w-full gymshark-btn-electric py-2 text-xs font-bold cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
