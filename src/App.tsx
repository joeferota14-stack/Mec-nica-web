import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, ShieldCheck, Clock, MessageCircle, Menu, X,
  Package, Monitor, Calendar, DollarSign, Car, Lock,
  Phone, Mail, MapPin, Cpu, Settings, Navigation, Zap,
  Target, Snowflake, Facebook, Instagram, Youtube,
  CheckCircle, Droplets, Search, Check, Star, ArrowRight,
} from 'lucide-react';
import wlasLogo from './assets/wlas-motor-logo.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CARD_SHADOW =
  'rgba(14,63,126,0.04) 0px 0px 0px 1px,' +
  'rgba(42,51,69,0.04) 0px 1px 1px -0.5px,' +
  'rgba(42,51,70,0.04) 0px 3px 3px -1.5px,' +
  'rgba(42,51,70,0.04) 0px 6px 6px -3px,' +
  'rgba(14,63,126,0.04) 0px 12px 12px -6px,' +
  'rgba(14,63,126,0.04) 0px 24px 24px -12px';

const PF = "'Playfair Display', serif";
const JB = "'JetBrains Mono', monospace";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = ['Todos', 'Mantenimiento', 'Motor', 'Frenos', 'Suspensión', 'Diagnóstico', 'Paquetes'];

interface Service {
  id: number; name: string; price: string; duration: string;
  category: string; badge: string; Icon: React.ElementType; description: string;
}

const SERVICES: Service[] = [
  { id: 1,  name: 'Cambio de Aceite y Filtro',         price: '$35',  duration: '45 min', category: 'Mantenimiento', badge: '⚡ Más Solicitado',     Icon: Droplets,    description: 'Aceite sintético o convencional, filtro nuevo y revisión de niveles.' },
  { id: 2,  name: 'Diagnóstico Computarizado OBD2',     price: '$25',  duration: '1 h',    category: 'Diagnóstico',   badge: '🔍 Incluye Informe',    Icon: Cpu,         description: 'Lectura de códigos de falla con escáner profesional e informe escrito.' },
  { id: 3,  name: 'ABC de Motor',                       price: '$80',  duration: '2 h',    category: 'Motor',         badge: '✅ Con Garantía',       Icon: Wrench,      description: 'Bujías, filtros de aire y combustible, correas auxiliares y más.' },
  { id: 4,  name: 'ABC de Frenos',                      price: '$60',  duration: '1.5 h',  category: 'Frenos',        badge: '🛡️ Seguridad',         Icon: ShieldCheck, description: 'Pastillas, discos, líquido de frenos e inspección completa del sistema.' },
  { id: 5,  name: 'Revisión de Suspensión',             price: '$30',  duration: '45 min', category: 'Suspensión',    badge: '🔍 Incluye Informe',    Icon: Car,         description: 'Inspección de amortiguadores, rótulas, terminales y barra estabilizadora.' },
  { id: 6,  name: 'Cambio de Correa de Distribución',   price: '$120', duration: '3–4 h',  category: 'Motor',         badge: '⚠️ Trabajo Crítico',    Icon: Settings,    description: 'Correa, tensor, polea y bomba de agua según especificación de fábrica.' },
  { id: 7,  name: 'Revisión Pre-Compra',                price: '$45',  duration: '1.5 h',  category: 'Diagnóstico',   badge: '📋 Informe Detallado',  Icon: Search,      description: 'Inspección de 50 puntos antes de comprar un vehículo usado.' },
  { id: 8,  name: 'Mantenimiento 10.000 km',            price: '$95',  duration: '2 h',    category: 'Mantenimiento', badge: '🏆 Paquete Completo',   Icon: Package,     description: 'Aceite, filtros, frenos, suspensión, luces y diagnóstico OBD incluido.' },
  { id: 9,  name: 'Paquete Viaje Seguro',               price: '$65',  duration: '2 h',    category: 'Paquetes',      badge: '🚗 Especial',           Icon: Navigation,  description: 'Check-up completo para carretera: frenos, suspensión, luces, líquidos.' },
  { id: 10, name: 'Limpieza de Inyectores',             price: '$50',  duration: '1.5 h',  category: 'Motor',         badge: '⚡ Mejora Rendimiento', Icon: Zap,         description: 'Limpieza ultrasónica en banco con prueba de caudal y atomización.' },
  { id: 11, name: 'Alineación y Balanceo',              price: '$25',  duration: '45 min', category: 'Suspensión',    badge: '✅ Con Garantía',       Icon: Target,      description: 'Alineación computarizada en 4 ruedas y balanceo de neumáticos.' },
  { id: 12, name: 'Paquete Invierno',                   price: '$75',  duration: '2 h',    category: 'Paquetes',      badge: '❄️ Temporada',          Icon: Snowflake,   description: 'Batería, limpiaparabrisas, líquido refrigerante y revisión de luces.' },
];

interface Testimonial {
  id: number; name: string; city: string; service: string;
  text: string; initials: string; color: string;
}

const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'María González',   city: 'Quito Norte',          service: 'Cambio de Aceite',        initials: 'MG', color: '#E94F37', text: '"Llevo 3 años trayendo mi carro aquí. Son puntuales, honestos y jamás me han cobrado algo innecesario. El mejor taller de Quito, sin duda."' },
  { id: 2, name: 'Carlos Mendoza',   city: 'La Floresta',          service: 'Diagnóstico OBD2',        initials: 'CM', color: '#3B82F6', text: '"Me explicaron el diagnóstico con paciencia, mostrándome cada código en pantalla. Nada de tecnicismos innecesarios. Confianza total."' },
  { id: 3, name: 'Paola Vásquez',    city: 'Cumbayá',              service: 'ABC de Frenos',           initials: 'PV', color: '#8B5CF6', text: '"El sistema de frenos de mi SUV estaba comprometido. Lo resolvieron en el tiempo prometido y con garantía escrita. Profesionalismo de primer nivel."' },
  { id: 4, name: 'Roberto Andrade',  city: 'Valle de los Chillos', service: 'Mantenimiento 10.000 km', initials: 'RA', color: '#10B981', text: '"Paquete completo a un precio justo. Entregaron el carro limpio por dentro y por fuera, con un informe detallado. Impecable."' },
  { id: 5, name: 'Sofía Torres',     city: 'Quito Sur',            service: 'Revisión Pre-Compra',     initials: 'ST', color: '#F59E0B', text: '"Me salvaron de comprar un carro con problemas graves de motor. El informe fue tan detallado que el vendedor no tuvo argumentos. Vale cada centavo."' },
  { id: 6, name: 'Juan Pablo Ruiz',  city: 'Sangolquí',            service: 'Correa de Distribución',  initials: 'JP', color: '#EC4899', text: '"Trabajo crítico hecho a la perfección. Usaron repuestos originales, respetaron el presupuesto y me avisaron de todo antes de proceder."' },
  { id: 7, name: 'Daniela Espinoza', city: 'Nayón',                service: 'ABC de Motor',            initials: 'DE', color: '#14B8A6', text: '"Mi carro arranca diferente: más potente, más suave. Noté la diferencia desde el primer día. El equipo es joven, capacitado y muy amable."' },
  { id: 8, name: 'Andrés Molina',    city: 'Tumbaco',              service: 'Paquete Viaje Seguro',    initials: 'AM', color: '#6366F1', text: '"Identificaron un problema en la suspensión que hubiera sido peligroso en carretera. Viajé tranquilo gracias a ellos. Altamente recomendados."' },
  { id: 9, name: 'Lucía Benítez',    city: 'El Inca',              service: 'Alineación y Balanceo',   initials: 'LB', color: '#F97316', text: '"Rapidísimos, honestos y con precios transparentes. Me mostraron los valores antes y después de la alineación en pantalla. Regresaré siempre."' },
];

const COL_T1 = [TESTIMONIALS[0], TESTIMONIALS[1], TESTIMONIALS[2]];
const COL_T2 = [TESTIMONIALS[3], TESTIMONIALS[4], TESTIMONIALS[5]];
const COL_T3 = [TESTIMONIALS[6], TESTIMONIALS[7], TESTIMONIALS[8]];

// ─── TikTok SVG ───────────────────────────────────────────────────────────────
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.88a8.27 8.27 0 004.84 1.54V7.01a4.85 4.85 0 01-1.07-.32z" />
  </svg>
);

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  html { scroll-behavior: smooth; }
  :root {
    --font-pf: 'Playfair Display', serif;
    --font-jb: 'JetBrains Mono', monospace;
  }
  @keyframes blur-in {
    0%   { filter: blur(12px); opacity: 0; transform: translateY(8px); }
    100% { filter: blur(0);    opacity: 1; transform: translateY(0);   }
  }
  @keyframes scroll-down {
    0%   { transform: translateY(0);    }
    100% { transform: translateY(-50%); }
  }
  @keyframes scroll-up {
    0%   { transform: translateY(-50%); }
    100% { transform: translateY(0);    }
  }
  @keyframes float-btn {
    0%, 100% { transform: translateY(0);    }
    50%       { transform: translateY(-6px); }
  }
  @keyframes pulse-line {
    0%, 100% { opacity: 0.6; transform: scaleY(1);   }
    50%       { opacity: 0.15; transform: scaleY(0.45); }
  }
  .reveal-card {
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .reveal-card.revealed { opacity: 1; transform: scale(1); }
  .scroll-down { animation: scroll-down 35s linear infinite; }
  .scroll-up   { animation: scroll-up   35s linear infinite; }
  .testimonials-col:hover .scroll-down,
  .testimonials-col:hover .scroll-up { animation-duration: 75s; }
  .service-card { transition: border-color 0.3s ease, transform 0.3s ease-out; }
  .service-card:hover { border-color: rgba(233,79,55,0.4) !important; transform: scale(1.02); }
  .trust-badge  { transition: background 0.3s ease; cursor: default; }
  .trust-badge:hover { background: rgba(233,79,55,0.05) !important; }
  .bento-card   { transition: transform 0.3s ease-out; }
  .bento-card:hover { transform: scale(1.02); }
  .nav-link { position: relative; color: rgba(245,245,240,0.75); transition: color 0.2s; font-size: 14px; font-weight: 500; text-decoration: none; }
  .nav-link:hover { color: #F5F5F0; }
  .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px; background: #E94F37; transition: width 0.3s; }
  .nav-link:hover::after { width: 100%; }
  .whatsapp-fab { animation: float-btn 3s ease-in-out infinite; }
  .filter-scroll { overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none; }
  .filter-scroll::-webkit-scrollbar { display: none; }
  @media (max-width: 900px) {
    .bento-grid > * { grid-column: 1 / -1 !important; grid-row: auto !important; min-height: auto !important; }
  }
  @media (max-width: 768px) {
    .badges-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .testimonials-outer { grid-template-columns: 1fr !important; height: auto !important; }
    .testimonials-outer > *:nth-child(2),
    .testimonials-outer > *:nth-child(3) { display: none; }
  }
  @media (max-width: 480px) {
    .badges-grid { grid-template-columns: 1fr !important; }
  }
`;

// ─── Reveal Hook ──────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.reveal-card'));
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => setTimeout(() => card.classList.add('revealed'), i * 80));
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Servicios', href: '#servicios'   },
    { label: 'Nosotros',  href: '#nosotros'    },
    { label: 'Opiniones', href: '#testimonios' },
    { label: 'Contacto',  href: '#footer'      },
  ];

  return (
    <>
      <nav
        aria-label="Navegación principal"
        style={{
          position: 'fixed', top: 12, left: 12, right: 12, zIndex: 100,
          height: 64, borderRadius: 20,
          background: 'rgba(26,26,46,0.55)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.35)' : 'none',
          transition: 'box-shadow 0.3s',
        }}
      >
        {/* Left nav links — desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </div>

        {/* Logo — absolutely centered */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Link to="/" aria-label="Wlas Motor — página de inicio">
            <img src={wlasLogo} alt="Wlas Motor" style={{ height: 52, width: 'auto' }} />
          </Link>
        </div>

        <div style={{ flex: 1 }} />

        {/* CTA — desktop */}
        <div className="hidden md:block">
          <Link
            to="/login"
            aria-label="Iniciar sesión"
            style={{
              background: '#E94F37', color: '#F5F5F0',
              padding: '10px 20px', borderRadius: 50,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F4721E')}
            onMouseLeave={e => (e.currentTarget.style.background = '#E94F37')}
          >
            Iniciar Sesión
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden ml-auto"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú de navegación'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F5F5F0', padding: 4 }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      {open && (
        <div
          style={{
            position: 'fixed', top: 88, left: 12, right: 12, zIndex: 99,
            background: 'rgba(22,22,40,0.97)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
            animation: 'blur-in 0.25s ease-out both',
          }}
        >
          {links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '14px 24px',
                color: 'rgba(245,245,240,0.85)', fontSize: 15, fontWeight: 500,
                textDecoration: 'none',
                borderBottom: i < links.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ padding: '16px 24px 20px' }}>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              aria-label="Agendar cita"
              style={{
                display: 'block', textAlign: 'center',
                background: '#E94F37', color: '#F5F5F0',
                padding: '13px 20px', borderRadius: 50,
                fontSize: 15, fontWeight: 600, textDecoration: 'none',
              }}
            >
              Agendar Cita →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Bienvenido a Wlas Motor"
      style={{ minHeight: '100vh', background: '#1A1A2E', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}
    >
      {/* Background image */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1636036756993-dc5dfca1f2d6?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1A1A2E 30%, rgba(26,26,46,0.72) 65%, rgba(26,26,46,0.35) 100%)' }} />
      {/* Grid pattern */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px', width: '100%' }}>

        <p style={{ color: '#E94F37', fontSize: 13, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 24, animation: 'blur-in 0.8s ease-out 0.2s both' }}>
          Taller Mecánico en Quito, Ecuador
        </p>

        <h1 style={{ fontFamily: PF, fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 700, color: '#F5F5F0', lineHeight: 1.1, marginBottom: 24, maxWidth: 760, animation: 'blur-in 0.8s ease-out 0.4s both' }}>
          Tu auto seguro, siempre en{' '}
          <em style={{ color: '#E94F37', fontStyle: 'italic' }}>manos expertas.</em>
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: 'rgba(245,245,240,0.75)', maxWidth: 580, lineHeight: 1.75, marginBottom: 40, animation: 'blur-in 0.8s ease-out 0.6s both' }}>
          Más de 8 años brindando diagnóstico transparente, repuestos de calidad
          y técnicos certificados. Sin cobros sorpresa, con garantía por escrito.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48, animation: 'blur-in 0.8s ease-out 0.7s both' }}>
          <Link
            to="/dashboard"
            aria-label="Agenda tu cita en el taller ahora"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E94F37', color: '#F5F5F0', padding: '14px 28px', borderRadius: 50, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s, transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4721E'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#E94F37'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Agenda tu cita ahora <ArrowRight size={16} />
          </Link>
          <a
            href="#servicios"
            aria-label="Ver nuestros servicios"
            style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 28px', borderRadius: 50, fontSize: 15, fontWeight: 600, textDecoration: 'none', border: '1.5px solid rgba(245,245,240,0.35)', color: '#F5F5F0', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,245,240,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,245,240,0.35)')}
          >
            Ver nuestros servicios
          </a>
        </div>

        {/* Trust pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', animation: 'blur-in 0.8s ease-out 0.85s both' }}>
          {['Respuesta en menos de 2 horas', 'Garantía en todos los trabajos', 'Sin cobros sorpresa'].map(pill => (
            <span key={pill} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,245,240,0.85)', padding: '6px 14px', borderRadius: 50, fontSize: 13 }}>
              <Check size={13} color="#2ECC71" strokeWidth={2.5} />
              {pill}
            </span>
          ))}
        </div>
      </div>

    </section>
  );
}

// ─── Trust Badges ─────────────────────────────────────────────────────────────
function TrustBadgesSection() {
  const ref = useReveal();
  const badges = [
    { Icon: Wrench,        title: 'Técnicos Certificados',    desc: 'Todo nuestro equipo cuenta con formación técnica especializada y certificaciones vigentes.' },
    { Icon: ShieldCheck,   title: 'Garantía en Escrito',      desc: 'Cada trabajo tiene respaldo documental. Si algo falla en el período, lo resolvemos sin costo.' },
    { Icon: Clock,         title: 'Entrega Puntual',          desc: 'Respetamos los tiempos prometidos. Te avisamos con anticipación si hay algún cambio.' },
    { Icon: MessageCircle, title: 'Diagnóstico Transparente', desc: 'Te explicamos qué tiene tu vehículo, qué se necesita y cuánto cuesta. Sin letra pequeña.' },
  ];

  return (
    <section aria-label="Por qué confiar en Wlas Motor" style={{ background: '#16213E', padding: '72px 0' }}>
      <div
        ref={ref}
        className="badges-grid"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {badges.map(({ Icon, title, desc }, i) => (
          <div
            key={title}
            className="reveal-card trust-badge"
            style={{ padding: '40px 32px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(233,79,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icon size={24} color="#E94F37" />
            </div>
            <h3 style={{ color: '#F5F5F0', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{title}</h3>
            <p style={{ color: '#8892A4', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Bento Grid ───────────────────────────────────────────────────────────────
function BentoGridSection() {
  const ref = useReveal();

  const cardBase: React.CSSProperties = {
    background: '#fff', borderRadius: 24, padding: 32,
    boxShadow: CARD_SHADOW, overflow: 'hidden',
  };

  return (
    <section id="nosotros" aria-label="Quiénes somos" style={{ background: '#FAFAF8', padding: '96px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ color: '#E94F37', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>— Quiénes Somos</p>
          <h2 style={{ fontFamily: PF, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#1A1A2E', marginBottom: 16 }}>
            Mecánica de confianza,<br />respaldada por resultados.
          </h2>
          <p style={{ color: '#8892A4', fontSize: 17, maxWidth: 540, lineHeight: 1.7 }}>
            Desde 2016, cuidamos los autos de las familias de Quito con honestidad, tecnología y garantía real.
          </p>
        </div>

        {/* Bento grid */}
        <div
          ref={ref}
          className="bento-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}
        >
          {/* Card 1 — Large history */}
          <div className="reveal-card bento-card" style={{ ...cardBase, gridColumn: '1 / 3', gridRow: '1 / 2' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(233,79,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Clock size={26} color="#E94F37" />
            </div>
            <h3 style={{ fontFamily: PF, fontSize: 26, fontWeight: 700, color: '#1A1A2E', marginBottom: 12 }}>
              Más de 8 años sirviendo a Quito
            </h3>
            <p style={{ color: '#4A5568', fontSize: 15, lineHeight: 1.75 }}>
              Comenzamos como un taller pequeño en el norte de Quito. Hoy contamos con bahías equipadas, escáner OBD profesional y un equipo de mecánicos certificados comprometidos con la excelencia.
            </p>
          </div>

          {/* Card 2 — OBD */}
          <div className="reveal-card bento-card" style={{ ...cardBase, gridColumn: '3 / 4', gridRow: '1 / 2' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(233,79,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Monitor size={26} color="#E94F37" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A2E', marginBottom: 10 }}>Diagnóstico con escáner OBD</h3>
            <p style={{ color: '#4A5568', fontSize: 14, lineHeight: 1.65 }}>Tecnología de diagnóstico computarizado para detectar fallas exactas con informe escrito.</p>
          </div>

          {/* Card 3 — All brands */}
          <div className="reveal-card bento-card" style={{ ...cardBase, gridColumn: '4 / 5', gridRow: '1 / 2' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(233,79,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Star size={26} color="#E94F37" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A2E', marginBottom: 10 }}>Todas las marcas, una sola dirección</h3>
            <p style={{ color: '#4A5568', fontSize: 14, lineHeight: 1.65 }}>Toyota, Chevrolet, Kia, Hyundai, Mazda y más. Experiencia en todas las marcas del mercado.</p>
          </div>

          {/* Card 4 — Spare parts */}
          <div className="reveal-card bento-card" style={{ ...cardBase, gridColumn: '1 / 3', gridRow: '2 / 3' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(233,79,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Package size={26} color="#E94F37" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A2E', marginBottom: 10 }}>Solo repuestos de calidad</h3>
            <p style={{ color: '#4A5568', fontSize: 14, lineHeight: 1.65 }}>Trabajamos únicamente con repuestos originales o de primera calidad. Sin atajos, sin riesgos para tu vehículo.</p>
          </div>

          {/* Card 5 — Photo tall */}
          <div
            className="reveal-card bento-card"
            aria-label="Mecánicos de Wlas Motor trabajando"
            style={{
              gridColumn: '3 / 5', gridRow: '1 / 3', minHeight: 400,
              padding: 0, position: 'relative', overflow: 'hidden', borderRadius: 24,
              backgroundImage: 'url(https://images.unsplash.com/photo-1574016397280-8fc4a3b17a30?w=800&q=80)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              boxShadow: CARD_SHADOW,
            }}
          >
            <div style={{ position: 'absolute', bottom: 24, left: 24, background: '#E94F37', borderRadius: 16, padding: '16px 20px', maxWidth: 220 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>500+ vehículos atendidos en 2025</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>⭐ 4.8 / 5.0 en Google</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
function ServicesSection() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [fading, setFading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [slider, setSlider] = useState({ left: 6, width: 80 });
  const handleFilter = useCallback((cat: string) => {
    setFading(true);
    setTimeout(() => { setActiveFilter(cat); setFading(false); }, 150);
  }, []);

  useEffect(() => {
    const idx = CATEGORIES.indexOf(activeFilter);
    const btn = btnRefs.current[idx];
    if (btn) setSlider({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeFilter]);

  const filtered = activeFilter === 'Todos' ? SERVICES : SERVICES.filter(s => s.category === activeFilter);

  return (
    <section id="servicios" aria-label="Nuestros servicios" style={{ background: '#1A1A2E', padding: '96px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ color: '#E94F37', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>— Nuestros Servicios</p>
          <h2 style={{ fontFamily: PF, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#F5F5F0', marginBottom: 16 }}>
            Todo lo que tu auto necesita,<br />en un solo lugar.
          </h2>
          <p style={{ color: '#8892A4', fontSize: 17, maxWidth: 500, lineHeight: 1.7 }}>
            Diagnóstico, mantenimiento y reparación con precios claros y garantía incluida.
          </p>
        </div>

        {/* Filter bar */}
        <div className="filter-scroll" style={{ marginBottom: 40 }}>
          <div
            ref={containerRef}
            role="tablist"
            aria-label="Filtrar por categoría de servicio"
            style={{ position: 'relative', background: '#16213E', padding: 6, borderRadius: 50, display: 'inline-flex', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}
          >
            {/* Animated slider */}
            <div
              aria-hidden="true"
              style={{ position: 'absolute', top: 6, bottom: 6, left: slider.left, width: slider.width, background: '#E94F37', borderRadius: 50, transition: 'left 300ms ease, width 300ms ease', pointerEvents: 'none' }}
            />
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                ref={el => { btnRefs.current[i] = el; }}
                onClick={() => handleFilter(cat)}
                role="tab"
                aria-selected={activeFilter === cat}
                aria-label={`Filtrar servicios: ${cat}`}
                style={{ position: 'relative', zIndex: 1, background: 'transparent', border: 'none', padding: '8px 18px', borderRadius: 50, fontSize: 14, fontWeight: 500, cursor: 'pointer', color: activeFilter === cat ? '#F5F5F0' : '#8892A4', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services grid */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}
        >
          {filtered.map(s => (
            <div
              key={s.id}
              className="service-card"
              style={{ background: '#16213E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 600, background: 'rgba(233,79,55,0.12)', color: '#E94F37', padding: '4px 10px', borderRadius: 50 }}>
                {s.badge}
              </span>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(233,79,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.Icon size={22} color="#E94F37" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F5F5F0', lineHeight: 1.35 }}>{s.name}</h3>
              <p style={{ fontSize: 13, color: '#8892A4', lineHeight: 1.6, flexGrow: 1 }}>{s.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontFamily: JB, fontSize: 18, fontWeight: 600, color: '#F5F5F0' }}>{s.price}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8892A4' }}>
                  <Clock size={12} /> {s.duration}
                </span>
              </div>
              <Link
                to="/dashboard"
                aria-label={`Agendar ${s.name}`}
                style={{ fontSize: 13, fontWeight: 600, color: '#E94F37', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'gap 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.gap = '8px')}
                onMouseLeave={e => (e.currentTarget.style.gap = '4px')}
              >
                Agendar este servicio <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: 24, marginBottom: 16, boxShadow: CARD_SHADOW }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
        {[1,2,3,4,5].map(n => <Star key={n} size={15} color="#F59E0B" fill="#F59E0B" />)}
      </div>
      <p style={{ fontFamily: PF, fontStyle: 'italic', fontSize: 15, lineHeight: 1.75, color: '#2D3748', marginBottom: 18 }}>{t.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{t.initials}</div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1A2E' }}>{t.name}</p>
          <p style={{ fontSize: 12, color: '#8892A4' }}>{t.city} · {t.service}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const columns: [Testimonial[], string][] = [
    [COL_T1, 'scroll-down'],
    [COL_T2, 'scroll-up'],
    [COL_T3, 'scroll-down'],
  ];

  return (
    <section id="testimonios" aria-label="Opiniones de clientes" style={{ background: '#FAFAF8', padding: '96px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <p style={{ color: '#E94F37', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>— Lo que dicen nuestros clientes</p>
          <h2 style={{ fontFamily: PF, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#1A1A2E', marginBottom: 16 }}>
            Más de 500 familias<br />confían en nosotros.
          </h2>
          <p style={{ color: '#8892A4', fontSize: 17, maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
            Cada opinión representa un auto cuidado y una familia que viajó tranquila.
          </p>
        </div>

        <div className="testimonials-outer" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, height: 640 }}>
          {columns.map(([testimonials, dir], ci) => (
            <div
              key={ci}
              className="testimonials-col"
              style={{ overflow: 'hidden', position: 'relative', height: 640 }}
            >
              {/* Top gradient mask */}
              <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, #FAFAF8, transparent)', zIndex: 10, pointerEvents: 'none' }} />
              {/* Bottom gradient mask */}
              <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, #FAFAF8, transparent)', zIndex: 10, pointerEvents: 'none' }} />
              {/* Scroll track — duplicated for seamless loop */}
              <div className={dir}>
                {[...testimonials, ...testimonials].map((t, i) => (
                  <TestimonialCard key={`${t.id}-${ci}-${i}`} t={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABannerSection() {
  return (
    <section aria-label="Agenda tu cita hoy" style={{ background: '#1A1A2E', padding: '96px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ borderRadius: 28, overflow: 'hidden', position: 'relative', backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', padding: '72px 56px' }}>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,26,46,0.92), rgba(233,79,55,0.75))' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: PF, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#F5F5F0', marginBottom: 16, maxWidth: 600 }}>
              ¿Tu auto necesita atención? Nosotros lo resolvemos hoy.
            </h2>
            <p style={{ color: 'rgba(245,245,240,0.8)', fontSize: 17, marginBottom: 48, maxWidth: 520, lineHeight: 1.7 }}>
              Agenda en minutos, recibe confirmación inmediata y entrega puntual garantizada.
            </p>

            {/* Value props */}
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 48 }}>
              {[
                { Icon: Calendar,   title: 'Reserva en minutos',           sub: 'Sin llamadas, sin esperas' },
                { Icon: DollarSign, title: 'Precios fijos y transparentes', sub: 'Sin cobros ocultos' },
                { Icon: Car,        title: 'Taller equipado',              sub: 'Tecnología de diagnóstico de punta' },
              ].map(({ Icon, title, sub }) => (
                <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color="#F5F5F0" />
                  </div>
                  <div>
                    <p style={{ color: '#F5F5F0', fontWeight: 600, fontSize: 15 }}>{title}</p>
                    <p style={{ color: 'rgba(245,245,240,0.65)', fontSize: 13 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/593999999999"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp para agendar"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', padding: '14px 28px', borderRadius: 50, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,211,102,0.35)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.35)'; }}
            >
              <MessageCircle size={18} /> Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <section aria-label="Suscripción al boletín de Wlas Motor" style={{ background: '#16213E', padding: '96px 0' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: '#E94F37', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>— Mantente al día</p>
        <h2 style={{ fontFamily: PF, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#F5F5F0', marginBottom: 16 }}>
          Consejos de mecánica gratis<br />en tu correo.
        </h2>
        <p style={{ color: '#8892A4', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
          Recibe tips de mantenimiento, alertas de temporada y ofertas exclusivas para suscriptores.
        </p>

        {subscribed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'blur-in 0.5s ease-out both' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,204,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={32} color="#2ECC71" />
            </div>
            <p style={{ color: '#F5F5F0', fontSize: 18, fontWeight: 600 }}>¡Gracias por suscribirte!</p>
            <p style={{ color: '#8892A4', fontSize: 15 }}>Recibirás nuestro próximo boletín muy pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', background: 'rgba(245,245,240,0.07)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, overflow: 'hidden', marginBottom: 20 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                aria-label="Dirección de correo electrónico"
                style={{ flex: 1, background: 'transparent', border: 'none', padding: '14px 24px', color: '#F5F5F0', fontSize: 15, outline: 'none', minWidth: 0 }}
              />
              <button
                type="submit"
                aria-label="Suscribirse al boletín"
                style={{ background: '#E94F37', color: '#F5F5F0', border: 'none', padding: '14px 24px', borderRadius: 50, fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F4721E')}
                onMouseLeave={e => (e.currentTarget.style.background = '#E94F37')}
              >
                Suscribirse
              </button>
            </div>
          </form>
        )}

        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#8892A4', fontSize: 13, marginTop: 16 }}>
          <Lock size={13} /> Más de 800 propietarios ya están suscritos. Sin spam.
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function FooterSection() {
  const socials = [
    { label: 'Facebook',  href: '#', icon: <Facebook  size={16} /> },
    { label: 'Instagram', href: '#', icon: <Instagram size={16} /> },
    { label: 'TikTok',    href: '#', icon: <TikTokIcon /> },
    { label: 'YouTube',   href: '#', icon: <Youtube   size={16} /> },
  ];

  const linkStyle: React.CSSProperties = { display: 'block', color: '#8892A4', fontSize: 14, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' };

  return (
    <footer id="footer" aria-label="Pie de página de Wlas Motor" style={{ background: '#0D0D1A', borderTop: '2px solid #E94F37', padding: '80px 0 0', position: 'relative', overflow: 'hidden' }}>
      {/* Watermark */}
      <div aria-hidden="true" style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', fontFamily: PF, fontSize: 'clamp(80px, 20vw, 260px)', fontWeight: 700, color: 'rgba(245,245,240,0.04)', whiteSpace: 'nowrap', userSelect: 'none', zIndex: 0, pointerEvents: 'none', lineHeight: 1 }}>
        WLAS
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10" style={{ marginBottom: 64 }}>

          {/* Col 1 — Brand */}
          <div>
            <img src={wlasLogo} alt="Wlas Motor" style={{ height: 42, width: 'auto', marginBottom: 16 }} />
            <p style={{ color: '#E94F37', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Mecánica que no miente.</p>
            <p style={{ color: '#8892A4', fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}>
              Taller automotriz en Quito con más de 8 años cuidando los autos de las familias ecuatorianas.
            </p>
            <p style={{ color: '#8892A4', fontSize: 13, marginBottom: 4 }}>📍 Av. 10 de Agosto y Colón, Quito</p>
            <p style={{ color: '#8892A4', fontSize: 13, marginBottom: 20 }}>🕐 Lun–Vie 8:00–18:00 · Sáb 8:00–14:00</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8892A4', textDecoration: 'none', transition: 'background 0.2s, color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E94F37'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#8892A4'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Servicios */}
          <div>
            <h4 style={{ color: '#F5F5F0', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Servicios</h4>
            {['Cambio de Aceite', 'Diagnóstico OBD2', 'ABC de Motor', 'ABC de Frenos', 'Alineación y Balanceo', 'Revisión Pre-Compra', 'Mantenimiento 10.000 km'].map(s => (
              <a key={s} href="#servicios" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8892A4')}
              >{s}</a>
            ))}
          </div>

          {/* Col 3 — Acerca de */}
          <div>
            <h4 style={{ color: '#F5F5F0', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Acerca de</h4>
            {['Quiénes Somos', 'Nuestro Equipo', 'Instalaciones', 'Blog de Mantenimiento', 'Preguntas Frecuentes', 'Política de Privacidad'].map(l => (
              <a key={l} href="#nosotros" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8892A4')}
              >{l}</a>
            ))}
          </div>

          {/* Col 4 — Contacto */}
          <div>
            <h4 style={{ color: '#F5F5F0', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Contacto</h4>
            {[
              { Icon: Phone,         text: '+593 99 999 9999',  href: 'tel:+593999999999' },
              { Icon: MessageCircle, text: 'WhatsApp',          href: 'https://wa.me/593999999999' },
              { Icon: Mail,          text: 'info@wlasmotor.ec', href: 'mailto:info@wlasmotor.ec' },
              { Icon: MapPin,        text: 'Cómo llegar',       href: '#' },
            ].map(({ Icon, text, href }) => (
              <a
                key={text}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label={text}
                style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#8892A4', fontSize: 14, textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8892A4')}
              >
                <Icon size={15} /> {text}
              </a>
            ))}
            <Link
              to="/dashboard"
              aria-label="Agendar cita online"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: '#E94F37', color: '#fff', padding: '10px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F4721E')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E94F37')}
            >
              <Calendar size={14} /> Agendar online
            </Link>
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: '#8892A4', fontSize: 13 }}>© 2026 Wlas Motor. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacidad', 'Términos de uso'].map(l => (
              <a key={l} href="#" style={{ color: '#8892A4', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8892A4')}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── WhatsApp FAB ─────────────────────────────────────────────────────────────
function WhatsAppFAB() {
  return (
    <a
      href="https://wa.me/593999999999"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar a Wlas Motor por WhatsApp"
      className="whatsapp-fab"
      style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200, width: 56, height: 56, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', textDecoration: 'none', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.65)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.4)')}
    >
      <MessageCircle size={26} color="#fff" />
    </a>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <Navbar />
      <main>
        <HeroSection />
        <TrustBadgesSection />
        <BentoGridSection />
        <ServicesSection />
        <TestimonialsSection />
        <CTABannerSection />
        <NewsletterSection />
      </main>
      <FooterSection />
      <WhatsAppFAB />
    </>
  );
}
