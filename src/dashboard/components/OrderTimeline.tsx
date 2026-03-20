import { OrderTimelineEvent, TimelineEventType } from '../../types/index';
import {
  PlusCircle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Package,
  Truck,
  MessageSquare,
} from 'lucide-react';

interface OrderTimelineProps {
  timeline: OrderTimelineEvent[];
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const eventConfig: Record<
  TimelineEventType,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  creado: {
    icon: <PlusCircle size={14} strokeWidth={2} />,
    color: 'text-zinc-300',
    bg: 'bg-zinc-700',
    border: 'border-zinc-600',
  },
  aprobado: {
    icon: <CheckCircle2 size={14} strokeWidth={2} />,
    color: 'text-blue-300',
    bg: 'bg-blue-900',
    border: 'border-blue-700',
  },
  iniciado: {
    icon: <PlayCircle size={14} strokeWidth={2} />,
    color: 'text-amber-300',
    bg: 'bg-amber-900',
    border: 'border-amber-700',
  },
  pausado: {
    icon: <PauseCircle size={14} strokeWidth={2} />,
    color: 'text-orange-300',
    bg: 'bg-orange-900',
    border: 'border-orange-700',
  },
  completado: {
    icon: <Package size={14} strokeWidth={2} />,
    color: 'text-emerald-300',
    bg: 'bg-emerald-900',
    border: 'border-emerald-700',
  },
  entregado: {
    icon: <Truck size={14} strokeWidth={2} />,
    color: 'text-emerald-200',
    bg: 'bg-emerald-800',
    border: 'border-emerald-600',
  },
  nota: {
    icon: <MessageSquare size={14} strokeWidth={2} />,
    color: 'text-zinc-400',
    bg: 'bg-zinc-800',
    border: 'border-zinc-600',
  },
};

export default function OrderTimeline({ timeline }: OrderTimelineProps) {
  const sorted = [...timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-white/30 italic">Sin eventos registrados.</p>
    );
  }

  return (
    <div className="relative flex flex-col gap-0">
      {sorted.map((event, i) => {
        const config = eventConfig[event.type] ?? eventConfig.nota;
        const isLast = i === sorted.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            {/* Left: icon + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full border shrink-0 ${config.bg} ${config.border} ${config.color} z-10`}
              >
                {config.icon}
              </div>
              {!isLast && (
                <div
                  className="w-px flex-1 mt-1"
                  style={{ background: 'rgba(255,255,255,0.07)', minHeight: 24 }}
                />
              )}
            </div>

            {/* Right: content */}
            <div className={`pb-5 ${isLast ? 'pb-0' : ''} flex-1 min-w-0`}>
              <p className="text-xs text-white/35 font-sans mb-0.5 tabular-nums">
                {formatTimestamp(event.timestamp)}
              </p>
              <p className="text-sm text-white/80 font-sans leading-snug">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
