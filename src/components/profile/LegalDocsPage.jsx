import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  FileSignature, 
  ShieldCheck, 
  UserCheck, 
  Wallet, 
  Users, 
  HeartPulse, 
  Bell 
} from 'lucide-react';

export default function LegalDocsPage({ onBack }) {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const legalDocs = [
    {
      id: 'offer',
      title: 'Публичный договор-оферта',
      desc: 'Официальные условия использования сервиса и предоставления услуг',
      icon: FileSignature,
      content: 'Официальное предложение (публичная оферта) платформы GymConnect для физических лиц на оказание информационных услуг, предоставление доступа к CRM-системе тренеров, каталогу тренировочных программ и сервису поиска напарников.'
    },
    {
      id: 'privacy',
      title: 'Политика конфиденциальности',
      desc: 'Защита и безопасность персональных данных согласно закону РК',
      icon: ShieldCheck,
      content: 'Настоящая Политика определяет порядок сбора, систематизации и защиты персональных данных пользователей сервиса GymConnect в соответствии с Законом Республики Казахстан "О персональных данных и их защите". Мы гарантируем безопасность хранения информации.'
    },
    {
      id: 'consent',
      title: 'Согласие на обработку данных',
      desc: 'Разрешение на сбор контактных данных и физических параметров',
      icon: UserCheck,
      content: 'Регистрируясь в сервисе, субъект персональных данных дает согласие ТОО "GymConnect" на обработку параметров тела, истории занятий и контактов исключительно для корректной работы тренировочного профиля.'
    },
    {
      id: 'payment',
      title: 'Регламент оплаты и возвратов (Kaspi Pay)',
      desc: 'Условия проведения транзакций, безопасность платежей и гарантии',
      icon: Wallet,
      content: 'Все платежи за PRO-подписки и пакеты персональных тренировок производятся в тенге (KZT) через шлюз Kaspi Pay. Правила возврата и переноса занятий соответствуют Закону Республики Казахстан "О защите прав потребителей".'
    },
    {
      id: 'rules',
      title: 'Правила сообщества GymConnect',
      desc: 'Нормы этичного поведения в фитнес-клубах и внутреннем комьюнити',
      icon: Users,
      content: 'Базовые правила спортивного этикета в клубах Алматы и чатах GymBro. Запрещены оскорбления, спам, несанкционированная коммерческая деятельность и навязывание запрещенных фармакологических препаратов.'
    },
    {
      id: 'disclaimer',
      title: 'Медицинский отказ от ответственности',
      desc: 'Важные предупреждения о спортивных нагрузках для здоровья',
      icon: HeartPulse,
      content: 'Все методики, калькулятор КБЖУ и программы тренировок носят исключительно рекомендательный характер. Перед началом тренировок с высокой интенсивностью настоятельно рекомендуется пройти консультацию врача.'
    },
    {
      id: 'marketing',
      title: 'Согласие на информационные рассылки',
      desc: 'Уведомления о графике занятий, акциях клубов и скидках',
      icon: Bell,
      content: 'Пользователь соглашается на получение сервисных уведомлений в Telegram о статусах продления абонементов, напоминаниях о тренировках и персональных акциях партнерских залов.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] overflow-y-auto pb-16 pt-3 px-4 select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        
        {/* Верхняя навигационная панель */}
        <div className="bg-white rounded-2xl py-2.5 px-3.5 shadow-xs border border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (selectedDoc) {
                setSelectedDoc(null);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>{selectedDoc ? 'К документам' : 'Назад в профиль'}</span>
          </button>
          
          <h2 className="text-xs font-semibold text-slate-800">
            {selectedDoc ? 'Просмотр документа' : 'Юридическая информация'}
          </h2>

          <div className="w-10" />
        </div>

        {/* Содержимое */}
        {selectedDoc ? (
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                <selectedDoc.icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 leading-snug">{selectedDoc.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedDoc.desc}</p>
              </div>
            </div>

            <div className="text-xs leading-relaxed text-slate-600 space-y-3 pt-1">
              <p className="font-medium text-slate-800">Редакция от 2026 года • Алматы, Казахстан</p>
              <p className="font-normal">{selectedDoc.content}</p>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] text-slate-500">
                Документ действует на всей территории Республики Казахстан в рамках электронной оферты платформы GymConnect.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDoc(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-xs hover:bg-slate-800 transition-colors mt-2"
            >
              Вернуться ко всем документам
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
            {legalDocs.map((doc) => {
              const IconComp = doc.icon;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 pr-2">
                    {/* Иконка в точных пропорциях профиля */}
                    <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 leading-snug">{doc.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{doc.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
