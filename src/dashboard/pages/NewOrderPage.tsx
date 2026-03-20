import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, Package, Wrench, Hammer, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  OrderPriority,
  OrderStatus,
  FuelType,
  LineItemType,
  WorkOrder,
  OrderLineItem,
  OrderTimelineEvent,
  Client,
  Vehicle,
} from '../../types/index';

// ─── Constants ────────────────────────────────────────────────

const PRIORITY_OPTIONS: { value: OrderPriority; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'vip', label: 'VIP' },
];

const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'electrico', label: 'Eléctrico' },
];

const LINE_ITEM_TYPES: { value: LineItemType; label: string; icon: React.ReactNode }[] = [
  { value: 'servicio', label: 'Servicio', icon: <Wrench size={13} /> },
  { value: 'refaccion', label: 'Refacción', icon: <Package size={13} /> },
  { value: 'mano_de_obra', label: 'Mano de Obra', icon: <Hammer size={13} /> },
];

// ─── Types ─────────────────────────────────────────────────────

interface DraftLineItem {
  id: string;
  description: string;
  type: LineItemType;
  quantity: number;
  unitPrice: number;
  inventoryItemId?: string;
}

interface Step1Data {
  vehicleMode: 'existing' | 'new';
  vehicleId: string;
  // New vehicle + client fields
  clientName: string;
  clientPhone: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  mileage: string;
  fuelType: FuelType;
}

interface Step2Data {
  description: string;
  technicianId: string;
  priority: OrderPriority;
  estimatedDelivery: string;
  mileageIn: string;
}

interface Step3Data {
  lineItems: DraftLineItem[];
  discount: string;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

function genId() {
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const TAX_RATE = 0.16;

// ─── Subcomponent: StepIndicator ──────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Vehículo', 'Descripción', 'Líneas', 'Confirmar'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={stepNum} className="flex items-center gap-0 flex-1">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sans transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'text-black'
                    : 'text-white/25 border border-white/15'
                }`}
                style={isActive ? { backgroundColor: '#C9A84C' } : undefined}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide uppercase font-sans whitespace-nowrap ${
                  isActive ? 'text-[#C9A84C]' : isDone ? 'text-emerald-400' : 'text-white/25'
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {stepNum < total && (
              <div
                className="h-px flex-1 mx-2 mt-0 -translate-y-2.5"
                style={{ backgroundColor: isDone ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Subcomponent: SectionCard ────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 mb-5"
      style={{ backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <h3 className="text-xs uppercase tracking-widest font-semibold text-white/40 font-sans mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Subcomponent: Field ──────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-white/50 font-sans">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20 w-full';

const selectClass =
  'bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-white/30 transition-colors w-full cursor-pointer';

// ─── Main Component ───────────────────────────────────────────

export default function NewOrderPage() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Step 1
  const [s1, setS1] = useState<Step1Data>({
    vehicleMode: 'existing',
    vehicleId: '',
    clientName: '',
    clientPhone: '',
    brand: '',
    model: '',
    year: '',
    plate: '',
    mileage: '',
    fuelType: 'gasolina',
  });

  // Step 2
  const [s2, setS2] = useState<Step2Data>({
    description: '',
    technicianId: '',
    priority: 'normal',
    estimatedDelivery: '',
    mileageIn: '',
  });

  // Step 3
  const [s3, setS3] = useState<Step3Data>({
    lineItems: [],
    discount: '0',
  });

  // Line item form
  const [showLineForm, setShowLineForm] = useState(false);
  const [draftLine, setDraftLine] = useState<DraftLineItem>({
    id: genId(),
    description: '',
    type: 'servicio',
    quantity: 1,
    unitPrice: 0,
    inventoryItemId: '',
  });

  // Vehicle search
  const [vehicleSearch, setVehicleSearch] = useState('');

  // ── Derived values ──
  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.toLowerCase();
    if (!q) return state.vehicles.slice(0, 20);
    return state.vehicles.filter((v) => {
      const client = state.clients.find((c) => c.id === v.clientId);
      return (
        v.plate.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q)
      );
    });
  }, [state.vehicles, state.clients, vehicleSearch]);

  const selectedVehicle = state.vehicles.find((v) => v.id === s1.vehicleId);
  const selectedClient = selectedVehicle
    ? state.clients.find((c) => c.id === selectedVehicle.clientId)
    : null;

  const subtotal = s3.lineItems.reduce((acc, li) => acc + li.quantity * li.unitPrice, 0);
  const discountAmt = parseFloat(s3.discount) || 0;
  const taxBase = subtotal - discountAmt;
  const tax = taxBase > 0 ? taxBase * TAX_RATE : 0;
  const total = taxBase + tax;

  // ── Inventory selector in line form ──
  const filteredInventory = useMemo(() => {
    if (draftLine.type !== 'refaccion') return [];
    return state.inventory.filter((i) => i.stock > 0).slice(0, 30);
  }, [state.inventory, draftLine.type]);

  // ── Validation ──
  function canProceed(): boolean {
    if (step === 1) {
      if (s1.vehicleMode === 'existing') return !!s1.vehicleId;
      return !!(s1.clientName && s1.clientPhone && s1.brand && s1.model && s1.year && s1.plate && s1.mileage);
    }
    if (step === 2) return !!s2.description;
    return true;
  }

  // ── Line item handlers ──
  function addLineItem() {
    if (!draftLine.description || draftLine.unitPrice <= 0) return;
    setS3((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { ...draftLine }],
    }));
    setDraftLine({ id: genId(), description: '', type: 'servicio', quantity: 1, unitPrice: 0, inventoryItemId: '' });
    setShowLineForm(false);
  }

  function removeLineItem(id: string) {
    setS3((prev) => ({ ...prev, lineItems: prev.lineItems.filter((li) => li.id !== id) }));
  }

  // ── Save order ──
  function handleCreate(status: OrderStatus) {
    const now = new Date().toISOString();

    // Create client/vehicle if new mode
    let clientId: string;
    let vehicleId: string;

    if (s1.vehicleMode === 'existing' && s1.vehicleId) {
      vehicleId = s1.vehicleId;
      clientId = selectedVehicle!.clientId;
    } else {
      clientId = `client-${Date.now()}`;
      vehicleId = `vehicle-${Date.now()}`;

      const newClient: Client = {
        id: clientId,
        name: s1.clientName,
        phone: s1.clientPhone,
        createdAt: now,
      };

      const newVehicle: Vehicle = {
        id: vehicleId,
        clientId,
        brand: s1.brand,
        model: s1.model,
        year: parseInt(s1.year) || new Date().getFullYear(),
        plate: s1.plate,
        mileage: parseInt(s1.mileage) || 0,
        fuelType: s1.fuelType,
        transmission: 'automatica',
        createdAt: now,
      };

      dispatch({ type: 'CLIENT_CREATE', payload: newClient });
      dispatch({ type: 'VEHICLE_CREATE', payload: newVehicle });
    }

    const orderId = `OT-2026-${String(state.orders.length + 1).padStart(3, '0')}`;

    const lineItems: OrderLineItem[] = s3.lineItems.map((li) => ({
      id: li.id,
      description: li.description,
      type: li.type,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      inventoryItemId: li.inventoryItemId || undefined,
    }));

    const timeline: OrderTimelineEvent[] = [
      {
        id: `evt-${Date.now()}-1`,
        timestamp: now,
        type: 'creado',
        description: `Orden creada${status === 'aprobado' ? ' y aprobada' : ' como presupuesto'}`,
      },
    ];

    if (status === 'aprobado') {
      timeline.push({
        id: `evt-${Date.now()}-2`,
        timestamp: now,
        type: 'aprobado',
        description: 'Orden aprobada al momento de la creación',
      });
    }

    const order: WorkOrder = {
      id: orderId,
      vehicleId,
      clientId,
      technicianId: s2.technicianId || undefined,
      status,
      priority: s2.priority,
      description: s2.description,
      lineItems,
      subtotal,
      discount: discountAmt,
      tax,
      total,
      paymentStatus: 'pendiente',
      amountPaid: 0,
      estimatedDelivery: s2.estimatedDelivery || undefined,
      mileageIn: parseInt(s2.mileageIn) || (selectedVehicle?.mileage ?? 0),
      createdAt: now,
      updatedAt: now,
      timeline,
    };

    dispatch({ type: 'ORDER_CREATE', payload: order });
    navigate(`/dashboard/orders/${orderId}`);
  }

  // ── Render steps ──

  function renderStep1() {
    return (
      <>
        <SectionCard title="Vehículo">
          {/* Toggle */}
          <div className="flex gap-2 mb-4">
            {(['existing', 'new'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setS1((p) => ({ ...p, vehicleMode: mode, vehicleId: '' }))}
                className={`px-4 py-2 rounded-lg text-xs font-semibold font-sans transition-all ${
                  s1.vehicleMode === mode
                    ? 'text-black'
                    : 'text-white/50 hover:text-white/80'
                }`}
                style={{
                  backgroundColor:
                    s1.vehicleMode === mode ? '#C9A84C' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {mode === 'existing' ? 'Vehículo existente' : 'Nuevo vehículo'}
              </button>
            ))}
          </div>

          {s1.vehicleMode === 'existing' ? (
            <>
              <Field label="Buscar vehículo (placa, marca, cliente)">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ej: ABC-1234 o Volkswagen..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                />
              </Field>
              <div className="mt-3 flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                {filteredVehicles.length === 0 && (
                  <p className="text-white/30 text-xs py-3 text-center font-sans">
                    No se encontraron vehículos
                  </p>
                )}
                {filteredVehicles.map((v) => {
                  const cl = state.clients.find((c) => c.id === v.clientId);
                  const isSelected = s1.vehicleId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setS1((p) => ({ ...p, vehicleId: v.id }))}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all text-sm font-sans ${
                        isSelected ? 'bg-[#C9A84C]/15 border-[#C9A84C]/40' : 'hover:bg-white/5'
                      }`}
                      style={{
                        border: isSelected
                          ? '1px solid rgba(201,168,76,0.4)'
                          : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div>
                        <p className={`font-semibold ${isSelected ? 'text-[#C9A84C]' : 'text-white/80'}`}>
                          {v.brand} {v.model} {v.year}
                        </p>
                        <p className="text-white/40 text-xs font-mono mt-0.5">
                          {v.plate} · {cl?.name ?? 'Sin cliente'}
                        </p>
                      </div>
                      {isSelected && <Check size={14} className="text-[#C9A84C] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Selected summary */}
              {s1.vehicleId && selectedVehicle && (
                <div
                  className="mt-4 p-3 rounded-lg"
                  style={{ backgroundColor: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <p className="text-xs text-[#C9A84C] font-semibold mb-1">Vehículo seleccionado</p>
                  <p className="text-white text-sm font-semibold">
                    {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year} — {selectedVehicle.plate}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    Cliente: {selectedClient?.name ?? '—'} · Km: {selectedVehicle.mileage.toLocaleString('es-MX')}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nombre del cliente *">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Nombre completo"
                    value={s1.clientName}
                    onChange={(e) => setS1((p) => ({ ...p, clientName: e.target.value }))}
                  />
                </Field>
                <Field label="Teléfono *">
                  <input
                    type="tel"
                    className={inputClass}
                    placeholder="55-0000-0000"
                    value={s1.clientPhone}
                    onChange={(e) => setS1((p) => ({ ...p, clientPhone: e.target.value }))}
                  />
                </Field>
                <Field label="Marca *">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Ej: Toyota"
                    value={s1.brand}
                    onChange={(e) => setS1((p) => ({ ...p, brand: e.target.value }))}
                  />
                </Field>
                <Field label="Modelo *">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Ej: Corolla"
                    value={s1.model}
                    onChange={(e) => setS1((p) => ({ ...p, model: e.target.value }))}
                  />
                </Field>
                <Field label="Año *">
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="2024"
                    value={s1.year}
                    onChange={(e) => setS1((p) => ({ ...p, year: e.target.value }))}
                  />
                </Field>
                <Field label="Placa *">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="ABC-1234"
                    value={s1.plate}
                    onChange={(e) => setS1((p) => ({ ...p, plate: e.target.value.toUpperCase() }))}
                  />
                </Field>
                <Field label="Kilometraje *">
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="0"
                    value={s1.mileage}
                    onChange={(e) => setS1((p) => ({ ...p, mileage: e.target.value }))}
                  />
                </Field>
                <Field label="Combustible">
                  <select
                    className={selectClass}
                    value={s1.fuelType}
                    onChange={(e) => setS1((p) => ({ ...p, fuelType: e.target.value as FuelType }))}
                    style={{ backgroundColor: '#161616' }}
                  >
                    {FUEL_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value} style={{ backgroundColor: '#161616' }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </>
          )}
        </SectionCard>
      </>
    );
  }

  function renderStep2() {
    return (
      <SectionCard title="Descripción y Asignación">
        <div className="flex flex-col gap-4">
          <Field label="Problema reportado por el cliente *">
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Describir el problema que reporta el cliente..."
              value={s2.description}
              onChange={(e) => setS2((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Técnico asignado">
              <select
                className={selectClass}
                value={s2.technicianId}
                onChange={(e) => setS2((p) => ({ ...p, technicianId: e.target.value }))}
                style={{ backgroundColor: '#161616' }}
              >
                <option value="" style={{ backgroundColor: '#161616' }}>Sin asignar</option>
                {state.technicians.map((t) => (
                  <option key={t.id} value={t.id} style={{ backgroundColor: '#161616' }}>
                    {t.name} {t.status === 'disponible' ? '✓' : t.status === 'ausente' ? '✗' : '·'}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Prioridad">
              <select
                className={selectClass}
                value={s2.priority}
                onChange={(e) => setS2((p) => ({ ...p, priority: e.target.value as OrderPriority }))}
                style={{ backgroundColor: '#161616' }}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value} style={{ backgroundColor: '#161616' }}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Fecha estimada de entrega">
              <input
                type="datetime-local"
                className={inputClass}
                value={s2.estimatedDelivery}
                onChange={(e) => setS2((p) => ({ ...p, estimatedDelivery: e.target.value }))}
              />
            </Field>

            <Field label="Kilometraje de entrada">
              <input
                type="number"
                className={inputClass}
                placeholder="Km al recibir el vehículo"
                value={s2.mileageIn}
                onChange={(e) => setS2((p) => ({ ...p, mileageIn: e.target.value }))}
              />
            </Field>
          </div>
        </div>
      </SectionCard>
    );
  }

  function renderStep3() {
    return (
      <>
        <SectionCard title="Líneas de Trabajo">
          {/* Table */}
          {s3.lineItems.length > 0 && (
            <div className="mb-4 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Descripción', 'Tipo', 'Cant.', 'P. Unit.', 'Subtotal', ''].map((h) => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-widest text-white/30 font-semibold px-3 py-2.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s3.lineItems.map((li) => (
                    <tr key={li.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-3 py-2.5 text-white/80 max-w-[200px] truncate">{li.description}</td>
                      <td className="px-3 py-2.5 text-white/50 capitalize">{li.type.replace('_', ' ')}</td>
                      <td className="px-3 py-2.5 text-white/60 tabular-nums">{li.quantity}</td>
                      <td className="px-3 py-2.5 text-white/60 tabular-nums">{formatCurrency(li.unitPrice)}</td>
                      <td className="px-3 py-2.5 text-white font-semibold tabular-nums">
                        {formatCurrency(li.quantity * li.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => removeLineItem(li.id)}
                          className="text-white/25 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add line form */}
          {showLineForm ? (
            <div
              className="rounded-lg p-4 mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/40 font-semibold font-sans uppercase tracking-widest">Nueva línea</p>
                <button
                  onClick={() => setShowLineForm(false)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2 mb-3">
                {LINE_ITEM_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() =>
                      setDraftLine((p) => ({
                        ...p,
                        type: t.value,
                        inventoryItemId: '',
                        description: '',
                        unitPrice: 0,
                      }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                      draftLine.type === t.value ? 'text-black' : 'text-white/40 hover:text-white/70'
                    }`}
                    style={{
                      backgroundColor:
                        draftLine.type === t.value ? '#C9A84C' : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Inventory picker for refaccion */}
                {draftLine.type === 'refaccion' && (
                  <div className="md:col-span-2">
                    <Field label="Buscar en inventario">
                      <select
                        className={selectClass}
                        value={draftLine.inventoryItemId ?? ''}
                        onChange={(e) => {
                          const item = state.inventory.find((i) => i.id === e.target.value);
                          setDraftLine((p) => ({
                            ...p,
                            inventoryItemId: e.target.value || undefined,
                            description: item ? item.name : p.description,
                            unitPrice: item ? item.price : p.unitPrice,
                          }));
                        }}
                        style={{ backgroundColor: '#161616' }}
                      >
                        <option value="" style={{ backgroundColor: '#161616' }}>Seleccionar del inventario (opcional)</option>
                        {filteredInventory.map((i) => (
                          <option key={i.id} value={i.id} style={{ backgroundColor: '#161616' }}>
                            {i.name} — Stock: {i.stock} — {formatCurrency(i.price)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}

                <div className="md:col-span-2">
                  <Field label="Descripción *">
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Descripción del trabajo o refacción..."
                      value={draftLine.description}
                      onChange={(e) => setDraftLine((p) => ({ ...p, description: e.target.value }))}
                    />
                  </Field>
                </div>

                <Field label="Cantidad">
                  <input
                    type="number"
                    className={inputClass}
                    min="0.1"
                    step="0.5"
                    value={draftLine.quantity}
                    onChange={(e) => setDraftLine((p) => ({ ...p, quantity: parseFloat(e.target.value) || 1 }))}
                  />
                </Field>

                <Field label="Precio unitario (USD)">
                  <input
                    type="number"
                    className={inputClass}
                    min="0"
                    step="0.01"
                    value={draftLine.unitPrice}
                    onChange={(e) => setDraftLine((p) => ({ ...p, unitPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-white/50 font-sans">
                  Subtotal:{' '}
                  <span className="text-white font-semibold">
                    {formatCurrency(draftLine.quantity * draftLine.unitPrice)}
                  </span>
                </p>
                <button
                  onClick={addLineItem}
                  disabled={!draftLine.description || draftLine.unitPrice <= 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-sans text-black disabled:opacity-30 transition-opacity"
                  style={{ backgroundColor: '#C9A84C' }}
                >
                  <Plus size={13} strokeWidth={3} />
                  Agregar línea
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLineForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold font-sans text-white/60 hover:text-white transition-colors mb-4"
              style={{ border: '1px dashed rgba(255,255,255,0.15)' }}
            >
              <Plus size={14} />
              Agregar línea de trabajo
            </button>
          )}

          {/* Financial summary */}
          {(s3.lineItems.length > 0 || true) && (
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex flex-col gap-2 text-sm font-sans">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-white/50">
                  <span>Descuento</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30">$</span>
                    <input
                      type="number"
                      min="0"
                      className="w-24 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-sm text-white text-right tabular-nums focus:outline-none focus:border-white/25"
                      value={s3.discount}
                      onChange={(e) => setS3((p) => ({ ...p, discount: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>IVA (16%)</span>
                  <span className="tabular-nums">{formatCurrency(tax)}</span>
                </div>
                <div
                  className="flex justify-between text-white font-bold text-base pt-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span>Total</span>
                  <span className="tabular-nums text-[#C9A84C]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </>
    );
  }

  function renderStep4() {
    const vehicle =
      s1.vehicleMode === 'existing'
        ? state.vehicles.find((v) => v.id === s1.vehicleId)
        : null;
    const client =
      s1.vehicleMode === 'existing' && vehicle
        ? state.clients.find((c) => c.id === vehicle.clientId)
        : null;
    const tech = state.technicians.find((t) => t.id === s2.technicianId);

    return (
      <>
        <SectionCard title="Resumen de la Orden">
          {/* Vehicle / Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-2 font-sans">Vehículo</p>
              {s1.vehicleMode === 'existing' && vehicle ? (
                <>
                  <p className="text-white font-semibold text-sm">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
                  <p className="text-white/50 text-xs font-mono mt-0.5">{vehicle.plate}</p>
                  <p className="text-white/40 text-xs mt-0.5">Cliente: {client?.name ?? '—'}</p>
                </>
              ) : (
                <>
                  <p className="text-white font-semibold text-sm">{s1.brand} {s1.model} {s1.year}</p>
                  <p className="text-white/50 text-xs font-mono mt-0.5">{s1.plate}</p>
                  <p className="text-white/40 text-xs mt-0.5">Cliente: {s1.clientName}</p>
                </>
              )}
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-2 font-sans">Asignación</p>
              <p className="text-white/70 text-sm">
                Técnico: {tech?.name ?? <span className="text-white/30 italic">Sin asignar</span>}
              </p>
              <p className="text-white/70 text-sm mt-1">Prioridad: <span className="font-semibold">{s2.priority.toUpperCase()}</span></p>
              {s2.estimatedDelivery && (
                <p className="text-white/50 text-xs mt-1">
                  Entrega estimada:{' '}
                  {new Date(s2.estimatedDelivery).toLocaleString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-2 font-sans">Descripción del problema</p>
            <p className="text-white/70 text-sm leading-relaxed">{s2.description}</p>
          </div>

          {/* Line items */}
          {s3.lineItems.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-2 font-sans">Líneas de trabajo</p>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <table className="w-full text-sm font-sans">
                  <tbody>
                    {s3.lineItems.map((li) => (
                      <tr key={li.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-3 py-2.5 text-white/80">{li.description}</td>
                        <td className="px-3 py-2.5 text-white/40 text-xs capitalize">{li.type.replace('_', ' ')}</td>
                        <td className="px-3 py-2.5 text-white/50 tabular-nums text-xs">{li.quantity} × {formatCurrency(li.unitPrice)}</td>
                        <td className="px-3 py-2.5 text-white font-semibold tabular-nums text-right">
                          {formatCurrency(li.quantity * li.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financials */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-col gap-2 text-sm font-sans">
              <div className="flex justify-between text-white/50">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento</span>
                  <span className="tabular-nums">− {formatCurrency(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/50">
                <span>IVA (16%)</span>
                <span className="tabular-nums">{formatCurrency(tax)}</span>
              </div>
              <div
                className="flex justify-between text-white font-bold text-base pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span>Total</span>
                <span className="tabular-nums text-[#C9A84C]">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleCreate('presupuesto')}
            className="flex-1 py-3.5 rounded-xl text-sm font-bold font-sans text-white/80 transition-all hover:text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Crear como Presupuesto
          </button>
          <button
            onClick={() => handleCreate('aprobado')}
            className="flex-1 py-3.5 rounded-xl text-sm font-bold font-sans text-black transition-all hover:opacity-90"
            style={{ backgroundColor: '#C9A84C' }}
          >
            Crear y Aprobar
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full max-w-3xl mx-auto" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/dashboard/orders"
          className="text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1
            className="text-3xl text-white leading-none tracking-tight"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            Nueva Orden de Trabajo
          </h1>
          <p className="text-white/35 text-sm font-sans mt-1">Completa los pasos para crear la orden</p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} total={4} />

      {/* Step content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {/* Navigation (steps 1–3) */}
      {step < 4 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold font-sans text-white/50 disabled:opacity-0 transition-colors hover:text-white/80"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ChevronLeft size={15} />
            Anterior
          </button>
          <button
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold font-sans text-black disabled:opacity-30 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#C9A84C' }}
          >
            Siguiente
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Back button on step 4 */}
      {step === 4 && (
        <button
          onClick={() => setStep(3)}
          className="flex items-center gap-2 mt-4 text-sm text-white/35 hover:text-white/60 font-sans transition-colors"
        >
          <ChevronLeft size={14} />
          Volver a editar líneas
        </button>
      )}
    </div>
  );
}
