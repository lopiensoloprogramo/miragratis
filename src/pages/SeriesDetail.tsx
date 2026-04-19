import { useParams } from "react-router-dom";
import { series } from "../data/series";
import VideoPlayer from "../components/VideoPlayer";
import { useState, useRef } from "react";
import AnuncioSidebar from "../components/AnunciosSidebar";
export default function SerieDetail() {
  const { id } = useParams();

  const serie = series.find((s) => s.id === id);

  if (!serie) return <div>No encontrada</div>;

  const playerRef = useRef<HTMLDivElement>(null);

  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [openSeason, setOpenSeason] = useState<number | null>(1);

  // 🔥 lógica episodios
  const currentSeason = serie.seasons.find((s) =>
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

const showAds = () => {
  let clicks = parseInt(localStorage.getItem("ad_clicks") || "0");
  let scriptLoaded = localStorage.getItem("ad_script");

  // 🔥 PRIMER CLICK → cargar script
  if (!scriptLoaded) {
    loadScriptAd();
    localStorage.setItem("ad_script", "true");
    return;
  }

  // 🔥 DESPUÉS → direct link cada 2 clicks
  clicks++;

  if (clicks >= 3) {
    window.open("https://omg10.com/4/10893314", "_blank");
    clicks = 0;
  }

  localStorage.setItem("ad_clicks", clicks.toString());
};

const loadScriptAd = () => {
  if (document.getElementById("propeller-ad")) return;

  const script = document.createElement("script");
  script.id = "propeller-ad";
  script.src = "https://al5sm.com/tag.min.js";
  script.dataset.zone = "10862995";

  document.body.appendChild(script);

  // 🔥 opcional: remover después de unos segundos
  setTimeout(() => {
    const s = document.getElementById("propeller-ad");
    if (s) s.remove();
    localStorage.removeItem("ad_script");
  }, 15000);
};




  return (
 <div className="p-4 md:p-6 text-white max-w-9xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-6">

        {/* IZQUIERDA */}
        <div className="space-y-6 w-full">

          {/* 🎬 PLAYER */}
          {selectedEpisode && (
            <div ref={playerRef}  className="scroll-mt-28">
              <VideoPlayer item={selectedEpisode.file}  />
            </div>
          )}

          {/* ⏮️⏭️ BOTONES */}
          {selectedEpisode && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={!prevEpisode}
                onClick={() => {
                  showAds()
                  if (!prevEpisode) return;
                  setSelectedEpisode(prevEpisode);
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
                 showAds()
                  if (!nextEpisode) return;
                  setSelectedEpisode(nextEpisode);
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
          )}

          {/* INFO */}
        {/* INFO */}
<div className="flex flex-col md:flex-row gap-4 md:gap-6">

  {/* 📷 IMAGEN */}
  <img
    src={serie.thumbnail}
    className="w-32 md:w-56 lg:w-64 h-auto object-cover rounded-xl mx-auto md:mx-0"
  />

  {/* 📄 TEXTO */}
  <div className="flex-1 text-center md:text-left">
    <h1 className="text-2xl md:text-4xl text-blue-950 font-bold">
      {serie.title}
    </h1>

    <p className="text-gray-400 text-sm md:text-base">
      {serie.year}
    </p>

    <p className="mt-3 text-black text-sm md:text-base leading-relaxed">
      {serie.description}
    </p>

    {/* 🎬 TRAILER */}
    {serie.trailer && (
      <div className="mt-4">
        <h3 className="text-black font-semibold mb-2 text-sm md:text-base">
          Trailer Oficial
        </h3>

        <div className="w-full md:max-w-md mx-auto md:mx-0">
          <VideoPlayer item={serie.trailer} />
        </div>
      </div>
    )}
  </div>

</div>

          {/* 📺 TEMPORADAS */}
          <div className="space-y-4">
                <div className="text-black  flex items-center justify-between">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    <span>🎬 Selecciona la Temporada👇</span> 
                    </button>
              </div>
            {serie.seasons.map((season) => (
              <div key={season.seasonNumber} className="bg-gray-900 rounded-lg">
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
                          showAds()
                          setSelectedEpisode(ep);
                          setTimeout(() => {
                            playerRef.current?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }, 100);
                        }}
                        className={`w-full text-left p-3 rounded flex justify-between ${
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

        {/* DERECHA */}
        <div className="hidden md:block">
          <div className="bg-gray-900 p-3 rounded-lg sticky top-6 text-sm flex justify-center">
            <button
              onClick={() =>
                window.open(
                  "https://www.facebook.com/profile.php?id=61574281967368",
                  "_blank"
                )
              }
              className="bg-blue-600 px-4 py-2 rounded text-white"
            >
              👍 Síguenos en Facebook
            </button>
          </div>
        </div>
   <AnuncioSidebar/>
      </div>
    </div>
  );
}