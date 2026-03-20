import { Technician, WorkOrder, TechnicianStatus } from '../../types';

interface TechnicianCardProps {
  technician: Technician;
  activeOrder?: WorkOrder;
  onStatusChange: (technicianId: string, status: TechnicianStatus) => void;
}

// Derive a stable color from the technician ID
function getAvatarColor(id: string): string {
  const colors = [
    '#C9A84C', // gold
    '#34d399', // emerald
    '#60a5fa', // blue
    '#f472b6', // pink
    '#a78bfa', // violet
    '#fb923c', // orange
    '#38bdf8', // sky
    '#4ade80', // green
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

const statusConfig: Record<TechnicianStatus, { label: string; dot: string; bg: string; text: string }> = {
  disponible: {
    label: 'Disponible',
    dot: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    text: '#34d399',
  },
  ocupado: {
    label: 'Ocupado',
    dot: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    text: '#fbbf24',
  },
  ausente: {
    label: 'Ausente',
    dot: '#f87171',
    bg: 'rgba(248,113,113,0.12)',
    text: '#f87171',
  },
};

const STATUSES: TechnicianStatus[] = ['disponible', 'ocupado', 'ausente'];

export default function TechnicianCard({ technician, activeOrder, onStatusChange }: TechnicianCardProps) {
  const avatarColor = getAvatarColor(technician.id);
  const initials = getInitials(technician.name);
  const status = statusConfig[technician.status];

  const hireDateFormatted = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(technician.hireDate));

  const efficiencyColor =
    technician.efficiency >= 90
      ? '#34d399'
      : technician.efficiency >= 75
      ? '#fbbf24'
      : '#f87171';

  return (
    <div
      className="flex flex-col gap-5 rounded-2xl p-5 transition-all duration-200"
      style={{
        backgroundColor: '#161616',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Top row — avatar + status badge */}
      <div className="flex items-start justify-between gap-3">
        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded-full shrink-0 select-none"
          style={{
            width: 56,
            height: 56,
            backgroundColor: `${avatarColor}22`,
            border: `2px solid ${avatarColor}55`,
            color: avatarColor,
            fontFamily: 'Anton, sans-serif',
            fontSize: 20,
            letterSpacing: '0.02em',
          }}
        >
          {initials}
        </div>

        {/* Status badge */}
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shrink-0"
          style={{
            backgroundColor: status.bg,
            color: status.text,
            fontFamily: 'Inter, sans-serif',
            border: `1px solid ${status.dot}33`,
          }}
        >
          <span
            className="rounded-full shrink-0"
            style={{
              width: 7,
              height: 7,
              backgroundColor: status.dot,
              boxShadow: `0 0 6px ${status.dot}`,
            }}
          />
          {status.label}
        </span>
      </div>

      {/* Name */}
      <div>
        <h3
          className="text-white leading-tight"
          style={{ fontFamily: 'Anton, sans-serif', fontSize: 20, letterSpacing: '0.01em' }}
        >
          {technician.name}
        </h3>
        {/* Active order info */}
        {technician.status === 'ocupado' && activeOrder && (
          <p className="text-xs mt-1" style={{ color: '#fbbf24', fontFamily: 'Inter, sans-serif' }}>
            En orden:{' '}
            <span className="font-semibold">
              #{activeOrder.id.replace('order-', '')}
            </span>{' '}
            — {activeOrder.description.slice(0, 38)}
            {activeOrder.description.length > 38 ? '…' : ''}
          </p>
        )}
      </div>

      {/* Specialty tags */}
      <div className="flex flex-wrap gap-1.5">
        {technician.specialty.map((spec) => (
          <span
            key={spec}
            className="text-[11px] rounded-md px-2 py-0.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {spec}
          </span>
        ))}
      </div>

      {/* Efficiency bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}
          >
            Eficiencia
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: efficiencyColor, fontFamily: 'Inter, sans-serif' }}
          >
            {technician.efficiency}%
          </span>
        </div>
        <div
          className="rounded-full overflow-hidden"
          style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${technician.efficiency}%`,
              backgroundColor: efficiencyColor,
              boxShadow: `0 0 8px ${efficiencyColor}88`,
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-2 gap-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}
          >
            Completadas
          </span>
          <span
            className="text-xl font-bold leading-none"
            style={{ color: '#C9A84C', fontFamily: 'Anton, sans-serif' }}
          >
            {technician.completedOrders}
          </span>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
            órdenes
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}
          >
            Contratado
          </span>
          <span
            className="text-xs font-medium leading-snug"
            style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}
          >
            {hireDateFormatted}
          </span>
        </div>
      </div>

      {/* Status changer */}
      <div className="flex gap-1.5">
        {STATUSES.map((s) => {
          const cfg = statusConfig[s];
          const isActive = technician.status === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(technician.id, s)}
              className="flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-all duration-150"
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: isActive ? cfg.bg : 'rgba(255,255,255,0.04)',
                color: isActive ? cfg.text : 'rgba(255,255,255,0.3)',
                border: isActive ? `1px solid ${cfg.dot}44` : '1px solid rgba(255,255,255,0.07)',
                cursor: isActive ? 'default' : 'pointer',
              }}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
