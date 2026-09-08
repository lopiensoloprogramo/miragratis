import { useEffect, useState } from "react";

export default function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
    const checkAdBlock = () => {
      // Elemento señuelo con nombres comúnmente bloqueados
      const bait = document.createElement("div");

      bait.className =
        "ads ad-banner ad-container advertisement ad-unit adsbox";

      bait.style.position = "absolute";
      bait.style.left = "-9999px";
      bait.style.width = "1px";
      bait.style.height = "1px";

      document.body.appendChild(bait);

      setTimeout(() => {
        const blocked =
          bait.offsetHeight === 0 ||
          bait.offsetParent === null ||
          getComputedStyle(bait).display === "none" ||
          getComputedStyle(bait).visibility === "hidden";

        document.body.removeChild(bait);

        if (blocked) {
          setAdBlockDetected(true);
        }
      }, 200);
    };

    checkAdBlock();
  }, []);

  if (!adBlockDetected) return null;

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
          Para continuar navegando, desactiva tu bloqueador de anuncios en el menú extensiones de tu navegador
          y recarga la página.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
        >
          🔄 Ya lo desactivé, recargar página
        </button>

      </div>
    </div>
  );
}