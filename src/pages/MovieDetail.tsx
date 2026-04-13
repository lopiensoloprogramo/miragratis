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
// 🔥 todos los episodios en una sola lista
const allEpisodes = movie.seasons.flatMap((s) => s.episodes);

// 🔥 índice del episodio actual
const currentIndex = allEpisodes.findIndex(
  (ep) => ep.file === selectedEpisode?.file
);

// 🔥 anterior y siguiente
const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
const nextEpisode =
  currentIndex < allEpisodes.length - 1
    ? allEpisodes[currentIndex + 1]
    : null;

  // 🔥 referencia al player
  const playerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="p-6 text-white max-w-6xl mx-auto space-y-6">

      {/* 🎬 PLAYER ARRIBA */}
      {selectedEpisode && (
       <div ref={playerRef} className="scroll-mt-20 mb-12">
          <VideoPlayer file={selectedEpisode.file} />
          {/* ⏮️⏭️ BOTONES */}
<div className="flex justify-between mt-4">
  
  {/* ANTERIOR */}
  <button
    disabled={!prevEpisode}
    onClick={() => {
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
      prevEpisode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-700 opacity-50"
    }`}
  >
    ⏮️ Anterior
  </button>

<h2 className="text-gray-500">
  Episodio {currentIndex + 1} de {allEpisodes.length}
</h2>

  {/* SIGUIENTE */}
  <button
    disabled={!nextEpisode}
    onClick={() => {
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
      nextEpisode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-700 opacity-50"
    }`}
  >
    Siguiente ⏭️
  </button>
</div>
        </div>
      )}

      {/* 🔝 TOP: imagen + info */}
      <div className="flex gap-6">
        
        {/* 🖼 IMAGEN */}
        <img
          src={movie.thumbnail}
          className="w-64 h-80 object-cover rounded-xl"
        />

        {/* 📝 INFO */}
        <div className="flex-1">
          <h1 className="text-4xl text-blue-950 font-bold">{movie.title}</h1>
          <p className="text-gray-400">{movie.year}</p>

          <p className="mt-4 text-black leading-relaxed">
            {movie.description}
          </p>
        </div>
      </div>

      {/* 📺 TEMPORADAS */}
      <div className="space-y-4">
        {movie.seasons.map((season) => (
          <div key={season.seasonNumber} className="bg-gray-900 rounded-lg">

            {/* HEADER */}
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

            {/* EPISODIOS */}
            {openSeason === season.seasonNumber && (
              <div className="px-4 pb-4 space-y-2">
                {season.episodes.map((ep, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedEpisode(ep);

                      // 🔥 scroll hacia el video arriba
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
  );
}