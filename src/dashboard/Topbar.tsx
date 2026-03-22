import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onMenuToggle: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  overview: 'Overview',
  orders: 'Órdenes de Trabajo',
  new: 'Nueva Orden',
  clients: 'Clientes',
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

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const breadcrumbs = getBreadcrumb(location.pathname);

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }
  const today = formatDate(new Date());
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
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {/* Hamburger — only on mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden flex items-center justify-center rounded-lg p-1.5 shrink-0 transition-colors"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)')}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              fontFamily: 'Inter, sans-serif',
              flexShrink: 0,
            }}
          >
            Dashboard
          </span>
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, flexShrink: 0 }}>/</span>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                  color: idx === breadcrumbs.length - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right side indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Date — hidden on small screens */}
        <span
          className="hidden md:block"
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.40)',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {todayFormatted}
        </span>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          title="Cerrar sesión"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)')}
        >
          <LogOut size={16} />
        </button>

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
            flexShrink: 0,
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
