import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  Plus,
  Search,
  Filter,
  X,
  ChevronRight,
  Banknote,
  Receipt,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import type {
  FinancialTransaction,
  WorkOrder,
  PaymentMethod,
  PaymentStatus,
} from '../../types';

// ─── HELPERS ─────────────────────────────────────────────────

function formatMXN(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

type Period = 'semana' | 'mes' | 'año';

function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === 'semana') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  }
  if (period === 'mes') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(now.getFullYear(), 0, 1);
}

function isInPeriod(dateStr: string, period: Period): boolean {
  const txDate = new Date(dateStr + 'T12:00:00');
  const start = getPeriodStart(period);
  const now = new Date();
  return txDate >= start && txDate <= now;
}

// ─── TYPES ───────────────────────────────────────────────────

interface RegisterPaymentState {
  order: WorkOrder;
  clientName: string;
}

interface RegisterExpenseForm {
  category: string;
  description: string;
  amount: string;
  paymentMethod: PaymentMethod;
  date: string;
}

// ─── BAR CHART ───────────────────────────────────────────────

function BarChart({ transactions, period }: { transactions: FinancialTransaction[]; period: Period }) {
  const days = period === 'semana' ? 7 : period === 'mes' ? 30 : 12;

  const chartData = useMemo(() => {
    if (period === 'año') {
      // Group by month
      const months = Array.from({ length: 12 }, (_, i) => {
        const label = new Date(new Date().getFullYear(), i, 1).toLocaleDateString('es-MX', { month: 'short' });
        const total = transactions
          .filter(t => {
            if (t.type !== 'ingreso') return false;
            const d = new Date(t.date + 'T12:00:00');
            return d.getMonth() === i && d.getFullYear() === new Date().getFullYear();
          })
          .reduce((s, t) => s + t.amount, 0);
        return { label, total };
      });
      return months;
    }

    // Group by day
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      const total = transactions
        .filter(t => t.type === 'ingreso' && t.date === dateStr)
        .reduce((s, t) => s + t.amount, 0);
      result.push({ label, total });
    }
    return result;
  }, [transactions, period, days]);

  const maxVal = Math.max(...chartData.map(d => d.total), 1);
  const showEvery = chartData.length > 10 ? Math.ceil(chartData.length / 8) : 1;

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5 h-40 w-full">
        {chartData.map((item, idx) => {
          const heightPct = (item.total / maxVal) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              {item.total > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex flex-col items-center pointer-events-none">
                  <div
                    className="text-xs font-sans font-medium text-white px-2 py-1 rounded-md whitespace-nowrap"
                    style={{ backgroundColor: '#C9A84C', color: '#0A0A0A' }}
                  >
                    {formatMXN(item.total)}
                  </div>
                  <div
                    className="w-0 h-0"
                    style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #C9A84C' }}
                  />
                </div>
              )}
              {/* Bar */}
              <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-sm transition-all duration-300 group-hover:opacity-80"
                  style={{
                    height: item.total > 0 ? `${Math.max(heightPct, 2)}%` : '2px',
                    backgroundColor: item.total > 0 ? '#C9A84C' : 'rgba(255,255,255,0.06)',
                    opacity: item.total > 0 ? 1 : 0.5,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex items-start gap-1.5 mt-2 w-full">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex-1 text-center">
            {idx % showEvery === 0 && (
              <span className="text-[9px] text-white/30 font-sans leading-none">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAYMENT STATUS BADGE ─────────────────────────────────────

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
    pagado: { label: 'Pagado', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    parcial: { label: 'Parcial', color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
    pendiente: { label: 'Pendiente', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-sans"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}

// ─── MODAL REGISTRAR PAGO ─────────────────────────────────────

interface RegisterPaymentModalProps {
  data: RegisterPaymentState;
  onClose: () => void;
}

function RegisterPaymentModal({ data, onClose }: RegisterPaymentModalProps) {
  const { dispatch, state } = useAppContext();
  const pendingBalance = data.order.total - data.order.amountPaid;
  const [amount, setAmount] = useState(pendingBalance.toFixed(2));
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [error, setError] = useState('');

  function handleConfirm() {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Ingresa un monto válido mayor a $0');
      return;
    }
    if (numAmount > pendingBalance + 0.01) {
      setError(`El monto no puede superar el saldo pendiente de ${formatMXN(pendingBalance)}`);
      return;
    }

    const newAmountPaid = data.order.amountPaid + numAmount;
    const newPendingBalance = data.order.total - newAmountPaid;
    const newPaymentStatus: PaymentStatus =
      newPendingBalance <= 0.01 ? 'pagado' : 'parcial';

    // 1. Create transaction
    dispatch({
      type: 'TRANSACTION_CREATE',
      payload: {
        id: `txn-${Date.now()}`,
        type: 'ingreso',
        category: 'Pago de orden',
        orderId: data.order.id,
        amount: numAmount,
        description: `Pago ${newPaymentStatus === 'pagado' ? 'completo' : 'parcial'} orden #${data.order.id.replace('order-', '')} — ${data.clientName}`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: method,
      },
    });

    // 2. Update order
    dispatch({
      type: 'ORDER_UPDATE',
      payload: {
        ...data.order,
        amountPaid: newAmountPaid,
        paymentStatus: newPaymentStatus,
        updatedAt: new Date().toISOString(),
      },
    });

    onClose();
  }

  const numAmount = parseFloat(amount) || 0;
  const remainingAfter = pendingBalance - numAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
        style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-display text-white" style={{ fontFamily: 'Anton, sans-serif' }}>
              Registrar Pago
            </h2>
            <p className="text-sm text-white/40 font-sans mt-0.5">
              Orden #{data.order.id.replace('order-', '')} — {data.clientName}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="rounded-xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between text-sm font-sans">
            <span className="text-white/50">Total de la orden</span>
            <span className="text-white font-medium">{formatMXN(data.order.total)}</span>
          </div>
          <div className="flex justify-between text-sm font-sans">
            <span className="text-white/50">Ya pagado</span>
            <span className="text-[#34d399] font-medium">{formatMXN(data.order.amountPaid)}</span>
          </div>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <div className="flex justify-between text-sm font-sans">
            <span className="text-white/50">Saldo pendiente</span>
            <span className="text-[#f87171] font-semibold">{formatMXN(pendingBalance)}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans">
            Monto a pagar
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-sans">$</span>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); }}
              className="w-full pl-7 pr-16 py-3 rounded-lg text-white font-sans text-sm outline-none transition-colors"
              style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
              step="0.01"
              min="0"
              max={pendingBalance}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-sans">USD</span>
          </div>
          {numAmount > 0 && numAmount <= pendingBalance && (
            <p className="text-xs font-sans" style={{ color: remainingAfter <= 0.01 ? '#34d399' : '#C9A84C' }}>
              {remainingAfter <= 0.01
                ? 'Saldo liquidado completamente'
                : `Quedará pendiente: ${formatMXN(remainingAfter)}`}
            </p>
          )}
          {error && <p className="text-xs text-[#f87171] font-sans">{error}</p>}
        </div>

        {/* Method */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans">
            Método de pago
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['efectivo', 'tarjeta', 'transferencia'] as PaymentMethod[]).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className="py-2.5 rounded-lg text-sm font-medium font-sans capitalize transition-all"
                style={{
                  backgroundColor: method === m ? 'rgba(201,168,76,0.15)' : '#0A0A0A',
                  border: method === m ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: method === m ? '#C9A84C' : 'rgba(255,255,255,0.5)',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium font-sans text-white/50 transition-colors hover:text-white"
            style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-bold font-sans transition-all hover:opacity-90"
            style={{ backgroundColor: '#C9A84C', color: '#0A0A0A' }}
          >
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL REGISTRAR GASTO ────────────────────────────────────

interface RegisterExpenseModalProps {
  onClose: () => void;
}

const EXPENSE_CATEGORIES = [
  'Compra de refacciones',
  'Nómina',
  'Servicios',
  'Herramientas',
  'Consumibles',
  'Publicidad',
  'Impuestos',
  'Mantenimiento',
  'Otro',
];

function RegisterExpenseModal({ onClose }: RegisterExpenseModalProps) {
  const { dispatch } = useAppContext();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<RegisterExpenseForm>({
    category: EXPENSE_CATEGORIES[0],
    description: '',
    amount: '',
    paymentMethod: 'efectivo',
    date: today,
  });
  const [error, setError] = useState('');

  function handleConfirm() {
    const numAmount = parseFloat(form.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Ingresa un monto válido mayor a $0');
      return;
    }
    if (!form.description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    dispatch({
      type: 'TRANSACTION_CREATE',
      payload: {
        id: `txn-${Date.now()}`,
        type: 'egreso',
        category: form.category,
        amount: numAmount,
        description: form.description.trim(),
        date: form.date,
        paymentMethod: form.paymentMethod,
      },
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
        style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-display text-white" style={{ fontFamily: 'Anton, sans-serif' }}>
              Registrar Gasto
            </h2>
            <p className="text-sm text-white/40 font-sans mt-0.5">Nuevo egreso manual</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans">Categoría</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-3 rounded-lg text-white font-sans text-sm outline-none"
            style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c} value={c} style={{ backgroundColor: '#161616' }}>{c}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans">Descripción</label>
          <input
            type="text"
            value={form.description}
            onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setError(''); }}
            placeholder="Detalle del gasto..."
            className="w-full px-3 py-3 rounded-lg text-white font-sans text-sm outline-none placeholder:text-white/25"
            style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-sans">$</span>
              <input
                type="number"
                value={form.amount}
                onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setError(''); }}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-3 rounded-lg text-white font-sans text-sm outline-none placeholder:text-white/25"
                style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-3 rounded-lg text-white font-sans text-sm outline-none"
              style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>

        {/* Method */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans">Método de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {(['efectivo', 'tarjeta', 'transferencia'] as PaymentMethod[]).map(m => (
              <button
                key={m}
                onClick={() => setForm(f => ({ ...f, paymentMethod: m }))}
                className="py-2.5 rounded-lg text-sm font-medium font-sans capitalize transition-all"
                style={{
                  backgroundColor: form.paymentMethod === m ? 'rgba(248,113,113,0.12)' : '#0A0A0A',
                  border: form.paymentMethod === m ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: form.paymentMethod === m ? '#f87171' : 'rgba(255,255,255,0.5)',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <AlertCircle size={14} className="text-[#f87171] shrink-0" />
            <p className="text-xs text-[#f87171] font-sans">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium font-sans text-white/50 transition-colors hover:text-white"
            style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-bold font-sans transition-all hover:opacity-90"
            style={{ backgroundColor: '#f87171', color: '#0A0A0A' }}
          >
            Registrar Gasto
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = {
  semana: 'Esta semana',
  mes: 'Este mes',
  año: 'Este año',
};

export default function FinancePage() {
  const { state } = useAppContext();
  const [period, setPeriod] = useState<Period>('mes');
  const [txTypeFilter, setTxTypeFilter] = useState<'todos' | 'ingreso' | 'egreso'>('todos');
  const [txMethodFilter, setTxMethodFilter] = useState<'todos' | PaymentMethod>('todos');
  const [txSearch, setTxSearch] = useState('');
  const [paymentModal, setPaymentModal] = useState<RegisterPaymentState | null>(null);
  const [expenseModal, setExpenseModal] = useState(false);

  // ── KPI calculations ──────────────────────────────────────

  const periodTransactions = useMemo(
    () => state.transactions.filter(t => isInPeriod(t.date, period)),
    [state.transactions, period]
  );

  const ingresos = useMemo(
    () => periodTransactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0),
    [periodTransactions]
  );

  const egresos = useMemo(
    () => periodTransactions.filter(t => t.type === 'egreso').reduce((s, t) => s + t.amount, 0),
    [periodTransactions]
  );

  const utilidad = ingresos - egresos;

  const cuentasPorCobrar = useMemo(
    () =>
      state.orders
        .filter(o => o.paymentStatus !== 'pagado' && o.status !== 'cancelado')
        .reduce((s, o) => s + (o.total - o.amountPaid), 0),
    [state.orders]
  );

  // ── Receivables ───────────────────────────────────────────

  const ordersWithBalance = useMemo(
    () =>
      state.orders
        .filter(o => o.paymentStatus !== 'pagado' && o.status !== 'cancelado' && o.total - o.amountPaid > 0)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.orders]
  );

  // Group by client
  const receivablesByClient = useMemo(() => {
    const map = new Map<string, { clientName: string; orders: WorkOrder[] }>();
    ordersWithBalance.forEach(order => {
      const client = state.clients.find(c => c.id === order.clientId);
      const clientName = client?.name ?? 'Cliente desconocido';
      if (!map.has(order.clientId)) {
        map.set(order.clientId, { clientName, orders: [] });
      }
      map.get(order.clientId)!.orders.push(order);
    });
    return Array.from(map.entries()).map(([id, data]) => ({ clientId: id, ...data }));
  }, [ordersWithBalance, state.clients]);

  // ── Filtered transactions ─────────────────────────────────

  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter(t => {
        if (txTypeFilter !== 'todos' && t.type !== txTypeFilter) return false;
        if (txMethodFilter !== 'todos' && t.paymentMethod !== txMethodFilter) return false;
        if (txSearch && !t.description.toLowerCase().includes(txSearch.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, txTypeFilter, txMethodFilter, txSearch]);

  // ─────────────────────────────────────────────────────────

  function getClientName(clientId: string): string {
    return state.clients.find(c => c.id === clientId)?.name ?? 'Cliente desconocido';
  }

  const CARD = { backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)' };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-screen-2xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* ── HEADER ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-4xl text-white leading-none"
              style={{ fontFamily: 'Anton, sans-serif' }}
            >
              Control Financiero
            </h1>
            <p className="text-white/40 text-sm mt-1 font-sans">
              Ingresos, egresos y cuentas por cobrar — WLAS MOTOR
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Period selector */}
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161616' }}
            >
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-4 py-2 text-sm font-medium font-sans transition-all"
                  style={{
                    backgroundColor: period === p ? '#C9A84C' : 'transparent',
                    color: period === p ? '#0A0A0A' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>

            {/* Registrar gasto */}
            <button
              onClick={() => setExpenseModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold font-sans transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
            >
              <Plus size={16} />
              Registrar Gasto
            </button>
          </div>
        </div>

        {/* ── KPIs ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ingresos */}
          <div className="rounded-xl p-5 flex flex-col gap-3 shadow-[0_0_24px_rgba(52,211,153,0.06)]" style={CARD}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Ingresos</p>
              <ArrowUpCircle size={18} className="text-[#34d399]" />
            </div>
            <p className="text-3xl font-display text-[#34d399] leading-none" style={{ fontFamily: 'Anton, sans-serif' }}>
              {formatMXN(ingresos)}
            </p>
            <p className="text-xs text-white/35">{PERIOD_LABELS[period]}</p>
          </div>

          {/* Egresos */}
          <div className="rounded-xl p-5 flex flex-col gap-3 shadow-[0_0_24px_rgba(248,113,113,0.06)]" style={CARD}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Egresos</p>
              <ArrowDownCircle size={18} className="text-[#f87171]" />
            </div>
            <p className="text-3xl font-display text-[#f87171] leading-none" style={{ fontFamily: 'Anton, sans-serif' }}>
              {formatMXN(egresos)}
            </p>
            <p className="text-xs text-white/35">{PERIOD_LABELS[period]}</p>
          </div>

          {/* Utilidad */}
          <div
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{
              ...CARD,
              boxShadow: utilidad >= 0
                ? '0 0 24px rgba(201,168,76,0.08)'
                : '0 0 24px rgba(248,113,113,0.08)',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Utilidad Bruta</p>
              {utilidad >= 0
                ? <TrendingUp size={18} className="text-[#C9A84C]" />
                : <TrendingDown size={18} className="text-[#f87171]" />
              }
            </div>
            <p
              className="text-3xl font-display leading-none"
              style={{
                fontFamily: 'Anton, sans-serif',
                color: utilidad >= 0 ? '#C9A84C' : '#f87171',
              }}
            >
              {formatMXN(utilidad)}
            </p>
            <div className="flex items-center gap-1.5">
              {egresos > 0 && ingresos > 0 && (
                <p className="text-xs text-white/35">
                  Margen: {((utilidad / ingresos) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>

          {/* Cuentas por cobrar */}
          <div className="rounded-xl p-5 flex flex-col gap-3 shadow-[0_0_24px_rgba(201,168,76,0.06)]" style={CARD}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Por Cobrar</p>
              <CreditCard size={18} className="text-[#C9A84C]" />
            </div>
            <p className="text-3xl font-display text-[#C9A84C] leading-none" style={{ fontFamily: 'Anton, sans-serif' }}>
              {formatMXN(cuentasPorCobrar)}
            </p>
            <p className="text-xs text-white/35">{ordersWithBalance.length} orden{ordersWithBalance.length !== 1 ? 'es' : ''} pendiente{ordersWithBalance.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* ── CHART ─────────────────────────────────────────── */}
        <div className="rounded-2xl p-6" style={CARD}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-display text-white" style={{ fontFamily: 'Anton, sans-serif' }}>
                Ingresos por {period === 'año' ? 'Mes' : 'Día'}
              </h2>
              <p className="text-xs text-white/40 font-sans mt-0.5">
                {period === 'semana' ? 'Últimos 7 días' : period === 'mes' ? 'Últimos 30 días' : 'Año actual'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#C9A84C' }} />
              <span className="text-xs text-white/40 font-sans">Ingresos</span>
            </div>
          </div>
          <BarChart transactions={state.transactions} period={period} />
        </div>

        {/* ── TRANSACTIONS TABLE ─────────────────────────────── */}
        <div className="rounded-2xl flex flex-col" style={CARD}>
          {/* Table header */}
          <div className="px-6 pt-6 pb-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display text-white" style={{ fontFamily: 'Anton, sans-serif' }}>
                Transacciones Recientes
              </h2>
              <span className="text-xs text-white/40 font-sans">
                {filteredTransactions.length} registros
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={e => setTxSearch(e.target.value)}
                  placeholder="Buscar descripción..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-sans text-white placeholder:text-white/25 outline-none"
                  style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              {/* Type filter */}
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['todos', 'ingreso', 'egreso'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTxTypeFilter(t)}
                    className="px-3 py-2 text-xs font-medium font-sans capitalize transition-all"
                    style={{
                      backgroundColor: txTypeFilter === t
                        ? t === 'ingreso' ? 'rgba(52,211,153,0.15)' : t === 'egreso' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.08)'
                        : 'transparent',
                      color: txTypeFilter === t
                        ? t === 'ingreso' ? '#34d399' : t === 'egreso' ? '#f87171' : '#fff'
                        : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {t === 'todos' ? 'Todos' : t}
                  </button>
                ))}
              </div>

              {/* Method filter */}
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['todos', 'efectivo', 'tarjeta', 'transferencia'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setTxMethodFilter(m)}
                    className="px-3 py-2 text-xs font-medium font-sans capitalize transition-all"
                    style={{
                      backgroundColor: txMethodFilter === m ? 'rgba(201,168,76,0.12)' : 'transparent',
                      color: txMethodFilter === m ? '#C9A84C' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {m === 'todos' ? 'Todos' : m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Orden', 'Método', 'Monto'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">
                      No se encontraron transacciones
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap text-xs">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: tx.type === 'ingreso' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                            color: tx.type === 'ingreso' ? '#34d399' : '#f87171',
                          }}
                        >
                          {tx.type === 'ingreso' ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{tx.category}</td>
                      <td className="px-4 py-3 text-white/80 max-w-xs truncate">{tx.description}</td>
                      <td className="px-4 py-3">
                        {tx.orderId ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium"
                            style={{ color: '#C9A84C' }}
                          >
                            <Receipt size={10} />
                            #{tx.orderId.replace('order-', '')}
                          </span>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {tx.paymentMethod === 'efectivo' && <Banknote size={10} />}
                          {tx.paymentMethod === 'tarjeta' && <CreditCard size={10} />}
                          {tx.paymentMethod === 'transferencia' && <DollarSign size={10} />}
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-right">
                        <span style={{ color: tx.type === 'ingreso' ? '#34d399' : '#f87171' }}>
                          {tx.type === 'egreso' ? '−' : '+'}{formatMXN(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CUENTAS POR COBRAR ─────────────────────────────── */}
        <div className="rounded-2xl flex flex-col" style={CARD}>
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display text-white" style={{ fontFamily: 'Anton, sans-serif' }}>
                Cuentas por Cobrar
              </h2>
              <p className="text-xs text-white/40 font-sans mt-0.5">
                Saldos pendientes agrupados por cliente
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 font-sans">Total pendiente</p>
              <p className="text-lg font-display text-[#C9A84C]" style={{ fontFamily: 'Anton, sans-serif' }}>
                {formatMXN(cuentasPorCobrar)}
              </p>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {receivablesByClient.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <CheckCircle2 size={40} className="text-[#34d399] opacity-50" />
              <p className="text-white/40 font-sans text-sm">Sin cuentas pendientes de cobro</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {receivablesByClient.map(({ clientId, clientName, orders }) => {
                const clientTotal = orders.reduce((s, o) => s + (o.total - o.amountPaid), 0);
                return (
                  <div key={clientId} className="px-6 py-4 flex flex-col gap-3">
                    {/* Client header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sans"
                          style={{ backgroundColor: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
                        >
                          {clientName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white font-sans">{clientName}</p>
                          <p className="text-xs text-white/40 font-sans">{orders.length} orden{orders.length !== 1 ? 'es' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40 font-sans">Saldo total</p>
                        <p className="text-sm font-bold text-[#f87171] font-sans">{formatMXN(clientTotal)}</p>
                      </div>
                    </div>

                    {/* Orders */}
                    <div className="flex flex-col gap-2 ml-10">
                      {orders.map(order => {
                        const balance = order.total - order.amountPaid;
                        const vehicle = state.vehicles.find(v => v.id === order.vehicleId);
                        return (
                          <div
                            key={order.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
                            style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white/60 font-sans">
                                  #{order.id.replace('order-', '')}
                                </span>
                                <PaymentBadge status={order.paymentStatus} />
                              </div>
                              <p className="text-xs text-white/50 font-sans truncate mt-0.5">
                                {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ''}
                                {vehicle ? ' — ' : ''}
                                {order.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                              <div className="text-right">
                                <p className="text-[10px] text-white/30 font-sans uppercase tracking-wider">Total</p>
                                <p className="text-xs font-medium text-white/70 font-sans">{formatMXN(order.total)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-white/30 font-sans uppercase tracking-wider">Pagado</p>
                                <p className="text-xs font-medium text-[#34d399] font-sans">{formatMXN(order.amountPaid)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-white/30 font-sans uppercase tracking-wider">Pendiente</p>
                                <p className="text-sm font-bold text-[#f87171] font-sans">{formatMXN(balance)}</p>
                              </div>
                              <button
                                onClick={() => setPaymentModal({ order, clientName })}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold font-sans transition-all hover:opacity-80 whitespace-nowrap"
                                style={{ backgroundColor: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C' }}
                              >
                                <DollarSign size={12} />
                                Registrar Pago
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      {paymentModal && (
        <RegisterPaymentModal
          data={paymentModal}
          onClose={() => setPaymentModal(null)}
        />
      )}
      {expenseModal && (
        <RegisterExpenseModal onClose={() => setExpenseModal(false)} />
      )}
    </div>
  );
}
