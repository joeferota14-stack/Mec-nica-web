/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Activity, Wrench, CircleDashed, Cpu, Gauge, Disc, Thermometer, Battery, Droplet, Car, ShieldCheck, CheckCircle2, Star, Clock, Trophy, Phone, Mail, MapPin, MessageCircle, Menu, X } from "lucide-react";
import logo from './assets/wlas-motor-logo.png';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // High-quality monochromatic automotive background
  const bgImageUrl = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop";

  return (
    <div className="bg-black font-sans min-h-screen scroll-smooth">
      {/* Fixed Navigation Bar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-500 ${
          isScrolled ? 'bg-black/95 backdrop-blur-md shadow-lg shadow-black/50 py-3 border-b border-white/10' : 'bg-transparent py-6'
        }`} 
        id="nav-bar"
      >
        {/* Logo */}
        <a href="#" className="flex items-center transition-all duration-300">
          <img 
            src={logo} 
            alt="WLAS MOTOR" 
            className="w-auto object-contain transition-all duration-500"
            style={{
              height: isScrolled ? '45px' : '60px',
              background: 'transparent',
              filter: isScrolled ? 'drop-shadow(0px 0px 6px rgba(255,255,255,0.5))' : 'none'
            }}
          />
        </a>

        {/* Botón Hamburguesa Móvil */}
        <button 
          className="md:hidden text-white transition-opacity"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Alternar menú"
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>

        {/* Links Centrados (Desktop) */}
        <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
          {[
            { label: "INICIO", href: "#" },
            { label: "SERVICIOS", href: "#services" },
            { label: "CARACTERÍSTICAS", href: "#features" },
            { label: "CONTACTO", href: "#footer" }
          ].map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-[10px] xl:text-xs font-bold tracking-[0.15em] transition-colors ${
                index === 0 
                  ? "px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-white" 
                  : "text-white/70 hover:text-white"
              }`}
              onClick={(e) => {
                if (item.href === "#") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Menú Overlay para Móviles */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-lg flex flex-col justify-center items-center gap-8 transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {[
          { label: "INICIO", href: "#" },
          { label: "SERVICIOS", href: "#services" },
          { label: "CARACTERÍSTICAS", href: "#features" },
          { label: "CONTACTO", href: "#footer" }
        ].map((item, index) => (
          <a
            key={item.label}
            href={item.href}
            className={`text-lg font-bold tracking-widest uppercase transition-colors px-10 py-3 ${
              index === 0 
                ? "rounded-full border border-white/20 bg-white/10 text-white" 
                : "text-white/70 hover:text-white"
            }`}
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (item.href === "#") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Hero Section Container */}
      <div className="min-h-screen flex items-center justify-center">
        {/* Main Frame Container */}
        <div 
          className="relative w-full h-screen overflow-hidden flex flex-col"
          id="hero-frame"
        >
          {/* Background Image with Monochromatic Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={bgImageUrl} 
              alt="Automotive Background" 
              className="w-full h-full object-cover grayscale opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>


          {/* Content Layout */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-16 relative z-10">
            
            {/* Main Heading & Description */}
            <div className="max-w-4xl">
              <h1 
                className="font-display text-[8vw] md:text-[5vw] leading-[0.9] uppercase tracking-tighter text-white"
                id="main-heading"
              >
                INGENIERÍA <br />
                <span className="text-white/30">SIN LÍMITES</span>
              </h1>
              <p className="mt-6 text-sm md:text-lg text-white/60 font-medium max-w-xl leading-relaxed" id="main-description">
                Elevamos el estándar de la mecánica automotriz. Precisión técnica y atención al detalle para vehículos que exigen lo mejor.
              </p>
              
              {/* Single CTA Button */}
              <div className="mt-10 flex items-center gap-4 group cursor-pointer w-fit" id="cta-button">
                <div className="bg-white text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-transform group-hover:scale-105">
                  Reservar Cita
                </div>
                <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center z-20 border-t border-white/10 pt-8" id="status-bar">
            <div className="flex gap-8">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Ubicación</p>
                <p className="text-xs font-bold text-white uppercase">Distrito Tecnológico</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Horario</p>
                <p className="text-xs font-bold text-white uppercase">Lun - Sáb / 08:00 - 18:00</p>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] uppercase tracking-widest text-white/40">WLAS MOTOR © 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="bg-zinc-50 py-24 px-4 md:px-8 border-t border-zinc-200" id="services">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Image Area */}
          <div className="relative rounded-[2rem] overflow-hidden border border-zinc-200 bg-zinc-100 shadow-xl shadow-zinc-200/50 h-[400px] md:h-full md:min-h-[600px]" id="services-image-container">
            {/* Single Car Image filling the container */}
            <img 
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop" 
              alt="Servicio Automotriz" 
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform hover:scale-105 duration-700"
            />
          </div>

          {/* Right Column: Text & Features */}
          <div className="flex flex-col">
            <h3 className="text-zinc-500 font-bold tracking-[0.15em] text-[10px] md:text-xs uppercase mb-6" id="services-subtitle">
              Nuestros Servicios
            </h3>
            
            <h2 className="text-4xl md:text-[3.5rem] leading-[1.1] font-display font-medium text-zinc-900 tracking-tight mb-6 text-balance" id="services-heading">
              Transformamos tu vehículo con servicio experto
            </h2>
            
            <p className="text-zinc-500 text-lg leading-relaxed mb-10 max-w-xl" id="services-description">
              Redefinimos el cuidado automotriz con técnicos expertos y tecnología de punta, logrando velocidad, exactitud y confianza en el camino.
            </p>
            
            <button className="flex items-center gap-3 bg-zinc-900 text-white px-6 py-3 rounded-full w-fit shadow-lg shadow-zinc-900/20 hover:scale-[1.02] active:scale-95 transition-all group mb-16" id="services-cta">
              <span className="font-semibold text-sm">Reservar una demostración</span>
              <div className="bg-white text-zinc-900 rounded-full w-6 h-6 flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-200 pt-10">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 flex items-center justify-center text-zinc-500">
                  <Activity className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h4 className="font-semibold text-zinc-900 text-lg leading-tight w-4/5">Diagnóstico Computarizado</h4>
              </div>
              
              <div className="flex flex-col gap-4 md:border-l md:border-zinc-200 md:pl-10">
                <div className="w-10 h-10 flex items-center justify-center text-zinc-500">
                  <Wrench className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h4 className="font-semibold text-zinc-900 text-lg leading-tight w-4/5">Análisis y Mantenimiento Inteligente</h4>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Grid Section (New) */}
      <section className="bg-white py-24 px-4 md:px-8" id="features">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          
          <div className="text-center mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-zinc-900 tracking-tight mb-6">
              Mantenimiento integral para el rendimiento óptimo
            </h2>
            <p className="text-zinc-500 text-lg">
              Confía en nuestras herramientas verificadas y nuestro equipo especializado para mantener tu vehículo seguro y en perfectas condiciones.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-16">
            
            {/* Card 1 */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-6 text-emerald-500">
                <Droplet strokeWidth={1.5} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Cambio de Aceite</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Lubricantes premium que protegen el motor, reducen el desgaste y mejoran la eficiencia en cada kilómetro.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-6 text-rose-500">
                <Disc strokeWidth={1.5} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Sistema de Frenos</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Revisión, ajuste y cambio de pastillas o discos para garantizar tu seguridad absoluta al detenerte.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-6 text-blue-500">
                <Car strokeWidth={1.5} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Suspensión y Dirección</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Alineación, balanceo y ajuste de amortiguadores para un manejo suave y control perfecto en curvas.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-6 text-amber-500">
                <Battery strokeWidth={1.5} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Sistema Eléctrico</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Diagnóstico de batería, alternador y cableado para asegurar un arranque confiable y energía constante.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-6 text-cyan-500">
                <Thermometer strokeWidth={1.5} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Aire Acondicionado</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Recarga de gas, limpieza de filtros y revisión de fugas para mantener el clima ideal en la cabina.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-6 text-indigo-500">
                <ShieldCheck strokeWidth={1.5} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Manteamiento Preventivo</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Inspección general de fluidos, bandas y filtros. La mejor estrategia para evitar reparaciones costosas.
              </p>
            </div>
            
          </div>

          <button className="flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-full w-fit shadow-lg shadow-zinc-900/20 hover:scale-[1.02] active:scale-95 transition-all group">
            <span className="font-semibold text-sm tracking-wide">Agendar Revisión Completa</span>
            <div className="bg-white text-zinc-900 rounded-full w-6 h-6 flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>

        </div>
      </section>

      {/* Benefits / Why Choose Us Section */}
      <section className="bg-zinc-50 py-24 px-4 md:px-8 border-t border-zinc-200" id="benefits">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            {/* Left Content */}
            <div className="w-full md:w-1/2">
              <h3 className="text-zinc-500 font-bold tracking-[0.15em] text-[10px] md:text-xs uppercase mb-6" id="benefits-subtitle">
                Por Qué Elegirnos
              </h3>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-zinc-900 tracking-tight mb-8">
                El estándar de excelencia en tu ciudad
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed mb-10">
                No somos un taller convencional. Somos un centro de ingeniería automotriz dedicado a la precisión. Combinamos técnicos formados en concesionarios con la tecnología de diagnóstico más avanzada disponible en el mercado.
              </p>
              
              <div className="space-y-6">
                {[
                  "Garantía de 12 meses en todas las reparaciones mayores",
                  "Transparencia total: te mostramos el problema antes de arreglarlo",
                  "Refacciones originales o de calidad superior OEM",
                  "Equipo de escaneo actualizado para vehículos 2026"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-zinc-900 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-zinc-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image/Stats grid */}
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-center items-center text-center">
                <Clock className="w-10 h-10 text-zinc-300 mb-4" strokeWidth={1.5} />
                <span className="text-4xl font-display font-medium text-zinc-900 mb-2">45m</span>
                <span className="text-zinc-500 text-sm font-medium">Diagnóstico Promedio</span>
              </div>
              <div className="bg-zinc-900 p-8 rounded-[2rem] shadow-xl flex flex-col justify-center items-center text-center">
                <Trophy className="w-10 h-10 text-zinc-600 mb-4" strokeWidth={1.5} />
                <span className="text-4xl font-display font-medium text-white mb-2">15+</span>
                <span className="text-zinc-400 text-sm font-medium">Años de Experiencia</span>
              </div>
              <div className="col-span-2 relative rounded-[2rem] overflow-hidden h-64 border border-zinc-200">
                <img 
                  src="https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=2070&auto=format&fit=crop" 
                  alt="Técnico Especializado" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise / Use Cases Section */}
      <section className="bg-white py-24 px-4 md:px-8 border-t border-zinc-200" id="expertise">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-zinc-900 tracking-tight mb-6">
              Expertos en todas las gamas
            </h2>
            <p className="text-zinc-500 text-lg">
              Desde mantenimientos de rutina en utilitarios hasta diagnósticos complejos en vehículos premium europeos y asiáticos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              { 
                title: "Vehículos Europeos", 
                desc: "Equipos específicos para BMW, Mercedes-Benz, Audi, Volkswagen y más. Respetamos los torques y especificaciones de fábrica.",
                image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
              },
              { 
                title: "Flotillas Comerciales", 
                desc: "Planes de mantenimiento preventivo diseñados para minimizar el tiempo de inactividad de tus vehículos de trabajo.",
                image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=2072&auto=format&fit=crop"
              },
              { 
                title: "Vehículos Híbridos", 
                desc: "Técnicos certificados en el manejo seguro y diagnóstico de sistemas híbridos de alta tensión y baterías.",
                image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2072&auto=format&fit=crop"
              }
            ].map((useCase, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="w-full h-64 rounded-[2rem] mb-6 overflow-hidden border border-zinc-200 shadow-sm relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img src={useCase.image} alt={useCase.title} className="w-full h-full object-cover grayscale mix-blend-multiply group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                </div>
                <h4 className="text-xl font-bold text-zinc-900 mb-3">{useCase.title}</h4>
                <p className="text-zinc-500 leading-relaxed">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-zinc-900 py-32 px-4 md:px-8" id="testimonials">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="flex gap-1 mb-6 text-amber-400">
              {[1,2,3,4,5].map((star) => <Star key={star} fill="currentColor" strokeWidth={0} className="w-6 h-6" />)}
            </div>
            <h2 className="text-3xl md:text-[3.5rem] leading-[1.1] font-display font-medium text-white tracking-tight max-w-3xl">
              "El único taller al que confío mi vehículo. Diagnósticos precisos sin costos inflados."
            </h2>
            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-700">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" alt="Avatar Cliente" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm">Ricardo Mendes</p>
                <p className="text-zinc-400 text-xs">Propietario de Audi A4</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black text-white pt-24 pb-12 px-4 md:px-8 border-t border-zinc-800" id="footer">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Logo & Info */}
            <div className="lg:col-span-1">
              <h2 className="font-display text-2xl font-bold tracking-tighter uppercase mb-6 flex items-center gap-3">
                <img src={logo} alt="WLAS MOTOR" className="h-8 w-auto bg-transparent object-contain brightness-0 invert" />
                WLAS MOTOR<span className="text-zinc-500 text-xl">.</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                Ingeniería sin límites. Elevamos el estándar de la mecánica automotriz con precisión y tecnología.
              </p>
              <button className="px-6 py-2 rounded-full border border-zinc-700 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors w-fit">
                Reservar Cita
              </button>
            </div>

            {/* Contact Links */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">Contacto</h4>
              <a href="#" className="text-zinc-300 hover:text-white transition-colors flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-zinc-500" />
                (555) 123-4567
              </a>
              <a href="#" className="text-zinc-300 hover:text-white transition-colors flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-zinc-500" />
                contacto@wlasmotor.com
              </a>
              <p className="text-zinc-300 flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>Av. Tecnológica 404, Zona Industrial<br/>Ciudad, CP 90000</span>
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">Navegación</h4>
              {["Inicio", "Servicios", "Flotillas", "Nuestra Historia", "Preguntas Frecuentes"].map((link) => (
                <a key={link} href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">
                  {link}
                </a>
              ))}
            </div>

            {/* Hours */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">Horarios</h4>
              <div className="flex justify-between text-sm text-zinc-300 border-b border-zinc-800 pb-2">
                <span>Lunes - Viernes</span>
                <span className="text-zinc-500">08:00 - 18:00</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-300 border-b border-zinc-800 pb-2">
                <span>Sábado</span>
                <span className="text-zinc-500">08:00 - 14:00</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-300 pb-2">
                <span>Domingo</span>
                <span className="text-zinc-600">Cerrado</span>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-800 text-xs text-zinc-600">
            <p>© 2026 WLAS MOTOR. Todos los derechos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Términos</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/1234567890?text=Hola,%20me%20gustar%C3%ADa%20agendar%20una%20revisi%C3%B3n%20para%20mi%20veh%C3%ADculo." 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-green-500 text-white p-4 rounded-full shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-50 flex items-center justify-center group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
        {/* Tooltip */}
        <span className="absolute -top-10 right-0 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Reserva tu cita
        </span>
      </a>
    </div>
  );
}
