// src/components/profile/LegalDocsPage.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Users, 
  HeartPulse, 
  Bell, 
  ChevronRight, 
  Check, 
  X
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function LegalDocsPage({ onBack, onConsentConfirmed, isMandatory = false }) {
  const [activeDoc, setActiveDoc] = useState(null);
  const [isAgreed, setIsAgreed] = useState(() => {
    return localStorage.getItem('gymconnect_legal_accepted') === 'true';
  });
  const [isSaving, setIsSaving] = useState(false);

  // 7 юридических актов GymConnect (строго по списку со скриншота с монохромными иконками)
  const legalDocuments = [
    {
      id: 'privacy_policy',
      icon: <Lock className="w-4 h-4 text-slate-700" />,
      title: 'Политика обработки и защиты персональных данных',
      desc: 'Порядок сбора, хранения и защиты сведений пользователей.\nСоответствует Закону Республики Казахстан о персональных данных.',
      content: `ПОЛИТИКА ОБРАБОТКИ И ЗАЩИТЫ ПЕРСОНАЛЬНЫХ ДАННЫХ
г. Алматы, Республика Казахстан

1. ОБЩИЕ ПОЛОЖЕНИЯ
1.1. Настоящая Политика определяет порядок сбора, систематизации, накопления, хранения, изменения, дополнения, использования и уничтожения персональных данных пользователей сервиса GymConnect в соответствии с Законом РК «О персональных данных и их защите».
1.2. Использование Telegram Mini App GymConnect означает полное согласие пользователя с условиями настоящей Политики.

2. ЦЕЛИ ОБРАБОТКИ
2.1. Данные обрабатываются для создания персонального профиля атлета, подбора напарников в фитнес-клубах Алматы и ведения тренировочной статистики.`
    },
    {
      id: 'public_offer',
      icon: <FileText className="w-4 h-4 text-slate-700" />,
      title: 'Публичный договор-оферта',
      desc: 'Официальное пользовательское соглашение платформы GymConnect.\nРегулирует порядок предоставления доступа к сервисам приложения.',
      content: `ПУБЛИЧНЫЙ ДОГОВОР-ОФЕРТА (ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ)
г. Алматы, Республика Казахстан

1. ПРЕДМЕТ ДОГОВОРА
1.1. GymConnect предоставляет Пользователю безвозмездный и возмездный (PRO) доступ к мобильному веб-приложению для поиска фитнес-залов, планирования занятий и коммуникации с напарниками.
1.2. Акцептом настоящей публичной оферты признается завершение регистрации или использование функционала Mini App.

2. ПРАВА И ОБЯЗАННОСТИ
2.1. Пользователь обязуется предоставлять достоверные сведения и соблюдать общественный порядок при совместных тренировках.`
    },
    {
      id: 'data_collection_consent',
      icon: <ShieldCheck className="w-4 h-4 text-slate-700" />,
      title: 'Согласие на сбор и обработку персональных данных',
      desc: 'Добровольное разрешение на цифровую обработку профиля.\nВключает передачу данных через защищенный Telegram WebApp API.',
      content: `СОГЛАСИЕ НА СБОР И ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ

Настоящим Пользователь подтверждает свое согласие сервису GymConnect на:
1. Сбор и обработку следующих данных: имя, фамилия, Telegram Username, номер телефона, возраст, вес, рост, выбранный фитнес-клуб.
2. Хранение данных в облачной базе Supabase с применением Row Level Security.
3. Согласие действует до момента отзыва Пользователем путем удаления учетной записи.`
    },
    {
      id: 'kaspi_payment_terms',
      icon: <CreditCard className="w-4 h-4 text-slate-700" />,
      title: 'Регламент оплаты и возврата (Kaspi Pay terms)',
      desc: 'Условия активации PRO-доступа и проведения безопасных платежей.\nПорядок расчетов через Kaspi и регламент возврата денежных средств.',
      content: `РЕГЛАМЕНТ ОПЛАТЫ И ВОЗВРАТА СРЕДСТВ (KASPI PAY)

1. ОПЛАТА УСЛУГ
1.1. Оплата платных тарифов (PRO-подписка на 1, 3, 6, 12 месяцев) осуществляется в тенге через платежные сервисы Kaspi Pay или по реквизитам сервиса.
1.2. Активация статуса PRO производится автоматически либо администратором в течение 15 минут после подтверждения оплаты.

2. ВОЗВРАТ ПЛАТЕЖЕЙ
2.1. Возврат средств производится по заявлению Пользователя в течение 48 часов с момента оплаты, если услуги не были оказаны в полном объеме.`
    },
    {
      id: 'community_safety_rules',
      icon: <Users className="w-4 h-4 text-slate-700" />,
      title: 'Правила сообщества и безопасности GymConnect',
      desc: 'Стандарты спортивного поведения при поиске напарников GymBro.\nОтказ от ответственности сервиса за личные действия атлетов в залах.',
      content: `ПРАВИЛА СООБЩЕСТВА И БЕЗОПАСНОСТИ GYMCONNECT

1. ПРИНЦИПЫ GYMBRO
1.1. Платформа создана исключительно для здорового образа жизни, тренировок и поиска спортивных единомышленников.
1.2. Категорически запрещены любые формы дискриминации, оскорблений, навязчивого поведения и распространения запрещенных веществ.

2. БЕЗОПАСНОСТЬ
2.1. Сервис является исключительно связующим звеном. Пользователи самостоятельно оценивают безопасность очных встреч в спортивных клубах.`
    },
    {
      id: 'medical_disclaimer',
      icon: <HeartPulse className="w-4 h-4 text-slate-700" />,
      title: 'Медицинский отказ от ответственности (Medical Disclaimer)',
      desc: 'Предупреждение о рисках физических нагрузок и травмоопасности.\nРекомендация обязательной консультации с врачом перед тренировками.',
      content: `МЕДИЦИНСКИЙ ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ (MEDICAL DISCLAIMER)

1. ОТСУТСТВИЕ МЕДИЦИНСКИХ КОНСУЛЬТАЦИЙ
1.1. Материалы, калькуляторы КБЖУ и тренировочные графики в GymConnect носят исключительно информационный характер и не заменяют врачебную консультацию.
1.2. Сервис настоятельно рекомендует пройти медицинский осмотр перед выполнением тяжелых физических упражнений.

2. ОГРАНИЧЕНИЕ ОТВЕТСТВЕННОСТИ
2.1. Администрация сервиса не несет ответственности за травмы, ухудшение здоровья или материальный ущерб, возникший в процессе тренировок.`
    },
    {
      id: 'marketing_consent',
      icon: <Bell className="w-4 h-4 text-slate-700" />,
      title: 'Согласие на получение рекламных и информационных рассылок',
      desc: 'Уведомления об обновлениях залов, акциях и спортивных челенджах.\nВозможность управления подпиской на оповещения в Telegram-боте.',
      content: `СОГЛАСИЕ НА ПОЛУЧЕНИЕ РАССЫЛОК И УВЕДОМЛЕНИЙ

1. ИНФОРМИРОВАНИЕ ПОЛЬЗОВАТЕЛЕЙ
1.1. Пользователь выражает согласие на получение сервисных уведомлений, напоминаний о тренировках и новостей клубов Алматы через Telegram-бот.
1.2. Пользователь вправе в любой момент отключить рекламные уведомления в настройках личного профиля.`
    }
  ];

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
      <div className="max-w-md mx-auto space-y-3">
        
        {/* Верхний App Bar */}
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

          <div className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            7 документов
          </div>
        </div>

        {/* Заголовочный баннер */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-1.5 shadow-sm border border-slate-200/70">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-sm font-black text-slate-900">
            Правовая документация сервиса
          </h1>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            Официальные регламенты и положения платформы GymConnect на территории Республики Казахстан.
          </p>
        </div>

        {/* Список 7 документов (Монохромные аккуратные иконки + строго 2 строки описания) */}
        <div className="space-y-2">
          {legalDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDoc(doc)}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm cursor-pointer flex items-center justify-between active:scale-98 transition-all"
            >
              <div className="flex items-start gap-2.5 text-left overflow-hidden">
                {/* Монохромная компактная иконка в размер меню */}
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm mt-0.5 text-slate-700">
                  {doc.icon}
                </div>

                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {doc.title}
                  </h3>
                  {/* Строго 2 строки описания одинаковой высоты */}
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                    {doc.desc}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>
          ))}
        </div>

        {/* Чекбокс согласия */}
        <div 
          onClick={() => setIsAgreed(!isAgreed)}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-2.5 cursor-pointer active:scale-98 transition-all"
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
            isAgreed ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-300'
          }`}>
            {isAgreed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-slate-900">
              Я принимаю условия всех 7 правовых документов
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Подтверждаю ознакомление с офертой, политикой данных, безопасностью и медицинским дисклеймером.
            </p>
          </div>
        </div>

        {/* Кнопка подтверждения */}
        <div className="pt-1">
          <button
            type="submit"
            onClick={handleConfirmConsent}
            disabled={!isAgreed || isSaving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSaving ? 'Сохранение согласия в базе...' : 'Подтвердить согласие и продолжить'}</span>
          </button>
        </div>

      </div>

      {/* Модальное окно чтения полного текста документа */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
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

            <div className="p-4 overflow-y-auto text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-line bg-slate-50/50">
              {activeDoc.content}
            </div>

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
