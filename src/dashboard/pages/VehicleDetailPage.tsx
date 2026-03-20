import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Fuel,
  Zap,
  Flame,
  Hash,
  Palette,
  Gauge,
  Settings2,
  User,
  Phone,
  Mail,
  ExternalLink,
  Plus,
  Edit3,
  X,
  ChevronRight,
  Calendar,
  Wrench,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Save,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Vehicle, OrderStatus, PaymentStatus } from '../../types';

// ── Helpers ─────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

const STATUS_META: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  presupuesto:  { label: 'Presupuesto',  bg: 'rgba(255,255,255,0.07)',  color: 'rgba(255,255,255,0.5)' },
  aprobado:     { label: 'Aprobado',     bg: 'rgba(201,168,76,0.15)',   color: '#C9A84C' },
  en_proceso:   { label: 'En proceso',   bg: 'rgba(59,130,246,0.15)',   color: '#60a5fa' },
  pausado:      { label: 'Pausado',      bg: 'rgba(234,179,8,0.15)',    color: '#facc15' },
  listo:        { label: 'Listo',        bg: 'rgba(52,211,153,0.15)',   color: '#34d399' },
  entregado:    { label: 'Entregado',    bg: 'rgba(52,211,153,0.08)',   color: 'rgba(52,211,153,0.6)' },
  cancelado:    { label: 'Cancelado',    bg: 'rgba(239,68,68,0.10)',    color: '#f87171' },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: '#f87171' },
  parcial:   { label: 'Parcial',   color: '#facc15' },
  pagado:    { label: 'Pagado',    color: '#34d399' },
};

const FUEL_LABEL: Record<string, string> = {
  gasolina: 'Gasolina',
  diesel: 'Diésel',
  hibrido: 'Híbrido',
  electrico: 'Eléctrico',
};

const TRANSMISSION_LABEL: Record<string, string> = {
  manual: 'Manual',
  automatica: 'Automática',
  cvt: 'CVT',
};

function FuelIcon({ type }: { type: string }) {
  if (type === 'hibrido' || type === 'electrico') return <Zap className="w-4 h-4" style={{ color: '#34d399' }} />;
  if (type === 'diesel') return <Fuel className="w-4 h-4" style={{ color: '#C9A84C' }} />;
  return <Flame className="w-4 h-4" style={{ color: '#f97316' }} />;
}

// ── Edit Modal ───────────────────────────────────────────────
interface EditModalProps {
  vehicle: Vehicle;
  onSave: (updated: Vehicle) => void;
  onClose: () => void;
}

function EditModal({ vehicle, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<Vehicle>({ ...vehicle });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  const inputStyle: React.CSSProperties = {
    background: '#0A0A0A',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    padding: '0.5rem 0.75rem',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 6,
  };

  const fieldset = (label: string, name: keyof Vehicle, type = 'text') => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name as string}
        type={type}
        value={form[name] as string | number ?? ''}
        onChange={handleChange}
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <Edit3 className="w-4 h-4" style={{ color: '#C9A84C' }} />
            <h2 className="text-white font-semibold text-base">Editar Vehículo</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {fieldset('Marca', 'brand')}
            {fieldset('Modelo', 'model')}
            {fieldset('Año', 'year', 'number')}
            {fieldset('Placa', 'plate')}
            {fieldset('VIN', 'vin')}
            {fieldset('Color', 'color')}
            {fieldset('Km inicial', 'mileage', 'number')}
          </div>

          {/* Fuel select */}
          <div>
            <label style={labelStyle}>Combustible</label>
            <select
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <option value="gasolina">Gasolina</option>
              <option value="diesel">Diésel</option>
              <option value="hibrido">Híbrido</option>
              <option value="electrico">Eléctrico</option>
            </select>
          </div>

          {/* Transmission select */}
          <div>
            <label style={labelStyle}>Transmisión</label>
            <select
              name="transmission"
              value={form.transmission}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <option value="manual">Manual</option>
              <option value="automatica">Automática</option>
              <option value="cvt">CVT</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes ?? ''}
              onChange={handleChange}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: '#C9A84C', color: '#000' }}
            >
              <Save className="w-4 h-4" />
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const vehicle = state.vehicles.find((v) => v.id === id);
  const client = vehicle ? state.clients.find((c) => c.id === vehicle.clientId) : null;
  const vehicleOrders = useMemo(() => {
    if (!vehicle) return [];
    return [...state.orders.filter((o) => o.vehicleId === vehicle.id)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.orders, vehicle]);

  const stats = useMemo(() => {
    const totalSpent = vehicleOrders.reduce((sum, o) => sum + o.amountPaid, 0);
    const totalFull = vehicleOrders.reduce((sum, o) => sum + o.total, 0);
    const avg = vehicleOrders.length > 0 ? totalFull / vehicleOrders.length : 0;
    const lastService = vehicleOrders[0]?.createdAt ?? null;
    return { totalVisits: vehicleOrders.length, lastService, totalSpent, avg };
  }, [vehicleOrders]);

  function handleSaveVehicle(updated: Vehicle) {
    dispatch({ type: 'VEHICLE_UPDATE', payload: updated });
    setShowEditModal(false);
  }

  // ── 404 ──
  if (!vehicle) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen text-center px-6"
        style={{ background: '#0A0A0A' }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Car className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
        <h1
          className="uppercase text-white mb-3"
          style={{ fontFamily: 'Anton, sans-serif', fontSize: '2.5rem' }}
        >
          Vehículo no encontrado
        </h1>
        <p className="text-white/35 mb-8 max-w-xs">
          El vehículo con ID <span className="font-mono text-white/50">{id}</span> no existe en el sistema.
        </p>
        <button
          onClick={() => navigate('/dashboard/vehicles')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: '#C9A84C', color: '#000' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Vehículos
        </button>
      </div>
    );
  }

  const techs = state.technicians;

  return (
    <>
      {/* ── Edit Modal ── */}
      {showEditModal && (
        <EditModal
          vehicle={vehicle}
          onSave={handleSaveVehicle}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <div className="min-h-full" style={{ background: '#0A0A0A' }}>

        {/* ── Top gold accent ── */}
        <div
          className="h-[2px]"
          style={{ background: 'linear-gradient(90deg, #C9A84C 0%, rgba(201,168,76,0.3) 60%, transparent 100%)' }}
        />

        <div className="p-6 md:p-8 max-w-5xl mx-auto">

          {/* ── Breadcrumb / Back ── */}
          <div className="flex items-center gap-2 mb-8 text-sm text-white/30">
            <Link
              to="/dashboard/vehicles"
              className="flex items-center gap-1.5 hover:text-white/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Vehículos
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/50 font-mono">{vehicle.plate}</span>
          </div>

          {/* ── Vehicle hero header ── */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-6"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              {/* Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1
                    className="text-white uppercase leading-none"
                    style={{
                      fontFamily: 'Anton, sans-serif',
                      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {vehicle.brand}
                  </h1>
                  <span
                    className="font-mono text-sm font-bold px-3 py-1.5 rounded-lg self-center"
                    style={{
                      background: 'rgba(201,168,76,0.12)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      color: '#C9A84C',
                      letterSpacing: '0.12em',
                    }}
                  >
                    {vehicle.plate}
                  </span>
                </div>
                <p
                  className="uppercase leading-none mb-1"
                  style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 'clamp(1.25rem, 3vw, 2rem)',
                    color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {vehicle.model}
                </p>
                <p className="text-white/30 text-sm font-medium tracking-widest">
                  {vehicle.year}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to={`/dashboard/orders/new?vehicleId=${vehicle.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: '#C9A84C', color: '#000' }}
                >
                  <Plus className="w-4 h-4" />
                  Nueva Orden
                </Link>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="h-px my-6" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* ── Vehicle specs grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  icon: <FuelIcon type={vehicle.fuelType} />,
                  label: 'Combustible',
                  value: FUEL_LABEL[vehicle.fuelType],
                },
                {
                  icon: <Settings2 className="w-4 h-4" style={{ color: '#C9A84C' }} />,
                  label: 'Transmisión',
                  value: TRANSMISSION_LABEL[vehicle.transmission],
                },
                {
                  icon: <Gauge className="w-4 h-4" style={{ color: '#C9A84C' }} />,
                  label: 'Km inicial',
                  value: vehicle.mileage.toLocaleString('es-MX'),
                },
                {
                  icon: <Palette className="w-4 h-4" style={{ color: '#C9A84C' }} />,
                  label: 'Color',
                  value: vehicle.color ?? '—',
                },
                {
                  icon: <Hash className="w-4 h-4" style={{ color: '#C9A84C' }} />,
                  label: 'VIN',
                  value: vehicle.vin ? (
                    <span className="font-mono text-[11px] break-all">{vehicle.vin}</span>
                  ) : '—',
                },
                {
                  icon: <Calendar className="w-4 h-4" style={{ color: '#C9A84C' }} />,
                  label: 'Registro',
                  value: formatDate(vehicle.createdAt),
                },
              ].map((spec, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">{spec.icon}</div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{spec.label}</p>
                  <p className="text-white text-sm font-semibold leading-snug">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* ── Notes ── */}
            {vehicle.notes && (
              <div
                className="mt-4 rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">Notas del vehículo</p>
                <p className="text-white/55 text-sm leading-relaxed">{vehicle.notes}</p>
              </div>
            )}
          </div>

          {/* ── Owner info ── */}
          {client && (
            <div
              className="rounded-2xl p-5 mb-6"
              style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4" style={{ color: '#C9A84C' }} />
                <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Propietario</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base mb-1">{client.name}</p>
                  {client.rfc && (
                    <p className="text-white/35 text-xs font-mono">RFC: {client.rfc}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
                    {client.phone}
                  </a>
                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
                      {client.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Summary stats ── */}
          {(() => {
            const statItems: Array<{ icon: ReactNode; label: string; display: string }> = [
              {
                icon: <Wrench className="w-5 h-5" style={{ color: '#C9A84C' }} />,
                label: 'Total de visitas',
                display: String(stats.totalVisits),
              },
              {
                icon: <Clock className="w-5 h-5" style={{ color: '#60a5fa' }} />,
                label: 'Último servicio',
                display: stats.lastService ? formatDate(stats.lastService) : 'Sin historial',
              },
              {
                icon: <DollarSign className="w-5 h-5" style={{ color: '#34d399' }} />,
                label: 'Gasto total acumulado',
                display: formatCurrency(stats.totalSpent),
              },
              {
                icon: <BarChart3 className="w-5 h-5" style={{ color: '#f97316' }} />,
                label: 'Promedio por visita',
                display: formatCurrency(stats.avg),
              },
            ];
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {statItems.map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4"
                    style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="mb-3">{stat.icon}</div>
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{stat.label}</p>
                    <p className="text-white font-bold text-lg leading-none">{stat.display}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Order history ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Section header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ background: '#161616', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" style={{ color: '#C9A84C' }} />
                <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
                  Historial de Órdenes
                </h2>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(201,168,76,0.12)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    color: '#C9A84C',
                  }}
                >
                  {vehicleOrders.length}
                </span>
              </div>
            </div>

            {vehicleOrders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                style={{ background: '#161616' }}
              >
                <Wrench className="w-10 h-10 mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
                <p className="text-white/30 text-sm">Este vehículo no tiene órdenes de trabajo registradas.</p>
                <Link
                  to={`/dashboard/orders/new?vehicleId=${vehicle.id}`}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: '#C9A84C', color: '#000' }}
                >
                  <Plus className="w-4 h-4" />
                  Crear primera orden
                </Link>
              </div>
            ) : (
              <div style={{ background: '#161616' }}>
                {vehicleOrders.map((order, idx) => {
                  const statusMeta = STATUS_META[order.status];
                  const paymentMeta = PAYMENT_META[order.paymentStatus];
                  const tech = order.technicianId
                    ? techs.find((t) => t.id === order.technicianId)
                    : null;
                  const isLast = idx === vehicleOrders.length - 1;

                  return (
                    <div
                      key={order.id}
                      style={{
                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Link
                        to={`/dashboard/orders/${order.id}`}
                        className="group flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 transition-colors"
                        style={{ display: 'flex' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        {/* Left: ID + date */}
                        <div className="flex items-center gap-4 md:w-40 shrink-0">
                          <div>
                            <p
                              className="font-mono text-xs font-bold"
                              style={{ color: '#C9A84C' }}
                            >
                              #{order.id.replace('order-', '')}
                            </p>
                            <p className="text-[11px] text-white/30">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>

                        {/* Center: description + tech */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-medium line-clamp-1 mb-0.5">
                            {order.description}
                          </p>
                          {tech && (
                            <p className="text-[11px] text-white/30">
                              Técnico: {tech.name}
                            </p>
                          )}
                        </div>

                        {/* Right: badges + amounts + arrow */}
                        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                          {/* Status badge */}
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={{ background: statusMeta.bg, color: statusMeta.color }}
                          >
                            {statusMeta.label}
                          </span>

                          {/* Payment badge */}
                          <span
                            className="text-xs font-semibold whitespace-nowrap"
                            style={{ color: paymentMeta.color }}
                          >
                            {paymentMeta.label}
                          </span>

                          {/* Total */}
                          <div className="text-right">
                            <p className="text-white font-bold text-sm">{formatCurrency(order.total)}</p>
                            {order.amountPaid < order.total && order.amountPaid > 0 && (
                              <p className="text-[10px] text-white/30">
                                Pagado: {formatCurrency(order.amountPaid)}
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <ExternalLink
                            className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity"
                            style={{ color: '#C9A84C' }}
                          />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Bottom spacer ── */}
          <div className="h-12" />
        </div>
      </div>
    </>
  );
}
