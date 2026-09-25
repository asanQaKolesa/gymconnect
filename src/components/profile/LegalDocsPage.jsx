// src/components/profile/LegalDocsPage.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Users, 
  CreditCard, 
  Award, 
  Building2, 
  ChevronRight, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function LegalDocsPage({ onBack, onConsentConfirmed, isMandatory = false }) {
  const [activeDoc, setActiveDoc] = useState(null);
  const [isAgreed, setIsAgreed] = useState(() => {
    return localStorage.getItem('gymconnect_legal_accepted') === 'true';
  });
  const [isSaving, setIsSaving] = useState(false);

  // 7 юридических актов GymConnect с компактными описаниями ровно в 2 строки
  const legalDocuments = [
    {
      id: 'terms_of_service',
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      title: '1. Публичный договор оферты',
      desc: 'Правила использования сервиса GymConnect в Алматы.\nОпределяет взаимные права, обязанности и условия платформы.',
      content: `ПУБЛИЧНЫЙ ДОГОВОР-ОФЕРТА (ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ)
г. Алматы, Республика Казахстан

1. ОБЩИЕ ПОЛОЖЕНИЯ
1.1. Настоящий документ является официальным публичным предложением сервиса GymConnect заключить договор на предоставление доступа к функционалу Telegram Mini App.
1.2. Акцептом настоящей оферты является завершение регистрации и проставление отметки согласия пользователем.

2. ПРЕДОСТАВЛЕНИЕ УСЛУГ
2.1. GymConnect предоставляет информационную платформу для поиска фитнес-клубов города Алматы, подбора спортивных партнеров (GymBro) и учета тренировок.
2.2. Сервис не является поставщиком медицинских услуг и рекомендует проконсультироваться с врачом перед началом физических нагрузок.`
    },
    {
      id: 'privacy_policy',
      icon: <Lock className="w-4 h-4 text-emerald-600" />,
      title: '2. Политика конфиденциальности',
      desc: 'Порядок сбора и защиты личных данных согласно закону РК.\nРегулирует использование контактов, фото и параметров тела.',
      content: `ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ И ОБРАБОТКИ ДАННЫХ
В соответствии с Законом РК «О персональных данных и их защите»

1. СОБИРАЕМЫЕ ДАННЫЕ
1.1. Сервис обрабатывает имя, Telegram Username, номер WhatsApp, возраст, город (Алматы), фитнес-клуб и параметры тренировок.
1.2. Персональные данные хранятся в защищенной базе данных Supabase с применением RLS-политик шифрования.

2. ЦЕЛЬ ОБРАБОТКИ
2.1. Данные используются исключительно для функционирования сервиса, подбора залов и связи между атлетами.`
    },
    {
      id: 'data_consent',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
      title: '3. Согласие на сбор и трансграничную передачу',
      desc: 'Официальное разрешение на цифровую обработку профиля.\nОбеспечивает передачу данных через защищенный Telegram WebApp API.',
      content: `СОГЛАСИЕ НА СБОР И ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ

Настоящим пользователь подтверждает свое добровольное и информированное согласие сервису GymConnect на:
1. Сбор, накопление, систематизацию и хранение персональных данных.
2. Трансграничную передачу данных через защищенные каналы Telegram API и Supabase.
3. Согласие действует с момента регистрации до момента удаления профиля пользователем.`
    },
    {
      id: 'gymbro_disclaimer',
      icon: <Users className="w-4 h-4 text-amber-600" />,
      title: '4. Регламент GymBro и отказ от ответственности',
      desc: 'Правила этики и безопасности при совместных тренировках.\nОтказ от ответственности сервиса за личное поведение участников.',
      content: `РЕГЛАМЕНТ БЕЗОПАСНОСТИ GYMBRO И ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ

1. СПОРТИВНОЕ НАЗНАЧЕНИЕ
1.1. Модуль GymBro предназначен строго для поиска напарников для занятий спортом в фитнес-клубах Алматы.
1.2. Запрещается использование модуля в противоправных целях, для домогательств или навязывания услуг.

2. РАЗГРАНИЧЕНИЕ ОТВЕТСТВЕННОСТИ
2.1. GymConnect не организует очные встречи и не несет ответственности за действия участников вне рамок приложения.
2.2. Пользователи несут личную ответственность за соблюдение техники безопасности в тренажерных залах.`
    },
    {
      id: 'payment_policy',
      icon: <CreditCard className="w-4 h-4 text-rose-600" />,
      title: '5. Положение о подписке PRO и оплате Kaspi',
      desc: 'Условия активации премиального доступа на 1, 3, 6, 12 месяцев.\nРегулирует правила проведения платежей и возврата средств.',
      content: `ПОЛОЖЕНИЕ О ПРЕМИУМ-ДОСТУПЕ (PRO) И ОПЛАТЕ

1. СТОИМОСТЬ И СРОКИ
1.1. PRO-статус открывает расширенный поиск напарников, углубленную аналитику питания и скидки в клубах.
1.2. Оплата производится через сертифицированные каналы (Kaspi Pay API / реквизиты администратора).

2. ВОЗВРАТ СРЕДСТВ
2.1. Возврат средств возможен в течение 48 часов с момента оплаты при отсутствии фактического использования PRO-функций.`
    },
    {
      id: 'trainer_regulations',
      icon: <Award className="w-4 h-4 text-purple-600" />,
      title: '6. Партнерский регламент тренеров (CRM)',
      desc: 'Условия ведения подопечных и проверки сертификатов тренеров.\nУстанавливает правила работы в дашборде Trainer CRM.',
      content: `РЕГЛАМЕНТ ПАРТНЕРСКОГО МОДУЛЯ ДЛЯ ТРЕНЕРОВ

1. СТАТУС ТРЕНЕРА
1.1. Доступ к Trainer CRM предоставляется сертифицированным фитнес-инструкторам после модерации администратором.
1.2. Тренер обязуется предоставлять достоверные сведения о квалификации и спортивном образовании.

2. РАБОТА С КЛИЕНТАМИ
2.1. Тренер самостоятельно согласовывает графики тренировок с учениками через функционал платформы.`
    },
    {
      id: 'gym_rules',
      icon: <Building2 className="w-4 h-4 text-teal-600" />,
      title: '7. Правила этикета в фитнес-клубах Алматы',
      desc: 'Обязательство соблюдения регламентов залов города Алматы.\nБережное отношение к инвентарю и взаимное спортивное уважение.',
      content: `ПРАВИЛА ПОВЕДЕНИЯ В ФИТНЕС-ЦЕНТРАХ АЛМАТЫ

Пользователь обязуется соблюдать внутренний распорядок клубов-партнеров:
1. Использовать сменную спортивную обувь и тренировочные полотенца.
2. Возвращать свободные веса (блины, гантели) на штатные стойки после выполнения упражнений.
3. Проявлять взаимное уважение к другим атлетам и персоналу фитнес-центров Алматы.`
    }
  ];

  // Подтверждение согласия и запись в Supabase
  const handleConfirmConsent = async () => {
    if (!isAgreed) {
      alert('Пожалуйста, поставьте галочку согласия со всеми 7 документами.');
      return;
    }

    setIsSaving(true);

    try {
      const tgId = localStorage.getItem('gymconnect_telegram_id');
      const payload = {
        legal_accepted: true,
        legal_accepted_at: new Date().toISOString(),
        legal_version: '1.0'
      };

      if (tgId) {
        await supabase
          .from('profiles')
          .update(payload)
          .eq('telegram_id', tgId);
      }

      localStorage.setItem('gymconnect_legal_accepted', 'true');
      localStorage.setItem('gymconnect_legal_version', '1.0');

      if (onConsentConfirmed) {
        onConsentConfirmed();
      } else if (onBack) {
        onBack();
      }
    } catch (e) {
      console.warn('Ошибка фиксации согласия в БД:', e);
      localStorage.setItem('gymconnect_legal_accepted', 'true');
      if (onConsentConfirmed) onConsentConfirmed();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] overflow-y-auto pb-24 pt-3 px-3 select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        
        {/* Верхняя навигационная панель */}
        <div className="bg-white rounded-2xl py-3 px-4 shadow-sm border border-slate-100 flex items-center justify-between sticky top-0 z-40">
          {!isMandatory ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Назад</span>
            </button>
          ) : (
            <div className="w-12"></div>
          )}

          <div className="text-center">
            <h2 className="text-xs font-bold text-slate-900">Юридический реестр</h2>
            <p className="text-[10px] text-slate-400">GymConnect Казахстан</p>
          </div>

          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            7 актов
          </div>
        </div>

        {/* Информационный приветственный баннер */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1.5 shadow-sm">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-sm font-black text-slate-900">
            Правовая безопасность атлетов
          </h1>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            Ознакомьтесь с официальными регламентами работы сервиса на территории Республики Казахстан.
          </p>
        </div>

        {/* Список 7 актов (Компактные аккуратные иконки + строго 2 строки описания) */}
        <div className="space-y-2">
          {legalDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDoc(doc)}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm cursor-pointer flex items-center justify-between active:scale-98 transition-all"
            >
              <div className="flex items-start gap-2.5 text-left overflow-hidden">
                {/* Компактная иконка в размер основного меню */}
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  {doc.icon}
                </div>

                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {doc.title}
                  </h3>
                  {/* Строго 2 строки описания одинаковой высоты во всех карточках */}
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                    {doc.desc}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>
          ))}
        </div>

        {/* Чекбокс безоговорочного согласия со всеми актами */}
        <div 
          onClick={() => setIsAgreed(!isAgreed)}
          className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-2.5 cursor-pointer active:scale-98 transition-all"
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
            isAgreed ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-300'
          }`}>
            {isAgreed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-slate-900">
              Я ознакомлен и принимаю условия всех 7 правовых актов
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Даю согласие на обработку данных, соблюдение спортивного этикета и правил GymBro.
            </p>
          </div>
        </div>

        {/* Кнопка фиксации согласия */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleConfirmConsent}
            disabled={!isAgreed || isSaving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSaving ? 'Сохранение согласия в базе...' : 'Подтвердить согласие и продолжить'}</span>
          </button>
        </div>

      </div>

      {/* Модальное окно полного чтения выбранного документа */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Шапка модалки */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  {activeDoc.icon}
                </div>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{activeDoc.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Текст документа */}
            <div className="p-4 overflow-y-auto space-y-3 text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-line bg-slate-50/50">
              {activeDoc.content}
            </div>

            {/* Подвал модалки */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-98 transition-all"
              >
                Понятно, закрыть
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
