import { useParams } from "react-router-dom";
import { useState } from "react";
import { movies } from "../data/movies";
import { series } from "../data/series";

export default function RedirectPage() {
  const { code } = useParams();
  const [clicks, setClicks] = useState(0);

  // 🔥 parsear el code
  // formato: movie-1-0  /  serie-2-3
  const [type, id, index] = (code || "").split("-");

  let realLink = "";

  if (type === "movie") {
    const movie = movies.find((m) => m.id === id);
    realLink = movie?.opcion?.[Number(index)]?.file || "";
  }

  if (type === "serie") {
    const serie = series.find((s) => s.id === id);

    // 🔥 ejemplo simple: primer episodio de todas las temporadas
    const allEpisodes = serie?.seasons.flatMap(s => s.episodes) || [];

    realLink = allEpisodes[Number(index)]?.file || "";
  }

  const handleUnlock = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);

    // 🔥 primer click → anuncio
    if (newClicks === 1) {
      window.open("https://omg10.com/4/10893314", "_blank");
      return;
    }

    // 🔥 segundo click → redirige
    if (newClicks >= 2 && realLink) {
      window.location.href = realLink;
    }
  };

  if (!realLink) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Link no válido
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-6 text-center">

      <h1 className="text-2xl font-bold mb-4">
        Descargar archivo
      </h1>

      <p className="text-gray-400 mb-6">
        Haz clic en el botón para continuar
      </p>

      <button
        onClick={handleUnlock}
        className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700"
      >
        ⬇️ Obtener enlace
      </button>

    </div>
  );
}