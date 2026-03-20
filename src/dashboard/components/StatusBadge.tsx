import { OrderStatus } from '../../types/index';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  presupuesto: {
    label: 'Presupuesto',
    bg: 'bg-zinc-800',
    text: 'text-zinc-100',
    dot: 'bg-zinc-400',
  },
  aprobado: {
    label: 'Aprobado',
    bg: 'bg-blue-900/60',
    text: 'text-blue-300',
    dot: 'bg-blue-400',
  },
  en_proceso: {
    label: 'En Proceso',
    bg: 'bg-amber-900/60',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  pausado: {
    label: 'Pausado',
    bg: 'bg-orange-900/60',
    text: 'text-orange-300',
    dot: 'bg-orange-400',
  },
  listo: {
    label: 'Listo',
    bg: 'bg-emerald-900/60',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  entregado: {
    label: 'Entregado',
    bg: 'bg-zinc-800/70',
    text: 'text-zinc-400',
    dot: 'bg-zinc-500',
  },
  cancelado: {
    label: 'Cancelado',
    bg: 'bg-red-900/60',
    text: 'text-red-300',
    dot: 'bg-red-400',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1.5'
    : 'text-xs px-2.5 py-1 gap-2';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide border border-white/5 ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`rounded-full shrink-0 ${config.dot} ${dotSize}`} />
      {config.label}
    </span>
  );
}
