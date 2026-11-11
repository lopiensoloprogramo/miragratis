
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "vip_admin_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

function safeCompare(a, b) {
  const first = Buffer.from(String(a));
  const second = Buffer.from(String(b));

  if (first.length !== second.length) return false;

  return timingSafeEqual(first, second);
}

function createSignature(value, secret) {
  return createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
}

function createSession(secret) {
  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = String(expiresAt);
  const signature = createSignature(payload, secret);

  return `${payload}.${signature}`;
}

function verifySession(token, secret) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expiresAt = Number(payload);

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  const expected = createSignature(payload, secret);
  return safeCompare(signature, expected);
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";

  const item = cookies
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return item ? item.substring(name.length + 1) : "";
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly;${secure} SameSite=Strict; Path=/api/vip; Max-Age=28800`
  );
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly;${secure} SameSite=Strict; Path=/api/vip; Max-Age=0`
  );
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método no permitido"
    });
  }

  try {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const adminPassword = process.env.VIP_ADMIN_PASSWORD;
    const sessionSecret = process.env.VIP_SESSION_SECRET;

    if (!adminPassword || !sessionSecret || sessionSecret.length < 32) {
      throw new Error("Falta configurar correctamente la autenticación VIP");
    }

    const payload =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({
        success: false,
        message: "Solicitud inválida"
      });
    }

    const { action } = payload;

    // Inicio de sesión del administrador
    if (action === "login") {
      if (!safeCompare(payload.password || "", adminPassword)) {
        return res.status(401).json({
          success: false,
          message: "Contraseña incorrecta"
        });
      }

      const token = createSession(sessionSecret);
      setSessionCookie(res, token);

      return res.status(200).json({
        success: true,
        message: "Sesión iniciada correctamente"
      });
    }

    // Cerrar sesión
    if (action === "logout") {
      clearSessionCookie(res);

      return res.status(200).json({
        success: true,
        message: "Sesión cerrada"
      });
    }

    // El envío público de comprobantes no requiere sesión
    if (action === "submit") {
      // Continúa hacia Google Apps Script sin contraseña administrativa.
    } else {
      // Las demás operaciones requieren una sesión válida.
      const token = getCookie(req, COOKIE_NAME);

      if (!verifySession(token, sessionSecret)) {
        return res.status(401).json({
          success: false,
          message: "Sesión caducada. Inicia sesión nuevamente."
        });
      }

      // Incluimos renew entre las acciones protegidas.
      if (!["list", "approve", "reject", "renew"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Acción no válida"
        });
      } 
    }

    if (!scriptUrl) {
      throw new Error("Falta configurar GOOGLE_APPS_SCRIPT_URL");
    }

    // La contraseña administrativa se agrega únicamente en el servidor.
    const backendPayload =
      action === "submit"
        ? payload
        : { ...payload, password: adminPassword };

    const upstream = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(backendPayload),
      redirect: "follow"
    });

    const responseText = await upstream.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("Respuesta inválida de Google Apps Script");
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("VIP API:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo procesar la solicitud VIP"
    });
  }
}
