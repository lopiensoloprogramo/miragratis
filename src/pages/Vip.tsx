
import { useRef, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Upload, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import yapeQR from "../assets/yape-qr.png";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export default function Vip() {
  const [name, setName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected?: File) => {
    setMessage("");
    setSuccess(false);

    if (!selected) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(selected.type)) {
      setMessage("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setMessage("El comprobante no debe superar los 2 MB.");
      return;
    }

    setFile(selected);
  };

  const sendRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    const cleanName = name.trim();
    const cleanTelegram = telegram.trim().replace(/^@/, "");
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setMessage("Escribe tu nombre.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{5,32}$/.test(cleanTelegram)) {
      setMessage("Escribe un usuario válido de Telegram.");
      return;
    }

    if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
      setMessage("Escribe un correo electrónico válido.");
      return;
    }

    if (!file) {
      setMessage("Adjunta tu comprobante de Yape.");
      return;
    }

    try {
      setLoading(true);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = String(reader.result);
          resolve(result.split(",")[1]);
        };

        reader.onerror = () => {
          reject(new Error("No se pudo leer el comprobante."));
        };

        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/vip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "submit",
          name: cleanName,
          telegram: cleanTelegram,
          email: cleanEmail,
          fileName: file.name,
          mimeType: file.type,
          fileBase64: base64,
        }),
      });

      const responseText = await response.text();

      console.log("Estado HTTP:", response.status);
      console.log("Respuesta del servidor:", responseText);

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          "El servidor devolvió una respuesta vacía o inválida. Revisa la consola."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "No se pudo enviar la solicitud."
        );
      }

      setSuccess(true);
      setMessage(
        "¡Comprobante recibido! Revisaremos tu pago y te enviaremos la invitación por correo cuando sea aprobado."
      );

      setName("");
      setTelegram("");
      setEmail("");
      setFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al enviar la solicitud."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <span className="inline-block bg-red-600/15 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            MIRAGRATIS VIP
          </span>

          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Disfruta sin publicidad
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto">
            Accede a nuestro grupo privado de Telegram y disfruta
            de los enlaces disponibles para miembros VIP.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Información del pago */}
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-2">
              Tu acceso VIP
            </h2>

            <div className="text-center py-5">
              <p className="text-gray-400 text-sm">
                Pago único de acceso
              </p>

              <div className="text-5xl font-black text-red-500 my-2">
                S/ 5
              </div>

              <p className="text-gray-500 text-xs">
                El acceso se habilita después de verificar tu pago.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 max-w-[260px] mx-auto">
              <img
                src={yapeQR}
                alt="Código QR de Yape"
                className="w-full h-auto object-contain"
              />
            </div>

            <div className="mt-5 space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Acceso al grupo privado.
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Enlaces para miembros VIP.
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-500" />
                Aprobación manual de pagos.
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form
            onSubmit={sendRequest}
            className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold mb-2">
              Solicitar acceso
            </h2>

            <p className="text-gray-400 text-sm mb-6">
              Completa tus datos después de realizar el pago.
            </p>

            <label className="block text-sm font-semibold mb-2">
              Tu nombre
            </label>

            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Ej. Juan Pérez"
              maxLength={80}
              required
              className="w-full bg-[#292929] border border-white/10 rounded-xl px-4 py-3 mb-5 outline-none focus:border-red-500"
            />

            <label className="block text-sm font-semibold mb-2">
              Usuario de Telegram
            </label>

            <div className="flex items-center bg-[#292929] border border-white/10 rounded-xl px-4 mb-5 focus-within:border-red-500">
              <span className="text-gray-400">@</span>

              <input
                type="text"
                value={telegram}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTelegram(e.target.value.replace(/^@/, ""))
                }
                placeholder="usuario"
                maxLength={32}
                required
                className="w-full bg-transparent px-2 py-3 outline-none"
              />
            </div>

            <label className="block text-sm font-semibold mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="tucorreo@gmail.com"
              maxLength={120}
              required
              className="w-full bg-[#292929] border border-white/10 rounded-xl px-4 py-3 mb-5 outline-none focus:border-red-500"
            />

            <label className="block text-sm font-semibold mb-2">
              Comprobante de Yape
            </label>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleFile(e.target.files?.[0])
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 hover:border-red-500 rounded-xl p-6 text-center transition"
            >
              <Upload className="mx-auto mb-2 text-red-400" size={28} />

              <span className="block font-semibold">
                {file ? file.name : "Seleccionar comprobante"}
              </span>

              <span className="block text-xs text-gray-500 mt-2">
                JPG, PNG o WEBP · Máximo 2 MB
              </span>
            </button>

            {file && (
              <div className="mt-3 flex items-center justify-between text-sm text-green-400">
                <span className="truncate">{file.name}</span>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) {
                      fileRef.current.value = "";
                    }
                  }}
                  className="text-red-400 ml-3"
                >
                  Quitar
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? "Enviando comprobante..." : "Enviar comprobante"}
            </button>

            {message && (
              <div
                className={`mt-4 p-4 rounded-xl text-sm ${
                  success
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <p className="text-center text-xs text-gray-500 mt-5">
              <Clock size={13} className="inline mr-1" />
              El acceso no es inmediato. Primero verificaremos tu pago.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
