// src/components/trainer/finance/FinanceCashboxScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Copy, 
  Check, 
  Receipt, 
  X,
  Search,
  ArrowUpRight,
  TrendingDown,
  Building,
  Save,
  Wallet,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function FinanceCashboxScreen({ 
  students = [], 
  trainer, 
  onBack, 
  onUpdate 
}) {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'history' | 'requisites'
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Реквизиты тренера (редактируемые в отдельной вкладке и сохраняемые в памяти)
  const [trainerRequisites, setTrainerRequisites] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_requisites');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const defaultPhone = trainer?.phone ? String(trainer.phone).replace(/\D/g, '') : '';
    return {
      phone: defaultPhone.startsWith('7') ? defaultPhone : (defaultPhone ? `7${defaultPhone}` : '77011234567'),
      bankCard: '4400 4301 2345 6789',
      recipientName: trainer?.full_name || trainer?.first_name || 'Наставник',
      bankName: 'Банковский перевод / По номеру'
    };
  });
  const [reqSavedFeedback, setReqSavedFeedback] = useState(false);

  const handleSaveRequisites = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('gymconnect_coach_requisites', JSON.stringify(trainerRequisites));
      setReqSavedFeedback(true);
      setTimeout(() => setReqSavedFeedback(false), 2500);
    } catch (err) {}
  };

  // 2. Выставленные счета
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_invoices');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return students.slice(0, 4).map((st, i) => {
      const isPaid = st.payment_status === 'paid' || i === 0;
      const amount = Number(st.monthly_price) || 70000;
      return {
        id: `inv-${st.id || i}-${Date.now() - i * 86400000}`,
        studentId: st.id,
        studentName: st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim(),
        username: st.username || st.telegram_username,
        phone: st.phone || st.whatsapp,
        amount,
        workoutsCount: Number(st.total_trainings) || 12,
        format: st.training_format || st.package_type || 'Индивидуально',
        status: isPaid ? 'paid' : (i === 1 ? 'pending' : 'rejected'),
        createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
        dueDate: new Date(Date.now() + (4 - i) * 86400000).toISOString(),
        customNote: 'Продление блока тренировок'
      };
    });
  });

  // 3. Кассовая лента (поступления и расходы)
  const [receipts, setReceipts] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_receipts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [
      {
        id: 'rec-1',
        title: students[0]?.full_name || 'Алихан Смаилов',
        amount: 70000,
        type: 'income',
        category: 'Оплата абонемента',
        desc: 'Блок на 12 тренировок (Индивидуально)',
        date: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        id: 'rec-2',
        title: 'Аренда тренажерного зала',
        amount: -45000,
        type: 'expense',
        category: 'Аренда зала',
        desc: 'Авансовый платеж за аренду зала',
        date: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: 'rec-3',
        title: students[1]?.full_name || 'Данияр Сериков',
        amount: 80000,
        type: 'income',
        category: 'Оплата абонемента',
        desc: 'Пакет на 12 занятий (Сплит)',
        date: new Date(Date.now() - 3600000 * 72).toISOString()
      }
    ];
  });

  // Синхронизация с хранилищем
  useEffect(() => {
    try {
      localStorage.setItem('gymconnect_coach_invoices', JSON.stringify(invoices));
    } catch (e) {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('gymconnect_coach_receipts', JSON.stringify(receipts));
    } catch (e) {}
  }, [receipts]);

  const formatMoney = (n) => `${Number(n || 0).toLocaleString('ru-RU')} ₸`;

  // Форма нового счёта
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: students[0]?.id || '',
    amount: 70000,
    workoutsCount: 12,
    customNote: 'Продление абонемента на 12 занятий'
  });

  // Форма нового расхода
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Аренда зала',
    amount: 30000,
    desc: ''
  });

  const totalPendingAmount = useMemo(() => {
    return invoices
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [invoices]);

  // Добавление нового счёта
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const st = students.find(s => s.id === invoiceForm.studentId);
    if (!st) return;

    const newInv = {
      id: `inv-${Date.now()}`,
      studentId: st.id,
      studentName: st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim(),
      username: st.username || st.telegram_username,
      phone: st.phone || st.whatsapp,
      amount: Number(invoiceForm.amount) || 70000,
      workoutsCount: Number(invoiceForm.workoutsCount) || 12,
      format: st.training_format || st.package_type || 'Индивидуально',
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      customNote: invoiceForm.customNote
    };

    setInvoices([newInv, ...invoices]);
    setIsInvoiceModalOpen(false);

    // Сразу открыть диалог отправки в Telegram
    handleSendViaTelegram(newInv);
  };

  // Добавление расхода тренера
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.title.trim()) return;

    const newExp = {
      id: `rec-exp-${Date.now()}`,
      title: expenseForm.title.trim(),
      amount: -Math.abs(Number(expenseForm.amount) || 0),
      type: 'expense',
      category: expenseForm.category,
      desc: expenseForm.desc.trim() || expenseForm.category,
      date: new Date().toISOString()
    };

    setReceipts([newExp, ...receipts]);
    setIsExpenseModalOpen(false);
    setExpenseForm({ title: '', category: 'Аренда зала', amount: 30000, desc: '' });
  };

  // Смена статуса счёта
  const handleUpdateInvoiceStatus = (invoiceId, newStatus) => {
    const target = invoices.find(i => i.id === invoiceId);
    if (!target) return;

    const updated = invoices.map(i => {
      if (i.id === invoiceId) {
        return { ...i, status: newStatus };
      }
      return i;
    });
    setInvoices(updated);

    // Если счёт перевели в «Оплачен», автоматически фиксируем приход в кассовую ленту
    if (newStatus === 'paid' && target.status !== 'paid') {
      const autoReceipt = {
        id: `rec-auto-${Date.now()}`,
        title: target.studentName,
        amount: target.amount,
        type: 'income',
        category: 'Оплата счёта',
        desc: `${target.workoutsCount} занятий • ${target.format}`,
        date: new Date().toISOString()
      };
      setReceipts([autoReceipt, ...receipts]);
    }

    if (onUpdate) onUpdate();
  };

  // Шаблон текста счёта с динамическими реквизитами
  const generateInvoiceMessage = (inv) => {
    return `Здравствуйте, ${inv.studentName}!\n\nВыставляю счёт на персональные тренировки в GymConnect:\n• Пакет: ${inv.workoutsCount} занятий (${inv.format})\n• Сумма к оплате: ${formatMoney(inv.amount)}\n\nРеквизиты для перевода:\n📱 Номер телефона: +${trainerRequisites.phone}\n💳 Номер карты: ${trainerRequisites.bankCard}\nПолучатель: ${trainerRequisites.recipientName}\n\nПосле перевода отправьте, пожалуйста, квитанцию в этот чат. Спасибо!`;
  };

  // Прямой переход в личку Telegram с предзаполненным шаблоном
  const handleSendViaTelegram = (inv) => {
    const rawText = generateInvoiceMessage(inv);
    const cleanNick = (inv.username || '').replace('@', '').trim();

    if (cleanNick) {
      window.open(`https://t.me/${cleanNick}?text=${encodeURIComponent(rawText)}`, '_blank');
    } else if (inv.phone) {
      const digits = String(inv.phone).replace(/\D/g, '');
      const validPhone = digits.startsWith('7') ? digits : `7${digits}`;
      window.open(`https://wa.me/${validPhone}?text=${encodeURIComponent(rawText)}`, '_blank');
    } else {
      navigator.clipboard.writeText(rawText);
      alert('У атлета не указан Telegram. Текст счёта скопирован в буфер обмена.');
    }
  };

  const handleCopyTextOnly = (inv) => {
    navigator.clipboard.writeText(generateInvoiceMessage(inv));
    setCopiedInvoiceId(inv.id);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return inv.studentName.toLowerCase().includes(q) || (inv.username || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 select-none pb-28">
      
      {/* 1. ВЕРХНИЙ БАР (ЧИСТЫЙ МОНОХРОМ) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Финансы</span>
          </button>

          <div className="text-center">
            <h1 className="text-xs font-bold text-slate-900">Касса и Счета</h1>
            <p className="text-[10px] text-slate-400 font-medium">Безналичные расчёты и расходы</p>
          </div>

          <div className="w-8" />
        </div>

        {/* 3 вкладки без лишних ярких цветов */}
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl mt-3 max-w-md mx-auto border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'invoices' 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-700" />
            <span>Счета ({invoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'history' 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-slate-700" />
            <span>Лента кассы</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requisites')}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'requisites' 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-slate-700" />
            <span>Реквизиты</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 max-w-md mx-auto space-y-3.5">

        {/* ================= ВКЛАДКА 1: ВЫСТАВЛЕННЫЕ СЧЕТА ================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {/* Карточка ожидающих платежей и кнопка выставления */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Ждут оплаты
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono block mt-0.5">
                  {formatMoney(totalPendingAmount)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Выставить счёт</span>
              </button>
            </div>

            {/* Поиск */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по имени атлета или никнейму..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 shadow-2xs"
              />
            </div>

            {/* Список счетов */}
            <div className="space-y-2.5">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'paid';
                const isRejected = inv.status === 'rejected';

                return (
                  <div
                    key={inv.id}
                    className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {inv.studentName}
                          </h4>
                          {inv.username && (
                            <span className="text-[10px] font-mono text-slate-400">
                              @{inv.username.replace('@', '')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {inv.workoutsCount} занятий ({inv.format}) • До {new Date(inv.dueDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          {formatMoney(inv.amount)}
                        </span>
                        
                        {/* Селектор статуса счёта */}
                        <div className="relative inline-block mt-1">
                          <select
                            value={inv.status}
                            onChange={(e) => handleUpdateInvoiceStatus(inv.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border appearance-none pr-5 outline-none cursor-pointer ${
                              isPaid 
                                ? 'bg-slate-100 text-slate-800 border-slate-300' 
                                : isRejected
                                  ? 'bg-slate-100 text-slate-500 border-slate-300 line-through'
                                  : 'bg-slate-900 text-white border-slate-900'
                            }`}
                          >
                            <option value="pending">Ожидает оплаты</option>
                            <option value="paid">Оплачен</option>
                            <option value="rejected">Отклонён</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </div>
                    </div>

                    {/* Кнопка отправки напрямую в Telegram */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendViaTelegram(inv)}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Открыть чат в Telegram с готовым текстом"
                      >
                        <Send className="w-3 h-3 text-slate-700" />
                        <span>Открыть диалог в Telegram</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyTextOnly(inv)}
                        className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold transition-all active:scale-95 flex items-center gap-1 cursor-pointer border border-slate-200 shadow-2xs"
                        title="Скопировать текст счёта"
                      >
                        {copiedInvoiceId === inv.id ? <Check className="w-3.5 h-3.5 text-slate-900" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= ВКЛАДКА 2: КАССОВАЯ ЛЕНТА И РАСХОДЫ ================= */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {/* Кнопка добавления расхода */}
            <div className="flex items-center justify-between bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Учёт расходов тренера</span>
                <span className="text-[10.5px] text-slate-400">Аренда зала, инвентарь, реклама и налоги</span>
              </div>

              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(true)}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Расход</span>
              </button>
            </div>

            {/* Лента транзакций */}
            <div className="space-y-2">
              {receipts.map((rec) => {
                const isIncome = rec.amount > 0;

                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 border border-slate-200 text-slate-700">
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {rec.title}
                        </h4>
                        <p className="text-[10.5px] text-slate-500 truncate">
                          {rec.desc || rec.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono font-bold block ${isIncome ? 'text-slate-900' : 'text-slate-500'}`}>
                        {isIncome ? `+${formatMoney(rec.amount)}` : formatMoney(rec.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(rec.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= ВКЛАДКА 3: РЕКВИЗИТЫ ТРЕНЕРА ================= */}
        {activeTab === 'requisites' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900">Реквизиты для приёма переводов</h3>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Эти данные будут автоматически подставляться в шаблон счёта при отправке ученику
              </p>
            </div>

            <form onSubmit={handleSaveRequisites} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Номер телефона для перевода (+7):
                </label>
                <input
                  type="text"
                  required
                  value={trainerRequisites.phone}
                  onChange={e => setTrainerRequisites({ ...trainerRequisites, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="77011234567"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Номер банковской карты:
                </label>
                <input
                  type="text"
                  required
                  value={trainerRequisites.bankCard}
                  onChange={e => setTrainerRequisites({ ...trainerRequisites, bankCard: e.target.value })}
                  placeholder="4400 4301 2345 6789"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Имя и фамилия получателя:
                </label>
                <input
                  type="text"
                  required
                  value={trainerRequisites.recipientName}
                  onChange={e => setTrainerRequisites({ ...trainerRequisites, recipientName: e.target.value })}
                  placeholder="Данияр С."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
              </div>

              {reqSavedFeedback && (
                <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-900 text-[11px] font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-slate-900" />
                  <span>Реквизиты сохранены и применены ко всем счетам!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить реквизиты</span>
              </button>
            </form>
          </div>
        )}

      </div>

      {/* МОДАЛКА ВЫСТАВЛЕНИЯ СЧЁТА */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900">Выставить счёт на оплату</h3>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Выберите атлета:
                </label>
                <select
                  value={invoiceForm.studentId}
                  onChange={e => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.first_name} {s.last_name || ''} (@{s.username || 'нет ника'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                    Сумма (₸):
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={invoiceForm.amount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                    Кол-во тренировок:
                  </label>
                  <input
                    type="number"
                    value={invoiceForm.workoutsCount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, workoutsCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Назначение платежа:
                </label>
                <input
                  type="text"
                  value={invoiceForm.customNote}
                  onChange={e => setInvoiceForm({ ...invoiceForm, customNote: e.target.value })}
                  placeholder="Блок на 12 тренировок"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="text-slate-900 font-bold block">Привязанные реквизиты перевода:</span>
                <p>Телефон: +{trainerRequisites.phone} • Получатель: {trainerRequisites.recipientName}</p>
                <p className="font-mono text-[10.5px] text-slate-500">Карта: {trainerRequisites.bankCard}</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Сформировать и открыть Telegram</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛКА ДОБАВЛЕНИЯ РАСХОДА */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900">Зафиксировать расход тренера</h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Категория расхода:
                </label>
                <select
                  value={expenseForm.category}
                  onChange={e => {
                    const cat = e.target.value;
                    setExpenseForm({ ...expenseForm, category: cat, title: cat });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold outline-none"
                >
                  <option value="Аренда зала">Аренда зала (клубная ставка)</option>
                  <option value="Спортивный инвентарь">Спортивный инвентарь / лямки / магнезия</option>
                  <option value="Спортпит и вода">Спортпит / шейкеры / вода для клиентов</option>
                  <option value="Реклама и продвижение">Реклама и продвижение</option>
                  <option value="Налоги и комиссии">Налоги и комиссии переводов</option>
                  <option value="Прочее">Прочее</option>
                </select>
              </div>

              <div>
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Название расхода:
                </label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="Оплата аренды за текущий месяц"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">
                  Сумма расхода (₸):
                </label>
                <input
                  type="number"
                  required
                  step="1000"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Внести в отчёт расходов
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
