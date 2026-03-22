import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/wlas-motor-logo.png';

export default function LoginPage() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir al dashboard
  if (session) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(translateError(error));
      setLoading(false);
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Gold accent top line */}
      <div
        className="h-[2px] w-full"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #C9A84C 30%, #F0D080 50%, #C9A84C 70%, transparent 100%)' }}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="WLAS MOTOR" className="h-14 w-auto object-contain" />
        </Link>
        <Link to="/" className="text-white/50 text-xs tracking-widest hover:text-white transition-colors">
          ← VOLVER
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-[#C9A84C]" />
            </div>
          </div>

          <h1 className="text-white text-2xl font-bold tracking-tight text-center mb-1">
            Acceso al Sistema
          </h1>
          <p className="text-white/40 text-sm text-center mb-8">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-white/60 text-xs font-medium tracking-widest uppercase">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A84C]/60 focus:bg-white/8 transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-white/60 text-xs font-medium tracking-widest uppercase">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-11 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A84C]/60 focus:bg-white/8 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-lg font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #F0D080 50%, #C9A84C 100%)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Ingresando…
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de ingresar.';
  if (msg.includes('Too many requests')) return 'Demasiados intentos. Intenta más tarde.';
  return msg;
}
