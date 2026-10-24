
import { useEffect, useState } from "react";

export default function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const script = document.createElement("script");
    script.src = "https://quge5.com/88/tag.min.js";
    script.async = true;
    script.dataset.zone = "88";

    const timeout = window.setTimeout(() => {
      if (active) {
        setAdBlockDetected(true);
        setChecked(true);
      }
    }, 2000);

    script.onload = () => {
      window.clearTimeout(timeout);
      if (active) setChecked(true);
    };

    script.onerror = () => {
      window.clearTimeout(timeout);
      if (active) {
        setAdBlockDetected(true);
        setChecked(true);
      }
    };

    document.head.appendChild(script);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      script.remove();
    };
  }, []);

  if (!checked || !adBlockDetected) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 border border-red-600 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-4">🚫</div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Bloqueador de anuncios detectado
        </h2>

        <p className="text-gray-300">
          Miragratis se mantiene gracias a la publicidad.
          Desactiva tu bloqueador y recarga la página para continuar.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
        >
          🔄 Recargar página
        </button>
      </div>
    </div>
  );
}
