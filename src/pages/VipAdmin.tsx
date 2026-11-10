
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  LockKeyhole,
  LogOut,
  RefreshCw,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Clock,
  Users
} from "lucide-react";

interface VipRequest {
  row: number;
  name: string;
  telegram: string;
  date?: string;
  status: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  receipt?: string;
  invitation?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: VipRequest[] & {
    invitation?: string;
    message?: string;
  };
}

type VipAction = "login" | "logout" | "list" | "approve" | "reject";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
}

interface StatusBadgeProps {
  status: VipRequest["status"];
}

export default function VipAdmin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [requests, setRequests] = useState<VipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyRow, setBusyRow] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function apiRequest(
    action: VipAction,
    extra: Record<string, unknown> = {}
  ): Promise<ApiResponse> {
    const response = await fetch("/api/vip", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action, ...extra })
    });

    const text = await response.text();

    let result: ApiResponse;

    try {
      result = JSON.parse(text) as ApiResponse;
    } catch {
      throw new Error("El servidor devolvió una respuesta inválida.");
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "No se pudo completar la operación.");
    }

    return result;
  }

  async function loadRequests() {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("list");
      setRequests(result.data || []);
      setLoggedIn(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido.";

      setError(errorMessage);

      if (errorMessage.includes("Sesión caducada")) {
        setLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiRequest("login", { password });
      setPassword("");
      setLoggedIn(true);
      await loadRequests();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error desconocido."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await apiRequest("logout");
    } catch {
      // La sesión también puede haber caducado.
    }

    setLoggedIn(false);
    setRequests([]);
    setMessage("");
    setError("");
  }

  async function handleAction(
    action: "approve" | "reject",
    row: number
  ) {
    const confirmation =
      action === "approve"
        ? "¿Confirmas que deseas aprobar este pago y generar su enlace de Telegram?"
        : "¿Confirmas que deseas rechazar esta solicitud?";

    if (!window.confirm(confirmation)) return;

    setBusyRow(row);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest(action, { row });

      if (action === "approve" && result.data?.invitation) {
        setMessage(
          "Solicitud aprobada. Enlace de invitación: " +
            result.data.invitation
        );
      } else {
        setMessage(
          result.data?.message || "Operación realizada correctamente."
        );
      }

      await loadRequests();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error desconocido."
      );
    } finally {
      setBusyRow(null);
    }
  }

  useEffect(() => {
    // No se envía ninguna contraseña al cargar la página.
  }, []);

  const pending = requests.filter(
    (item) => item.status === "PENDIENTE"
  );

  const approved = requests.filter(
    (item) => item.status === "APROBADO"
  );

  const rejected = requests.filter(
    (item) => item.status === "RECHAZADO"
  );

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-4 py-12 flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-xl"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/15 text-purple-400">
            <LockKeyhole size={27} />
          </div>

          <h1 className="text-center text-2xl font-bold">
            Administración VIP
          </h1>

          <p className="mt-2 mb-7 text-center text-sm text-slate-400">
            Ingresa tu contraseña para administrar las solicitudes de MiraGratis.
          </p>

          <label className="mb-2 block text-sm font-medium">
            Contraseña de administrador
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduce tu contraseña"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-purple-500"
          />

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-purple-600 py-3 font-semibold transition hover:bg-purple-500 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              MiraGratis VIP
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Administración de solicitudes y pagos.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadRequests}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 break-words rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
            {message}
            {message.includes("https://t.me/") && (
              <button
                onClick={() => {
                  const link = message.match(/https:\/\/t\.me\/\S+/)?.[0];
                  if (link) navigator.clipboard.writeText(link);
                }}
                className="ml-2 inline-flex items-center gap-1 underline"
              >
                <Copy size={14} /> Copiar enlace
              </button>
            )}
          </div>
        )}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Clock size={20} />}
            label="Pendientes"
            value={pending.length}
            color="text-yellow-400"
          />

          <StatCard
            icon={<CheckCircle size={20} />}
            label="Aprobadas"
            value={approved.length}
            color="text-green-400"
          />

          <StatCard
            icon={<XCircle size={20} />}
            label="Rechazadas"
            value={rejected.length}
            color="text-red-400"
          />
        </section>

        <div className="mb-4 flex items-center gap-2">
          <Users size={19} className="text-purple-400" />
          <h2 className="text-lg font-semibold">
            Solicitudes ({requests.length})
          </h2>
        </div>

        {loading && requests.length === 0 ? (
          <p className="py-10 text-center text-slate-400">
            Cargando solicitudes...
          </p>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Todavía no hay solicitudes registradas.
          </div>
        ) : (
          <div className="space-y-4">
            {requests
              .slice()
              .reverse()
              .map((item) => (
                <article
                  key={item.row}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-purple-300">
                        {item.telegram}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {item.date
                          ? new Date(item.date).toLocaleString("es-PE")
                          : "Fecha no disponible"}
                      </p>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {item.receipt && (
                      <a
                        href={item.receipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                      >
                        <ExternalLink size={15} />
                        Ver comprobante
                      </a>
                    )}

                    {item.status === "PENDIENTE" && (
                      <>
                        <button
                          onClick={() =>
                            handleAction("approve", item.row)
                          }
                          disabled={busyRow === item.row}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
                        >
                          <CheckCircle size={15} />
                          {busyRow === item.row
                            ? "Procesando..."
                            : "Aprobar"}
                        </button>

                        <button
                          onClick={() =>
                            handleAction("reject", item.row)
                          }
                          disabled={busyRow === item.row}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
                        >
                          <XCircle size={15} />
                          Rechazar
                        </button>
                      </>
                    )}

                    {item.invitation && (
                      <a
                        href={item.invitation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm text-green-300 hover:bg-green-950"
                      >
                        <ExternalLink size={15} />
                        Enlace de invitación
                      </a>
                    )}
                  </div>
                </article>
              ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  color
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className={`mb-3 ${color}`}>{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<VipRequest["status"], string> = {
    PENDIENTE:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    APROBADO:
      "bg-green-500/10 text-green-400 border-green-500/20",
    RECHAZADO:
      "bg-red-500/10 text-red-400 border-red-500/20"
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
