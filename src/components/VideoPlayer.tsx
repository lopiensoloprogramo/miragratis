
import { useState, useEffect } from "react";

export default function VideoPlayer({
  item,
  showAd = false,
  requireClicks = false,
}: {
  item: string;
  showAd?: boolean;
  requireClicks?: boolean;
}) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  const MAX_CLICKS = 6;

  // Detectar tipos
  const isDrive = item?.startsWith("drive:");
  const driveId = isDrive ? item.replace("drive:", "") : null;

  const isYoutube = item?.startsWith("youtube:");
  const youtubeId = isYoutube ? item.replace("youtube:", "") : null;

  const isMega = item?.startsWith("mega:");
  const megaId = isMega ? item.replace("mega:", "") : null;

  // Si no requiere clics, se reproduce normalmente
  const isUnlocked = !requireClicks || unlocked;

  const getVideoUrl = async (item: string) => {
    try {
      const res = await fetch(
        `https://us-central1-miragratis.cloudfunctions.net/getVideoUrl?item=${encodeURIComponent(item)}`
      );

      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Error obteniendo video:", err);
      return "";
    }
  };

  // Publicidad existente
  const openAddirecto = () => {
    let clicks = parseInt(localStorage.getItem("ad_clicks") || "0");

    if (clicks === 0) {
      window.open("https://omg10.com/4/10893314", "_blank");
      clicks = 1;
    } else {
      clicks++;

      if (clicks % 2 !== 0) {
        window.open("https://omg10.com/4/10893314", "_blank");
      }
    }

    localStorage.setItem("ad_clicks", clicks.toString());
  };

  // Control de los seis clics
  const handlePlayerClick = () => {
    if (unlocked) return;

    if (showAd) {
      openAddirecto();
    }

    const nextClick = clickCount + 1;

    setClickCount(nextClick);

    if (nextClick >= MAX_CLICKS) {
      setUnlocked(true);
    }
  };

  // Reiniciar al cambiar de contenido
  useEffect(() => {
    setClickCount(0);
    setUnlocked(false);
  }, [item]);

  // Cargar video
  useEffect(() => {
    if (!item) {
      setLoading(false);
      return;
    }

    if (isDrive || isYoutube || isMega) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setVideoUrl("");

      const url = await getVideoUrl(item);

      setVideoUrl(url);
      setLoading(false);
    };

    load();
  }, [item]);

  const progress = (clickCount / MAX_CLICKS) * 100;
  const circumference = 264;

  return (
    <div className="w-full aspect-[16/8] md:aspect-[16/8] bg-black rounded-lg overflow-hidden relative">

      {/* BLOQUEO DE REPRODUCCIÓN: SOLO PELÍCULAS */}
      {requireClicks && !unlocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-white">

          <button
            onClick={handlePlayerClick}
            className="flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            {/* CÍRCULO DE PROGRESO */}
            <div className="relative w-24 h-24">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full -rotate-90"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#404040"
                  strokeWidth="6"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference - (progress / 100) * circumference
                  }
                  className="transition-all duration-300"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {clickCount}/{MAX_CLICKS}
                </span>
              </div>
            </div>

            <span className="text-sm font-semibold">
              {clickCount === 0
                ? "Presiona para reproducir"
                : clickCount === 5
                ? "¡Último clic!"
                : "Preparando video..."}
            </span>

            <span className="text-xs text-gray-400">
              {`Progreso: ${clickCount} de 6`}
            </span>
          </button>
        </div>
      )}

      {/* YOUTUBE */}
      {isUnlocked && isYoutube && youtubeId && (
        <iframe
          key={youtubeId}
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}

      {/* DRIVE */}
      {isUnlocked && isDrive && driveId && (
        <iframe
          key={driveId}
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          className="w-full h-full"
          allow="autoplay"
          allowFullScreen
        />
      )}

      {/* MEGA */}
      {isUnlocked && isMega && megaId && (
        <iframe
          key={megaId}
          src={`https://mega.nz/embed/${megaId}`}
          className="w-full h-full"
          allow="autoplay"
          allowFullScreen
        />
      )}

      {/* BUNNY / MP4 */}
      {isUnlocked && !isDrive && !isYoutube && !isMega && videoUrl && (
        <video
          key={videoUrl}
          controls
          autoPlay
          className="w-full h-full"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* ERROR */}
      {isUnlocked && !loading && !isDrive && !isYoutube && !isMega && !videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Video no disponible
        </div>
      )}

      {/* LOADER */}
      {isUnlocked && loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
