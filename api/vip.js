import { createHmac, timingSafeEqual } from "node:crypto";

const ADMIN_COOKIE = "vip_admin_session";
const MEMBER_COOKIE = "vip_member_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

function safeCompare(a, b) {
  const first = Buffer.from(String(a));
  const second = Buffer.from(String(b));
  if (first.length !== second.length) return false;
  return timingSafeEqual(first, second);
}

function sign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function createAdminSession(secret) {
  const payload = String(Date.now() + SESSION_DURATION);
  return `${payload}.${sign(payload, secret)}`;
}

function verifyAdminSession(token, secret) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) &&
    expiresAt > Date.now() &&
    safeCompare(signature, sign(payload, secret));
}

function createMemberSession(email, secret) {
  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function verifyMemberSession(token, secret) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!safeCompare(signature, sign(payload, secret))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.email || !Number.isFinite(data.expiresAt) || data.expiresAt <= Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const item = cookies.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return item ? item.substring(name.length + 1) : "";
}

function setCookie(res, name, value, maxAge) {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  res.setHeader("Set-Cookie", `${name}=${value}; HttpOnly;${secure} SameSite=Lax; Path=/api/vip; Max-Age=${maxAge}`);
}

function clearCookie(res, name) {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  res.setHeader("Set-Cookie", `${name}=; HttpOnly;${secure} SameSite=Lax; Path=/api/vip; Max-Age=0`);
}

async function callAppsScript(scriptUrl, payload) {
  const upstream = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow"
  });
  const raw = await upstream.text();
  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error("Respuesta inválida de Google Apps Script");
  }
  if (!result.success) throw new Error(result.message || "No se pudo procesar la solicitud");
  return result.data;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Método no permitido" });
  }
   
  try {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const adminPassword = process.env.VIP_ADMIN_PASSWORD;
    const sessionSecret = process.env.VIP_SESSION_SECRET;

    if (!scriptUrl) throw new Error("Falta configurar GOOGLE_APPS_SCRIPT_URL");
    if (!adminPassword || !sessionSecret || sessionSecret.length < 32) {
      throw new Error("Falta configurar correctamente la autenticación VIP");
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ success: false, message: "Solicitud inválida" });
    }

    const { action } = payload;

    if (action === "login") {
      if (!safeCompare(payload.password || "", adminPassword)) {
        return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
      }
      setCookie(res, ADMIN_COOKIE, createAdminSession(sessionSecret), 28800);
      return res.status(200).json({ success: true, message: "Sesión iniciada correctamente" });
    }

    if (action === "logout") {
      clearCookie(res, ADMIN_COOKIE);
      return res.status(200).json({ success: true, message: "Sesión cerrada" });
    }

    if (action === "memberLogin") {
      const member = await callAppsScript(scriptUrl, {
        action: "memberLogin",
        email: payload.email,
        password: payload.password
      });
      setCookie(res, MEMBER_COOKIE, createMemberSession(member.email, sessionSecret), 28800);
      return res.status(200).json({ success: true, data: member });
    }

    if (action === "memberLogout") {
      clearCookie(res, MEMBER_COOKIE);
      return res.status(200).json({ success: true, message: "Sesión VIP cerrada" });
    }

    if (action === "catalog") {
      // Primero comprobamos si existe una sesión administrativa válida.
      const adminToken = getCookie(req, ADMIN_COOKIE);

      if (verifyAdminSession(adminToken, sessionSecret)) {
        const catalog = await callAppsScript(scriptUrl, {
          action: "adminCatalog",
          password: adminPassword
        });

        return res.status(200).json({
          success: true,
          data: {
            ...catalog,
            access: "admin"
          }
        });
      }

      // Si no es administrador, comprobamos la sesión de miembro VIP.
      const member = verifyMemberSession(
        getCookie(req, MEMBER_COOKIE),
        sessionSecret
      );

      if (!member) {
        return res.status(401).json({
          success: false,
          message: "Tu sesión VIP caducó. Inicia sesión nuevamente."
        });
      }

      const catalog = await callAppsScript(scriptUrl, {
        action: "catalog",
        email: member.email,
        password: adminPassword
      });

      return res.status(200).json({
        success: true,
        data: {
          ...catalog,
          access: "member"
        }
      });
    }

    const adminToken = getCookie(req, ADMIN_COOKIE);
    if (!verifyAdminSession(adminToken, sessionSecret)) {
      return res.status(401).json({ success: false, message: "Sesión caducada. Inicia sesión nuevamente." });
    }

    const allowedAdminActions = [
      "list", "approve", "reject", "renew",
      "adminAccounts", "setPlan", "suspend", "reactivate", "resetMemberPassword"
    ];
    if (!allowedAdminActions.includes(action)) {
      return res.status(400).json({ success: false, message: "Acción no válida" });
    }

    const data = await callAppsScript(scriptUrl, {
      ...payload,
      password: adminPassword
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("VIP API:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "No se pudo procesar la solicitud VIP"
    });
  }
}
