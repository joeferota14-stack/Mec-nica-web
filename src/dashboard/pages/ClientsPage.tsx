import { useState, useMemo } from 'react';
import { Search, UserPlus, Users, Phone, Mail, FileText, Edit2, X, Plus, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Client } from '../../types';

const inputCls = 'w-full px-3 py-2.5 text-sm text-white rounded-lg outline-none transition-all placeholder-white/20';
const inputStyle = { background: '#111', border: '1px solid rgba(255,255,255,0.1)' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  rfc: string;
  address: string;
  notes: string;
}

const EMPTY_FORM: FormState = { name: '', phone: '', email: '', rfc: '', address: '', notes: '' };

function toForm(c: Client): FormState {
  return {
    name: c.name,
    phone: c.phone,
    email: c.email ?? '',
    rfc: c.rfc ?? '',
    address: c.address ?? '',
    notes: c.notes ?? '',
  };
}

export default function ClientsPage() {
  const { state, dispatch } = useAppContext();
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.clients;
    return state.clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        (c.rfc?.toLowerCase().includes(q) ?? false)
    );
  }, [state.clients, query]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(c: Client, e: React.MouseEvent) {
    e.stopPropagation();
    setEditing(c);
    setForm(toForm(c));
    setErrors({});
    setShowModal(true);
  }

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Requerido';
    if (!form.phone.trim()) e.phone = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    if (editing) {
      dispatch({
        type: 'CLIENT_UPDATE',
        payload: {
          ...editing,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          rfc: form.rfc.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
        },
      });
    } else {
      dispatch({
        type: 'CLIENT_CREATE',
        payload: {
          id: `c-${Date.now()}`,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          rfc: form.rfc.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
          createdAt: new Date().toISOString(),
        },
      });
    }
    setShowModal(false);
    setEditing(null);
  }

  function getClientStats(clientId: string) {
    const vehicles = state.vehicles.filter((v) => v.clientId === clientId);
    const orders = state.orders.filter((o) => o.clientId === clientId);
    const totalSpent = orders.reduce((acc, o) => acc + o.amountPaid, 0);
    return { vehicles: vehicles.length, orders: orders.length, totalSpent };
  }

  const detailClient = selectedClient
    ? state.clients.find((c) => c.id === selectedClient.id) ?? null
    : null;

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ background: '#0A0A0A' }}>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1
              className="text-white uppercase tracking-tight"
              style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
            >
              Clientes
            </h1>
            <span
              className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
            >
              {state.clients.length}
            </span>
          </div>
          <p className="text-white/40 text-sm">
            {filtered.length !== state.clients.length
              ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`
              : 'Todos los clientes registrados'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, RFC…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 rounded-xl outline-none"
              style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 whitespace-nowrap"
            style={{ background: '#C9A84C', color: '#000' }}
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, #C9A84C 0%, rgba(201,168,76,0.2) 50%, transparent 100%)' }} />

      {/* ── List ── */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((client) => {
            const stats = getClientStats(client.id);
            return (
              <div
                key={client.id}
                onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:border-white/10"
                style={{
                  background: selectedClient?.id === client.id ? 'rgba(201,168,76,0.06)' : '#111',
                  border: selectedClient?.id === client.id
                    ? '1px solid rgba(201,168,76,0.25)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
                >
                  {client.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{client.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-white/45">
                      <Phone className="w-3 h-3" />{client.phone}
                    </span>
                    {client.email && (
                      <span className="flex items-center gap-1 text-xs text-white/45">
                        <Mail className="w-3 h-3" />{client.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm">{stats.vehicles}</p>
                    <p className="text-white/40 text-xs">vehículos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm">{stats.orders}</p>
                    <p className="text-white/40 text-xs">órdenes</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => openEdit(client, e)}
                    className="p-2 rounded-lg transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <ChevronRight
                    className="w-4 h-4 transition-transform"
                    style={{
                      color: 'rgba(255,255,255,0.2)',
                      transform: selectedClient?.id === client.id ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Users className="w-9 h-9" style={{ color: 'rgba(255,255,255,0.18)' }} />
          </div>
          <h3 className="text-white/60 text-lg font-semibold mb-2">
            {query ? 'Sin resultados' : 'Sin clientes registrados'}
          </h3>
          <p className="text-white/25 text-sm max-w-xs mb-5">
            {query ? `No se encontró ningún cliente con "${query}".` : 'Agrega tu primer cliente para comenzar.'}
          </p>
          {!query && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-full transition-all hover:opacity-90"
              style={{ background: '#C9A84C', color: '#000' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Cliente
            </button>
          )}
        </div>
      )}

      {/* ── Detail panel (expandable) ── */}
      {detailClient && (() => {
        const stats = getClientStats(detailClient.id);
        const clientVehicles = state.vehicles.filter((v) => v.clientId === detailClient.id);
        return (
          <div
            className="mt-3 p-5 rounded-xl"
            style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-3">Información de contacto</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: <Phone className="w-3.5 h-3.5" />, label: detailClient.phone },
                    detailClient.email && { icon: <Mail className="w-3.5 h-3.5" />, label: detailClient.email },
                    detailClient.rfc && { icon: <FileText className="w-3.5 h-3.5" />, label: `RFC: ${detailClient.rfc}` },
                    detailClient.address && { icon: <FileText className="w-3.5 h-3.5" />, label: detailClient.address },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <span style={{ color: '#C9A84C' }}>{(item as { icon: React.ReactNode; label: string }).icon}</span>
                      {(item as { icon: React.ReactNode; label: string }).label}
                    </div>
                  ))}
                  {detailClient.notes && (
                    <p className="text-xs text-white/40 mt-2 italic">"{detailClient.notes}"</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-3">Vehículos ({stats.vehicles})</p>
                {clientVehicles.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {clientVehicles.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                      >
                        <span className="text-sm text-white">{v.brand} {v.model} {v.year}</span>
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}
                        >
                          {v.plate}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/30">Sin vehículos registrados</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                  <UserPlus className="w-4 h-4" style={{ color: '#C9A84C' }} />
                </div>
                <h2 className="text-white font-bold text-lg">
                  {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 flex flex-col gap-5">
              <Field label="Nombre completo *">
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                />
                {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
              </Field>

              <Field label="Teléfono *">
                <input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                />
                {errors.phone && <span className="text-xs text-red-400">{errors.phone}</span>}
              </Field>

              <Field label="Correo electrónico">
                <input
                  type="email"
                  placeholder="juan@email.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="RFC / Tax ID">
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={form.rfc}
                    onChange={(e) => set('rfc', e.target.value.toUpperCase())}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Dirección">
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Notas">
                <textarea
                  rows={3}
                  placeholder="Observaciones opcionales…"
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  className={inputCls}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-white/50 hover:text-white transition-colors rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90"
                style={{ background: '#C9A84C', color: '#000' }}
              >
                {editing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editing ? 'Guardar cambios' : 'Registrar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
