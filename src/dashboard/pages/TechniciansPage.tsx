import { useState, useRef } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Plus,
  X,
  ChevronDown,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Technician, TechnicianStatus, WorkOrder } from '../../types';
import TechnicianCard from '../components/TechnicianCard';

// ─── helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `tech-${Date.now().toString(36)}`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

const statusConfig: Record<TechnicianStatus, { label: string; color: string; bg: string }> = {
  disponible: { label: 'Disponible', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  ocupado: { label: 'Ocupado', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  ausente: { label: 'Ausente', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

// ─── Add Technician Modal ──────────────────────────────────────────────────────

interface AddTechnicianModalProps {
  onClose: () => void;
  onSave: (t: Technician) => void;
}

function AddTechnicianModal({ onClose, onSave }: AddTechnicianModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hireDate, setHireDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const specInputRef = useRef<HTMLInputElement>(null);

  function addSpecialty() {
    const val = specInput.trim();
    if (val && !specialties.includes(val)) {
      setSpecialties((prev) => [...prev, val]);
    }
    setSpecInput('');
    specInputRef.current?.focus();
  }

  function removeSpecialty(spec: string) {
    setSpecialties((prev) => prev.filter((s) => s !== spec));
  }

  function handleSpecKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    } else if (e.key === 'Backspace' && specInput === '' && specialties.length > 0) {
      setSpecialties((prev) => prev.slice(0, -1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { name?: string } = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const newTech: Technician = {
      id: generateId(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      specialty: specialties,
      status: 'disponible',
      efficiency: 80,
      completedOrders: 0,
      hireDate: hireDate,
    };
    onSave(newTech);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 6,
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl flex flex-col"
        style={{
          backgroundColor: '#161616',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div>
            <h2
              className="text-white text-lg"
              style={{ fontFamily: 'Anton, sans-serif', letterSpacing: '0.02em' }}
            >
              Agregar Técnico
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
              Nuevo miembro del equipo
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre completo *</label>
            <input
              type="text"
              placeholder="Ej: Carlos Hernández López"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              style={{
                ...inputStyle,
                borderColor: errors.name ? '#f87171' : 'rgba(255,255,255,0.1)',
              }}
            />
            {errors.name && (
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#f87171', fontFamily: 'Inter, sans-serif' }}>
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input
              type="tel"
              placeholder="Ej: 55-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Fecha de contratación */}
          <div>
            <label style={labelStyle}>Fecha de contratación</label>
            <input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              style={{
                ...inputStyle,
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Especialidades */}
          <div>
            <label style={labelStyle}>Especialidades</label>
            <div
              className="flex flex-wrap gap-1.5 rounded-xl p-2.5 cursor-text"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                minHeight: 44,
              }}
              onClick={() => specInputRef.current?.focus()}
            >
              {specialties.map((spec) => (
                <span
                  key={spec}
                  className="flex items-center gap-1 rounded-md pl-2 pr-1 py-0.5 text-xs"
                  style={{
                    backgroundColor: 'rgba(201,168,76,0.18)',
                    color: '#C9A84C',
                    border: '1px solid rgba(201,168,76,0.3)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(spec)}
                    className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                ref={specInputRef}
                type="text"
                placeholder={specialties.length === 0 ? 'Escribe y presiona Enter…' : ''}
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
                onKeyDown={handleSpecKeyDown}
                onBlur={addSpecialty}
                className="flex-1 min-w-24 bg-transparent text-xs outline-none"
                style={{ color: '#fff', fontFamily: 'Inter, sans-serif', minWidth: 120 }}
              />
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
              Presiona Enter o Tab para agregar cada especialidad
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl py-3 text-sm font-bold transition-all duration-150 hover:brightness-110 active:scale-95"
              style={{
                backgroundColor: '#C9A84C',
                color: '#0A0A0A',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Guardar Técnico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Assign Order Modal ───────────────────────────────────────────────────────

interface AssignOrderModalProps {
  order: WorkOrder;
  technicians: Technician[];
  onAssign: (orderId: string, techId: string) => void;
  onClose: () => void;
}

function AssignOrderModal({ order, technicians, onAssign, onClose }: AssignOrderModalProps) {
  const [selectedTech, setSelectedTech] = useState('');
  const available = technicians.filter((t) => t.status === 'disponible');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl"
        style={{
          backgroundColor: '#161616',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div>
            <h2 className="text-white text-base" style={{ fontFamily: 'Anton, sans-serif' }}>
              Asignar Técnico
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
              Orden #{order.id.replace('order-', '')}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
            {order.description}
          </p>

          {available.length === 0 ? (
            <div
              className="rounded-xl p-4 text-center text-sm"
              style={{
                backgroundColor: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                color: '#f87171',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              No hay técnicos disponibles en este momento.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {available.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTech(t.id)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                  style={{
                    backgroundColor:
                      selectedTech === t.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                    border:
                      selectedTech === t.id
                        ? '1px solid rgba(201,168,76,0.4)'
                        : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: 'rgba(52,211,153,0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(52,211,153,0.3)',
                      fontFamily: 'Anton, sans-serif',
                    }}
                  >
                    {t.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {t.name}
                    </span>
                    <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                      {t.specialty.slice(0, 2).join(', ')}
                    </span>
                  </div>
                  <span
                    className="ml-auto text-[11px] font-semibold shrink-0"
                    style={{ color: '#34d399', fontFamily: 'Inter, sans-serif' }}
                  >
                    {t.efficiency}%
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Cancelar
            </button>
            <button
              disabled={!selectedTech}
              onClick={() => selectedTech && onAssign(order.id, selectedTech)}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                backgroundColor: '#C9A84C',
                color: '#0A0A0A',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Asignar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TechniciansPage() {
  const { state, dispatch } = useAppContext();
  const { technicians, orders, vehicles } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [assignOrderModal, setAssignOrderModal] = useState<WorkOrder | null>(null);
  const [tableOpen, setTableOpen] = useState(true);
  const [assignOpen, setAssignOpen] = useState(true);

  // KPI counts
  const countDisponible = technicians.filter((t) => t.status === 'disponible').length;
  const countOcupado = technicians.filter((t) => t.status === 'ocupado').length;
  const countAusente = technicians.filter((t) => t.status === 'ausente').length;

  // Orders without technician and with active statuses
  const unassignedOrders = orders.filter(
    (o) =>
      !o.technicianId &&
      !['entregado', 'cancelado'].includes(o.status)
  );

  function getActiveOrderForTech(tech: Technician): WorkOrder | undefined {
    if (!tech.activeOrderId) return undefined;
    return orders.find((o) => o.id === tech.activeOrderId);
  }

  function handleStatusChange(techId: string, newStatus: TechnicianStatus) {
    const tech = technicians.find((t) => t.id === techId);
    if (!tech || tech.status === newStatus) return;
    dispatch({
      type: 'TECHNICIAN_UPDATE',
      payload: {
        ...tech,
        status: newStatus,
        activeOrderId: newStatus !== 'ocupado' ? undefined : tech.activeOrderId,
      },
    });
  }

  function handleAddTechnician(newTech: Technician) {
    // TECHNICIAN_UPDATE upserts (create if not found)
    dispatch({ type: 'TECHNICIAN_UPDATE', payload: newTech });
    setShowAddModal(false);
  }

  function handleAssignOrder(orderId: string, techId: string) {
    const order = orders.find((o) => o.id === orderId);
    const tech = technicians.find((t) => t.id === techId);
    if (!order || !tech) return;

    // Update order with technician
    dispatch({
      type: 'ORDER_UPDATE',
      payload: { ...order, technicianId: techId, updatedAt: new Date().toISOString() },
    });
    // Mark technician as busy
    dispatch({
      type: 'TECHNICIAN_UPDATE',
      payload: { ...tech, status: 'ocupado', activeOrderId: orderId },
    });
    setAssignOrderModal(null);
  }

  function getVehicleLabel(order: WorkOrder): string {
    const v = vehicles.find((v) => v.id === order.vehicleId);
    return v ? `${v.brand} ${v.model} ${v.year}` : order.vehicleId;
  }

  // Avg efficiency for display
  const avgEfficiency =
    technicians.length > 0
      ? Math.round(technicians.reduce((sum, t) => sum + t.efficiency, 0) / technicians.length)
      : 0;

  // This month orders per tech
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  function ordersThisMonth(techId: string): number {
    return orders.filter(
      (o) =>
        o.technicianId === techId &&
        o.createdAt >= monthStart &&
        o.status !== 'cancelado'
    ).length;
  }

  // Last activity for technician (most recent order they worked on)
  function lastActivity(techId: string): string {
    const techOrders = orders
      .filter((o) => o.technicianId === techId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (techOrders.length === 0) return '—';
    return formatDate(techOrders[0].updatedAt);
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-white leading-none"
              style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, letterSpacing: '0.01em' }}
            >
              Equipo de Técnicos
            </h1>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Gestión y productividad del personal de taller
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:brightness-110 active:scale-95 shrink-0"
            style={{ backgroundColor: '#C9A84C', color: '#0A0A0A' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Agregar Técnico
          </button>
        </div>

        {/* ── KPI row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Disponibles ahora',
              value: countDisponible,
              icon: <UserCheck size={20} />,
              color: '#34d399',
              bg: 'rgba(52,211,153,0.08)',
              glow: '0 0 24px rgba(52,211,153,0.1)',
            },
            {
              label: 'Ocupados',
              value: countOcupado,
              icon: <Clock size={20} />,
              color: '#fbbf24',
              bg: 'rgba(251,191,36,0.08)',
              glow: '0 0 24px rgba(251,191,36,0.1)',
            },
            {
              label: 'Ausentes',
              value: countAusente,
              icon: <UserX size={20} />,
              color: '#f87171',
              bg: 'rgba(248,113,113,0.08)',
              glow: '0 0 24px rgba(248,113,113,0.1)',
            },
            {
              label: 'Total técnicos',
              value: technicians.length,
              icon: <Users size={20} />,
              color: '#C9A84C',
              bg: 'rgba(201,168,76,0.08)',
              glow: '0 0 24px rgba(201,168,76,0.1)',
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                backgroundColor: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: kpi.glow,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {kpi.label}
                </span>
                <span style={{ color: kpi.color, opacity: 0.75 }}>{kpi.icon}</span>
              </div>
              <span
                className="leading-none"
                style={{ fontFamily: 'Anton, sans-serif', fontSize: 36, color: kpi.color }}
              >
                {kpi.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Technician Cards Grid ──────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Vista general del equipo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map((tech) => (
              <TechnicianCard
                key={tech.id}
                technician={tech}
                activeOrder={getActiveOrderForTech(tech)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </section>

        {/* ── Productivity Table ─────────────────────────────────── */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#161616',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Table header / toggle */}
          <button
            className="w-full flex items-center justify-between px-6 py-4"
            style={{ borderBottom: tableOpen ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
            onClick={() => setTableOpen((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <Wrench size={16} style={{ color: '#C9A84C' }} />
              <span
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Tabla de Productividad
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
              >
                Efic. prom. {avgEfficiency}%
              </span>
            </div>
            <ChevronDown
              size={16}
              style={{
                color: 'rgba(255,255,255,0.35)',
                transform: tableOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {tableOpen && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {[
                      'Técnico',
                      'Especialidades',
                      'Órdenes este mes',
                      'Tasa de eficiencia',
                      'Estado actual',
                      'Última actividad',
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {technicians.map((tech, idx) => {
                    const sc = statusConfig[tech.status];
                    const monthly = ordersThisMonth(tech.id);
                    const lastAct = lastActivity(tech.id);
                    const effColor =
                      tech.efficiency >= 90
                        ? '#34d399'
                        : tech.efficiency >= 75
                        ? '#fbbf24'
                        : '#f87171';

                    return (
                      <tr
                        key={tech.id}
                        style={{
                          borderBottom:
                            idx < technicians.length - 1
                              ? '1px solid rgba(255,255,255,0.04)'
                              : 'none',
                        }}
                      >
                        {/* Técnico */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
                              style={{
                                width: 34,
                                height: 34,
                                backgroundColor: 'rgba(201,168,76,0.12)',
                                color: '#C9A84C',
                                border: '1px solid rgba(201,168,76,0.25)',
                                fontFamily: 'Anton, sans-serif',
                                letterSpacing: '0.02em',
                              }}
                            >
                              {tech.name
                                .split(' ')
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{tech.name}</p>
                              {tech.phone && (
                                <p
                                  className="text-[11px]"
                                  style={{ color: 'rgba(255,255,255,0.35)' }}
                                >
                                  {tech.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Especialidades */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {tech.specialty.slice(0, 2).map((s) => (
                              <span
                                key={s}
                                className="text-[11px] rounded px-1.5 py-0.5"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.06)',
                                  color: 'rgba(255,255,255,0.5)',
                                  border: '1px solid rgba(255,255,255,0.07)',
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {tech.specialty.length > 2 && (
                              <span
                                className="text-[11px] rounded px-1.5 py-0.5"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.04)',
                                  color: 'rgba(255,255,255,0.3)',
                                }}
                              >
                                +{tech.specialty.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Órdenes este mes */}
                        <td className="px-6 py-4">
                          <span
                            className="font-bold"
                            style={{ color: monthly > 0 ? '#C9A84C' : 'rgba(255,255,255,0.35)', fontFamily: 'Anton, sans-serif', fontSize: 16 }}
                          >
                            {monthly}
                          </span>
                        </td>

                        {/* Tasa de eficiencia */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[120px]">
                            <div
                              className="flex-1 rounded-full overflow-hidden"
                              style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${tech.efficiency}%`,
                                  backgroundColor: effColor,
                                  boxShadow: `0 0 6px ${effColor}66`,
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-bold shrink-0"
                              style={{ color: effColor, minWidth: 36 }}
                            >
                              {tech.efficiency}%
                            </span>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span
                            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold w-fit"
                            style={{
                              backgroundColor: sc.bg,
                              color: sc.color,
                              border: `1px solid ${sc.color}33`,
                            }}
                          >
                            <span
                              className="rounded-full shrink-0"
                              style={{
                                width: 6,
                                height: 6,
                                backgroundColor: sc.color,
                                boxShadow: `0 0 5px ${sc.color}`,
                              }}
                            />
                            {sc.label}
                          </span>
                        </td>

                        {/* Última actividad */}
                        <td className="px-6 py-4">
                          <span
                            className="text-sm"
                            style={{ color: 'rgba(255,255,255,0.45)' }}
                          >
                            {lastAct}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Unassigned Orders ──────────────────────────────────── */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#161616',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            className="w-full flex items-center justify-between px-6 py-4"
            style={{ borderBottom: assignOpen ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
            onClick={() => setAssignOpen((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={16} style={{ color: unassignedOrders.length > 0 ? '#fbbf24' : 'rgba(255,255,255,0.35)' }} />
              <span
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Órdenes sin Técnico Asignado
              </span>
              {unassignedOrders.length > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
                >
                  {unassignedOrders.length} pendiente{unassignedOrders.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              style={{
                color: 'rgba(255,255,255,0.35)',
                transform: assignOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {assignOpen && (
            <div className="p-6">
              {unassignedOrders.length === 0 ? (
                <div
                  className="rounded-xl p-6 text-center"
                  style={{
                    backgroundColor: 'rgba(52,211,153,0.06)',
                    border: '1px solid rgba(52,211,153,0.15)',
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: '#34d399' }}>
                    Todas las órdenes activas tienen técnico asignado
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(52,211,153,0.6)' }}>
                    El equipo está completamente organizado
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {unassignedOrders.map((order) => {
                    const priorityColor =
                      order.priority === 'urgente'
                        ? '#f87171'
                        : order.priority === 'vip'
                        ? '#C9A84C'
                        : 'rgba(255,255,255,0.35)';

                    const statusLabel: Record<string, string> = {
                      presupuesto: 'Presupuesto',
                      aprobado: 'Aprobado',
                      en_proceso: 'En proceso',
                      pausado: 'Pausado',
                      listo: 'Listo',
                    };

                    return (
                      <div
                        key={order.id}
                        className="rounded-xl p-4 flex flex-col gap-3"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className="text-xs font-bold uppercase tracking-wider"
                              style={{ color: '#C9A84C' }}
                            >
                              #{order.id.replace('order-', '')}
                            </p>
                            <p
                              className="text-sm font-semibold text-white mt-0.5 leading-snug"
                              style={{ lineClamp: 2 }}
                            >
                              {getVehicleLabel(order)}
                            </p>
                          </div>
                          <span
                            className="shrink-0 text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5"
                            style={{
                              color: priorityColor,
                              backgroundColor: `${priorityColor}1a`,
                              border: `1px solid ${priorityColor}33`,
                            }}
                          >
                            {order.priority}
                          </span>
                        </div>
                        <p
                          className="text-xs leading-relaxed line-clamp-2"
                          style={{ color: 'rgba(255,255,255,0.45)' }}
                        >
                          {order.description}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: 'rgba(255,255,255,0.4)' }}
                          >
                            {statusLabel[order.status] ?? order.status}
                          </span>
                          <button
                            onClick={() => setAssignOrderModal(order)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                            style={{ backgroundColor: '#C9A84C', color: '#0A0A0A' }}
                          >
                            <Users size={12} strokeWidth={2.5} />
                            Asignar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {showAddModal && (
        <AddTechnicianModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTechnician}
        />
      )}
      {assignOrderModal && (
        <AssignOrderModal
          order={assignOrderModal}
          technicians={technicians}
          onAssign={handleAssignOrder}
          onClose={() => setAssignOrderModal(null)}
        />
      )}
    </div>
  );
}
