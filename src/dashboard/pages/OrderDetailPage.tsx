import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Wrench,
  Car,
  User,
  Calendar,
  Gauge,
  CheckCircle2,
  PlayCircle,
  Package,
  Truck,
  ArrowRight,
  Edit3,
  Save,
  X,
  Plus,
  CreditCard,
  DollarSign,
  MessageSquare,
  UserCog,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { OrderStatus, OrderPriority } from '../../types/index';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';

// ─── Helpers ──────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const PRIORITY_LABELS: Record<OrderPriority, string> = {
  normal: 'Normal',
  urgente: 'Urgente',
  vip: 'VIP',
};

const PRIORITY_STYLES: Record<OrderPriority, string> = {
  normal:
    'text-white/50 bg-white/5 border border-white/10',
  urgente:
    'text-amber-300 bg-amber-900/40 border border-amber-700/40',
  vip:
    'text-[#C9A84C] border',
};

const STATUS_FLOW: Record<OrderStatus, { next: OrderStatus | null; label: string; icon: React.ReactNode; color: string }> = {
  presupuesto: {
    next: 'aprobado',
    label: 'Aprobar Orden',
    icon: <CheckCircle2 size={15} strokeWidth={2} />,
    color: '#3b82f6',
  },
  aprobado: {
    next: 'en_proceso',
    label: 'Iniciar Trabajo',
    icon: <PlayCircle size={15} strokeWidth={2} />,
    color: '#f59e0b',
  },
  en_proceso: {
    next: 'listo',
    label: 'Marcar Listo',
    icon: <Package size={15} strokeWidth={2} />,
    color: '#34d399',
  },
  pausado: {
    next: 'en_proceso',
    label: 'Reanudar Trabajo',
    icon: <PlayCircle size={15} strokeWidth={2} />,
    color: '#f59e0b',
  },
  listo: {
    next: 'entregado',
    label: 'Registrar Entrega',
    icon: <Truck size={15} strokeWidth={2} />,
    color: '#34d399',
  },
  entregado: { next: null, label: 'Entregado', icon: <Truck size={15} />, color: '#6b7280' },
  cancelado: { next: null, label: 'Cancelado', icon: <X size={15} />, color: '#6b7280' },
};

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  presupuesto: 'Orden aprobada por el cliente',
  aprobado: 'Trabajo iniciado por el técnico',
  en_proceso: 'Trabajo completado — listo para entrega',
  pausado: 'Trabajo reanudado',
  listo: 'Vehículo entregado al cliente',
  entregado: '',
  cancelado: '',
};

// ─── Sub-components ───────────────────────────────────────────

function InfoBlock({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-white/30 font-sans">{label}</p>
      <p className={`text-sm text-white/80 ${mono ? 'font-mono' : 'font-sans'}`}>{value}</p>
    </div>
  );
}

function SectionCard({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 mb-4"
      style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase tracking-widest font-semibold text-white/35 font-sans">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  // Local UI state
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);
  const [diagnosisDraft, setDiagnosisDraft] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showPartialPayForm, setShowPartialPayForm] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [reassigning, setReassigning] = useState(false);
  const [newTechId, setNewTechId] = useState('');

  const order = state.orders.find((o) => o.id === id);

  // 404
  if (!order) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="text-center">
          <p
            className="text-7xl font-bold text-white/10 mb-2 leading-none"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            404
          </p>
          <p className="text-white/50 text-lg font-sans mb-1">Orden no encontrada</p>
          <p className="text-white/25 text-sm font-sans font-mono">{id}</p>
        </div>
        <Link
          to="/dashboard/orders"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold font-sans transition-all hover:opacity-90 text-black"
          style={{ backgroundColor: '#C9A84C' }}
        >
          <ChevronLeft size={15} />
          Volver a Órdenes
        </Link>
      </div>
    );
  }

  const vehicle = state.vehicles.find((v) => v.id === order.vehicleId);
  const client = state.clients.find((c) => c.id === order.clientId);
  const tech = state.technicians.find((t) => t.id === order.technicianId);

  const isEditable = order.status === 'presupuesto' || order.status === 'aprobado' || order.status === 'en_proceso';
  const flow = STATUS_FLOW[order.status];
  const balance = order.total - order.amountPaid;

  // ── Handlers ──

  function handleStatusChange(nextStatus: OrderStatus) {
    const note = STATUS_DESCRIPTIONS[order.status] || `Estado cambiado a ${nextStatus}`;
    dispatch({
      type: 'ORDER_STATUS_CHANGE',
      payload: { id: order.id, status: nextStatus, note },
    });
  }

  function saveDiagnosis() {
    dispatch({
      type: 'ORDER_UPDATE',
      payload: { ...order, diagnosis: diagnosisDraft, updatedAt: new Date().toISOString() },
    });
    setEditingDiagnosis(false);
  }

  function addNote() {
    if (!noteText.trim()) return;
    dispatch({
      type: 'ORDER_UPDATE',
      payload: {
        ...order,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...order.timeline,
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'nota' as const,
            description: noteText.trim(),
          },
        ],
      },
    });
    setNoteText('');
    setShowNoteForm(false);
  }

  function registerPartialPayment() {
    const amount = parseFloat(partialAmount);
    if (!amount || amount <= 0) return;
    const newPaid = order.amountPaid + amount;
    const newPaymentStatus =
      newPaid >= order.total ? 'pagado' : 'parcial';
    dispatch({
      type: 'ORDER_UPDATE',
      payload: {
        ...order,
        amountPaid: newPaid,
        paymentStatus: newPaymentStatus,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...order.timeline,
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'nota' as const,
            description: `Pago registrado: ${formatCurrency(amount)} — Total pagado: ${formatCurrency(newPaid)}`,
          },
        ],
      },
    });
    setPartialAmount('');
    setShowPartialPayForm(false);
  }

  function markFullyPaid() {
    dispatch({
      type: 'ORDER_UPDATE',
      payload: {
        ...order,
        amountPaid: order.total,
        paymentStatus: 'pagado',
        updatedAt: new Date().toISOString(),
        timeline: [
          ...order.timeline,
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'nota' as const,
            description: `Pago completo registrado: ${formatCurrency(order.total)}`,
          },
        ],
      },
    });
  }

  function reassignTechnician() {
    if (!newTechId) return;
    const newTech = state.technicians.find((t) => t.id === newTechId);
    dispatch({
      type: 'ORDER_UPDATE',
      payload: {
        ...order,
        technicianId: newTechId,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...order.timeline,
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'nota' as const,
            description: `Técnico reasignado a: ${newTech?.name ?? newTechId}`,
            technicianId: newTechId,
          },
        ],
      },
    });
    setReassigning(false);
    setNewTechId('');
  }

  const PAYMENT_STATUS_STYLES: Record<string, string> = {
    pendiente: 'text-red-300 bg-red-900/40',
    parcial: 'text-amber-300 bg-amber-900/40',
    pagado: 'text-emerald-300 bg-emerald-900/40',
  };

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: '#0A0A0A' }}>
      {/* ── Top header ── */}
      <div className="flex items-start gap-4 mb-6">
        <Link
          to="/dashboard/orders"
          className="text-white/35 hover:text-white/60 transition-colors mt-1 shrink-0"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1
              className="text-2xl md:text-3xl text-white leading-none tracking-tight font-mono"
              style={{ fontFamily: 'Anton, sans-serif' }}
            >
              {order.id}
            </h1>
            <StatusBadge status={order.status} size="md" />
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[order.priority]}`}
              style={order.priority === 'vip' ? { borderColor: '#C9A84C', color: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.1)' } : undefined}
            >
              {PRIORITY_LABELS[order.priority]}
            </span>
          </div>
          <p className="text-white/35 text-xs font-sans">
            Creado el {formatDate(order.createdAt)}
            {order.updatedAt !== order.createdAt && (
              <span className="ml-2">· Actualizado {formatDate(order.updatedAt)}</span>
            )}
          </p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ════ LEFT COLUMN (60%) ════ */}
        <div className="flex-[3] min-w-0 w-full">

          {/* Vehicle & Client info */}
          <SectionCard title="Vehículo y Cliente">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoBlock label="Vehículo" value={vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'} />
              <InfoBlock label="Año" value={vehicle?.year ?? '—'} />
              <InfoBlock label="Placa" value={vehicle?.plate ?? '—'} mono />
              <InfoBlock label="Cliente" value={client?.name ?? '—'} />
              <InfoBlock label="Teléfono" value={client?.phone ?? '—'} mono />
              <InfoBlock
                label="Combustible"
                value={
                  vehicle
                    ? vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)
                    : '—'
                }
              />
              <InfoBlock
                label="Km. Entrada"
                value={
                  <span className="flex items-center gap-1">
                    <Gauge size={12} className="text-white/30" />
                    {order.mileageIn.toLocaleString('es-MX')} km
                  </span>
                }
              />
              {order.mileageOut && (
                <InfoBlock
                  label="Km. Salida"
                  value={
                    <span className="flex items-center gap-1">
                      <Gauge size={12} className="text-white/30" />
                      {order.mileageOut.toLocaleString('es-MX')} km
                    </span>
                  }
                />
              )}
              {order.estimatedDelivery && (
                <InfoBlock
                  label="Entrega Est."
                  value={
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-white/30" />
                      {new Date(order.estimatedDelivery).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </span>
                  }
                />
              )}
            </div>
          </SectionCard>

          {/* Problem description */}
          <SectionCard title="Descripción del Problema">
            <p className="text-white/70 text-sm font-sans leading-relaxed">{order.description}</p>
          </SectionCard>

          {/* Diagnosis */}
          <SectionCard
            title="Diagnóstico del Técnico"
            actions={
              isEditable && !editingDiagnosis ? (
                <button
                  onClick={() => {
                    setDiagnosisDraft(order.diagnosis ?? '');
                    setEditingDiagnosis(true);
                  }}
                  className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors font-sans"
                >
                  <Edit3 size={12} />
                  Editar
                </button>
              ) : null
            }
          >
            {editingDiagnosis ? (
              <div className="flex flex-col gap-3">
                <textarea
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/20"
                  rows={4}
                  value={diagnosisDraft}
                  onChange={(e) => setDiagnosisDraft(e.target.value)}
                  placeholder="Describe el diagnóstico técnico..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveDiagnosis}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans text-black transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#C9A84C' }}
                  >
                    <Save size={12} />
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingDiagnosis(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans text-white/50 hover:text-white/70 transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <X size={12} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : order.diagnosis ? (
              <p className="text-white/70 text-sm font-sans leading-relaxed">{order.diagnosis}</p>
            ) : (
              <p className="text-white/25 text-sm font-sans italic">Sin diagnóstico registrado.</p>
            )}
          </SectionCard>

          {/* Line items */}
          <SectionCard title="Líneas de Trabajo">
            {order.lineItems.length === 0 ? (
              <p className="text-white/25 text-sm italic font-sans">Sin líneas de trabajo.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Descripción', 'Tipo', 'Cant.', 'P.Unit', 'Subtotal'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[10px] uppercase tracking-widest text-white/25 font-semibold px-3 py-2.5"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.lineItems.map((li) => (
                      <tr
                        key={li.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="px-3 py-3 text-white/80 max-w-[220px]">
                          <p className="truncate">{li.description}</p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              li.type === 'servicio'
                                ? 'text-blue-300 bg-blue-900/40'
                                : li.type === 'refaccion'
                                ? 'text-amber-300 bg-amber-900/40'
                                : 'text-emerald-300 bg-emerald-900/40'
                            }`}
                          >
                            {li.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-white/50 tabular-nums">{li.quantity}</td>
                        <td className="px-3 py-3 text-white/50 tabular-nums whitespace-nowrap">
                          {formatCurrency(li.unitPrice)}
                        </td>
                        <td className="px-3 py-3 text-white font-semibold tabular-nums whitespace-nowrap">
                          {formatCurrency(li.quantity * li.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Financial summary */}
          <SectionCard title="Resumen Financiero">
            <div className="flex flex-col gap-2.5 text-sm font-sans">
              <div className="flex justify-between text-white/50">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento</span>
                  <span className="tabular-nums">− {formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/50">
                <span>IVA (16%)</span>
                <span className="tabular-nums">{formatCurrency(order.tax)}</span>
              </div>
              <div
                className="flex justify-between text-white font-bold text-base py-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span>Total</span>
                <span className="tabular-nums text-[#C9A84C]">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Monto pagado</span>
                <span className="tabular-nums text-emerald-400">{formatCurrency(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Saldo pendiente</span>
                <span className={`font-bold tabular-nums ${balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>

              {/* Payment status badge */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-white/30 text-xs">Estado de pago</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>

            {/* Payment actions */}
            {order.paymentStatus !== 'pagado' && (
              <div className="flex flex-col gap-3 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {showPartialPayForm ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-white/40 font-sans uppercase tracking-widest font-semibold">Registrar pago</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm font-sans">$</span>
                        <input
                          type="number"
                          className="w-full bg-white/5 border border-white/15 rounded-lg pl-7 pr-3 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-white/30 transition-colors"
                          placeholder={`Máx: ${formatCurrency(balance)}`}
                          value={partialAmount}
                          onChange={(e) => setPartialAmount(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={registerPartialPayment}
                        disabled={!partialAmount || parseFloat(partialAmount) <= 0}
                        className="px-4 py-2.5 rounded-lg text-sm font-bold font-sans text-black disabled:opacity-30 shrink-0"
                        style={{ backgroundColor: '#C9A84C' }}
                      >
                        Registrar
                      </button>
                      <button
                        onClick={() => setShowPartialPayForm(false)}
                        className="px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setShowPartialPayForm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-sans text-white/70 hover:text-white transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <CreditCard size={13} />
                      Registrar Pago Parcial
                    </button>
                    <button
                      onClick={markFullyPaid}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-sans text-emerald-300 hover:text-emerald-200 transition-colors"
                      style={{ border: '1px solid rgba(52,211,153,0.25)', backgroundColor: 'rgba(52,211,153,0.07)' }}
                    >
                      <DollarSign size={13} />
                      Marcar como Pagado
                    </button>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ════ RIGHT COLUMN (40%) ════ */}
        <div className="flex-[2] min-w-0 w-full lg:max-w-sm">

          {/* Status action */}
          {flow.next && (
            <div
              className="rounded-xl p-5 mb-4"
              style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[11px] uppercase tracking-widest font-semibold text-white/35 font-sans mb-4">
                Cambio de Estado
              </p>
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={order.status} />
                <ArrowRight size={14} className="text-white/20" />
                <StatusBadge status={flow.next} />
              </div>
              <button
                onClick={() => handleStatusChange(flow.next!)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold font-sans text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: flow.color }}
              >
                {flow.icon}
                {flow.label}
              </button>
            </div>
          )}

          {/* Technician */}
          <SectionCard
            title="Técnico Asignado"
            actions={
              <button
                onClick={() => {
                  setReassigning(!reassigning);
                  setNewTechId('');
                }}
                className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors font-sans"
              >
                <UserCog size={12} />
                Reasignar
              </button>
            }
          >
            {tech ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-sans shrink-0"
                  style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  {tech.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold font-sans">{tech.name}</p>
                  <p className="text-white/40 text-xs font-sans mt-0.5">{tech.specialty.slice(0, 2).join(', ')}</p>
                </div>
              </div>
            ) : (
              <p className="text-white/25 text-sm italic font-sans">Sin técnico asignado</p>
            )}

            {reassigning && (
              <div className="mt-4 flex flex-col gap-2">
                <select
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-white/25 cursor-pointer"
                  value={newTechId}
                  onChange={(e) => setNewTechId(e.target.value)}
                  style={{ backgroundColor: '#0f0f0f' }}
                >
                  <option value="" style={{ backgroundColor: '#161616' }}>Seleccionar técnico</option>
                  {state.technicians.map((t) => (
                    <option key={t.id} value={t.id} style={{ backgroundColor: '#161616' }}>
                      {t.name} — {t.status}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={reassignTechnician}
                    disabled={!newTechId}
                    className="flex-1 py-2 rounded-lg text-xs font-bold font-sans text-black disabled:opacity-30 transition-opacity"
                    style={{ backgroundColor: '#C9A84C' }}
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setReassigning(false)}
                    className="px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Timeline */}
          <SectionCard
            title="Historial de Eventos"
            actions={
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors font-sans"
              >
                <Plus size={12} />
                Agregar nota
              </button>
            }
          >
            {showNoteForm && (
              <div className="mb-4 flex flex-col gap-2">
                <textarea
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-white/25 resize-none placeholder:text-white/20"
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Escribir nota o comentario..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={addNote}
                    disabled={!noteText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans text-black disabled:opacity-30 transition-opacity"
                    style={{ backgroundColor: '#C9A84C' }}
                  >
                    <MessageSquare size={11} />
                    Agregar nota
                  </button>
                  <button
                    onClick={() => {
                      setShowNoteForm(false);
                      setNoteText('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 font-sans transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            <OrderTimeline timeline={order.timeline} />
          </SectionCard>

          {/* Delivery info if entregado */}
          {order.actualDelivery && (
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Truck size={14} className="text-emerald-400" />
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider font-sans">Entregado</p>
              </div>
              <p className="text-white/60 text-xs font-sans">{formatDate(order.actualDelivery)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
