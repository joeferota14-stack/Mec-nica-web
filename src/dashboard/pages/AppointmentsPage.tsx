import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Check,
  X,
  CheckCircle,
  ExternalLink,
  Clock,
  User,
  Phone,
  Car,
  Wrench,
  UserCog,
  StickyNote,
  CalendarDays,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  Appointment,
  AppointmentStatus,
} from '../../types/index';

// ─── HELPERS ─────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Jul', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// 8:00 → 18:00, each 30 min = 20 slots
const HOUR_SLOTS: string[] = [];
for (let h = 8; h < 18; h++) {
  HOUR_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  HOUR_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}
// Include 18:00 label
const HOUR_LABELS: string[] = [];
for (let h = 8; h <= 18; h++) {
  HOUR_LABELS.push(`${String(h).padStart(2, '0')}:00`);
}

const TIME_OPTIONS: string[] = [];
for (let h = 8; h < 18; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas' },
];

const SERVICE_OPTIONS = [
  'Mantenimiento',
  'Diagnóstico',
  'Frenos',
  'Cambio de aceite',
  'Aire acondicionado',
  'Suspensión',
  'Motor',
  'Transmisión',
  'Electricidad',
  'Afinación',
  'Otro',
];

// ─── STATUS CONFIG ────────────────────────────────────────────

type StatusConfig = {
  label: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
};

const STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
  pendiente: {
    label: 'Pendiente',
    badgeClass: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    dotClass: 'bg-zinc-400',
    borderClass: 'border-l-zinc-500',
  },
  confirmada: {
    label: 'Confirmada',
    badgeClass: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
    dotClass: 'bg-blue-400',
    borderClass: 'border-l-blue-500',
  },
  completada: {
    label: 'Completada',
    badgeClass: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40',
    dotClass: 'bg-emerald-400',
    borderClass: 'border-l-emerald-500',
  },
  cancelada: {
    label: 'Cancelada',
    badgeClass: 'bg-red-900/40 text-red-300 border border-red-700/40',
    dotClass: 'bg-red-400',
    borderClass: 'border-l-red-500',
  },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────

function StatusBadgeAppt({ status }: { status: AppointmentStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

// ─── MODAL FORM STATE ─────────────────────────────────────────

interface AppointmentFormData {
  clientMode: 'existing' | 'new';
  clientId: string;
  clientName: string;
  clientPhone: string;
  vehicleMode: 'existing' | 'free';
  vehicleId: string;
  vehicleDescription: string;
  serviceType: string;
  serviceCustom: string;
  date: string;
  time: string;
  estimatedDuration: number;
  technicianId: string;
  notes: string;
}

function getDefaultForm(): AppointmentFormData {
  const today = toDateStr(new Date());
  return {
    clientMode: 'existing',
    clientId: '',
    clientName: '',
    clientPhone: '',
    vehicleMode: 'existing',
    vehicleId: '',
    vehicleDescription: '',
    serviceType: 'Mantenimiento',
    serviceCustom: '',
    date: today,
    time: '09:00',
    estimatedDuration: 60,
    technicianId: '',
    notes: '',
  };
}

// ─── NEW APPOINTMENT MODAL ────────────────────────────────────

interface NewAppointmentModalProps {
  onClose: () => void;
}

function NewAppointmentModal({ onClose }: NewAppointmentModalProps) {
  const { state, dispatch } = useAppContext();
  const [form, setForm] = useState<AppointmentFormData>(getDefaultForm());
  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormData, string>>>({});

  const clientVehicles = useMemo(
    () => state.vehicles.filter((v) => v.clientId === form.clientId),
    [state.vehicles, form.clientId],
  );

  function set<K extends keyof AppointmentFormData>(key: K, value: AppointmentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleClientChange(clientId: string) {
    const client = state.clients.find((c) => c.id === clientId);
    set('clientId', clientId);
    if (client) {
      set('clientName', client.name);
      set('clientPhone', client.phone);
    }
    set('vehicleId', '');
    set('vehicleDescription', '');
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (form.clientMode === 'existing' && !form.clientId) e.clientId = 'Selecciona un cliente';
    if (form.clientMode === 'new') {
      if (!form.clientName.trim()) e.clientName = 'Nombre requerido';
      if (!form.clientPhone.trim()) e.clientPhone = 'Teléfono requerido';
    }
    if (form.vehicleMode === 'existing' && !form.vehicleId) e.vehicleId = 'Selecciona un vehículo';
    if (form.vehicleMode === 'free' && !form.vehicleDescription.trim()) e.vehicleDescription = 'Descripción requerida';
    if (!form.date) e.date = 'Fecha requerida';
    if (!form.time) e.time = 'Hora requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const selectedVehicle = state.vehicles.find((v) => v.id === form.vehicleId);
    const vehicleDesc = form.vehicleMode === 'existing' && selectedVehicle
      ? `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year} — ${selectedVehicle.plate}`
      : form.vehicleDescription;

    const serviceType = form.serviceType === 'Otro' ? form.serviceCustom : form.serviceType;

    const apt: Appointment = {
      id: `apt-${Date.now()}`,
      clientId: form.clientMode === 'existing' ? form.clientId || undefined : undefined,
      clientName: form.clientName,
      clientPhone: form.clientPhone,
      vehicleDescription: vehicleDesc,
      vehicleId: form.vehicleMode === 'existing' ? form.vehicleId || undefined : undefined,
      serviceType,
      estimatedDuration: form.estimatedDuration,
      date: form.date,
      time: form.time,
      status: 'pendiente',
      technicianId: form.technicianId || undefined,
      notes: form.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'APPOINTMENT_CREATE', payload: apt });
    onClose();
  }

  const inputClass = 'w-full bg-[#1A1A1A] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]/60 transition-colors placeholder:text-white/30';
  const labelClass = 'block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide';
  const errorClass = 'text-xs text-red-400 mt-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: '#161616' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/08" style={{ background: '#161616' }}>
          <div>
            <h2 className="text-lg font-bold text-white font-display tracking-wide">Nueva Cita</h2>
            <p className="text-xs text-white/40 mt-0.5">Registra una nueva cita en la agenda</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/05 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* CLIENT SECTION */}
          <div className="rounded-xl border border-white/08 p-4 space-y-4" style={{ background: '#0F0F0F' }}>
            <h3 className="text-xs font-semibold text-[#C9A84C] uppercase tracking-widest flex items-center gap-2">
              <User size={13} /> Cliente
            </h3>
            {/* Toggle */}
            <div className="flex gap-2">
              {(['existing', 'new'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => set('clientMode', mode)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    form.clientMode === mode
                      ? 'bg-[#C9A84C]/10 border-[#C9A84C]/40 text-[#C9A84C]'
                      : 'border-white/08 text-white/40 hover:text-white/70'
                  }`}
                >
                  {mode === 'existing' ? 'Cliente existente' : 'Cliente nuevo'}
                </button>
              ))}
            </div>

            {form.clientMode === 'existing' ? (
              <div>
                <label className={labelClass}>Seleccionar cliente</label>
                <select
                  value={form.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Selecciona un cliente —</option>
                  {state.clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                  ))}
                </select>
                {errors.clientId && <p className={errorClass}>{errors.clientId}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => set('clientName', e.target.value)}
                    placeholder="Nombre completo"
                    className={inputClass}
                  />
                  {errors.clientName && <p className={errorClass}>{errors.clientName}</p>}
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input
                    type="text"
                    value={form.clientPhone}
                    onChange={(e) => set('clientPhone', e.target.value)}
                    placeholder="55-XXXX-XXXX"
                    className={inputClass}
                  />
                  {errors.clientPhone && <p className={errorClass}>{errors.clientPhone}</p>}
                </div>
              </div>
            )}
          </div>

          {/* VEHICLE SECTION */}
          <div className="rounded-xl border border-white/08 p-4 space-y-4" style={{ background: '#0F0F0F' }}>
            <h3 className="text-xs font-semibold text-[#C9A84C] uppercase tracking-widest flex items-center gap-2">
              <Car size={13} /> Vehículo
            </h3>

            {form.clientMode === 'existing' && form.clientId && clientVehicles.length > 0 ? (
              <>
                <div className="flex gap-2">
                  {(['existing', 'free'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => set('vehicleMode', mode)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        form.vehicleMode === mode
                          ? 'bg-[#C9A84C]/10 border-[#C9A84C]/40 text-[#C9A84C]'
                          : 'border-white/08 text-white/40 hover:text-white/70'
                      }`}
                    >
                      {mode === 'existing' ? 'Vehículo registrado' : 'Descripción libre'}
                    </button>
                  ))}
                </div>
                {form.vehicleMode === 'existing' ? (
                  <div>
                    <label className={labelClass}>Seleccionar vehículo</label>
                    <select
                      value={form.vehicleId}
                      onChange={(e) => set('vehicleId', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">— Selecciona un vehículo —</option>
                      {clientVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} {v.year} — {v.plate}
                        </option>
                      ))}
                    </select>
                    {errors.vehicleId && <p className={errorClass}>{errors.vehicleId}</p>}
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Descripción del vehículo</label>
                    <input
                      type="text"
                      value={form.vehicleDescription}
                      onChange={(e) => set('vehicleDescription', e.target.value)}
                      placeholder="Marca Modelo Año — Placas"
                      className={inputClass}
                    />
                    {errors.vehicleDescription && <p className={errorClass}>{errors.vehicleDescription}</p>}
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className={labelClass}>Descripción del vehículo</label>
                <input
                  type="text"
                  value={form.vehicleDescription}
                  onChange={(e) => set('vehicleDescription', e.target.value)}
                  placeholder="Ej: Toyota Corolla 2022 — DEF-9012"
                  className={inputClass}
                />
                {errors.vehicleDescription && <p className={errorClass}>{errors.vehicleDescription}</p>}
              </div>
            )}
          </div>

          {/* SERVICE SECTION */}
          <div className="rounded-xl border border-white/08 p-4 space-y-4" style={{ background: '#0F0F0F' }}>
            <h3 className="text-xs font-semibold text-[#C9A84C] uppercase tracking-widest flex items-center gap-2">
              <Wrench size={13} /> Servicio y Programación
            </h3>

            <div>
              <label className={labelClass}>Tipo de servicio</label>
              <select
                value={form.serviceType}
                onChange={(e) => set('serviceType', e.target.value)}
                className={inputClass}
              >
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {form.serviceType === 'Otro' && (
              <div>
                <label className={labelClass}>Describe el servicio</label>
                <input
                  type="text"
                  value={form.serviceCustom}
                  onChange={(e) => set('serviceCustom', e.target.value)}
                  placeholder="Descripción del servicio..."
                  className={inputClass}
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  className={inputClass}
                />
                {errors.date && <p className={errorClass}>{errors.date}</p>}
              </div>
              <div>
                <label className={labelClass}>Hora</label>
                <select
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                  className={inputClass}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.time && <p className={errorClass}>{errors.time}</p>}
              </div>
              <div>
                <label className={labelClass}>Duración est.</label>
                <select
                  value={form.estimatedDuration}
                  onChange={(e) => set('estimatedDuration', Number(e.target.value))}
                  className={inputClass}
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Técnico asignado</label>
              <select
                value={form.technicianId}
                onChange={(e) => set('technicianId', e.target.value)}
                className={inputClass}
              >
                <option value="">— Sin asignar —</option>
                {state.technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.status === 'disponible' ? 'Disponible' : t.status === 'ocupado' ? 'Ocupado' : 'Ausente'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-white/08" style={{ background: '#161616' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/05 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-black bg-[#C9A84C] hover:bg-[#d4b05e] transition-colors shadow-lg shadow-[#C9A84C]/20"
          >
            <Plus size={15} />
            Crear Cita
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL / EDIT MODAL ──────────────────────────────────────

interface DetailModalProps {
  appointment: Appointment;
  onClose: () => void;
}

function DetailModal({ appointment, onClose }: DetailModalProps) {
  const { state, dispatch } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Appointment>>({ ...appointment });

  const technician = state.technicians.find((t) => t.id === appointment.technicianId);

  function changeStatus(status: AppointmentStatus) {
    dispatch({ type: 'APPOINTMENT_STATUS_CHANGE', payload: { id: appointment.id, status } });
    onClose();
  }

  function saveEdit() {
    const updated: Appointment = { ...appointment, ...form } as Appointment;
    dispatch({ type: 'APPOINTMENT_UPDATE', payload: updated });
    setEditing(false);
    onClose();
  }

  const inputClass = 'w-full bg-[#0F0F0F] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]/60 transition-colors';

  const cfg = STATUS_CONFIG[appointment.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: '#161616' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/08" style={{ background: '#161616' }}>
          <div className="flex items-center gap-3">
            <div className={`w-1 h-10 rounded-full ${cfg.dotClass.replace('bg-', 'bg-')}`} style={{ background: appointment.status === 'confirmada' ? '#60a5fa' : appointment.status === 'completada' ? '#34d399' : appointment.status === 'cancelada' ? '#f87171' : '#71717a' }} />
            <div>
              <h2 className="text-base font-bold text-white font-display">{appointment.clientName}</h2>
              <p className="text-xs text-white/40 mt-0.5">{appointment.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadgeAppt status={appointment.status} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/05 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {editing ? (
            /* EDIT MODE */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Cliente</label>
                  <input
                    type="text"
                    value={form.clientName ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Teléfono</label>
                  <input
                    type="text"
                    value={form.clientPhone ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, clientPhone: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Vehículo</label>
                <input
                  type="text"
                  value={form.vehicleDescription ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, vehicleDescription: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Servicio</label>
                <input
                  type="text"
                  value={form.serviceType ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, serviceType: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Fecha</label>
                  <input
                    type="date"
                    value={form.date ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Hora</label>
                  <select
                    value={form.time ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                    className={inputClass}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Duración</label>
                  <select
                    value={form.estimatedDuration ?? 60}
                    onChange={(e) => setForm((p) => ({ ...p, estimatedDuration: Number(e.target.value) }))}
                    className={inputClass}
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Técnico</label>
                <select
                  value={form.technicianId ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, technicianId: e.target.value || undefined }))}
                  className={inputClass}
                >
                  <option value="">— Sin asignar —</option>
                  {state.technicians.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Notas</label>
                <textarea
                  value={form.notes ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value || undefined }))}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveEdit}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#C9A84C] text-black hover:bg-[#d4b05e] transition-colors"
                >
                  Guardar cambios
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 rounded-lg text-sm text-white/50 border border-white/10 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* VIEW MODE */
            <>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow icon={<User size={14} />} label="Cliente" value={appointment.clientName} />
                <InfoRow icon={<Phone size={14} />} label="Teléfono" value={appointment.clientPhone} />
                <InfoRow icon={<CalendarDays size={14} />} label="Fecha" value={formatDate(appointment.date)} />
                <InfoRow icon={<Clock size={14} />} label="Hora" value={`${appointment.time} (${formatDuration(appointment.estimatedDuration)})`} />
                <InfoRow icon={<Car size={14} />} label="Vehículo" value={appointment.vehicleDescription} className="col-span-2" />
                <InfoRow icon={<Wrench size={14} />} label="Servicio" value={appointment.serviceType} className="col-span-2" />
                {technician && (
                  <InfoRow icon={<UserCog size={14} />} label="Técnico" value={technician.name} className="col-span-2" />
                )}
                {appointment.notes && (
                  <InfoRow icon={<StickyNote size={14} />} label="Notas" value={appointment.notes} className="col-span-2" />
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Acciones</p>
                <div className="flex flex-wrap gap-2">
                  {appointment.status === 'pendiente' && (
                    <button
                      onClick={() => changeStatus('confirmada')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-700/40 hover:bg-blue-900/60 transition-colors"
                    >
                      <Check size={13} /> Confirmar
                    </button>
                  )}
                  {appointment.status === 'confirmada' && (
                    <button
                      onClick={() => changeStatus('completada')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 hover:bg-emerald-900/60 transition-colors"
                    >
                      <CheckCircle size={13} /> Completar
                    </button>
                  )}
                  {appointment.status !== 'cancelada' && appointment.status !== 'completada' && (
                    <button
                      onClick={() => changeStatus('cancelada')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/40 text-red-300 border border-red-700/40 hover:bg-red-900/60 transition-colors"
                    >
                      <X size={13} /> Cancelar
                    </button>
                  )}
                  <Link
                    to="/dashboard/orders/new"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/20 transition-colors"
                  >
                    <ExternalLink size={13} /> Crear Orden
                  </Link>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/05 text-white/60 border border-white/10 hover:text-white transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg p-3 border border-white/06 ${className}`} style={{ background: '#0F0F0F' }}>
      <div className="flex items-center gap-1.5 text-white/40 mb-1 text-xs uppercase tracking-wide">
        {icon} {label}
      </div>
      <p className="text-sm text-white leading-snug">{value}</p>
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────

interface ListViewProps {
  appointments: Appointment[];
  technicians: ReturnType<typeof useAppContext>['state']['technicians'];
  onRowClick: (apt: Appointment) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}

function ListView({ appointments, technicians, onRowClick, onStatusChange }: ListViewProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white/30">
        <CalendarDays size={40} className="mb-3 opacity-30" />
        <p className="text-sm">No hay citas con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/08" style={{ background: '#161616' }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/08">
            {['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Vehículo', 'Servicio', 'Duración', 'Técnico', 'Estado', 'Acciones'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap"
                style={{ background: '#111111' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt, idx) => {
            const tech = technicians.find((t) => t.id === apt.technicianId);
            return (
              <tr
                key={apt.id}
                onClick={() => onRowClick(apt)}
                className={`cursor-pointer transition-colors hover:bg-white/03 ${idx !== appointments.length - 1 ? 'border-b border-white/05' : ''}`}
              >
                <td className="px-4 py-3 text-white/70 whitespace-nowrap">{formatDate(apt.date)}</td>
                <td className="px-4 py-3 text-white whitespace-nowrap font-mono text-xs">{apt.time}</td>
                <td className="px-4 py-3 text-white font-medium whitespace-nowrap max-w-[160px] truncate">{apt.clientName}</td>
                <td className="px-4 py-3 text-white/60 whitespace-nowrap font-mono text-xs">{apt.clientPhone}</td>
                <td className="px-4 py-3 text-white/60 max-w-[150px] truncate">{apt.vehicleDescription}</td>
                <td className="px-4 py-3 text-white/80 max-w-[140px] truncate">{apt.serviceType}</td>
                <td className="px-4 py-3 text-white/50 whitespace-nowrap">{formatDuration(apt.estimatedDuration)}</td>
                <td className="px-4 py-3 text-white/60 whitespace-nowrap">{tech?.name ?? <span className="text-white/30 italic">Sin asignar</span>}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadgeAppt status={apt.status} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    {apt.status === 'pendiente' && (
                      <button
                        title="Confirmar"
                        onClick={() => onStatusChange(apt.id, 'confirmada')}
                        className="p-1.5 rounded-md text-blue-400 hover:bg-blue-900/30 transition-colors"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    {apt.status === 'confirmada' && (
                      <button
                        title="Completar"
                        onClick={() => onStatusChange(apt.id, 'completada')}
                        className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-900/30 transition-colors"
                      >
                        <CheckCircle size={13} />
                      </button>
                    )}
                    {apt.status !== 'cancelada' && apt.status !== 'completada' && (
                      <button
                        title="Cancelar"
                        onClick={() => onStatusChange(apt.id, 'cancelada')}
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-900/30 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    )}
                    <Link
                      to="/dashboard/orders/new"
                      title="Crear Orden"
                      className="p-1.5 rounded-md text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── WEEK VIEW ────────────────────────────────────────────────

interface WeekViewProps {
  appointments: Appointment[];
  weekDates: Date[];
  onBlockClick: (apt: Appointment) => void;
}

function WeekView({ appointments, weekDates, onBlockClick }: WeekViewProps) {
  const todayStr = toDateStr(new Date());

  // Group appointments by date
  const byDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const apt of appointments) {
      if (!map[apt.date]) map[apt.date] = [];
      map[apt.date].push(apt);
    }
    return map;
  }, [appointments]);

  // Grid: each row = 30 min slot, 20 rows total (8:00→18:00)
  // Row index = (timeToMinutes(time) - 480) / 30
  const GRID_START = 480; // 8:00 in minutes
  const SLOT_HEIGHT = 48; // px per 30-min slot
  const TOTAL_SLOTS = 20; // 8:00 to 18:00

  return (
    <div className="rounded-xl border border-white/08 overflow-x-auto" style={{ background: '#161616' }}>
      <div style={{ minWidth: 560 }}>
      {/* Day headers */}
      <div className="grid border-b border-white/08" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
        <div style={{ background: '#111111' }} className="p-2" />
        {weekDates.map((d, i) => {
          const dateStr = toDateStr(d);
          const isToday = dateStr === todayStr;
          const count = byDate[dateStr]?.length ?? 0;
          return (
            <div
              key={i}
              style={{ background: '#111111' }}
              className={`p-2 text-center border-l border-white/05 ${isToday ? 'bg-[#C9A84C]/05' : ''}`}
            >
              <p className={`text-xs font-medium uppercase tracking-wide ${isToday ? 'text-[#C9A84C]' : 'text-white/40'}`}>
                {DAY_LABELS[i]}
              </p>
              <p className={`text-sm font-bold mt-0.5 ${isToday ? 'text-[#C9A84C]' : 'text-white'}`}>
                {d.getDate()}
              </p>
              {count > 0 && (
                <div className="flex justify-center mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] font-medium">
                    {count}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable grid body */}
      <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
        <div
          className="grid relative"
          style={{ gridTemplateColumns: '52px repeat(7, 1fr)', minHeight: `${TOTAL_SLOTS * SLOT_HEIGHT}px` }}
        >
          {/* Hour labels column */}
          <div className="relative">
            {HOUR_LABELS.map((label, i) => (
              <div
                key={label}
                className="absolute left-0 right-0 flex items-start justify-end pr-2"
                style={{ top: `${i * SLOT_HEIGHT * 2}px`, height: `${SLOT_HEIGHT}px` }}
              >
                <span className="text-[10px] text-white/30 font-mono leading-none mt-0.5">{label}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((d, dayIdx) => {
            const dateStr = toDateStr(d);
            const isToday = dateStr === todayStr;
            const dayApts = byDate[dateStr] ?? [];

            return (
              <div
                key={dayIdx}
                className={`relative border-l border-white/05 ${isToday ? 'bg-[#C9A84C]/02' : ''}`}
                style={{ minHeight: `${TOTAL_SLOTS * SLOT_HEIGHT}px` }}
              >
                {/* Slot lines */}
                {Array.from({ length: TOTAL_SLOTS }).map((_, slotIdx) => (
                  <div
                    key={slotIdx}
                    className={`absolute left-0 right-0 border-t ${slotIdx % 2 === 0 ? 'border-white/08' : 'border-white/03'}`}
                    style={{ top: `${slotIdx * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                  />
                ))}

                {/* Appointment blocks */}
                {dayApts.map((apt) => {
                  const startMin = timeToMinutes(apt.time);
                  const topOffset = ((startMin - GRID_START) / 30) * SLOT_HEIGHT;
                  const blockHeight = Math.max((apt.estimatedDuration / 30) * SLOT_HEIGHT - 4, SLOT_HEIGHT - 4);
                  const cfg = STATUS_CONFIG[apt.status];

                  if (startMin < GRID_START || startMin >= GRID_START + TOTAL_SLOTS * 30) return null;

                  return (
                    <button
                      key={apt.id}
                      onClick={() => onBlockClick(apt)}
                      className={`absolute left-1 right-1 rounded-md border-l-2 text-left overflow-hidden transition-opacity hover:opacity-90 ${cfg.borderClass}`}
                      style={{
                        top: `${topOffset + 2}px`,
                        height: `${blockHeight}px`,
                        background:
                          apt.status === 'confirmada' ? 'rgba(59,130,246,0.15)' :
                          apt.status === 'completada' ? 'rgba(52,211,153,0.12)' :
                          apt.status === 'cancelada' ? 'rgba(248,113,113,0.10)' :
                          'rgba(113,113,122,0.15)',
                      }}
                    >
                      <div className="px-1.5 py-1">
                        <p className="text-[11px] font-semibold text-white truncate leading-tight">{apt.clientName.split(' ')[0]}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{apt.time}</p>
                        {blockHeight > 40 && (
                          <p className="text-[10px] text-white/40 truncate leading-tight mt-0.5">{apt.serviceType}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────

export default function AppointmentsPage() {
  const { state, dispatch } = useAppContext();

  // View state
  const [view, setView] = useState<'list' | 'week'>('list');
  const [weekAnchor, setWeekAnchor] = useState<Date>(new Date());

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | ''>('');
  const [filterTech, setFilterTech] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);

  const weekLabel = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} – ${last.getDate()} ${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${first.getDate()} ${MONTH_NAMES[first.getMonth()]} – ${last.getDate()} ${MONTH_NAMES[last.getMonth()]} ${first.getFullYear()}`;
  }, [weekDates]);

  const filteredList = useMemo(() => {
    return state.appointments
      .filter((a) => {
        if (filterStatus && a.status !== filterStatus) return false;
        if (filterTech && a.technicianId !== filterTech) return false;
        if (filterDate && a.date !== filterDate) return false;
        return true;
      })
      .sort((a, b) => {
        const da = `${a.date}T${a.time}`;
        const db = `${b.date}T${b.time}`;
        return da < db ? -1 : da > db ? 1 : 0;
      });
  }, [state.appointments, filterStatus, filterTech, filterDate]);

  const weekAppointments = useMemo(() => {
    const weekDateStrs = new Set(weekDates.map(toDateStr));
    return state.appointments.filter((a) => weekDateStrs.has(a.date));
  }, [state.appointments, weekDates]);

  const handleStatusChange = useCallback(
    (id: string, status: AppointmentStatus) => {
      dispatch({ type: 'APPOINTMENT_STATUS_CHANGE', payload: { id, status } });
    },
    [dispatch],
  );

  // Stats
  const stats = useMemo(() => {
    const total = state.appointments.length;
    const hoy = toDateStr(new Date());
    const today = state.appointments.filter((a) => a.date === hoy).length;
    const pendientes = state.appointments.filter((a) => a.status === 'pendiente').length;
    const confirmadas = state.appointments.filter((a) => a.status === 'confirmada').length;
    return { total, today, pendientes, confirmadas };
  }, [state.appointments]);

  const hasActiveFilters = filterStatus !== '' || filterTech !== '' || filterDate !== '';

  return (
    <div className="p-6 lg:p-8 space-y-6" style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-display tracking-wide">Agenda de Citas</h1>
          <p className="text-white/40 text-sm mt-1">Gestión y programación de citas del taller</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-white/10 overflow-hidden" style={{ background: '#161616' }}>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-white/08 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <List size={15} /> Vista Lista
            </button>
            <button
              onClick={() => setView('week')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-l border-white/10 ${
                view === 'week' ? 'bg-white/08 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Calendar size={15} /> Vista Semana
            </button>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-black bg-[#C9A84C] hover:bg-[#d4b05e] transition-colors shadow-lg shadow-[#C9A84C]/20"
          >
            <Plus size={15} />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total citas', value: stats.total, color: 'text-white' },
          { label: 'Hoy', value: stats.today, color: 'text-[#C9A84C]' },
          { label: 'Pendientes', value: stats.pendientes, color: 'text-zinc-400' },
          { label: 'Confirmadas', value: stats.confirmadas, color: 'text-blue-400' },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-white/08 px-4 py-3"
            style={{ background: '#161616' }}
          >
            <p className="text-xs text-white/40 uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`text-2xl font-bold font-display ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── CONTENT ── */}
      {view === 'list' ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-white/08" style={{ background: '#161616' }}>
            <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Filtrar:</span>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AppointmentStatus | '')}
              className="bg-[#0F0F0F] border border-white/10 text-sm text-white/70 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="bg-[#0F0F0F] border border-white/10 text-sm text-white/70 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            >
              <option value="">Todos los técnicos</option>
              {state.technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-[#0F0F0F] border border-white/10 text-sm text-white/70 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            />

            {hasActiveFilters && (
              <button
                onClick={() => { setFilterStatus(''); setFilterTech(''); setFilterDate(''); }}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/05"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}

            <span className="ml-auto text-xs text-white/30">
              {filteredList.length} cita{filteredList.length !== 1 ? 's' : ''}
            </span>
          </div>

          <ListView
            appointments={filteredList}
            technicians={state.technicians}
            onRowClick={setSelectedApt}
            onStatusChange={handleStatusChange}
          />
        </>
      ) : (
        <>
          {/* Week navigation */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/08" style={{ background: '#161616' }}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekAnchor((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/05 transition-colors border border-white/08"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setWeekAnchor(new Date())}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/05 transition-colors border border-white/08"
              >
                Hoy
              </button>
              <button
                onClick={() => setWeekAnchor((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/05 transition-colors border border-white/08"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <p className="text-sm font-semibold text-white/80">{weekLabel}</p>
            <span className="text-xs text-white/30">
              {weekAppointments.length} cita{weekAppointments.length !== 1 ? 's' : ''} esta semana
            </span>
          </div>

          <WeekView
            appointments={weekAppointments}
            weekDates={weekDates}
            onBlockClick={setSelectedApt}
          />
        </>
      )}

      {/* ── MODALS ── */}
      {showNewModal && <NewAppointmentModal onClose={() => setShowNewModal(false)} />}
      {selectedApt && (
        <DetailModal
          appointment={state.appointments.find((a) => a.id === selectedApt.id) ?? selectedApt}
          onClose={() => setSelectedApt(null)}
        />
      )}
    </div>
  );
}
