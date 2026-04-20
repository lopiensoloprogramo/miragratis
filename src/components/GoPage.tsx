import { useParams } from "react-router-dom";
import { series } from "../data/series";
import { movies } from "../data/movies";
import { useEffect, useState } from "react";

export default function GoPage() {
  const { slug } = useParams();
  const [realLink, setRealLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Slug inválido");
      setLoading(false);
      return;
    }

    try {
      const parts = slug.split("-");

      if (parts.length < 3) {
        setError("Formato de enlace incorrecto");
        setLoading(false);
        return;
      }

      const type = parts[0];
      const id = parts[1];
      const index = Number(parts[2]);

      if (isNaN(index)) {
        setError("Índice inválido");
        setLoading(false);
        return;
      }

      // 🔥 SERIES
      if (type === "serie") {
        const serie = series.find((s) => s.id === id);

        if (!serie) {
          setError("Serie no encontrada");
          setLoading(false);
          return;
        }

        const allEpisodes = serie.seasons.flatMap((s) => s.episodes);
        const ep = allEpisodes[index];

        if (!ep) {
          setError("Episodio no encontrado");
          setLoading(false);
          return;
        }

            if (ep.download && ep.download.trim() !== "") {
            // ✅ LINK DIRECTO
            setRealLink(ep.download);
            } 
            else if (ep.file && ep.file.startsWith("drive:")) {
            // ✅ GOOGLE DRIVE
            const fileId = ep.file.replace("drive:", "");
            setRealLink(`https://drive.google.com/file/d/${fileId}/view`);
            } 
            else {
            setError("Este episodio no tiene enlace disponible");
            }
      }

      // 🔥 MOVIES
      else if (type === "movie") {
        const movie = movies.find((m) => m.id === id);

        if (!movie) {
          setError("Película no encontrada");
          setLoading(false);
          return;
        }

        const option = movie.opcion?.[index];

        if (!option) {
          setError("Opción no encontrada");
          setLoading(false);
          return;
        }

        if (option.download && option.download.trim() !== "") {
          setRealLink(option.download);
        } else if (option.file && option.file.startsWith("drive:")) {
          const fileId = option.file.replace("drive:", "");
          setRealLink(`https://drive.google.com/file/d/${fileId}/view`);
        } else {
          setError("Esta opción no tiene enlace disponible");
        }
      } else {
        setError("Tipo inválido");
      }

    } catch (err) {
      setError("Error procesando el enlace");
    }

    setLoading(false);
  }, [slug]);

  const handleUnlock = () => {
    if (!realLink) {
      alert("No hay enlace disponible");
      return;
    }

    // 🔥 publicidad
    window.open("https://omg10.com/4/10893314", "_blank");

    // 🔥 redirección segura
    setTimeout(() => {
      window.location.href = realLink;
    }, 1500);
  };

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-gray-400 animate-pulse">
          🔄 Preparando enlace...
        </p>
      </div>
    );
  }

  // ❌ ERROR
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white text-center px-4">
        <h1 className="text-xl font-bold mb-3">⚠️ Error</h1>
        <p className="text-gray-400 mb-4">{error}</p>

        <button
          onClick={() => window.history.back()}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
        >
          🔙 Volver
        </button>
      </div>
    );
  }

  // ✅ OK
  return (
    <div className="h-screen flex flex-col items-center justify-center text-white bg-black text-center px-4">
      <h1 className="text-2xl font-bold mb-4">
        🔒 Enlace protegido
      </h1>

      <p className="mb-6 text-gray-400">
        Haz clic para desbloquear el enlace
      </p>

      <button
        onClick={handleUnlock}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-bold"
      >
        🔓 Obtener enlace
      </button>
    </div>
  );
}