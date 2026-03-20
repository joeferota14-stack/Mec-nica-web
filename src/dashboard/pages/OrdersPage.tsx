import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  ClipboardList,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { OrderStatus, OrderPriority } from '../../types/index';
import StatusBadge from '../components/StatusBadge';

const PAGE_SIZE = 10;

const ALL_STATUSES: OrderStatus[] = [
  'presupuesto',
  'aprobado',
  'en_proceso',
  'pausado',
  'listo',
  'entregado',
  'cancelado',
];

const ALL_PRIORITIES: OrderPriority[] = ['normal', 'urgente', 'vip'];

const PRIORITY_LABELS: Record<OrderPriority, string> = {
  normal: 'Normal',
  urgente: 'Urgente',
  vip: 'VIP',
};

const PRIORITY_STYLES: Record<OrderPriority, string> = {
  normal: 'text-white/50',
  urgente: 'text-amber-400',
  vip: 'text-[#C9A84C] font-bold',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function OrdersPage() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<OrderPriority | ''>('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return state.orders.filter((order) => {
      const vehicle = state.vehicles.find((v) => v.id === order.vehicleId);
      const client = state.clients.find((c) => c.id === order.clientId);
      const tech = state.technicians.find((t) => t.id === order.technicianId);

      const matchSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        vehicle?.plate.toLowerCase().includes(q) ||
        vehicle?.brand.toLowerCase().includes(q) ||
        vehicle?.model.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q) ||
        tech?.name.toLowerCase().includes(q);

      const matchStatus = !statusFilter || order.status === statusFilter;
      const matchPriority = !priorityFilter || order.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [state.orders, state.vehicles, state.clients, state.technicians, search, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange() {
    setPage(1);
  }

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: '#0A0A0A' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1
            className="text-3xl text-white leading-none tracking-tight"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            Órdenes de Trabajo
          </h1>
          <p className="text-sm text-white/40 mt-1 font-sans">
            {filtered.length} {filtered.length === 1 ? 'orden' : 'órdenes'} encontradas
          </p>
        </div>
        <Link
          to="/dashboard/orders/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold font-sans text-black transition-opacity hover:opacity-90 shrink-0"
          style={{ backgroundColor: '#C9A84C' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Nueva Orden
        </Link>
      </div>

      {/* ── Filters ── */}
      <div
        className="flex flex-wrap gap-3 mb-5 p-4 rounded-xl"
        style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por ID, placa, cliente, técnico..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 font-sans focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrderStatus | '');
            handleFilterChange();
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 font-sans focus:outline-none focus:border-white/25 transition-colors cursor-pointer"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s} style={{ backgroundColor: '#161616' }}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value as OrderPriority | '');
            handleFilterChange();
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 font-sans focus:outline-none focus:border-white/25 transition-colors cursor-pointer"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          <option value="">Todas las prioridades</option>
          {ALL_PRIORITIES.map((p) => (
            <option key={p} value={p} style={{ backgroundColor: '#161616' }}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <ClipboardList size={40} className="text-white/15" />
            <p className="text-white/30 text-sm font-sans">No se encontraron órdenes</p>
            <Link
              to="/dashboard/orders/new"
              className="text-[#C9A84C] text-sm font-semibold hover:underline font-sans"
            >
              Crear primera orden
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['ID', 'Vehículo / Placa', 'Cliente', 'Técnico', 'Estado', 'Prioridad', 'Total', 'Fecha', ''].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left text-[11px] uppercase tracking-widest text-white/30 font-semibold px-4 py-3 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => {
                  const vehicle = state.vehicles.find((v) => v.id === order.vehicleId);
                  const client = state.clients.find((c) => c.id === order.clientId);
                  const tech = state.technicians.find((t) => t.id === order.technicianId);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                      className="cursor-pointer transition-colors group"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      {/* ID */}
                      <td className="px-4 py-3.5 font-mono text-[#C9A84C] text-xs font-semibold whitespace-nowrap">
                        {order.id}
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {vehicle ? (
                          <div>
                            <p className="text-white font-medium text-sm">
                              {vehicle.brand} {vehicle.model} {vehicle.year}
                            </p>
                            <p className="text-white/40 text-xs font-mono mt-0.5">{vehicle.plate}</p>
                          </div>
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-white/80 text-sm">{client?.name ?? '—'}</p>
                      </td>

                      {/* Technician */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-white/60 text-sm">{tech?.name ?? <span className="text-white/25 italic">Sin asignar</span>}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={order.status} size="sm" />
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`text-xs font-semibold ${PRIORITY_STYLES[order.priority]}`}>
                          {PRIORITY_LABELS[order.priority]}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-white font-semibold tabular-nums">
                          {formatCurrency(order.total)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-white/40 text-xs">{formatDate(order.createdAt)}</span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/orders/${order.id}`);
                          }}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[#C9A84C] transition-colors font-semibold"
                        >
                          <Eye size={13} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-white/30 font-sans">
            Página {page} de {totalPages} — {filtered.length} resultados
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans text-white/60 disabled:opacity-30 transition-colors hover:enabled:bg-white/8"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans text-white/60 disabled:opacity-30 transition-colors hover:enabled:bg-white/8"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
