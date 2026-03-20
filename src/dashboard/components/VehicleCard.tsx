import type { ReactNode } from 'react';
import { Vehicle, Client } from '../../types';
import { Fuel, Wrench, Calendar, User, ChevronRight, Zap, Flame } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  client: Client;
  orderCount: number;
  lastOrderDate?: string;
  onClick?: () => void;
}

const fuelIcons: Record<string, ReactNode> = {
  gasolina: <Flame className="w-3.5 h-3.5" />,
  diesel: <Fuel className="w-3.5 h-3.5" />,
  hibrido: <Zap className="w-3.5 h-3.5" style={{ color: '#34d399' }} />,
  electrico: <Zap className="w-3.5 h-3.5" style={{ color: '#34d399' }} />,
};

const fuelLabel: Record<string, string> = {
  gasolina: 'Gasolina',
  diesel: 'Diésel',
  hibrido: 'Híbrido',
  electrico: 'Eléctrico',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function VehicleCard({
  vehicle,
  client,
  orderCount,
  lastOrderDate,
  onClick,
}: VehicleCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/50"
      style={{
        background: '#161616',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top row: brand/model + plate badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3
              className="font-display uppercase text-white text-xl leading-none tracking-tight truncate"
            >
              {vehicle.brand} {vehicle.model}
            </h3>
          </div>
          <p className="text-xs text-white/35 font-medium tracking-wider">{vehicle.year}</p>
        </div>

        {/* Plate badge */}
        <span
          className="shrink-0 font-mono text-xs font-bold px-3 py-1.5 rounded-md tracking-widest"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#C9A84C',
          }}
        >
          {vehicle.plate}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Owner */}
      <div className="flex items-center gap-2 mb-3">
        <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <span className="text-sm text-white/60 truncate">{client.name}</span>
      </div>

      {/* Fuel + color row */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          {fuelIcons[vehicle.fuelType]}
          <span>{fuelLabel[vehicle.fuelType]}</span>
        </div>
        {vehicle.color && (
          <span className="text-xs text-white/35 truncate">{vehicle.color}</span>
        )}
      </div>

      {/* Bottom stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Order count */}
          <div className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
            <span className="text-xs font-semibold" style={{ color: '#C9A84C' }}>
              {orderCount} {orderCount === 1 ? 'orden' : 'órdenes'}
            </span>
          </div>

          {/* Last visit */}
          {lastOrderDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <span className="text-xs text-white/30">{formatDate(lastOrderDate)}</span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight
          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        />
      </div>
    </button>
  );
}
