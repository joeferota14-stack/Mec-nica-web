/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export default function App() {
  // High-quality monochromatic automotive background
  const bgImageUrl = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      {/* Main Frame Container */}
      <div 
        className="relative w-full max-w-7xl h-[90vh] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col"
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

        {/* Navigation Bar */}
        <nav className="absolute top-8 right-8 flex items-center gap-4 z-20" id="nav-bar">
          <div className="hidden md:flex gap-2">
            {["Inicio", "Servicios", "Tienda"].map((item) => (
              <button
                key={item}
                className="px-6 py-2 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm hover:bg-white hover:text-black transition-colors text-xs font-bold uppercase tracking-widest text-white"
                id={`nav-${item.toLowerCase()}`}
              >
                {item}
              </button>
            ))}
          </div>
          <button 
            className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
            id="nav-contact"
          >
            Contacto
          </button>
        </nav>

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
            <p className="text-[10px] uppercase tracking-widest text-white/40">AutoTech Elite © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
