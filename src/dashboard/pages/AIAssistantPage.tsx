import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Trash2, Car, ChevronDown, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AIMessage, Vehicle, WorkOrder } from '../../types';
import { sendMessage } from '../../services/geminiService';

// ─── Helpers ────────────────────────────────────────────────

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABELS: Record<string, string> = {
  presupuesto: 'Presupuesto',
  aprobado: 'Aprobado',
  en_proceso: 'En proceso',
  pausado: 'Pausado',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

// ─── Text formatter: converts bullet lists to HTML ──────────

function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-1 my-2 text-white/80">
          {listBuffer.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Numbered list: "1. ...", "2. ..."
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    // Bullet list: "- ..." or "* ..."
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);

    if (numberedMatch || bulletMatch) {
      const content = numberedMatch ? `${numberedMatch[1]}. ${numberedMatch[2]}` : bulletMatch![1];
      listBuffer.push(content);
    } else {
      if (listBuffer.length > 0) flushList(`list-${idx}`);
      if (trimmed === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        elements.push(
          <p key={idx} className="font-semibold text-white leading-relaxed">
            {trimmed.slice(2, -2)}
          </p>
        );
      } else {
        // Inline bold: replace **text** with <strong>
        const parts = trimmed.split(/\*\*(.+?)\*\*/g);
        elements.push(
          <p key={idx} className="leading-relaxed text-white/85">
            {parts.map((part, pi) =>
              pi % 2 === 1 ? <strong key={pi} className="text-white font-semibold">{part}</strong> : part
            )}
          </p>
        );
      }
    }
  });

  if (listBuffer.length > 0) flushList('list-end');

  return <div className="text-sm space-y-1">{elements}</div>;
}

// ─── Typing indicator ───────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}
      >
        <Bot className="w-4 h-4" style={{ color: '#C9A84C' }} />
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-1.5 py-0.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#C9A84C',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Message bubble ─────────────────────────────────────────

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
            style={{
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.35)',
            }}
          >
            {message.content}
          </div>
          <p className="text-right text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-5"
        style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}
      >
        <Bot className="w-4 h-4" style={{ color: '#C9A84C' }} />
      </div>
      <div className="max-w-[80%]">
        <div
          className="px-4 py-3 rounded-2xl rounded-bl-sm"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <FormattedText text={message.content} />
        </div>
        <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

// ─── Vehicle info card ──────────────────────────────────────

function VehicleContextCard({ vehicle, orders }: { vehicle: Vehicle; orders: WorkOrder[] }) {
  const recentOrders = orders.slice(-2);

  const FUEL_LABELS: Record<string, string> = {
    gasolina: 'Gasolina',
    diesel: 'Diésel',
    hibrido: 'Híbrido',
    electrico: 'Eléctrico',
  };

  const TX_LABELS: Record<string, string> = {
    manual: 'Manual',
    automatica: 'Automática',
    cvt: 'CVT',
  };

  return (
    <div
      className="rounded-xl p-4 mt-3"
      style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Car className="w-4 h-4" style={{ color: '#C9A84C' }} />
        <span className="text-sm font-semibold text-white">
          {vehicle.brand} {vehicle.model}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}
        >
          {vehicle.year}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: 'Placa', value: vehicle.plate },
          { label: 'Km', value: vehicle.mileage.toLocaleString() },
          { label: 'Combustible', value: FUEL_LABELS[vehicle.fuelType] || vehicle.fuelType },
          { label: 'Transmisión', value: TX_LABELS[vehicle.transmission] || vehicle.transmission },
        ].map(item => (
          <div key={item.label}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {item.label}
            </p>
            <p className="text-xs text-white font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <div
          className="pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Órdenes recientes
          </p>
          <div className="space-y-2">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-start gap-2">
                <Clock className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <div className="min-w-0">
                  <p className="text-[11px] text-white/70 truncate leading-tight">{order.description}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#C9A84C' }}>
                    {STATUS_LABELS[order.status] || order.status} · {order.createdAt.split('T')[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  '¿Cuándo es el próximo mantenimiento?',
  'Diagnóstico por síntomas',
  'Revisar historial de este vehículo',
  'Costo estimado de frenos',
  'Especificaciones de aceite recomendado',
];

const WELCOME_MESSAGE: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hola, soy tu asistente técnico de WLAS MOTOR. Puedo ayudarte con diagnósticos, recomendaciones de mantenimiento y consultas sobre los vehículos del taller.\n\nSelecciona un vehículo en el panel izquierdo para darme contexto, o escríbeme directamente tu consulta.',
  timestamp: new Date().toISOString(),
};

export default function AIAssistantPage() {
  const { state } = useAppContext();

  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineH = 24;
    const maxH = lineH * 4 + 24;
    ta.style.height = `${Math.min(ta.scrollHeight, maxH)}px`;
  }, [inputText]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedVehicle = state.vehicles.find(v => v.id === selectedVehicleId);
  const vehicleOrders: WorkOrder[] = selectedVehicleId
    ? state.orders.filter(o => o.vehicleId === selectedVehicleId)
    : [];

  const getVehicleClient = (vehicle: Vehicle) =>
    state.clients.find(c => c.id === vehicle.clientId);

  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? inputText).trim();
    if (!content || isLoading) return;

    if (!hasApiKey) {
      setErrorMsg('No hay API key configurada. Agrega GEMINI_API_KEY en el archivo .env para activar el asistente.');
      return;
    }

    setErrorMsg(null);
    const userMsg: AIMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    // Keep history without welcome message for API call
    const historyForApi = messages.filter(m => m.id !== 'welcome');

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessage({
        userMessage: content,
        chatHistory: historyForApi,
        vehicle: selectedVehicle,
        orders: vehicleOrders,
      });

      const assistantMsg: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: responseText || 'No obtuve respuesta. Por favor intenta de nuevo.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const assistantErrMsg: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Ocurrió un error al conectar con Gemini. Verifica tu conexión e intenta nuevamente.\n\nDetalle: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantErrMsg]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [inputText, isLoading, messages, hasApiKey, selectedVehicle, vehicleOrders]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setErrorMsg(null);
  };

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════
          LEFT PANEL — Context (30%)
      ═══════════════════════════════════════════════ */}
      <div
        className="w-[30%] min-w-[260px] max-w-[360px] flex flex-col p-5 overflow-y-auto shrink-0"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D' }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl uppercase text-white tracking-tight">
              Asistente IA
            </h1>
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              <Sparkles className="w-3 h-3" />
              Gemini
            </span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Diagnóstico inteligente para WLAS MOTOR
          </p>
        </div>

        {/* API Key warning */}
        {!hasApiKey && (
          <div
            className="flex gap-3 p-3 rounded-xl mb-5"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-1">API Key no configurada</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Crea un archivo <code className="text-amber-400">.env</code> en la raíz del proyecto con:
              </p>
              <code
                className="block text-[10px] mt-1.5 px-2 py-1 rounded"
                style={{ background: 'rgba(0,0,0,0.4)', color: '#C9A84C' }}
              >
                GEMINI_API_KEY=tu_api_key
              </code>
            </div>
          </div>
        )}

        {/* Vehicle selector */}
        <div className="mb-5">
          <label className="block text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Vehículo en contexto
          </label>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
                color: selectedVehicle ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            >
              <span className="truncate">
                {selectedVehicle
                  ? `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year} — ${selectedVehicle.plate}`
                  : 'Sin vehículo seleccionado'}
              </span>
              <ChevronDown
                className="w-4 h-4 shrink-0 ml-2 transition-transform"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
              >
                <button
                  type="button"
                  onClick={() => { setSelectedVehicleId(''); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  Sin vehículo seleccionado
                </button>
                {state.vehicles.map(v => {
                  const client = getVehicleClient(v);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => { setSelectedVehicleId(v.id); setDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 transition-colors hover:bg-white/5"
                      style={{
                        background: v.id === selectedVehicleId ? 'rgba(201,168,76,0.08)' : 'transparent',
                        borderLeft: v.id === selectedVehicleId ? '2px solid #C9A84C' : '2px solid transparent',
                      }}
                    >
                      <p className="text-sm text-white truncate">
                        {v.brand} {v.model} {v.year} — {v.plate}
                      </p>
                      {client && (
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {client.name}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedVehicle && (
            <VehicleContextCard vehicle={selectedVehicle} orders={vehicleOrders} />
          )}
        </div>

        {/* Quick suggestions */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Preguntas rápidas
          </label>
          <div className="flex flex-col gap-2">
            {QUICK_SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                disabled={isLoading || !hasApiKey}
                onClick={() => handleSend(suggestion)}
                className="text-left text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.6)',
                }}
                onMouseEnter={e => {
                  if (!isLoading && hasApiKey) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.08)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.2)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#C9A84C';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT PANEL — Chat (70%)
      ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat topbar */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0A0A0A' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              <Bot className="w-5 h-5" style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">WLAS Motor AI</p>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
                />
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {hasApiKey ? 'Conectado · Gemini 2.0 Flash' : 'Sin conexión'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearConversation}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'white';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div
            className="mx-6 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl shrink-0"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p className="text-xs text-amber-400">{errorMsg}</p>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          className="px-6 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0A0A0A' }}
        >
          <div
            className="flex items-end gap-3 rounded-2xl px-4 py-3"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !hasApiKey}
              placeholder={
                !hasApiKey
                  ? 'Configura GEMINI_API_KEY para activar el asistente...'
                  : 'Escribe tu consulta técnica... (Enter para enviar, Shift+Enter nueva línea)'
              }
              rows={1}
              className="flex-1 bg-transparent text-sm text-white resize-none outline-none placeholder-white/25 leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading || !hasApiKey}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#C9A84C' }}
              onMouseEnter={e => {
                if (!(!inputText.trim() || isLoading || !hasApiKey)) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#D4B460';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
          <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Enter para enviar · Shift+Enter para nueva línea · Las respuestas son orientativas
          </p>
        </div>
      </div>
    </div>
  );
}
