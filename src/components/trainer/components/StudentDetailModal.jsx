// src/components/trainer/components/StudentDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  X,
  User,
  Dumbbell,
  CreditCard,
  FileText
} from 'lucide-react';
import StudentInfoTab from '../student-detail/StudentInfoTab';
import StudentProgramTab from '../student-detail/StudentProgramTab';
import StudentFinanceTab from '../student-detail/StudentFinanceTab';
import StudentNotesTab from '../student-detail/StudentNotesTab';

export default function StudentDetailModal({ 
  isOpen, 
  onClose, 
  student, 
  backText = 'Назад', 
  onUpdate 
}) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'program' | 'finance' | 'notes'

  // При открытии нового ученика всегда сбрасываемся на первую вкладку анкеты
  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
    }
  }, [isOpen, student?.id]);

  if (!isOpen || !student) return null;

  // Очистка контактов
  const cleanPhone = student.phone || student.whatsapp ? String(student.phone || student.whatsapp).replace(/\D/g, '') : '';
  const cleanUsername = student.username || student.telegram_username ? String(student.username || student.telegram_username).replace('@', '').trim() : '';

  const leftTrainings = student.left_trainings !== undefined 
    ? student.left_trainings 
    : (student.remaining_workouts !== undefined ? student.remaining_workouts : 12);
  const totalTrainings = student.total_trainings || 12;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      
      {/* 1. ПОЛНОСТЬЮ ИЗОЛИРОВАННАЯ ШАПКА ДОСЬЕ (БЕЗ ПРОСВЕЧИВАНИЯ МЕНЮ) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          
          {/* Интеллектуальная кнопка возврата */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>{backText}</span>
          </button>

          <div className="overflow-hidden text-center flex-1 px-1">
            <h1 className="text-xs font-bold text-slate-900 truncate">
              {student.first_name} {student.last_name || ''}
            </h1>
            <p className="text-[10px] text-slate-400 truncate">
              {student.gym ? student.gym.split('|')[0] : 'Фитнес-клуб не указан'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 active:scale-90 transition-transform cursor-pointer shrink-0"
            title="Закрыть профиль"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* 2. ОСНОВНОЙ КОНТЕНТ ДОСЬЕ */}
      <main className="p-3.5 space-y-3.5 max-w-md mx-auto w-full pb-16">
        
        {/* Карточка-визитка ученика */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden shadow-xs">
                {student.photo_url || student.avatar_url ? (
                  <img src={student.photo_url || student.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{student.first_name ? student.first_name[0] : 'U'}</span>
                )}
              </div>

              <div className="overflow-hidden space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm font-bold text-slate-900 truncate leading-tight">
                    {student.first_name} {student.last_name || ''}
                  </h2>
                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-bold ${
                    student.status === 'paused' 
                      ? 'bg-amber-100 text-amber-800' 
                      : student.status === 'left' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {student.status === 'paused' ? 'На паузе' : student.status === 'left' ? 'Завершил' : 'Активен'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 truncate">
                  {student.age ? `${student.age} лет` : 'Возраст не указан'} • {student.gender === 'female' ? 'Женский' : 'Мужской'}
                </p>

                <div className="flex items-center gap-1 text-[10.5px] text-slate-400 truncate">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="truncate">{student.gym || 'Алматы'}</span>
                </div>
              </div>
            </div>

            {/* Быстрые мессенджеры в один ряд (SVG) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {cleanUsername && (
                <a
                  href={`https://t.me/${cleanUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center border border-[#229ED9]/25 shadow-2xs active:scale-90 transition-transform"
                  title="Написать в Telegram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone.startsWith('7') ? cleanPhone : `7${cleanPhone}`}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-2xs active:scale-90 transition-transform"
                  title="Написать в WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.67-1.4 1.23-1.92 1.31-.5.08-1.15.11-3.69-.94-3.25-1.34-5.32-4.66-5.48-4.88-.16-.22-1.31-1.74-1.31-3.32 0-1.58.83-2.35 1.12-2.67.3-.32.65-.4.87-.4.22 0 .44 0 .63.01.2.01.47-.08.73.57.27.67.92 2.24 1 2.4.08.16.13.35.03.57-.1.22-.16.35-.31.54-.16.19-.34.42-.48.56-.16.16-.33.33-.14.66.19.33.85 1.4 1.82 2.26 1.25 1.11 2.3 1.46 2.63 1.62.33.16.52.14.71-.08.2-.22.84-.98 1.06-1.32.22-.34.44-.28.74-.17.3.11 1.9.9 2.23 1.06.33.16.55.24.63.38.08.14.08.81-.16 1.48z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Быстрые показатели абонемента */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center font-mono">
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[9.5px] text-slate-400 block font-sans">Остаток</span>
              <span className={`text-xs font-bold ${leftTrainings <= 2 ? 'text-rose-600' : 'text-slate-800'}`}>
                {leftTrainings} / {totalTrainings}
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[9.5px] text-slate-400 block font-sans">Стоимость</span>
              <span className="text-xs font-bold text-emerald-700">
                {student.monthly_price ? `${Number(student.monthly_price).toLocaleString()} ₸` : '70 000 ₸'}
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[9.5px] text-slate-400 block font-sans">Оплата</span>
              <span className={`text-xs font-bold font-sans ${
                student.payment_status === 'pending' ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {student.payment_status === 'pending' ? 'Ожидает' : 'Оплачено'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. НАВИГАЦИОННЫЕ ТАБЫ ДОСЬЕ АТЛЕТА */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-2xl">
          {[
            { id: 'info', label: 'Анкета', icon: User },
            { id: 'program', label: 'Программа', icon: Dumbbell },
            { id: 'finance', label: 'Касса', icon: CreditCard },
            { id: 'notes', label: 'Заметки', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isCurrent 
                    ? 'bg-white text-blue-600 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. МОДУЛЬНЫЕ РАЗДЕЛЫ ДОСЬЕ */}
        <div>
          {activeTab === 'info' && (
            <StudentInfoTab 
              student={student} 
              onUpdate={onUpdate} 
            />
          )}

          {activeTab === 'program' && (
            <StudentProgramTab 
              student={student} 
              onUpdate={onUpdate} 
            />
          )}

          {activeTab === 'finance' && (
            <StudentFinanceTab 
              student={student} 
              onUpdate={onUpdate} 
            />
          )}

          {activeTab === 'notes' && (
            <StudentNotesTab 
              student={student} 
              onUpdate={onUpdate} 
            />
          )}
        </div>

      </main>

    </div>
  );
}
