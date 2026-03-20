import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  variant?: 'default' | 'gold' | 'emerald' | 'red' | 'amber';
}

const variantStyles: Record<NonNullable<KPICardProps['variant']>, { icon: string; value: string; glow: string }> = {
  default: {
    icon: 'text-white/40',
    value: 'text-white',
    glow: '',
  },
  gold: {
    icon: 'text-[#C9A84C]',
    value: 'text-[#C9A84C]',
    glow: 'shadow-[0_0_24px_rgba(201,168,76,0.08)]',
  },
  emerald: {
    icon: 'text-[#34d399]',
    value: 'text-[#34d399]',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.08)]',
  },
  red: {
    icon: 'text-red-400',
    value: 'text-red-400',
    glow: 'shadow-[0_0_24px_rgba(248,113,113,0.08)]',
  },
  amber: {
    icon: 'text-amber-400',
    value: 'text-amber-400',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.08)]',
  },
};

export default function KPICard({ title, value, subtitle, icon, trend, variant = 'default' }: KPICardProps) {
  const styles = variantStyles[variant];
  const trendPositive = trend && trend.value >= 0;

  return (
    <div
      className={`relative flex flex-col gap-3 rounded-xl p-5 ${styles.glow}`}
      style={{
        backgroundColor: '#161616',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Icon — top right */}
      <div className={`absolute top-4 right-4 ${styles.icon} opacity-80`}>
        {icon}
      </div>

      {/* Title */}
      <p
        className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans"
        style={{ letterSpacing: '0.1em' }}
      >
        {title}
      </p>

      {/* Value */}
      <p
        className={`text-4xl font-display leading-none ${styles.value}`}
        style={{ fontFamily: 'Anton, sans-serif' }}
      >
        {value}
      </p>

      {/* Subtitle and trend */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        {subtitle && (
          <p className="text-xs text-white/35 font-sans truncate">{subtitle}</p>
        )}

        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium font-sans ml-auto shrink-0 ${
              trendPositive ? 'text-[#34d399]' : 'text-red-400'
            }`}
          >
            {trendPositive ? (
              <TrendingUp size={12} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={12} strokeWidth={2.5} />
            )}
            <span>
              {trendPositive ? '+' : ''}{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
