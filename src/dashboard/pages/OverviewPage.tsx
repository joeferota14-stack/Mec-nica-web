import { Link } from 'react-router-dom';
import {
  ClipboardList,
  DollarSign,
  Car,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  Package,
  Plus,
  ChevronRight,
  Clock,
  Wrench,
  User,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import KPICard from '../components/KPICard';
import type { OrderStatus, InventoryAlertLevel } from '../../types';

// ─── Helpers ─────────────────────────────────────────────────

function formatMXN(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ─── Status Badge ─────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  presupuesto: { label: 'Presupuesto', bg: 'rgba(113,113,122,0.18)', text: '#a1a1aa' },
  aprobado:    { label: 'Aprobado',    bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  en_proceso:  { label: 'En proceso',  bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
  pausado:     { label: 'Pausado',     bg: 'rgba(249,115,22,0.15)',  text: '#fb923c' },
  listo:       { label: 'Listo',       bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
  entregado:   { label: 'Entregado',   bg: 'rgba(113,113,122,0.12)', text: '#71717a' },
  cancelado:   { label: 'Cancelado',   bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-sans"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Alert Level Badge ────────────────────────────────────────

function AlertBadge({ level }: { level: InventoryAlertLevel }) {
  const cfg =
    level === 'critico'
      ? { label: 'Crítico', bg: 'rgba(248,113,113,0.15)', text: '#f87171' }
      : { label: 'Bajo',    bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-sans"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Appointment Status Badge ─────────────────────────────────

function AptBadge({ status }: { status: string }) {
  const isConfirmed = status === 'confirmada';
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-sans"
      style={
        isConfirmed
          ? { backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }
          : { backgroundColor: 'rgba(251,191,36,0.15)', color: '#fbbf24' }
      }
    >
      {isConfirmed ? 'Confirmada' : 'Pendiente'}
    </span>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────

function Section({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[#C9A84C]">{icon}</span>
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-widest font-sans" style={{ letterSpacing: '0.08em' }}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-white/25 text-sm font-sans">
      {message}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function OverviewPage() {
  const { state } = useAppContext();
  const { orders, transactions, inventory, appointments, clients, vehicles, technicians } = state;

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  // ── KPI calculations ──
  const ordersActive = orders.filter(o => ['aprobado', 'en_proceso'].includes(o.status)).length;
  const ordersToday = orders.filter(o => o.createdAt.startsWith(today)).length;
  const revenueToday = transactions
    .filter(t => t.type === 'ingreso' && t.date.startsWith(today))
    .reduce((sum, t) => sum + t.amount, 0);
  const revenueMonth = transactions
    .filter(t => t.type === 'ingreso' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = orders
    .filter(o => o.paymentStatus !== 'pagado' && o.status !== 'cancelado')
    .reduce((sum, o) => sum + (o.total - o.amountPaid), 0);
  const vehiclesInShop = orders.filter(o => ['aprobado', 'en_proceso', 'listo'].includes(o.status)).length;
  const lowStockAlerts = inventory.filter(i => i.alertLevel !== 'ok').length;

  // ── Active orders (last 5 aprobado/en_proceso) ──
  const activeOrders = orders
    .filter(o => ['aprobado', 'en_proceso'].includes(o.status))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // ── Low/critical stock items ──
  const stockAlerts = inventory
    .filter(i => i.alertLevel === 'bajo' || i.alertLevel === 'critico')
    .sort((a, b) => {
      if (a.alertLevel === 'critico' && b.alertLevel !== 'critico') return -1;
      if (b.alertLevel === 'critico' && a.alertLevel !== 'critico') return 1;
      return a.stock - b.stock;
    })
    .slice(0, 5);

  // ── Upcoming appointments (confirmed or pending, future) ──
  const upcomingAppointments = appointments
    .filter(a => (a.status === 'confirmada' || a.status === 'pendiente') && a.date >= today)
    .sort((a, b) => {
      const da = a.date + 'T' + a.time;
      const db = b.date + 'T' + b.time;
      return da.localeCompare(db);
    })
    .slice(0, 3);

  // ── Lookups ──
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
  const techMap = Object.fromEntries(technicians.map(t => [t.id, t]));

  // ── Formatted date for header ──
  const displayDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="px-6 py-7 max-w-screen-xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl text-white leading-tight"
            style={{ fontFamily: 'Anton, sans-serif', letterSpacing: '0.02em' }}
          >
            Panel de Control
          </h1>
          <p className="text-sm text-white/35 font-sans mt-1 capitalize">{displayDate}</p>
        </div>

        <Link
          to="/dashboard/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold font-sans transition-all hover:brightness-110 active:scale-95 shrink-0"
          style={{ backgroundColor: '#C9A84C', color: '#0A0A0A' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Nueva Orden
        </Link>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Órdenes Activas"
          value={ordersActive}
          subtitle="aprobadas + en proceso"
          icon={<Wrench size={20} strokeWidth={1.8} />}
          variant="gold"
          trend={{ value: 12, label: 'vs. ayer' }}
        />
        <KPICard
          title="Órdenes Hoy"
          value={ordersToday}
          subtitle="creadas hoy"
          icon={<ClipboardList size={20} strokeWidth={1.8} />}
          variant="default"
        />
        <KPICard
          title="Ingresos Hoy"
          value={revenueToday > 0 ? formatMXN(revenueToday) : '$0'}
          subtitle="pagos recibidos"
          icon={<DollarSign size={20} strokeWidth={1.8} />}
          variant="emerald"
        />
        <KPICard
          title="Ingresos del Mes"
          value={formatMXN(revenueMonth)}
          subtitle={currentMonth.replace('-', ' / ')}
          icon={<TrendingUp size={20} strokeWidth={1.8} />}
          variant="emerald"
          trend={{ value: 8, label: 'vs. mes pasado' }}
        />
        <KPICard
          title="Cobros Pendientes"
          value={formatMXN(pendingPayments)}
          subtitle="total sin cobrar"
          icon={<DollarSign size={20} strokeWidth={1.8} />}
          variant="amber"
        />
        <KPICard
          title="Vehículos en Taller"
          value={vehiclesInShop}
          subtitle="en taller ahora"
          icon={<Car size={20} strokeWidth={1.8} />}
          variant="default"
        />
        <KPICard
          title="Alertas de Stock"
          value={lowStockAlerts}
          subtitle={lowStockAlerts === 0 ? 'inventario OK' : 'artículos bajos o críticos'}
          icon={<AlertTriangle size={20} strokeWidth={1.8} />}
          variant={lowStockAlerts === 0 ? 'default' : lowStockAlerts > 3 ? 'red' : 'amber'}
        />
        <KPICard
          title="Próximas Citas"
          value={upcomingAppointments.length}
          subtitle="confirmadas y pendientes"
          icon={<CalendarClock size={20} strokeWidth={1.8} />}
          variant="default"
        />
      </div>

      {/* ── Bottom 3-section grid ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Active Orders Table ── (span 2 cols on xl) */}
        <div className="xl:col-span-2">
          <Section
            title="Órdenes Activas"
            icon={<Wrench size={16} strokeWidth={2} />}
            action={
              <Link
                to="/dashboard/orders"
                className="flex items-center gap-1 text-xs text-white/35 hover:text-[#C9A84C] font-sans transition-colors"
              >
                Ver todas <ChevronRight size={13} />
              </Link>
            }
          >
            {activeOrders.length === 0 ? (
              <EmptyState message="No hay órdenes activas en este momento" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['ID', 'Vehículo', 'Cliente', 'Técnico', 'Estado', 'Total'].map(col => (
                        <th
                          key={col}
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/25"
                          style={{ letterSpacing: '0.08em' }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeOrders.map(order => {
                      const vehicle = vehicleMap[order.vehicleId];
                      const client = clientMap[order.clientId];
                      const tech = order.technicianId ? techMap[order.technicianId] : null;
                      return (
                        <tr
                          key={order.id}
                          className="group hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <Link
                              to={`/dashboard/orders/${order.id}`}
                              className="text-[#C9A84C] hover:text-[#d4b560] font-medium transition-colors"
                            >
                              #{order.id.replace('order-', '')}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5">
                            {vehicle ? (
                              <div>
                                <p className="text-white/80 font-medium leading-tight">
                                  {vehicle.brand} {vehicle.model}
                                </p>
                                <p className="text-white/30 text-xs">{vehicle.plate} · {vehicle.year}</p>
                              </div>
                            ) : (
                              <span className="text-white/30">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-white/70 truncate max-w-[140px]">
                              {client ? client.name.split(' ').slice(0, 2).join(' ') : '—'}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            {tech ? (
                              <p className="text-white/60 truncate max-w-[120px]">
                                {tech.name.split(' ').slice(0, 2).join(' ')}
                              </p>
                            ) : (
                              <span className="text-white/25 text-xs">Sin asignar</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-white/80 font-medium font-display" style={{ fontFamily: 'Anton, sans-serif', fontSize: '0.95rem' }}>
                              {formatMXN(order.total)}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

        {/* ── Right column: Stock Alerts + Appointments ── */}
        <div className="flex flex-col gap-6">

          {/* Stock Alerts */}
          <Section
            title="Alertas de Stock"
            icon={<Package size={16} strokeWidth={2} />}
            action={
              <Link
                to="/dashboard/inventory"
                className="flex items-center gap-1 text-xs text-white/35 hover:text-[#C9A84C] font-sans transition-colors"
              >
                Inventario <ChevronRight size={13} />
              </Link>
            }
          >
            {stockAlerts.length === 0 ? (
              <EmptyState message="Inventario en niveles óptimos" />
            ) : (
              <div className="divide-y divide-white/5">
                {stockAlerts.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3.5 gap-3 hover:bg-white/[0.03] transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-white/75 text-sm font-medium font-sans truncate leading-tight">
                        {item.name}
                      </p>
                      <p className="text-white/30 text-xs font-sans mt-0.5">
                        Stock: <span className={item.alertLevel === 'critico' ? 'text-red-400 font-semibold' : 'text-amber-400 font-semibold'}>{item.stock}</span>
                        {' '}/ mín. {item.minStock} {item.unit}
                      </p>
                    </div>
                    <AlertBadge level={item.alertLevel} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Upcoming Appointments */}
          <Section
            title="Próximas Citas"
            icon={<CalendarClock size={16} strokeWidth={2} />}
            action={
              <Link
                to="/dashboard/appointments"
                className="flex items-center gap-1 text-xs text-white/35 hover:text-[#C9A84C] font-sans transition-colors"
              >
                Ver agenda <ChevronRight size={13} />
              </Link>
            }
          >
            {upcomingAppointments.length === 0 ? (
              <EmptyState message="No hay citas próximas" />
            ) : (
              <div className="divide-y divide-white/5">
                {upcomingAppointments.map(apt => (
                  <div key={apt.id} className="px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 text-white/35 text-xs font-sans">
                        <Clock size={11} strokeWidth={2} />
                        <span>{formatDate(apt.date)} · {apt.time}</span>
                      </div>
                      <AptBadge status={apt.status} />
                    </div>
                    <p className="text-white/75 text-sm font-medium font-sans leading-tight">
                      {apt.serviceType}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <User size={11} strokeWidth={2} className="text-white/25" />
                      <p className="text-white/40 text-xs font-sans">{apt.clientName}</p>
                    </div>
                    <p className="text-white/25 text-xs font-sans mt-0.5 truncate">{apt.vehicleDescription}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
