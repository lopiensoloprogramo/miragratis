import { useEffect } from "react";

export default function AnuncioSidebar() {
  useEffect(() => {
    // 🔥 evitar duplicados
    if (document.getElementById("monetag-sidebar-ad")) return;

    const script = document.createElement("script");
    script.id = "monetag-sidebar-ad";
    script.src = "https://nap5k.com/tag.min.js";
    script.dataset.zone = "10895578";

    document.body.appendChild(script);

    // 🔥 cleanup (cuando sales de la página)
    return () => {
      const s = document.getElementById("monetag-sidebar-ad");
      if (s) s.remove();
    };
  }, []);

  return (
    <div className="mt-4">
      {/* aquí se inyecta el anuncio */}
    </div>
  );
}