import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LEGAL_DOCS_LIST } from '../legalDocs';
import AthleteStats from './profile/AthleteStats';

const PROFILE_SECTIONS = [
  { id: 'athlete', label: 'Атлет', icon: '👤' },
  { id: 'stats', label: 'Статистика', icon: '📊' },
  { id: 'support', label: 'Поддержка', icon: '💬' },
  { id: 'legal', label: 'Документы', icon: '📄' }
];

export default function ProfileTab({ user, onUpdateUser }) {
  const [activeSection, setActiveSection] = useState('athlete');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Форма профиля атлета
  const [form, setForm] = useState({
    name: user?.name || '',
    gender: user?.gender || 'Парень',
    city: user?.city || 'Алматы',
    avatar_url: user?.avatar_url || ''
  });

  // Загрузка фото в Base64
  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  // Сохранение изменений атлета
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
      {/* Apple Segmented Control для вкладок профиля */}
      <div className="apple-glass p-1.5 flex gap-1.5 overflow-x-auto no-scrollbar">
        {PROFILE_SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSection === section.id
                ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
                : 'text-slate-400 hover:text-slate-200 bg-white/[0.02]'
            }`}
          >
            <span>{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* ================= 1. ПОДРАЗДЕЛ: АТЛЕТ ================= */}
      {activeSection === 'athlete' && (
        <div className="apple-glass p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
            <h2 className="text-sm font-bold text-white tracking-tight">Личные данные атлета</h2>
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
            <form onSubmit={handleSave} className="space-y-4 pt-1">
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
                    <span>📸 Выбрать фото</span>
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
      )}

      {/* ================= 2. ПОДРАЗДЕЛ: СТАТИСТИКА (INVICTUS STYLE) ================= */}
      {activeSection === 'stats' && (
        <AthleteStats user={user} />
      )}

      {/* ================= 3. ПОДРАЗДЕЛ: ПОДДЕРЖКА ================= */}
      {activeSection === 'support' && (
        <div className="apple-glass p-5 space-y-4">
          <div className="pb-2 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white tracking-tight">Служба заботы GymConnect</h3>
            <p className="text-xs text-slate-400 mt-0.5">Оперативная помощь и предложения по сервису</p>
          </div>

          <div className="space-y-2.5">
            <a
              href="https://t.me/asanali_kk"
              target="_blank"
              rel="noreferrer"
              className="w-full gymshark-btn-electric py-3 text-xs font-bold flex items-center justify-center gap-2 no-underline cursor-pointer"
            >
              <span>💬 Чат с основателем (@asanali_kk)</span>
              <span>➔</span>
            </a>

            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-1.5 text-xs">
              <p className="font-semibold text-slate-200">Время ответа:</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Обычно отвечаем в течение 15–30 минут с 09:00 до 22:00 по времени Алматы/Астаны.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. ПОДРАЗДЕЛ: ДОКУМЕНТЫ ================= */}
      {activeSection === 'legal' && (
        <div className="apple-glass p-5 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white tracking-tight">Правовая информация</h3>
            <span className="text-[10px] text-[#FF8C38] font-medium">gymconnect.kz</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {LEGAL_DOCS_LIST && LEGAL_DOCS_LIST.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] text-slate-300 flex justify-between items-center no-underline active:scale-[0.99] transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 pr-2">
                  <span className="text-base">{doc.icon}</span>
                  <span className="leading-snug text-[11px] font-medium">{doc.title}</span>
                </div>
                <span className="text-slate-500 text-xs">➔</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
