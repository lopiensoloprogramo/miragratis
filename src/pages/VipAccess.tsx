import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    email: string;
    name: string;
    plan: string;
    expiresAt?: string;
  };
}

export default function VipAccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/vip", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "memberLogin",
          email: email.trim().toLowerCase(),
          password
        })
      });

      const result = (await response.json()) as LoginResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo iniciar sesión.");
      }

      navigate("/vip-biblioteca", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-slate-950 px-4 py-14 text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
            <LockKeyhole size={30} />
          </div>
          <p className="text-sm font-bold tracking-[0.25em] text-purple-300">MIRAGRATIS</p>
          <h1 className="mt-2 text-3xl font-black">Acceso VIP</h1>
          <p className="mt-3 text-sm text-slate-400">
            Inicia sesión con los datos que recibiste en tu correo al aprobar tu solicitud.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <label htmlFor="vip-email" className="mb-2 block text-sm font-medium text-slate-200">
            Correo electrónico
          </label>
          <input
            id="vip-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tucorreo@gmail.com"
            className="mb-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
          />

          <label htmlFor="vip-password" className="mb-2 block text-sm font-medium text-slate-200">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="vip-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña VIP"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white outline-none transition focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={18} />
            {loading ? "Verificando acceso..." : "Entrar a la biblioteca"}
          </button>

          <div className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-400" />
            Tu sesión es privada. Puedes iniciar sesión en tus propios dispositivos.
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Aún no tienes acceso?{" "}
          <Link to="/vip" className="font-semibold text-purple-300 hover:text-purple-200">
            Solicita tu membresía VIP
          </Link>
        </p>
      </div>
    </main>
  );
}
