import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Car, Plus, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import VehicleCard from '../components/VehicleCard';
import { Vehicle, FuelType, TransmissionType } from '../../types';

const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'electrico', label: 'Eléctrico' },
];

const TRANSMISSION_OPTIONS: { value: TransmissionType; label: string }[] = [
  { value: 'automatica', label: 'Automática' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
];

const CURRENT_YEAR = new Date().getFullYear();

interface FormState {
  clientId: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  vin: string;
  color: string;
  mileage: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  notes: string;
}

const EMPTY_FORM: FormState = {
  clientId: '',
  brand: '',
  model: '',
  year: String(CURRENT_YEAR),
  plate: '',
  vin: '',
  color: '',
  mileage: '0',
  fuelType: 'gasolina',
  transmission: 'automatica',
  notes: '',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 text-sm text-white rounded-lg outline-none transition-all placeholder-white/20';
const inputStyle = {
  background: '#111',
  border: '1px solid rgba(255,255,255,0.1)',
};

export default function VehiclesPage() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const enriched = useMemo(() => {
    return state.vehicles.map((v) => {
      const client = state.clients.find((c) => c.id === v.clientId);
      const vehicleOrders = state.orders.filter((o) => o.vehicleId === v.id);
      const sorted = [...vehicleOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        vehicle: v,
        client,
        orderCount: vehicleOrders.length,
        lastOrderDate: sorted[0]?.createdAt,
      };
    });
  }, [state.vehicles, state.clients, state.orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter(({ vehicle, client }) => {
      return (
        vehicle.plate.toLowerCase().includes(q) ||
        vehicle.brand.toLowerCase().includes(q) ||
        vehicle.model.toLowerCase().includes(q) ||
        (client?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [enriched, query]);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.clientId) e.clientId = 'Selecciona un cliente';
    if (!form.brand.trim()) e.brand = 'Requerido';
    if (!form.model.trim()) e.model = 'Requerido';
    const y = Number(form.year);
    if (!form.year || isNaN(y) || y < 1900 || y > CURRENT_YEAR + 1) e.year = 'Año inválido';
    if (!form.plate.trim()) e.plate = 'Requerido';
    const m = Number(form.mileage);
    if (isNaN(m) || m < 0) e.mileage = 'Valor inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      clientId: form.clientId,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      plate: form.plate.trim().toUpperCase(),
      vin: form.vin.trim() || undefined,
      color: form.color.trim() || undefined,
      mileage: Number(form.mileage),
      fuelType: form.fuelType,
      transmission: form.transmission,
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'VEHICLE_CREATE', payload: newVehicle });
    setShowModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function openModal() {
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  }

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
              Vehículos Registrados
            </h1>
            <span
              className="text-sm font-bold px-3 py-1 rounded-full"
              style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#C9A84C',
              }}
            >
              {state.vehicles.length}
            </span>
          </div>
          <p className="text-white/40 text-sm">
            {filtered.length !== state.vehicles.length
              ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
              : 'Todos los vehículos del sistema'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            />
            <input
              type="text"
              placeholder="Buscar placa, marca, cliente…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 rounded-xl outline-none transition-all"
              style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          {/* Add button */}
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 whitespace-nowrap"
            style={{ background: '#C9A84C', color: '#000' }}
          >
            <Plus className="w-4 h-4" />
            Nuevo Vehículo
          </button>
        </div>
      </div>

      {/* ── Gold accent line ── */}
      <div
        className="h-px mb-8"
        style={{ background: 'linear-gradient(90deg, #C9A84C 0%, rgba(201,168,76,0.2) 50%, transparent 100%)' }}
      />

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ vehicle, client, orderCount, lastOrderDate }) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              client={client}
              orderCount={orderCount}
              lastOrderDate={lastOrderDate}
              onClick={() => navigate(`/dashboard/vehicles/${vehicle.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Car className="w-9 h-9" style={{ color: 'rgba(255,255,255,0.18)' }} />
          </div>
          <h3 className="text-white/60 text-lg font-semibold mb-2">
            {query ? 'Sin resultados' : 'Sin vehículos registrados'}
          </h3>
          <p className="text-white/25 text-sm max-w-xs">
            {query
              ? `No se encontró ningún vehículo que coincida con "${query}".`
              : 'Agrega el primer vehículo con el botón "Nuevo Vehículo".'}
          </p>
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="mt-5 text-xs font-semibold px-5 py-2 rounded-full transition-all hover:opacity-80"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
            >
              Limpiar búsqueda
            </button>
          ) : (
            <button
              onClick={openModal}
              className="mt-5 flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-full transition-all hover:opacity-90"
              style={{ background: '#C9A84C', color: '#000' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Vehículo
            </button>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                  <Car className="w-4 h-4" style={{ color: '#C9A84C' }} />
                </div>
                <h2 className="text-white font-bold text-lg">Nuevo Vehículo</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto p-6 flex flex-col gap-5">

              {/* Cliente */}
              <Field label="Cliente *">
                {state.clients.length === 0 ? (
                  <p className="text-xs text-amber-400/80 py-2">
                    No hay clientes registrados. Ve a Clientes y crea uno primero.
                  </p>
                ) : (
                  <select
                    value={form.clientId}
                    onChange={(e) => set('clientId', e.target.value)}
                    className={inputCls}
                    style={{ ...inputStyle, color: form.clientId ? '#fff' : 'rgba(255,255,255,0.3)' }}
                  >
                    <option value="">Seleccionar cliente…</option>
                    {state.clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
                {errors.clientId && <span className="text-xs text-red-400">{errors.clientId}</span>}
              </Field>

              {/* Marca / Modelo */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Marca *">
                  <input
                    type="text"
                    placeholder="Toyota, Ford, Honda…"
                    value={form.brand}
                    onChange={(e) => set('brand', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                  {errors.brand && <span className="text-xs text-red-400">{errors.brand}</span>}
                </Field>
                <Field label="Modelo *">
                  <input
                    type="text"
                    placeholder="Corolla, F-150, Civic…"
                    value={form.model}
                    onChange={(e) => set('model', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                  {errors.model && <span className="text-xs text-red-400">{errors.model}</span>}
                </Field>
              </div>

              {/* Año / Color */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Año *">
                  <input
                    type="number"
                    placeholder={String(CURRENT_YEAR)}
                    value={form.year}
                    onChange={(e) => set('year', e.target.value)}
                    min={1900}
                    max={CURRENT_YEAR + 1}
                    className={inputCls}
                    style={inputStyle}
                  />
                  {errors.year && <span className="text-xs text-red-400">{errors.year}</span>}
                </Field>
                <Field label="Color">
                  <input
                    type="text"
                    placeholder="Blanco, Negro, Rojo…"
                    value={form.color}
                    onChange={(e) => set('color', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Placa / VIN */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Placa *">
                  <input
                    type="text"
                    placeholder="ABC-123"
                    value={form.plate}
                    onChange={(e) => set('plate', e.target.value.toUpperCase())}
                    className={inputCls}
                    style={inputStyle}
                  />
                  {errors.plate && <span className="text-xs text-red-400">{errors.plate}</span>}
                </Field>
                <Field label="VIN / Serie">
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={form.vin}
                    onChange={(e) => set('vin', e.target.value.toUpperCase())}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Combustible / Transmisión / Kilometraje */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Combustible *">
                  <select
                    value={form.fuelType}
                    onChange={(e) => set('fuelType', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    {FUEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Transmisión *">
                  <select
                    value={form.transmission}
                    onChange={(e) => set('transmission', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    {TRANSMISSION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Kilometraje">
                  <input
                    type="number"
                    placeholder="0"
                    value={form.mileage}
                    onChange={(e) => set('mileage', e.target.value)}
                    min={0}
                    className={inputCls}
                    style={inputStyle}
                  />
                  {errors.mileage && <span className="text-xs text-red-400">{errors.mileage}</span>}
                </Field>
              </div>

              {/* Notas */}
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

            {/* Modal footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-white/50 hover:text-white transition-colors rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={state.clients.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#C9A84C', color: '#000' }}
              >
                <Plus className="w-4 h-4" />
                Registrar Vehículo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
