import { useParams } from "react-router-dom";
import { movies } from "../data/movies";
import VideoPlayer from "../components/VideoPlayer";
import { useState, useRef } from "react";

export default function MovieDetail() {
  const { id } = useParams();
  const movie = movies.find((m) => m.id === id);

  if (!movie) return <div>No encontrada</div>;

  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [openSeason, setOpenSeason] = useState<number | null>(1);

  // 🔥 lógica episodios por temporada
  const currentSeason = movie.seasons.find((s) =>
    s.episodes.some((ep) => ep.file === selectedEpisode?.file)
  );

  const seasonEpisodes = currentSeason?.episodes || [];

  const currentIndex = seasonEpisodes.findIndex(
    (ep) => ep.file === selectedEpisode?.file
  );

  const prevEpisode =
    currentIndex > 0 ? seasonEpisodes[currentIndex - 1] : null;

  const nextEpisode =
    currentIndex < seasonEpisodes.length - 1
      ? seasonEpisodes[currentIndex + 1]
      : null;

  const playerRef = useRef<HTMLDivElement>(null);
const showAd = () => {
  let clicks = parseInt(localStorage.getItem("ad_clicks") || "0");
  let adLoaded = localStorage.getItem("ad_loaded");

  // 🔥 SI YA HAY SCRIPT ACTIVO → NO HACER NADA
  if (adLoaded === "true") return;

  // 🔥 PRIMER CLICK
  if (clicks === 0) {
    loadAd();
    localStorage.setItem("ad_clicks", "1");
    return;
  }

  clicks++;

  // 🔥 cada 3 clics
  if (clicks >= 1) {
    loadAd();
    clicks = 0;
  }

  localStorage.setItem("ad_clicks", clicks.toString());
};

const loadAd = () => {
  // evitar duplicados
  if (document.getElementById("propeller-script")) return;

  const script = document.createElement("script");
  script.id = "propeller-script";
  script.src = "https://al5sm.com/tag.min.js";
  script.setAttribute("data-zone", "10862995");

  document.body.appendChild(script);

  // 🔥 marcar como activo
  localStorage.setItem("ad_loaded", "true");

  // 🔥 después de 10s lo "desactivamos"
  setTimeout(() => {
    localStorage.removeItem("ad_loaded");

    const s = document.getElementById("propeller-script");
    if (s) s.remove();
  }, 10000);
};



  return (
    <div className="p-6 text-white max-w-9xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-6">

        {/* 🔥 IZQUIERDA (80%) */}
        <div className="space-y-6 w-full">

          {/* 🎬 PLAYER */}
          {selectedEpisode && (
            <div ref={playerRef} className="scroll-mt-20">
              <VideoPlayer file={selectedEpisode.file} />

              {/* ⏮️⏭️ BOTONES */}
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={!prevEpisode}
                  onClick={() => {
                    showAd();
                    if (!prevEpisode) return;
                    setSelectedEpisode(prevEpisode);

                    setTimeout(() => {
                      playerRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }}
                  className={`px-4 py-2 rounded ${
                    prevEpisode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-700 opacity-50"
                  }`}
                >
                  ⏮️ Anterior
                </button>

                <span className="text-gray-400 text-sm">
                  Episodio {currentIndex + 1} de {seasonEpisodes.length}
                </span>

                <button
                  disabled={!nextEpisode}
                  onClick={() => {
                     showAd();
                    if (!nextEpisode) return;
                    setSelectedEpisode(nextEpisode);

                    setTimeout(() => {
                      playerRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }}
                  className={`px-4 py-2 rounded ${
                    nextEpisode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-700 opacity-50"
                  }`}
                >
                  Siguiente ⏭️
                </button>
              </div>
            </div>
          )}

          {/* 🔝 INFO */}
          <div className="flex gap-6">
            <img
              src={movie.thumbnail}
              className="w-64 h-90 object-cover rounded-xl"
            />

            <div className="flex-1">
              <h1 className="text-4xl text-blue-950 font-bold">
                {movie.title}
              </h1>
              <p className="text-gray-400">{movie.year}</p>

              <p className="mt-4 text-black leading-relaxed">
                {movie.description}
              </p>

              {/* 🎬 TRAILER */}
              {movie.trailer && (
                <div className="mt-4">
                  <h3 className="text-black font-semibold mb-2">
                    Trailer Oficial
                  </h3>

                  <div className="max-w-md">
                    <VideoPlayer file={movie.trailer} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 📺 TEMPORADAS */}
          <div className="space-y-4">
            {movie.seasons.map((season) => (
              <div
                key={season.seasonNumber}
                className="bg-gray-900 rounded-lg"
              >
                <button
                  onClick={() =>
                    setOpenSeason(
                      openSeason === season.seasonNumber
                        ? null
                        : season.seasonNumber
                    )
                  }
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-800"
                >
                  <span className="font-semibold">
                    Temporada {season.seasonNumber}
                  </span>

                  <span>
                    {openSeason === season.seasonNumber ? "▲" : "▼"}
                  </span>
                </button>

                {openSeason === season.seasonNumber && (
                  <div className="px-4 pb-4 space-y-2">
                    {season.episodes.map((ep, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedEpisode(ep);
                          showAd();
                          setTimeout(() => {
                            playerRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }, 100);
                        }}
                        className={`w-full text-left p-3 rounded flex justify-between
                          ${
                            selectedEpisode?.file === ep.file
                              ? "bg-gray-700"
                              : "bg-gray-800 hover:bg-gray-700"
                          }`}
                      >
                        <span>{ep.title}</span>
                        <span className="text-gray-400 text-sm">▶</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 👉 DERECHA (20%) */}
        <div className="hidden md:block">
         <div className="bg-gray-900 p-3 rounded-lg sticky top-6 text-sm">
            
            <h3 className="font-semibold mb-3 text-align-center">Síguenos</h3>

            <div className="space-y-2">
              <a target="_blank"  href="https://www.facebook.com/profile.php?id=61574281967368" className="block hover:text-blue-400">Facebook</a>
            
            </div>

            {/* 🔥 ZONA MONEY */}
            <div className="mt-6 border-t border-gray-700 pt-4">
              <button className="w-full bg-red-600 py-2 rounded hover:bg-red-500">
                Login
              </button>
            </div>

          </div>
          
        </div>

      </div>
    </div>
  );
}