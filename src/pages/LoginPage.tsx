import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import wlasLogo from '../assets/wlas-motor-logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmail('admin@wlasmotor.com');
    setPassword('demo1234');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A2E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', top: 32, left: 32 }}>
        <Link to="/">
          <img src={wlasLogo} alt="Wlas Motor" style={{ height: 48 }} />
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: 440, background: '#16213E', borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: -50, left: -50, right: -50, height: 100, background: 'radial-gradient(ellipse at top, rgba(233,79,55,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(233,79,55,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Lock size={28} color="#E94F37" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#F5F5F0', marginBottom: 8 }}>
            Acceso Administrativo
          </h1>
          <p style={{ color: '#8892A4', fontSize: 15 }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <div style={{ background: 'rgba(233,79,55,0.05)', border: '1px dashed rgba(233,79,55,0.3)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <Info size={20} color="#E94F37" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ color: '#F5F5F0', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Modo Demo Activo</p>
              <p style={{ color: '#8892A4', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                Email: admin@wlasmotor.com<br />
                Pass: demo1234
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            style={{ width: '100%', padding: '8px 16px', background: 'rgba(233,79,55,0.1)', border: '1px solid rgba(233,79,55,0.2)', color: '#E94F37', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,79,55,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(233,79,55,0.1)' }}
          >
            Usar credenciales demo
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(245,245,240,0.8)', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#8892A4" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ej. admin@wlasmotor.com"
                required
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px 14px 44px', color: '#F5F5F0', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#E94F37'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(245,245,240,0.8)', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={18} color="#8892A4" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px 14px 44px', color: '#F5F5F0', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#E94F37'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', background: '#E94F37', color: '#F5F5F0', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4721E' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#E94F37' }}
          >
            Ingresar al Dashboard <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
