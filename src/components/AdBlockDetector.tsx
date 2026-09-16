import { useEffect, useState } from "react";

declare global {
  interface Window {
    __miraGratisAdBlocked?: () => void;
  }
}

export default function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
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
    <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-gray-900 border border-red-600 rounded-2xl p-6 text-center shadow-2xl">

        <div className="text-5xl mb-4">
          🚫
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Permite los anuncios para continuar
        </h2>

        <p className="text-gray-300 leading-relaxed">
          Detectamos que los anuncios de MiraGratis están siendo bloqueados.
        </p>

        <p className="text-gray-400 text-sm mt-3 leading-relaxed">
          No necesitas desactivar tu bloqueador para todos los sitios.
          Puedes permitir los anuncios únicamente para MiraGratis.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="
            mt-6
            w-full
            bg-red-600
            hover:bg-red-700
            active:scale-[0.98]
            text-white
            font-bold
            py-3
            rounded-xl
            transition
          "
        >
          🔄 Ya lo permití
        </button>

      </div>
    </div>
  );
}