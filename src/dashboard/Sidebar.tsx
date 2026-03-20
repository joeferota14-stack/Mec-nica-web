import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Car,
  Package,
  Users,
  UserCircle,
  TrendingUp,
  Kanban,
  CalendarDays,
  Bot,
  ArrowLeft,
} from 'lucide-react';
import wlasLogo from '../assets/wlas-motor-logo.png';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard/overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { to: '/dashboard/orders', label: 'Órdenes', icon: <ClipboardList size={18} /> },
  { to: '/dashboard/clients', label: 'Clientes', icon: <UserCircle size={18} /> },
  { to: '/dashboard/vehicles', label: 'Vehículos', icon: <Car size={18} /> },
  { to: '/dashboard/inventory', label: 'Inventario', icon: <Package size={18} /> },
  { to: '/dashboard/technicians', label: 'Técnicos', icon: <Users size={18} /> },
  { to: '/dashboard/finance', label: 'Finanzas', icon: <TrendingUp size={18} /> },
  { to: '/dashboard/tracking', label: 'Seguimiento', icon: <Kanban size={18} /> },
  { to: '/dashboard/appointments', label: 'Citas', icon: <CalendarDays size={18} /> },
  { to: '/dashboard/ai-assistant', label: 'Asistente IA', icon: <Bot size={18} />, badge: 'IA' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: '100vh',
        backgroundColor: '#111111',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <img
          src={wlasLogo}
          alt="WLAS MOTOR"
          style={{ width: '100%', maxWidth: 160, height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 2,
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#C9A84C' : 'rgba(255,255,255,0.65)',
              backgroundColor: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              border: isActive ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
            })}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: '#C9A84C',
                  color: '#0A0A0A',
                  padding: '1px 6px',
                  borderRadius: 4,
                  letterSpacing: '0.05em',
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Back to website */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '9px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.45)',
            backgroundColor: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={15} />
          <span>Volver a la web</span>
        </button>
      </div>
    </aside>
  );
}
