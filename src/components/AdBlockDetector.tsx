import { useEffect, useState } from "react";

declare global {
  interface Window {
    __miraGratisAdBlocked?: () => void;
  }
}

export default function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
    // Función que puede ser llamada desde openAddirecto()
    window.__miraGratisAdBlocked = () => {
      setAdBlockDetected(true);
    };

    return () => {
      delete window.__miraGratisAdBlocked;
    };
  }, []);

  if (!adBlockDetected) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 border border-red-600 rounded-2xl p-6 text-center shadow-2xl">

        <div className="text-5xl mb-4">
          🚫
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Bloqueador de anuncios detectado
        </h2>

        <p className="text-gray-300 leading-relaxed">
          MiraGratis se mantiene gracias a la publicidad.
          Permite los anuncios en este sitio para continuar navegando.
        </p>

        <p className="text-gray-400 text-sm mt-3">
          No es necesario desactivar tu bloqueador para todos los sitios.
          Solo permite los anuncios para MiraGratis.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="
            mt-6
            w-full
            bg-red-600
            hover:bg-red-700
            text-white
            font-bold
            py-3
            rounded-xl
            transition
          "
        >
          🔄 Ya lo permití, recargar
        </button>

      </div>
    </div>
  );
}