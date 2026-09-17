import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LEGAL_DOCS_LIST } from '../legalDocs';

export default function ProfileTab({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Локальное состояние формы редактирования
  const [form, setForm] = useState({
    name: user?.name || '',
    gender: user?.gender || 'Парень',
    city: user?.city || 'Алматы',
    avatar_url: user?.avatar_url || ''
  });

  // Загрузка фото аватара
  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Сжатие / чтение в Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  // Сохранение изменений только в таблицу users
  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Укажите имя');

    setSaving(true);
    const { data, error } = await supabase
      .from('users')
      .update({
        name: form.name.trim(),
        gender: form.gender,
        city: form.city,
        avatar_url: form.avatar_url || null
      })
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      onUpdateUser(data);
      setIsEditing(false);
    } else {
      alert('Ошибка при сохранении профиля: ' + (error?.message || 'Неизвестная ошибка'));
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* 1. КАРТОЧКА ОСНОВНОГО ПРОФИЛЯ АТЛЕТА */}
      <div className="apple-glass p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
          <h2 className="text-sm font-bold text-white tracking-tight">Профиль атлета</h2>
          <button
            onClick={() => {
              setForm({
                name: user?.name || '',
                gender: user?.gender || 'Парень',
                city: user?.city || 'Алматы',
                avatar_url: user?.avatar_url || ''
              });
              setIsEditing(!isEditing);
            }}
            className="text-xs text-[#FF5A1F] font-semibold hover:underline cursor-pointer"
          >
            {isEditing ? 'Отмена' : 'Редактировать'}
          </button>
        </div>

        {isEditing ? (
          /* РЕЖИМ РЕДАКТИРОВАНИЯ */
          <form onSubmit={handleSave} className="space-y-4 pt-1">
            {/* Загрузка фото */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-slate-400">{form.name?.[0] || 'A'}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 transition">
                  <span>📸 Загрузить фото</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>

                {form.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, avatar_url: '' }))}
                    className="block text-[11px] text-red-400 hover:underline cursor-pointer"
                  >
                    Удалить фото
                  </button>
                )}
              </div>
            </div>

            {/* Имя */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Имя атлета</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full apple-input"
              />
            </div>

            {/* Пол */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Пол</label>
              <div className="grid grid-cols-2 gap-2">
                {['Парень', 'Девушка'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      form.gender === g
                        ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
                        : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Город */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Город</label>
              <div className="grid grid-cols-2 gap-2">
                {['Алматы', 'Астана'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, city: c })}
                    className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      form.city === c
                        ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
                        : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full gymshark-btn-electric py-3 text-xs font-bold mt-2 cursor-pointer"
            >
              {saving ? 'Сохраняем...' : 'Сохранить изменения'}
            </button>
          </form>
        ) : (
          /* РЕЖИМ ПРОСМОТРА */
          <div className="flex items-center gap-4 pt-1">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-[#FF5A1F]/20 flex-shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || 'A'
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white leading-tight">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-medium">
                {user?.city} • {user?.gender}
              </p>
              <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                Аккаунт подтвержден
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. БЛОК СТАТИСТИКИ (БУДУЩИЙ ФУНКЦИОНАЛ) */}
      <div className="apple-glass p-5 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Фитнес-статистика</h3>
          <span className="text-[10px] bg-[#FF5A1F]/15 text-[#FF8C38] border border-[#FF5A1F]/30 px-2 py-0.5 rounded-md font-bold">
            Скоро
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Здесь будут отображаться твои замеры тела, динамика веса, количество тренировок в месяц и силовые рекорды.
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
            <p className="text-[10px] text-slate-500">Тренировки</p>
            <p className="text-sm font-bold text-white mt-0.5">—</p>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
            <p className="text-[10px] text-slate-500">Текущий вес</p>
            <p className="text-sm font-bold text-white mt-0.5">—</p>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
            <p className="text-[10px] text-slate-500">Цель</p>
            <p className="text-sm font-bold text-white mt-0.5">—</p>
          </div>
        </div>
      </div>

      {/* 3. ПОДДЕРЖКА */}
      <div className="apple-glass p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Поддержка</h3>
        <a
          href="https://t.me/asanali_kk"
          target="_blank"
          rel="noreferrer"
          className="w-full gymshark-btn-glass py-2.5 text-xs flex items-center justify-center gap-2 no-underline text-[#FF8C38]"
        >
          Чат с основателем (@asanali_kk)
        </a>
      </div>

      {/* 4. ПРАВОВАЯ ИНФОРМАЦИЯ (7 ОФИЦИАЛЬНЫХ ДОКУМЕНТОВ GYMCONNECT.KZ) */}
      <div className="apple-glass p-4 space-y-2">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Правовая информация</h3>
          <span className="text-[10px] text-slate-500 font-medium">gymconnect.kz</span>
        </div>
        <div className="space-y-1.5 text-xs">
          {LEGAL_DOCS_LIST && LEGAL_DOCS_LIST.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] text-slate-300 flex justify-between items-center no-underline active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-2 pr-2">
                <span className="text-sm">{doc.icon}</span>
                <span className="leading-snug text-[11px] font-medium">{doc.title}</span>
              </div>
              <span className="text-slate-500 text-xs">➔</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
