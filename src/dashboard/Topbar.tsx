import { useLocation } from 'react-router-dom';

const ROUTE_LABELS: Record<string, string> = {
  overview: 'Overview',
  orders: 'Órdenes de Trabajo',
  new: 'Nueva Orden',
  vehicles: 'Vehículos',
  inventory: 'Inventario',
  technicians: 'Técnicos',
  finance: 'Finanzas',
  tracking: 'Seguimiento',
  appointments: 'Citas',
  'ai-assistant': 'Asistente IA',
};

function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.replace('/dashboard/', '').split('/').filter(Boolean);
  return segments.map((seg) => {
    // If it looks like an ID (e.g. "order-003"), label it as detail
    if (seg.match(/^[a-z]+-\d+$/)) return 'Detalle';
    return ROUTE_LABELS[seg] ?? seg;
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Topbar() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumb(location.pathname);
  const today = formatDate(new Date());
  // Capitalize first letter
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header
      style={{
        height: 56,
        backgroundColor: '#0A0A0A',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Dashboard
        </span>
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>/</span>
            <span
              style={{
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                color: idx === breadcrumbs.length - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
              }}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Date */}
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.40)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {todayFormatted}
        </span>

        {/* Workshop status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            backgroundColor: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.25)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#34d399',
              display: 'inline-block',
              boxShadow: '0 0 6px #34d399',
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#34d399',
            }}
          >
            Abierto
          </span>
        </div>
      </div>
    </header>
  );
}
