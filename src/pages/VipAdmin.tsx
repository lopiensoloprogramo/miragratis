
import { useState } from "react";
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
  Users,
  Mail,
  AlertCircle,
  Crown,
  UserCheck,
  UserX,
  KeyRound,
  CalendarDays,
  ShieldCheck
} from "lucide-react";

interface VipRequest {
  row: number;
  name: string;
  telegram: string;
  email?: string;
  emailStatus?: string;
  date?: string;
  status: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  receipt?: string;
  invitation?: string;
}

interface VipAccount {
  email: string;
  name: string;
  status: "ACTIVO" | "SUSPENDIDO";
  plan: "LIFETIME" | "YEAR" | "MONTH";
  expiresAt?: string;
  requestRow?: number;
  createdAt?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

type VipAction =
  | "login"
  | "logout"
  | "list"
  | "approve"
  | "reject"
  | "renew"
  | "adminAccounts"
  | "setPlan"
  | "suspend"
  | "reactivate"
  | "resetMemberPassword";

type Tab = "solicitudes" | "cuentas";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
}

interface StatusBadgeProps {
  status: VipRequest["status"];
}

const PLAN_LABELS: Record<string, string> = {
  LIFETIME: "Vitalicio",
  YEAR: "Anual",
  MONTH: "Mensual"
};

export default function VipAdmin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [requests, setRequests] = useState<VipRequest[]>([]);
  const [accounts, setAccounts] = useState<VipAccount[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("solicitudes");

  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [busyRow, setBusyRow] = useState<number | null>(null);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

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

    const responseText = await response.text();

    let result: ApiResponse;

    try {
      result = JSON.parse(responseText) as ApiResponse;
    } catch {
      throw new Error("El servidor devolvió una respuesta inválida.");
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "No se pudo completar la operación."
      );
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

      if (
        errorMessage.toLowerCase().includes("sesión") ||
        errorMessage.toLowerCase().includes("autoriz")
      ) {
        setLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    setLoadingAccounts(true);
    setError("");

    try {
      const result = await apiRequest("adminAccounts");
      setAccounts(result.data || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las cuentas VIP."
      );
    } finally {
      setLoadingAccounts(false);
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
    setAccounts([]);
    setActiveTab("solicitudes");
    setMessage("");
    setError("");
  }

  async function handleRequestAction(
    action: "approve" | "reject" | "renew",
    row: number
  ) {
    let confirmation = "";

    if (action === "approve") {
      confirmation =
        "¿Confirmas que deseas aprobar este pago y crear la cuenta VIP? Se enviarán las credenciales y el enlace de Telegram por correo.";
    } else if (action === "reject") {
      confirmation =
        "¿Confirmas que deseas rechazar esta solicitud?";
    } else {
      confirmation =
        "¿Deseas generar un nuevo enlace de Telegram y enviarlo al Gmail registrado? Se intentará revocar el enlace anterior. La contraseña de la biblioteca no cambiará.";
    }

    if (!window.confirm(confirmation)) return;

    setBusyRow(row);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest(action, { row });

      setMessage(
        result.data?.message ||
          (action === "approve"
            ? "Solicitud aprobada."
            : action === "renew"
              ? "Se generó el nuevo enlace."
              : "Solicitud rechazada.")
      );

      await loadRequests();

      if (action === "approve") {
        await loadAccounts();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error desconocido."
      );
    } finally {
      setBusyRow(null);
    }
  }

  async function handleAccountAction(
    action: "suspend" | "reactivate" | "resetMemberPassword",
    account: VipAccount
  ) {
    let confirmation = "";

    if (action === "suspend") {
      confirmation =
        `¿Deseas suspender la cuenta de ${account.email}? No podrá ingresar a la biblioteca VIP.`;
    } else if (action === "reactivate") {
      confirmation =
        `¿Deseas reactivar la cuenta de ${account.email}?`;
    } else {
      confirmation =
        `¿Deseas generar una nueva contraseña para ${account.email}? La nueva contraseña será enviada a su Gmail registrado.`;
    }

    if (!window.confirm(confirmation)) return;

    setBusyEmail(account.email);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest(action, {
        email: account.email
      });

      setMessage(
        result.data?.message ||
          (action === "suspend"
            ? "Cuenta suspendida."
            : action === "reactivate"
              ? "Cuenta reactivada."
              : "Nueva contraseña enviada por correo.")
      );

      await loadAccounts();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error desconocido."
      );
    } finally {
      setBusyEmail(null);
    }
  }

  async function handleChangePlan(
    account: VipAccount,
    newPlan: "LIFETIME" | "YEAR" | "MONTH"
  ) {
    if (newPlan === account.plan) return;

    const confirmation =
      newPlan === "LIFETIME"
        ? `¿Cambiar la cuenta de ${account.email} al plan vitalicio?`
        : `¿Cambiar la cuenta de ${account.email} al plan ${PLAN_LABELS[newPlan]}? El vencimiento se calculará desde hoy.`;

    if (!window.confirm(confirmation)) return;

    setBusyEmail(account.email);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest("setPlan", {
        email: account.email,
        plan: newPlan
      });

      setMessage(
        result.data?.message || "Plan actualizado correctamente."
      );

      await loadAccounts();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error desconocido."
      );
    } finally {
      setBusyEmail(null);
    }
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Copiado correctamente.");
    } catch {
      setError("No se pudo copiar. Inténtalo manualmente.");
    }
  }

  async function changeTab(tab: Tab) {
    setActiveTab(tab);
    setError("");
    setMessage("");

    if (tab === "cuentas") {
      await loadAccounts();
    }
  }

  const pending = requests.filter(
    (item) => item.status === "PENDIENTE"
  );

  const approved = requests.filter(
    (item) => item.status === "APROBADO"
  );

  const rejected = requests.filter(
    (item) => item.status === "RECHAZADO"
  );

  const activeAccounts = accounts.filter(
    (item) => item.status === "ACTIVO"
  );

  const suspendedAccounts = accounts.filter(
    (item) => item.status === "SUSPENDIDO"
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
            Ingresa tu contraseña para administrar MiraGratis VIP.
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
              Administración de solicitudes y miembros.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                activeTab === "solicitudes"
                  ? loadRequests()
                  : loadAccounts()
              }
              disabled={loading || loadingAccounts}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading || loadingAccounts ? "animate-spin" : ""
                }
              />
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
          </div>
        )}

        <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => changeTab("solicitudes")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${
              activeTab === "solicitudes"
                ? "border-purple-500 bg-purple-600 text-white"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Clock size={18} />
            Solicitudes ({requests.length})
          </button>

          <button
            onClick={() => changeTab("cuentas")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${
              activeTab === "cuentas"
                ? "border-purple-500 bg-purple-600 text-white"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Crown size={18} />
            Cuentas VIP ({accounts.length})
          </button>
        </div>

        {activeTab === "solicitudes" && (
          <>
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

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                            <Mail size={15} className="text-slate-400" />
                            <span>
                              {item.email || "Sin correo registrado"}
                            </span>

                            {item.email && (
                              <button
                                onClick={() => copyText(item.email!)}
                                title="Copiar correo"
                                className="text-slate-400 hover:text-white"
                              >
                                <Copy size={14} />
                              </button>
                            )}
                          </div>

                          <p className="mt-2 text-xs text-slate-500">
                            {item.date
                              ? new Date(item.date).toLocaleString("es-PE")
                              : "Fecha no disponible"}
                          </p>
                        </div>

                        <StatusBadge status={item.status} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">
                          Estado del correo:
                        </span>

                        {item.emailStatus === "ENVIADO" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                            <CheckCircle size={13} />
                            Enviado
                          </span>
                        ) : item.emailStatus === "ERROR" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                            <AlertCircle size={13} />
                            Error de envío
                          </span>
                        ) : item.status === "PENDIENTE" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                            <Clock size={13} />
                            Pendiente de aprobación
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                            Sin información
                          </span>
                        )}
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
                                handleRequestAction("approve", item.row)
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
                                handleRequestAction("reject", item.row)
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
                          <>
                            <a
                              href={item.invitation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm text-green-300 hover:bg-green-950"
                            >
                              <ExternalLink size={15} />
                              Enlace de invitación
                            </a>

                            <button
                              onClick={() => copyText(item.invitation!)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                            >
                              <Copy size={15} />
                              Copiar enlace
                            </button>
                          </>
                        )}

                        {item.status === "APROBADO" && (
                          <button
                            onClick={() =>
                              handleRequestAction("renew", item.row)
                            }
                            disabled={busyRow === item.row}
                            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold hover:bg-purple-500 disabled:opacity-50"
                          >
                            <RefreshCw
                              size={15}
                              className={
                                busyRow === item.row ? "animate-spin" : ""
                              }
                            />
                            {busyRow === item.row
                              ? "Generando acceso..."
                              : "Generar nuevo acceso"}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </>
        )}

        {activeTab === "cuentas" && (
          <>
            <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                icon={<Users size={20} />}
                label="Total de miembros"
                value={accounts.length}
                color="text-purple-400"
              />

              <StatCard
                icon={<UserCheck size={20} />}
                label="Cuentas activas"
                value={activeAccounts.length}
                color="text-green-400"
              />

              <StatCard
                icon={<UserX size={20} />}
                label="Cuentas suspendidas"
                value={suspendedAccounts.length}
                color="text-red-400"
              />
            </section>

            <div className="mb-4 flex items-center gap-2">
              <Crown size={19} className="text-purple-400" />
              <h2 className="text-lg font-semibold">
                Miembros VIP ({accounts.length})
              </h2>
            </div>

            {loadingAccounts ? (
              <p className="py-10 text-center text-slate-400">
                Cargando cuentas VIP...
              </p>
            ) : accounts.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
                <Users size={30} className="mx-auto mb-3 opacity-50" />
                Todavía no hay cuentas VIP registradas.
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => {
                  const isBusy = busyEmail === account.email;
                  const isActive = account.status === "ACTIVO";

                  return (
                    <article
                      key={account.email}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white">
                            {account.name}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                            <Mail size={15} className="text-slate-400" />
                            <span className="break-all">
                              {account.email}
                            </span>

                            <button
                              onClick={() => copyText(account.email)}
                              title="Copiar correo"
                              className="text-slate-400 hover:text-white"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? "border-green-500/20 bg-green-500/10 text-green-400"
                              : "border-red-500/20 bg-red-500/10 text-red-400"
                          }`}
                        >
                          {isActive ? "ACTIVA" : "SUSPENDIDA"}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                            <Crown size={14} />
                            Plan actual
                          </div>

                          <p className="font-semibold text-purple-300">
                            {PLAN_LABELS[account.plan] || account.plan}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                            <CalendarDays size={14} />
                            Vencimiento
                          </div>

                          <p className="font-semibold text-white">
                            {account.plan === "LIFETIME"
                              ? "Sin vencimiento"
                              : account.expiresAt
                                ? new Date(
                                    account.expiresAt
                                  ).toLocaleDateString("es-PE")
                                : "No definido"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-medium text-slate-400">
                          Cambiar plan de membresía
                        </label>

                        <select
                          value={account.plan}
                          disabled={isBusy}
                          onChange={(e) =>
                            handleChangePlan(
                              account,
                              e.target.value as
                                | "LIFETIME"
                                | "YEAR"
                                | "MONTH"
                            )
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-50 sm:max-w-xs"
                        >
                          <option value="LIFETIME">
                            Vitalicio - De por vida
                          </option>
                          <option value="YEAR">Anual - 1 año</option>
                          <option value="MONTH">Mensual - 1 mes</option>
                        </select>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {isActive ? (
                          <button
                            onClick={() =>
                              handleAccountAction("suspend", account)
                            }
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                          >
                            <UserX size={15} />
                            Suspender cuenta
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleAccountAction("reactivate", account)
                            }
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/20 disabled:opacity-50"
                          >
                            <UserCheck size={15} />
                            Reactivar cuenta
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleAccountAction(
                              "resetMemberPassword",
                              account
                            )
                          }
                          disabled={isBusy}
                          className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm font-semibold text-purple-300 hover:bg-purple-500/20 disabled:opacity-50"
                        >
                          <KeyRound size={15} />
                          Restablecer contraseña
                        </button>
                      </div>

                      {isBusy && (
                        <p className="mt-3 flex items-center gap-2 text-xs text-purple-300">
                          <RefreshCw size={13} className="animate-spin" />
                          Procesando operación...
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                        {account.createdAt && (
                          <span>
                            Registrada:{" "}
                            {new Date(
                              account.createdAt
                            ).toLocaleDateString("es-PE")}
                          </span>
                        )}

                        {account.requestRow && (
                          <span>
                            Solicitud: #{account.requestRow}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-semibold text-purple-300">
                <ShieldCheck size={17} />
                Información sobre los planes
              </div>
              <p>
                Los miembros fundadores conservan su acceso vitalicio.
                Si cambias una cuenta a plan mensual o anual, el vencimiento
                se calcula desde la fecha del cambio.
              </p>
            </div>
          </>
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
