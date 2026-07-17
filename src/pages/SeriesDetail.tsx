import { useParams } from "react-router-dom";
import { series } from "../data/series";
import VideoPlayer from "../components/VideoPlayer";
import { useState, useRef } from "react";
import AnuncioSidebar from "../components/AnunciosSidebar";
import qryape from '../assets/yape-qr.png'
import MovieRow from "../components/MovieRow";


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


const allEpisodes = serie.seasons.flatMap((s) => s.episodes);

const getGlobalIndex = (file: string) => {
  return allEpisodes.findIndex((ep) => ep.file === file);
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .filter(word => word.length > 2);

const normalize = (genres: string[]) =>
  genres.map((g) => g.trim().toLowerCase());

const serieGenres = normalize(serie.genre);
const serieTitleWords = normalizeText(serie.title);

const relatedSeries = series
  .filter((s) => s.id !== serie.id)
  .map((s) => {
    const genres = normalize(s.genre);

    const genreMatches = genres.filter((g) =>
      serieGenres.includes(g)
    ).length;

    const titleWords = normalizeText(s.title);

    const titleMatches = titleWords.filter((word) =>
      serieTitleWords.includes(word)
    ).length;

    const score =
      titleMatches * 100 +
      genreMatches * 2;

    return {
      serie: s,
      score,
    };
  })
  .filter((x) => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .map((x) => x.serie);

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
                    <span>🎬 Selecciona la Temporada 👇</span> 
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
  <div
    key={index}
    className={`p-3 rounded ${
      selectedEpisode?.file === ep.file
        ? "bg-gray-700"
        : "bg-gray-800"
    }`}
  >
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

      {/* 🎬 TITULO */}
      <span className="text-left">{ep.title}</span>

      {/* 🔥 BOTONES */}
      <div className="flex gap-2">

        {/* ▶️ VER ONLINE */}
        <button
          onClick={() => {
            showAds();
            setSelectedEpisode(ep);

            setTimeout(() => {
              playerRef.current?.scrollIntoView({
                behavior: "smooth",
              });
            }, 100);
          }}
          className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600"
        >
          ▶ Ver
        </button>

        {/* ⬇️ DESCARGAR */}
        <button
          onClick={() => {
            const indexGlobal = getGlobalIndex(ep.file);
            window.location.href = `/go/serie-${serie.id}-${indexGlobal}`;
          }}
          className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500"
        >
          ⬇ Descargar
        </button>

      </div>
    </div>
  </div>
))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* DERECHA */}
       <div className="block md:block">
           <div className="bg-gray-900 p-3 rounded-lg sticky top-6 text-sm">

                <button
                  onClick={() =>
                    window.open(
                      "https://www.facebook.com/profile.php?id=61574281967368",
                      "_blank"
                    )
                  }
                  className="w-full bg-blue-600 px-4 py-2 rounded text-white"
                >
                  👍 Síguenos en Facebook
                </button>

                <div className="mt-4 border-t border-gray-700 pt-4 text-center">
                  <p className="text-white font-semibold">
                   ❤️ Apoya MiraGratis
                  </p>
                  <img
                    src={qryape}
                    alt="Yape"
                    className="w-24 mx-auto mt-2 rounded-lg"
                  />

                  <p className="text-green-400 text-sm mt-2">
                     Ayuda a mantener la web
                  </p>
                </div>

            </div>
        </div>
   <AnuncioSidebar/>
      </div>
        {relatedSeries.length > 0 && (
        <div className="mt-8 text-black font-semibold">
          <MovieRow
            title="📺 Series relacionadas"
            items={relatedSeries}
          />
        </div>
      )}
    </div>
  );
}