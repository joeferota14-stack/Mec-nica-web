import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { InventoryItem, InventoryAlertLevel } from '../../types';

// ─── HELPERS ─────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function margin(cost: number, price: number) {
  if (price <= 0) return 0;
  return ((price - cost) / price) * 100;
}

const CATEGORIES = [
  'lubricantes',
  'filtros',
  'frenos',
  'electricidad',
  'suspensión',
  'aire_acondicionado',
];

const CATEGORY_LABELS: Record<string, string> = {
  lubricantes: 'Lubricantes',
  filtros: 'Filtros',
  frenos: 'Frenos',
  electricidad: 'Electricidad',
  'suspensión': 'Suspensión',
  aire_acondicionado: 'Aire Acondicionado',
};

// ─── BADGE ───────────────────────────────────────────────────

function AlertBadge({ level }: { level: InventoryAlertLevel }) {
  if (level === 'ok') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Disponible
      </span>
    );
  }
  if (level === 'bajo') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Stock Bajo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-400/10 text-red-400 border border-red-400/20">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      Crítico
    </span>
  );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl"
        style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-display text-lg text-white tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── FIELD HELPERS ────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[#C9A84C]/60 focus:bg-white/8 transition-colors';
const inputStyle = { borderColor: 'rgba(255,255,255,0.10)' };

// ─── MODAL: AGREGAR REFACCIÓN ─────────────────────────────────

type NewItemForm = {
  sku: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  stock: string;
  minStock: string;
  cost: string;
  price: string;
  location: string;
};

const emptyForm: NewItemForm = {
  sku: '',
  name: '',
  category: 'lubricantes',
  brand: '',
  unit: 'pieza',
  stock: '0',
  minStock: '2',
  cost: '',
  price: '',
  location: '',
};

function AddItemModal({ onClose }: { onClose: () => void }) {
  const { dispatch } = useAppContext();
  const [form, setForm] = useState<NewItemForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<NewItemForm>>({});

  function set(key: keyof NewItemForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const e: Partial<NewItemForm> = {};
    if (!form.sku.trim()) e.sku = 'Requerido';
    if (!form.name.trim()) e.name = 'Requerido';
    if (!form.unit.trim()) e.unit = 'Requerido';
    if (isNaN(Number(form.cost)) || Number(form.cost) < 0) e.cost = 'Inválido';
    if (isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Inválido';
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = 'Inválido';
    if (isNaN(Number(form.minStock)) || Number(form.minStock) < 0) e.minStock = 'Inválido';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const stock = parseInt(form.stock);
    const minStock = parseInt(form.minStock);
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim() || undefined,
      unit: form.unit.trim(),
      stock,
      minStock,
      cost: parseFloat(form.cost),
      price: parseFloat(form.price),
      location: form.location.trim() || undefined,
      alertLevel: stock <= 0 ? 'critico' : stock <= minStock ? 'bajo' : 'ok',
      lastUpdated: new Date().toISOString(),
    };
    dispatch({ type: 'INVENTORY_UPDATE', payload: newItem });
    onClose();
  }

  return (
    <Modal title="Agregar Refacción" onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="SKU *">
          <input className={inputClass} style={inputStyle} placeholder="EJ: LUB-007" value={form.sku} onChange={e => set('sku', e.target.value)} />
          {errors.sku && <span className="text-xs text-red-400">{errors.sku}</span>}
        </Field>
        <Field label="Categoría *">
          <select
            className={inputClass} style={inputStyle}
            value={form.category} onChange={e => set('category', e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
          </select>
        </Field>
        <Field label="Nombre *">
          <input className={`${inputClass} col-span-2`} style={inputStyle} placeholder="Nombre de la refacción" value={form.name} onChange={e => set('name', e.target.value)} />
          {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
        </Field>
        <Field label="Marca">
          <input className={inputClass} style={inputStyle} placeholder="Bosch, NGK, Fram…" value={form.brand} onChange={e => set('brand', e.target.value)} />
        </Field>
        <Field label="Unidad *">
          <input className={inputClass} style={inputStyle} placeholder="pieza, juego, litro…" value={form.unit} onChange={e => set('unit', e.target.value)} />
          {errors.unit && <span className="text-xs text-red-400">{errors.unit}</span>}
        </Field>
        <Field label="Stock Inicial *">
          <input className={inputClass} style={inputStyle} type="number" min="0" placeholder="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
          {errors.stock && <span className="text-xs text-red-400">{errors.stock}</span>}
        </Field>
        <Field label="Stock Mínimo *">
          <input className={inputClass} style={inputStyle} type="number" min="0" placeholder="2" value={form.minStock} onChange={e => set('minStock', e.target.value)} />
          {errors.minStock && <span className="text-xs text-red-400">{errors.minStock}</span>}
        </Field>
        <Field label="Costo (USD) *">
          <input className={inputClass} style={inputStyle} type="number" min="0" step="0.01" placeholder="0.00" value={form.cost} onChange={e => set('cost', e.target.value)} />
          {errors.cost && <span className="text-xs text-red-400">{errors.cost}</span>}
        </Field>
        <Field label="Precio Venta (USD) *">
          <input className={inputClass} style={inputStyle} type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
          {errors.price && <span className="text-xs text-red-400">{errors.price}</span>}
        </Field>
        <div className="col-span-2">
          <Field label="Ubicación">
            <input className={inputClass} style={inputStyle} placeholder="Estante A1, Bodega F2…" value={form.location} onChange={e => set('location', e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Margin preview */}
      {form.cost && form.price && Number(form.cost) > 0 && Number(form.price) > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-white/4 border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-xs text-white/40">Margen estimado: </span>
          <span className="text-sm font-semibold" style={{ color: '#C9A84C' }}>
            {margin(Number(form.cost), Number(form.price)).toFixed(1)}%
          </span>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-black transition-all hover:brightness-110"
          style={{ background: '#C9A84C' }}
        >
          Guardar Refacción
        </button>
      </div>
    </Modal>
  );
}

// ─── MODAL: REGISTRAR ENTRADA ─────────────────────────────────

function EntradaModal({ items, onClose }: { items: InventoryItem[]; onClose: () => void }) {
  const { dispatch } = useAppContext();
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');

  const selected = items.find(i => i.id === selectedId);

  function handleSave() {
    if (!selectedId) { setError('Selecciona un ítem'); return; }
    const n = parseInt(qty);
    if (!qty || isNaN(n) || n <= 0) { setError('Cantidad inválida (debe ser mayor a 0)'); return; }
    if (!selected) return;
    dispatch({
      type: 'INVENTORY_UPDATE',
      payload: { ...selected, stock: selected.stock + n, lastUpdated: new Date().toISOString() },
    });
    onClose();
  }

  return (
    <Modal title="Registrar Entrada de Stock" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Seleccionar Refacción *">
          <select
            className={inputClass} style={inputStyle}
            value={selectedId}
            onChange={e => { setSelectedId(e.target.value); setError(''); }}
          >
            <option value="">-- Selecciona una refacción --</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                [{item.sku}] {item.name}
              </option>
            ))}
          </select>
        </Field>

        {selected && (
          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-white/4 border text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-white/40 text-xs mb-0.5">Stock actual</p>
              <p className="text-white font-semibold">{selected.stock} {selected.unit}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-0.5">Stock mínimo</p>
              <p className="text-white font-semibold">{selected.minStock}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-0.5">Alerta</p>
              <AlertBadge level={selected.alertLevel} />
            </div>
          </div>
        )}

        <Field label="Cantidad a Agregar *">
          <input
            className={inputClass} style={inputStyle}
            type="number" min="1" placeholder="0"
            value={qty}
            onChange={e => { setQty(e.target.value); setError(''); }}
          />
        </Field>

        {selected && qty && !isNaN(parseInt(qty)) && parseInt(qty) > 0 && (
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span>Stock resultante:</span>
            <span className="text-emerald-400 font-semibold">{selected.stock + parseInt(qty)} {selected.unit}</span>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-black transition-all hover:brightness-110"
          style={{ background: '#34d399' }}
        >
          Registrar Entrada
        </button>
      </div>
    </Modal>
  );
}

// ─── MODAL: AJUSTAR STOCK ─────────────────────────────────────

function AjusteModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { dispatch } = useAppContext();
  const [newStock, setNewStock] = useState(String(item.stock));
  const [motivo, setMotivo] = useState('');
  const [errors, setErrors] = useState<{ stock?: string; motivo?: string }>({});

  function handleSave() {
    const n = parseInt(newStock);
    const e: typeof errors = {};
    if (isNaN(n) || n < 0) e.stock = 'Stock inválido (debe ser >= 0)';
    if (!motivo.trim()) e.motivo = 'El motivo es requerido';
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    dispatch({
      type: 'INVENTORY_UPDATE',
      payload: { ...item, stock: n, lastUpdated: new Date().toISOString() },
    });
    onClose();
  }

  const diff = parseInt(newStock) - item.stock;
  const diffLabel = isNaN(diff) ? null : diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '0';
  const diffColor = !isNaN(diff) ? (diff > 0 ? '#34d399' : diff < 0 ? '#f87171' : 'rgba(255,255,255,0.4)') : 'transparent';

  return (
    <Modal title="Ajustar Stock" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Item info */}
        <div className="p-3 rounded-lg bg-white/4 border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-white/40 mb-0.5">[{item.sku}]</p>
          <p className="text-sm text-white font-medium">{item.name}</p>
          {item.brand && <p className="text-xs text-white/30 mt-0.5">{item.brand}</p>}
        </div>

        <Field label="Stock Actual (solo lectura)">
          <input
            className={`${inputClass} opacity-50 cursor-not-allowed`}
            style={inputStyle}
            value={`${item.stock} ${item.unit}`}
            readOnly
          />
        </Field>

        <Field label="Nuevo Stock *">
          <div className="flex items-center gap-3">
            <input
              className={inputClass} style={inputStyle}
              type="number" min="0"
              value={newStock}
              onChange={e => { setNewStock(e.target.value); setErrors(prev => ({ ...prev, stock: undefined })); }}
            />
            {diffLabel && (
              <span className="text-sm font-semibold whitespace-nowrap" style={{ color: diffColor }}>
                {diffLabel}
              </span>
            )}
          </div>
          {errors.stock && <span className="text-xs text-red-400">{errors.stock}</span>}
        </Field>

        <Field label="Motivo del Ajuste *">
          <textarea
            className={`${inputClass} resize-none`} style={inputStyle}
            rows={3}
            placeholder="Ej: Conteo físico de inventario, merma, daño en almacén…"
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setErrors(prev => ({ ...prev, motivo: undefined })); }}
          />
          {errors.motivo && <span className="text-xs text-red-400">{errors.motivo}</span>}
        </Field>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-black transition-all hover:brightness-110"
          style={{ background: '#C9A84C' }}
        >
          Aplicar Ajuste
        </button>
      </div>
    </Modal>
  );
}

// ─── SORT ─────────────────────────────────────────────────────

type SortKey = keyof Pick<InventoryItem, 'sku' | 'name' | 'category' | 'brand' | 'stock' | 'minStock' | 'cost' | 'price' | 'location' | 'lastUpdated'> | 'margin';
type SortDir = 'asc' | 'desc';

function sortItems(items: InventoryItem[], key: SortKey, dir: SortDir): InventoryItem[] {
  return [...items].sort((a, b) => {
    let av: string | number;
    let bv: string | number;
    if (key === 'margin') {
      av = margin(a.cost, a.price);
      bv = margin(b.cost, b.price);
    } else {
      av = (a[key] ?? '') as string | number;
      bv = (b[key] ?? '') as string | number;
    }
    if (typeof av === 'string' && typeof bv === 'string') {
      return dir === 'asc' ? av.localeCompare(bv, 'es') : bv.localeCompare(av, 'es');
    }
    return dir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });
}

// ─── COLUMN HEADER ────────────────────────────────────────────

function ColHeader({ label, sortKey, current, dir, onSort }: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none whitespace-nowrap group"
      style={{ color: active ? '#C9A84C' : 'rgba(255,255,255,0.35)' }}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="opacity-40 group-hover:opacity-100 transition-opacity text-[10px]">
          {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────

export default function InventoryPage() {
  const { state } = useAppContext();
  const items = state.inventory;

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [alertFilter, setAlertFilter] = useState<'all' | InventoryAlertLevel>('all');

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEntrada, setShowEntrada] = useState(false);
  const [ajusteItem, setAjusteItem] = useState<InventoryItem | null>(null);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('sku');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // KPIs
  const totalItems = items.length;
  const itemsBajo = items.filter(i => i.alertLevel === 'bajo').length;
  const itemsCritico = items.filter(i => i.alertLevel === 'critico').length;

  // Unique categories in data
  const allCategories = useMemo(() => {
    const cats = new Set(items.map(i => i.category));
    return Array.from(cats).sort();
  }, [items]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(i =>
        i.sku.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        (i.brand ?? '').toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter(i => i.category === categoryFilter);
    }
    if (alertFilter !== 'all') {
      result = result.filter(i => i.alertLevel === alertFilter);
    }
    return sortItems(result, sortKey, sortDir);
  }, [items, search, categoryFilter, alertFilter, sortKey, sortDir]);

  const colProps = { current: sortKey, dir: sortDir, onSort: handleSort };

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: '#0A0A0A' }}>

      {/* ── Header ── */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-white tracking-wide">
              Inventario de Refacciones
            </h1>
            <p className="text-white/40 text-sm mt-1">Control de stock, alertas y movimientos</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => setShowEntrada(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-white/70 hover:text-white hover:bg-white/6 transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.10)' }}
            >
              <span className="text-emerald-400">↑</span>
              Registrar Entrada
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:brightness-110"
              style={{ background: '#C9A84C' }}
            >
              <span>+</span>
              Agregar Refacción
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Total */}
          <div className="rounded-xl p-4 border" style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Artículos</p>
            <p className="font-display text-2xl text-white">{totalItems}</p>
          </div>
          {/* Stock Bajo */}
          <div className="rounded-xl p-4 border" style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Alerta Baja</p>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-2xl" style={{ color: itemsBajo > 0 ? '#fbbf24' : 'white' }}>{itemsBajo}</p>
              {itemsBajo > 0 && <span className="text-xs text-amber-400/70">artículos</span>}
            </div>
          </div>
          {/* Crítico */}
          <div className="rounded-xl p-4 border" style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Stock Crítico</p>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-2xl" style={{ color: itemsCritico > 0 ? '#f87171' : 'white' }}>{itemsCritico}</p>
              {itemsCritico > 0 && <span className="text-xs text-red-400/70 animate-pulse">sin stock</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">⌕</span>
          <input
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border bg-white/4 text-sm text-white placeholder-white/25 outline-none focus:border-[#C9A84C]/50 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            placeholder="Buscar por SKU, nombre o marca…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category */}
        <select
          className="px-4 py-2.5 rounded-xl border bg-white/4 text-sm text-white outline-none focus:border-[#C9A84C]/50 transition-colors cursor-pointer"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {allCategories.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
          ))}
        </select>

        {/* Alert level */}
        <select
          className="px-4 py-2.5 rounded-xl border bg-white/4 text-sm text-white outline-none focus:border-[#C9A84C]/50 transition-colors cursor-pointer"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          value={alertFilter}
          onChange={e => setAlertFilter(e.target.value as 'all' | InventoryAlertLevel)}
        >
          <option value="all">Todos los niveles</option>
          <option value="ok">Disponible</option>
          <option value="bajo">Stock Bajo</option>
          <option value="critico">Crítico</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <ColHeader label="SKU" sortKey="sku" {...colProps} />
                <ColHeader label="Nombre" sortKey="name" {...colProps} />
                <ColHeader label="Categoría" sortKey="category" {...colProps} />
                <ColHeader label="Marca" sortKey="brand" {...colProps} />
                <ColHeader label="Stock" sortKey="stock" {...colProps} />
                <ColHeader label="Mín." sortKey="minStock" {...colProps} />
                <ColHeader label="Costo" sortKey="cost" {...colProps} />
                <ColHeader label="Precio" sortKey="price" {...colProps} />
                <ColHeader label="Margen" sortKey="margin" {...colProps} />
                <ColHeader label="Ubicación" sortKey="location" {...colProps} />
                <ColHeader label="Actualización" sortKey="lastUpdated" {...colProps} />
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-16 text-white/25 text-sm">
                    No se encontraron artículos con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const mg = margin(item.cost, item.price);
                  const isLastRow = idx === filtered.length - 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/3 transition-colors"
                      style={{ borderBottom: isLastRow ? 'none' : '1px solid rgba(255,255,255,0.04)' }}
                    >
                      {/* SKU */}
                      <td className="px-4 py-3 font-mono text-xs text-white/60 whitespace-nowrap">{item.sku}</td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium leading-tight">{item.name}</p>
                        <p className="text-white/30 text-xs mt-0.5">{item.unit}</p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                        {item.brand ?? <span className="text-white/20">—</span>}
                      </td>

                      {/* Stock with badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-white font-semibold">{item.stock}</span>
                          <AlertBadge level={item.alertLevel} />
                        </div>
                      </td>

                      {/* Min Stock */}
                      <td className="px-4 py-3 text-white/50 text-sm text-center">{item.minStock}</td>

                      {/* Cost */}
                      <td className="px-4 py-3 text-white/60 text-sm whitespace-nowrap">{formatCurrency(item.cost)}</td>

                      {/* Price */}
                      <td className="px-4 py-3 text-white text-sm font-medium whitespace-nowrap">{formatCurrency(item.price)}</td>

                      {/* Margin */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: mg >= 40 ? '#34d399' : mg >= 20 ? '#C9A84C' : '#f87171' }}
                        >
                          {mg.toFixed(1)}%
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                        {item.location ?? <span className="text-white/20">—</span>}
                      </td>

                      {/* Last updated */}
                      <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{formatDate(item.lastUpdated)}</td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setAjusteItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-white/50 hover:text-white hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/10 transition-all whitespace-nowrap"
                          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                          Ajustar Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div
            className="px-6 py-3 flex items-center justify-between border-t text-xs text-white/30"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <span>
              Mostrando {filtered.length} de {totalItems} artículos
            </span>
            <span>
              Valor en inventario:{' '}
              <span className="text-white/60 font-medium">
                {formatCurrency(filtered.reduce((acc, i) => acc + i.cost * i.stock, 0))}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
      {showEntrada && <EntradaModal items={items} onClose={() => setShowEntrada(false)} />}
      {ajusteItem && <AjusteModal item={ajusteItem} onClose={() => setAjusteItem(null)} />}
    </div>
  );
}
