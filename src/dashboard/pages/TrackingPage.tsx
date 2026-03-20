import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  CheckCheck,
  ArrowUpFromLine,
  Clock,
  Car,
  User,
  Wrench,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Trophy,
  Filter,
  EyeOff,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import type {
  WorkOrder,
  OrderStatus,
  OrderPriority,
  Client,
  Vehicle,
  Technician,
} from '../../types/index';

// ─── Time helpers ──────────────────────────────────────────────────────────────

function elapsedSince(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const totalMinutes = Math.floor(diffMs / 60_000);
  if (totalMinutes < 1) return '< 1m';
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `${days}d ${remHours}h`;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function secondsSince(ms: number): number {
  return Math.floor((Date.now() - ms) / 1000);
}

function formatLastUpdate(seconds: number): string {
  if (seconds < 10) return 'ahora mismo';
  if (seconds < 60) return `hace ${seconds}s`;
  return `hace ${Math.floor(seconds / 60)}m`;
}

function isToday(isoDate?: string): boolean {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Priority badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: OrderPriority }) {
  if (priority === 'normal') return null;

  if (priority === 'vip')
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase animate-pulse"
        style={{
          background: 'rgba(201,168,76,0.18)',
          color: '#C9A84C',
          border: '1px solid rgba(201,168,76,0.45)',
          boxShadow: '0 0 8px rgba(201,168,76,0.25)',
        }}
      >
        ★ VIP
      </span>
    );

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase"
      style={{
        background: 'rgba(248,113,113,0.18)',
        color: '#f87171',
        border: '1px solid rgba(248,113,113,0.35)',
      }}
    >
      <Zap size={9} />
      URGENTE
    </span>
  );
}

// ─── Elapsed time badge ───────────────────────────────────────────────────────

function ElapsedBadge({ createdAt }: { createdAt: string }) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const hours = diffMs / 3_600_000;
  let color = '#a1a1aa';
  if (hours > 48) color = '#f87171';
  else if (hours > 24) color = '#fbbf24';
  return (
    <span className="font-mono text-[11px] font-semibold" style={{ color }}>
      {elapsedSince(createdAt)}
    </span>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColumnDef {
  id: string;
  label: string;
  sublabel?: string;
  accentColor: string;
  dimmed?: boolean;
  filter: (o: WorkOrder) => boolean;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'pending',
    label: 'PENDIENTE / APROBADO',
    sublabel: 'Esperando inicio',
    accentColor: '#a1a1aa',
    filter: (o) => o.status === 'presupuesto' || o.status === 'aprobado',
  },
  {
    id: 'in_process',
    label: 'EN PROCESO',
    sublabel: 'En trabajo',
    accentColor: '#fbbf24',
    filter: (o) => o.status === 'en_proceso' || o.status === 'pausado',
  },
  {
    id: 'ready',
    label: 'LISTO',
    sublabel: 'Esperando entrega',
    accentColor: '#34d399',
    filter: (o) => o.status === 'listo',
  },
  {
    id: 'delivered_today',
    label: 'ENTREGADO HOY',
    sublabel: 'Completados hoy',
    accentColor: '#C9A84C',
    dimmed: true,
    filter: (o) => o.status === 'entregado' && isToday(o.actualDelivery),
  },
];

// ─── Next status logic ────────────────────────────────────────────────────────

function nextStatus(current: OrderStatus): OrderStatus | null {
  if (current === 'presupuesto' || current === 'aprobado') return 'en_proceso';
  if (current === 'en_proceso' || current === 'pausado') return 'listo';
  if (current === 'listo') return 'entregado';
  return null;
}

interface ActionButtonProps {
  status: OrderStatus;
  onAdvance: () => void;
}

function ActionButton({ status, onAdvance }: ActionButtonProps) {
  const next = nextStatus(status);
  if (!next) return null;

  let label: string;
  let icon: React.ReactNode;
  let bg: string;
  let textColor: string;
  let shadow: string;

  if (next === 'en_proceso') {
    label = 'Iniciar';
    icon = <Play size={12} strokeWidth={2.5} />;
    bg = 'rgba(251,191,36,0.12)';
    textColor = '#fbbf24';
    shadow = '0 0 12px rgba(251,191,36,0.15)';
  } else if (next === 'listo') {
    label = 'Marcar Listo';
    icon = <CheckCheck size={12} strokeWidth={2.5} />;
    bg = 'rgba(52,211,153,0.12)';
    textColor = '#34d399';
    shadow = '0 0 12px rgba(52,211,153,0.15)';
  } else {
    label = 'Registrar Entrega';
    icon = <ArrowUpFromLine size={12} strokeWidth={2.5} />;
    bg = 'rgba(201,168,76,0.12)';
    textColor = '#C9A84C';
    shadow = '0 0 12px rgba(201,168,76,0.15)';
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdvance();
      }}
      className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-semibold uppercase tracking-wider transition-all duration-200 hover:brightness-125 active:scale-95 cursor-pointer"
      style={{
        background: bg,
        color: textColor,
        border: `1px solid ${textColor}35`,
        boxShadow: shadow,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Empty state for "Entregado Hoy" ─────────────────────────────────────────

function EmptyDelivered() {
  return (
    <div
      className="flex flex-col items-center justify-center py-10 px-4 rounded-xl text-center"
      style={{ border: '1px dashed rgba(201,168,76,0.15)' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: 'rgba(201,168,76,0.08)' }}
      >
        <Trophy size={20} style={{ color: '#C9A84C' }} />
      </div>
      <p className="text-[13px] font-semibold text-white/40 mb-1">Sin entregas aún</p>
      <p className="text-[11px] text-white/20 leading-relaxed max-w-[160px]">
        Cada entrega completada hoy aparecerá aquí.
      </p>
    </div>
  );
}

// ─── Generic empty column state ───────────────────────────────────────────────

function EmptyColumn({ accentColor }: { accentColor: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-10 rounded-xl"
      style={{ border: `1px dashed ${accentColor}18` }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
        style={{ background: `${accentColor}08` }}
      >
        <span style={{ color: accentColor, fontSize: 14, lineHeight: 1 }}>—</span>
      </div>
      <span className="text-[11px] text-white/20">Sin órdenes</span>
    </div>
  );
}

// ─── Vehicle Card ─────────────────────────────────────────────────────────────

interface VehicleCardProps {
  order: WorkOrder;
  client?: Client;
  vehicle?: Vehicle;
  technician?: Technician;
  dimmed?: boolean;
  onAdvance: (orderId: string, newStatus: OrderStatus) => void;
}

function VehicleCard({
  order,
  client,
  vehicle,
  technician,
  dimmed,
  onAdvance,
}: VehicleCardProps) {
  const next = nextStatus(order.status);

  return (
    <Link
      to={`/dashboard/orders/${order.id}`}
      className="block rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] hover:-translate-y-0.5 group"
      style={{
        background: '#161616',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        opacity: dimmed ? 0.7 : 1,
      }}
    >
      {/* Top row: order ID + priority + elapsed */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-mono text-[10px] tracking-widest px-1.5 py-0.5 rounded"
            style={{
              color: '#C9A84C',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.22)',
            }}
          >
            #{order.id.replace('order-', '').toUpperCase()}
          </span>
          <PriorityBadge priority={order.priority} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Clock size={10} style={{ color: '#52525b' }} />
          <ElapsedBadge createdAt={order.createdAt} />
        </div>
      </div>

      {/* Vehicle name */}
      {vehicle ? (
        <div className="mb-1.5">
          <p
            className="text-white text-[17px] leading-tight tracking-wide"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="text-white/35 text-[11px] mt-0.5">
            {vehicle.year}
            {vehicle.color ? ` · ${vehicle.color}` : ''}
          </p>
        </div>
      ) : (
        <p
          className="text-white/50 text-[15px] mb-1.5"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          Vehículo no encontrado
        </p>
      )}

      {/* Plate badge (prominent, monospace) */}
      {vehicle && (
        <span
          className="inline-block font-mono text-[12px] font-bold px-2.5 py-1 rounded-md mb-3 tracking-wider uppercase"
          style={{
            background: 'rgba(201,168,76,0.1)',
            color: '#C9A84C',
            border: '1px solid rgba(201,168,76,0.28)',
            letterSpacing: '0.12em',
          }}
        >
          {vehicle.plate}
        </span>
      )}

      {/* Client row */}
      {client && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <User size={11} style={{ color: '#52525b' }} />
          <span className="text-[12px] text-white/55 truncate">{client.name}</span>
        </div>
      )}

      {/* Description (truncated to ~60 chars) */}
      <p
        className="text-[11px] leading-relaxed text-white/35 mb-2.5 overflow-hidden"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        } as CSSProperties}
        title={order.description}
      >
        {order.description.length > 60
          ? order.description.slice(0, 60) + '…'
          : order.description}
      </p>

      {/* Divider */}
      <div
        className="border-t pt-2.5 flex items-center justify-between gap-2"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        {/* Technician */}
        {technician ? (
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{
                background: 'rgba(201,168,76,0.18)',
                color: '#C9A84C',
                border: '1px solid rgba(201,168,76,0.35)',
              }}
            >
              {getInitials(technician.name)}
            </div>
            <span className="text-[11px] text-white/45 truncate">{technician.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Wrench size={11} style={{ color: '#3f3f46' }} />
            <span className="text-[11px] text-white/20 italic">Sin asignar</span>
          </div>
        )}

        {/* Delivery time (dimmed col) or mileage */}
        {dimmed && order.actualDelivery ? (
          <span className="text-[10px] text-white/25 font-mono shrink-0">
            {new Date(order.actualDelivery).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </span>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <Car size={10} style={{ color: '#3f3f46' }} />
            <span className="text-[10px] text-white/20 font-mono">
              {order.mileageIn.toLocaleString()} km
            </span>
          </div>
        )}
      </div>

      {/* Action button */}
      {next && !dimmed && (
        <ActionButton
          status={order.status}
          onAdvance={() => onAdvance(order.id, next)}
        />
      )}
    </Link>
  );
}

// ─── Column component ─────────────────────────────────────────────────────────

interface KanbanColumnProps {
  col: ColumnDef;
  orders: WorkOrder[];
  clients: Client[];
  vehicles: Vehicle[];
  technicians: Technician[];
  onAdvance: (orderId: string, newStatus: OrderStatus) => void;
  isMobileExpanded: boolean;
  onToggleMobile: () => void;
  isMobile: boolean;
}

function KanbanColumn({
  col,
  orders,
  clients,
  vehicles,
  technicians,
  onAdvance,
  isMobileExpanded,
  onToggleMobile,
  isMobile,
}: KanbanColumnProps) {
  const colOrders = orders
    .filter(col.filter)
    .sort((a, b) => {
      const priorityScore = (p: OrderPriority) =>
        p === 'vip' ? 2 : p === 'urgente' ? 1 : 0;
      const diff = priorityScore(b.priority) - priorityScore(a.priority);
      if (diff !== 0) return diff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const headerBar = (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl mb-3 select-none"
      style={{
        background: `linear-gradient(135deg, ${col.accentColor}10, ${col.accentColor}04)`,
        border: `1px solid ${col.accentColor}22`,
        cursor: isMobile ? 'pointer' : 'default',
      }}
      onClick={isMobile ? onToggleMobile : undefined}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: col.accentColor,
              boxShadow: `0 0 6px ${col.accentColor}70`,
            }}
          />
          <span
            className="text-[11px] font-bold tracking-[0.1em] uppercase"
            style={{ color: col.accentColor, fontFamily: 'Anton, sans-serif' }}
          >
            {col.label}
          </span>
        </div>
        {col.sublabel && (
          <span className="hidden lg:block text-[10px] text-white/20 pl-4.5 ml-4.5">
            {col.sublabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-[12px] font-bold font-mono px-2.5 py-0.5 rounded-full"
          style={{
            background: `${col.accentColor}18`,
            color: col.accentColor,
            border: `1px solid ${col.accentColor}25`,
          }}
        >
          {colOrders.length}
        </span>
        {isMobile &&
          (isMobileExpanded ? (
            <ChevronUp size={14} style={{ color: col.accentColor }} />
          ) : (
            <ChevronDown size={14} style={{ color: col.accentColor }} />
          ))}
      </div>
    </div>
  );

  const cardList = (
    <div className="flex flex-col gap-3">
      {colOrders.length === 0 ? (
        col.id === 'delivered_today' ? (
          <EmptyDelivered />
        ) : (
          <EmptyColumn accentColor={col.accentColor} />
        )
      ) : (
        colOrders.map((order) => {
          const client = clients.find((c) => c.id === order.clientId);
          const vehicle = vehicles.find((v) => v.id === order.vehicleId);
          const technician = technicians.find((t) => t.id === order.technicianId);
          return (
            <VehicleCard
              key={order.id}
              order={order}
              client={client}
              vehicle={vehicle}
              technician={technician}
              dimmed={col.dimmed}
              onAdvance={onAdvance}
            />
          );
        })
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="w-full">
        {headerBar}
        {isMobileExpanded && <div className="pb-2">{cardList}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-[260px] flex-1">
      {headerBar}
      <div
        className="flex-1 overflow-y-auto pr-0.5"
        style={{ maxHeight: 'calc(100vh - 220px)' }}
      >
        {cardList}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrackingPage() {
  const { state, dispatch } = useAppContext();

  const [tick, setTick] = useState(0);
  const [lastUpdateAt, setLastUpdateAt] = useState(Date.now());
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({
    pending: true,
    in_process: true,
    ready: true,
    delivered_today: false,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Filters
  const [hideLowPriority, setHideLowPriority] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState<string>('');

  // Detect mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setLastUpdateAt(Date.now());
      setLastUpdateTime(new Date());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Suppress unused tick warning — used to force re-render for elapsed times
  void tick;

  const handleAdvance = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      dispatch({
        type: 'ORDER_STATUS_CHANGE',
        payload: {
          id: orderId,
          status: newStatus,
          note: `Estado actualizado a ${newStatus} desde tablero Kanban`,
        },
      });
    },
    [dispatch]
  );

  const toggleCol = (colId: string) =>
    setExpandedCols((prev) => ({ ...prev, [colId]: !prev[colId] }));

  // Build filtered orders for kanban
  const kanbanOrders = state.orders.filter((o) => {
    // Exclude cancelled and old deliveries
    if (o.status === 'cancelado') return false;
    if (o.status === 'entregado' && !isToday(o.actualDelivery)) return false;

    // Technician filter
    if (selectedTechId && o.technicianId !== selectedTechId) return false;

    // Low priority filter (hide presupuesto/normal that are not yet active)
    if (hideLowPriority && o.priority === 'normal' && o.status === 'presupuesto') return false;

    return true;
  });

  // Stats
  const inShopCount = state.orders.filter(
    (o) => o.status === 'aprobado' || o.status === 'en_proceso' || o.status === 'listo'
  ).length;

  const secondsSinceUpdate = secondsSince(lastUpdateAt);

  // Technicians with orders in the board (for filter selector)
  const activeTechIds = new Set(
    state.orders
      .filter((o) => o.status !== 'cancelado')
      .map((o) => o.technicianId)
      .filter(Boolean)
  );
  const filterableTechnicians = state.technicians.filter((t) => activeTechIds.has(t.id));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A' }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 px-5 lg:px-8 py-4"
        style={{
          background: 'rgba(10,10,10,0.94)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title */}
          <div>
            <h1
              className="text-2xl lg:text-3xl text-white tracking-wider uppercase leading-none"
              style={{ fontFamily: 'Anton, sans-serif' }}
            >
              Seguimiento en Tiempo Real
            </h1>
            <p className="text-[12px] text-white/30 mt-0.5 font-sans">
              Tablero Kanban · WLAS MOTOR
            </p>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* In-shop counter */}
            <div
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
              style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.22)',
              }}
            >
              <Car size={14} style={{ color: '#C9A84C' }} />
              <span
                className="text-[14px] font-bold font-mono"
                style={{ color: '#C9A84C' }}
              >
                {inShopCount}
              </span>
              <span className="text-[11px] text-white/35 hidden sm:inline">
                en taller
              </span>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#34d399' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{ background: '#34d399' }}
                />
              </span>
              <div className="flex flex-col leading-none">
                <span
                  className="text-[11px] font-bold tracking-wider"
                  style={{ color: '#34d399' }}
                >
                  EN VIVO
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <RefreshCw size={9} style={{ color: '#3f3f46' }} />
                  <span className="text-[10px] text-white/20">
                    {formatLastUpdate(secondsSinceUpdate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Last update timestamp */}
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Clock size={11} style={{ color: '#52525b' }} />
              <span className="text-[11px] font-mono text-white/30">
                Última actualización: {formatTimestamp(lastUpdateTime)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div
          className="mt-3 flex items-center gap-3 flex-wrap"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}
        >
          <div className="flex items-center gap-1.5">
            <Filter size={11} style={{ color: '#52525b' }} />
            <span className="text-[11px] text-white/25 uppercase tracking-wider">
              Filtros
            </span>
          </div>

          {/* Toggle low priority */}
          <button
            onClick={() => setHideLowPriority((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer"
            style={{
              background: hideLowPriority
                ? 'rgba(251,191,36,0.12)'
                : 'rgba(255,255,255,0.04)',
              border: hideLowPriority
                ? '1px solid rgba(251,191,36,0.3)'
                : '1px solid rgba(255,255,255,0.07)',
              color: hideLowPriority ? '#fbbf24' : '#71717a',
            }}
          >
            <EyeOff size={11} />
            Ocultar baja prioridad
          </button>

          {/* Technician selector */}
          <div className="relative">
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="appearance-none pl-8 pr-6 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer outline-none"
              style={{
                background: selectedTechId
                  ? 'rgba(201,168,76,0.1)'
                  : 'rgba(255,255,255,0.04)',
                border: selectedTechId
                  ? '1px solid rgba(201,168,76,0.3)'
                  : '1px solid rgba(255,255,255,0.07)',
                color: selectedTechId ? '#C9A84C' : '#71717a',
              }}
            >
              <option value="">Todos los técnicos</option>
              {filterableTechnicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <User
              size={11}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: selectedTechId ? '#C9A84C' : '#52525b' }}
            />
          </div>

          {/* Clear filters button */}
          {(hideLowPriority || selectedTechId) && (
            <button
              onClick={() => {
                setHideLowPriority(false);
                setSelectedTechId('');
              }}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors cursor-pointer underline underline-offset-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </header>

      {/* ── Kanban Board ── */}
      <main className="flex-1 px-4 lg:px-6 py-5">
        {/* Mobile: stacked accordion */}
        {isMobile && (
          <div className="flex flex-col gap-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                orders={kanbanOrders}
                clients={state.clients}
                vehicles={state.vehicles}
                technicians={state.technicians}
                onAdvance={handleAdvance}
                isMobileExpanded={expandedCols[col.id] ?? false}
                onToggleMobile={() => toggleCol(col.id)}
                isMobile={true}
              />
            ))}
          </div>
        )}

        {/* Desktop: 4-column layout */}
        {!isMobile && (
          <div
            className="flex gap-4 items-start"
            style={{ minHeight: 'calc(100vh - 240px)' }}
          >
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                orders={kanbanOrders}
                clients={state.clients}
                vehicles={state.vehicles}
                technicians={state.technicians}
                onAdvance={handleAdvance}
                isMobileExpanded={true}
                onToggleMobile={() => {}}
                isMobile={false}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer status bar ── */}
      <footer
        className="flex items-center justify-between px-6 lg:px-8 py-2.5 text-[10px] text-white/18 font-mono"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span>
          {state.orders.filter((o) => o.status === 'en_proceso' || o.status === 'pausado').length}
          {' '}en proceso
          &nbsp;·&nbsp;
          {state.orders.filter((o) => o.status === 'listo').length}
          {' '}listos para entrega
          &nbsp;·&nbsp;
          {state.orders.filter((o) => isToday(o.actualDelivery) && o.status === 'entregado').length}
          {' '}entregados hoy
        </span>
        <span className="text-white/15">Auto-refresh · 30s</span>
      </footer>
    </div>
  );
}
