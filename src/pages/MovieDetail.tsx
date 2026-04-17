import { useParams } from "react-router-dom";
import { series } from "../data/series";
import { movies } from "../data/movies";
import VideoPlayer from "../components/VideoPlayer";
import { useState, useRef, useEffect } from "react";

export default function MovieDetail() {
  const { id } = useParams();

  const item =
    series.find((s) => s.id === id) ||
    movies.find((m) => m.id === id);

  if (!item) return <div>No encontrada</div>;

  const isSerie = "seasons" in item;

  const playerRef = useRef<HTMLDivElement>(null);

  // 🎬 OPCIONES PARA PELÍCULAS
  const [selectedOption, setSelectedOption] = useState<any>(null);

  // 📺 SERIES
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [openSeason, setOpenSeason] = useState<number | null>(1);

  // 🔥 cuando carga película → setear primera opción
  useEffect(() => {
    if (!isSerie && item.opcion?.length > 0) {
      setSelectedOption(item.opcion[0]);
    }
  }, [item, isSerie]);

  // 🔥 lógica episodios (igual que antes)
  const currentSeason = isSerie
    ? item.seasons.find((s) =>
        s.episodes.some((ep) => ep.file === selectedEpisode?.file)
      )
    : null;

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

  return (
    <div className="p-6 text-white max-w-9xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-6">

        {/* IZQUIERDA */}
        <div className="space-y-6 w-full">

          {/* 🎬 PLAYER */}
          {isSerie ? (
            selectedEpisode && (
              <div ref={playerRef}>
                <VideoPlayer item={selectedEpisode.file} />
              </div>
            )
          ) : (
            selectedOption && (
              <div ref={playerRef}>
                <VideoPlayer item={selectedOption.file} />
              </div>
            )
          )}

          {/* 🎬 SELECTOR DE OPCIONES (PELÍCULA) */}
          {!isSerie && item.opcion?.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {item.opcion.map((op, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(op)}
                  className={`px-4 py-2 rounded text-sm ${
                    selectedOption?.file === op.file
                      ? "bg-blue-600"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {op.title}
                </button>
              ))}
            </div>
          )}

          {/* 📺 BOTONES SERIES */}
          {isSerie && selectedEpisode && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={!prevEpisode}
                onClick={() => { console.log("ITEM:", item);
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
          <div className="flex gap-6">
            <img
              src={item.thumbnail}
              className="w-64 h-90 object-cover rounded-xl"
            />

            <div className="flex-1">
              <h1 className="text-4xl text-blue-950 font-bold">
                {item.title}
              </h1>
              <p className="text-gray-400">{item.year}</p>

              <p className="mt-4 text-black leading-relaxed">
                {item.description}
              </p>

              {/* TRAILER */}
              {item.trailer && (
                <div className="mt-4">
                  <h3 className="text-black font-semibold mb-2">
                    Trailer Oficial
                  </h3>

                  <div className="max-w-md">
                    <VideoPlayer item={item.trailer} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 📺 TEMPORADAS */}
          {isSerie && (
            <div className="space-y-4">
              {item.seasons.map((season) => (
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
          )}
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

      </div>
    </div>
  );
}