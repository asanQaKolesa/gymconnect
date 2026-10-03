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
  TrendingDown
} from 'lucide-react';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

export default function FinanceCashboxScreen({ 
  students = [], 
  trainer, 
  onBack, 
  onUpdate 
}) {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'history'
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState(null);
  const [sendingInvoiceId, setSendingInvoiceId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const coachName = trainer?.full_name || trainer?.first_name || 'Наставник';
  const coachPhone = trainer?.phone ? String(trainer.phone).replace(/\D/g, '') : '';
  const cleanPhone = coachPhone.startsWith('7') ? coachPhone : `7${coachPhone}`;

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
        telegramId: st.telegram_id,
        amount,
        workoutsCount: Number(st.total_trainings) || 12,
        status: isPaid ? 'paid' : (i === 1 ? 'pending' : 'overdue'),
        createdAt: new Date(Date.now() - (i + 1) * 3600000 * 24).toISOString(),
        dueDate: new Date(Date.now() + (3 - i) * 3600000 * 24).toISOString(),
        method: isPaid ? 'Kaspi Pay' : null
      };
    });
  });

  const [receipts, setReceipts] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_receipts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [
      {
        id: 'rec-1',
        studentName: students[0]?.full_name || 'Алихан Смаилов',
        amount: 70000,
        type: 'subscription',
        desc: 'Блок на 12 тренировок (Индивидуально)',
        method: 'Kaspi Pay',
        date: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        id: 'rec-2',
        studentName: students[1]?.full_name || 'Данияр Сериков',
        amount: 80000,
        type: 'subscription',
        desc: 'Пакет на 12 тренировок (Сплит)',
        method: 'Kaspi Перевод',
        date: new Date(Date.now() - 3600000 * 50).toISOString()
      },
      {
        id: 'rec-3',
        studentName: 'Клубная аренда зала',
        amount: -45000,
        type: 'expense',
        desc: 'Оплата аренды тренажерного зала',
        method: 'Безналичный расчет',
        date: new Date(Date.now() - 3600000 * 96).toISOString()
      }
    ];
  });

  const [invoiceForm, setInvoiceForm] = useState({
    studentId: students[0]?.id || '',
    amount: 70000,
    workoutsCount: 12,
    customNote: 'Продление абонемента на 12 тренировок'
  });

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

  const totalInvoicedPending = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  }, [invoices]);

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const st = students.find(s => s.id === invoiceForm.studentId);
    if (!st) return;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      studentId: st.id,
      studentName: st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim(),
      username: st.username || st.telegram_username,
      telegramId: st.telegram_id,
      amount: Number(invoiceForm.amount) || 70000,
      workoutsCount: Number(invoiceForm.workoutsCount) || 12,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      customNote: invoiceForm.customNote
    };

    setInvoices([newInvoice, ...invoices]);
    setIsInvoiceModalOpen(false);
  };

  const handleMarkAsPaid = (invoiceId) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const updatedInvoices = invoices.map(i => {
      if (i.id === invoiceId) {
        return { ...i, status: 'paid', method: 'Kaspi Pay' };
      }
      return i;
    });

    setInvoices(updatedInvoices);

    const newReceipt = {
      id: `rec-${Date.now()}`,
      studentName: inv.studentName,
      amount: inv.amount,
      type: 'subscription',
      desc: `Оплата счёта: ${inv.workoutsCount} занятий`,
      method: 'Kaspi Pay',
      date: new Date().toISOString()
    };
    setReceipts([newReceipt, ...receipts]);

    if (onUpdate) onUpdate();
  };

  const getReminderText = (inv) => {
    return `🧾 <b>Счёт на оплату тренировок GymConnect</b>\n\nАтлет: <b>${escapeHtml(inv.studentName)}</b>\nПакет: <b>${inv.workoutsCount} персональных тренировок</b>\nК оплате: <b>${formatMoney(inv.amount)}</b>\n\nРеквизиты Kaspi:\n📱 <b>+${cleanPhone || '77000000000'}</b> (${escapeHtml(coachName)})\n\n<i>После оплаты отправьте квитанцию в этот чат для продления графика.</i>`;
  };

  const handleRemindViaTelegram = async (inv) => {
    setSendingInvoiceId(inv.id);
    const text = getReminderText(inv);

    if (inv.telegramId) {
      try {
        const res = await sendTelegramMessage(String(inv.telegramId), text, 'HTML');
        if (res && res.ok) {
          alert(`✅ Счёт успешно отправлен в Telegram ученику ${inv.studentName}!`);
        } else {
          navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ''));
          alert(`Текст счёта скопирован для отправки в личку @${inv.username || ''}`);
        }
      } catch (e) {
        navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ''));
        alert(`Текст счёта скопирован в буфер обмена.`);
      }
    } else if (inv.username) {
      navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ''));
      window.open(`https://t.me/${inv.username.replace('@', '')}`, '_blank');
    } else {
      navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ''));
      alert('Текст счёта скопирован в буфер обмена.');
    }
    setSendingInvoiceId(null);
  };

  const handleCopyInvoiceText = (inv) => {
    const raw = getReminderText(inv).replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(raw);
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
      {/* 1. ВЕРХНИЙ БАР */}
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
            <p className="text-[10px] text-slate-400 font-medium">Kaspi Pay интеграция</p>
          </div>

          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="w-8 h-8 rounded-xl bg-[#1E60D5] hover:bg-blue-700 text-white flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Выставить счёт"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Переключатель табов */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mt-3 max-w-md mx-auto border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'invoices' 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#1E60D5]" />
            <span>Счета ({invoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history' 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-slate-600" />
            <span>Кассовая лента</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 max-w-md mx-auto space-y-3.5">
        {/* ПЛАШКА ОЖИДАЕМЫХ СРЕДСТВ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">
              Ждут оплаты по счетам
            </span>
            <span className="text-lg font-bold text-amber-600 font-mono block">
              {formatMoney(totalInvoicedPending)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#1E60D5]" />
            <span>Выставить счёт</span>
          </button>
        </div>

        {/* ВКЛАДКА 1: ВЫСТАВЛЕННЫЕ СЧЕТА */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {/* Поиск */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск счёта по атлету..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#1E60D5] shadow-2xs"
              />
            </div>

            <div className="space-y-2.5">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'paid';
                const isOverdue = inv.status === 'overdue';

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
                          {inv.workoutsCount} тренировок • Срок: до {new Date(inv.dueDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          {formatMoney(inv.amount)}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : isOverdue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isPaid ? 'Оплачен' : isOverdue ? 'Просрочен' : 'Ожидает оплаты'}
                        </span>
                      </div>
                    </div>

                    {/* Панель действий */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={sendingInvoiceId === inv.id}
                          onClick={() => handleRemindViaTelegram(inv)}
                          className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#1E60D5] border border-blue-200 rounded-xl text-[11px] font-semibold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>В Telegram</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyInvoiceText(inv)}
                          className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                          title="Скопировать реквизиты"
                        >
                          {copiedInvoiceId === inv.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Получил оплату</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ВКЛАДКА 2: ИСТОРИЯ ПОСТУПЛЕНИЙ */}
        {activeTab === 'history' && (
          <div className="space-y-2.5">
            {receipts.map((rec) => {
              const isPositive = rec.amount > 0;
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {rec.studentName}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {rec.desc} • {rec.method}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-mono font-bold block ${isPositive ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {isPositive ? `+${formatMoney(rec.amount)}` : formatMoney(rec.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rec.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО ВЫСТАВЛЕНИЯ СЧЁТА */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#1E60D5]" />
                <h3 className="text-xs font-bold text-slate-900">Выставить счёт на оплату</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-[#1E60D5] font-semibold"
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
                    Сумма счёта (₸):
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={invoiceForm.amount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold outline-none focus:border-[#1E60D5]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold outline-none focus:border-[#1E60D5]"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-[#1E60D5]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="text-slate-900 font-bold block">Реквизиты тренера:</span>
                <p>Kaspi: +{cleanPhone || '77000000000'} ({coachName})</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md shadow-blue-600/25 cursor-pointer"
              >
                Сформировать счёт и отправить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
