
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

    if (!scriptUrl) {
      throw new Error("Falta configurar GOOGLE_APPS_SCRIPT_URL");
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

    const upstream = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
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
