
import { useParams } from "react-router-dom";
import { movies } from "../data/movies";
import VideoPlayer from "../components/VideoPlayer";
import { useState, useRef } from "react";
import AnuncioSidebar from "../components/AnunciosSidebar";
import MovieRow from "../components/MovieRow";
import ImageGallery from "../components/ImageGallery";

export default function MovieDetail() {
  const { id } = useParams();

  const movie = movies.find((m) => m.id === id);
  if (!movie) return <div>No encontrada</div>;

  const playerRef = useRef<HTMLDivElement>(null);

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [mode, setMode] = useState<"view" | "download" | null>(null);

  // SCROLL
  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ADS CONTROL
  const openAddirecto = () => {
    window.open("https://omg10.com/4/10893314", "_blank");
  };

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .split(" ")
      .filter((word) => word.length > 2);

  const normalize = (genres: string[]) =>
    genres.map((g) => g.trim().toLowerCase());

  const movieGenres = normalize(movie.genre);
  const movieTitleWords = normalizeText(movie.title);

  const relatedMovies = movies
    .filter((m) => m.id !== movie.id)
    .map((m) => {
      const genres = normalize(m.genre);

      const genreMatches = genres.filter((g) =>
        movieGenres.includes(g)
      ).length;

      const titleWords = normalizeText(m.title);

      const titleMatches = titleWords.filter((word) =>
        movieTitleWords.includes(word)
      ).length;

      const score = titleMatches * 100 + genreMatches * 2;

      return {
        movie: m,
        score,
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.movie);

  return (
    <div className="p-4 md:p-6 text-white max-w-9xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">

        {/* IZQUIERDA */}
        <div className="space-y-6 w-full">

          {/* INFO */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <img
              src={movie.thumbnail}
              className="w-32 md:w-56 lg:w-64 h-auto object-cover rounded-xl mx-auto md:mx-0"
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-4xl text-blue-950 font-bold">
                {movie.title}
              </h1>

              <p className="text-gray-400 text-sm md:text-base">
                {movie.year}
              </p>

              <p className="text-black font-semibold text-sm md:text-base">
                Lenguaje: {movie.languaje}
              </p>

              <p className="mt-3 text-black text-sm md:text-base leading-relaxed">
                {movie.description}
              </p>

              {/* TRAILER: SIN BLOQUEO */}
              {movie.trailer && (
                <div className="mt-4">
                  <h3 className="text-black font-semibold mb-2">
                    Trailer Oficial
                  </h3>

                  <div className="w-full md:max-w-md mx-auto md:mx-0">
                    <VideoPlayer item={movie.trailer} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTONES PRINCIPALES */}
          {movie.opcion?.length > 0 && (
            <div className="space-y-3">

              <div className="flex items-center gap-3 flex-wrap">

                {/* VER */}
                <button
                  onClick={() => {
                    openAddirecto();
                    setMode("view");
                    setShowDownloadOptions(false);
                    setShowOptions(true);
                  }}
                  className={`font-bold py-2 px-5 rounded shadow transition ${
                    mode === "view"
                      ? "bg-blue-700 ring-2 ring-blue-300"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  🎬 VER AHORA
                </button>

              </div>

              {/* OPCIONES DE REPRODUCCIÓN */}
              {showOptions && !showDownloadOptions && (
                <div className="flex gap-3 flex-wrap">
                  <p className="text-black">
                    Elije entre las opciones
                  </p>

                  {movie.opcion.map((op, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedOption(op);

                        setTimeout(() => {
                          scrollToPlayer();
                        }, 100);
                      }}
                      className={`px-4 py-2 rounded text-sm transition ${
                        selectedOption?.file === op.file
                          ? "bg-blue-600"
                          : "bg-blue-500 hover:bg-blue-700"
                      }`}
                    >
                      ▶ {op.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PLAYER: SEIS CLICS */}
          {selectedOption && (
            <div
              ref={playerRef}
              className="scroll-mt-24"
            >
              <VideoPlayer
                item={selectedOption.file}
                requireClicks={true}
                showAd={true}
              />
            </div>
          )}

          {/* DESCARGAR */}
          <button
            onClick={() => {
              setSelectedOption(null);
              setMode("download");
              setShowDownloadOptions(true);
              setShowOptions(true);
            }}
            className={`font-bold py-2 px-5 rounded shadow transition ${
              mode === "download"
                ? "bg-green-700 ring-2 ring-green-300"
                : "bg-green-700 hover:bg-green-600"
            }`}
          >
            ⬇️ DESCARGAR
          </button>

          {/* OPCIONES DE DESCARGA */}
          {showOptions && showDownloadOptions && (
            <div className="flex gap-3 flex-wrap mt-3">
              <p className="text-black">
                Elije entre las opciones
              </p>

              {movie.opcion.map((op, index) => (
                <button
                  key={index}
                  onClick={() => {
                    window.location.href = `/go/movie-${movie.id}-${index}`;
                  }}
                  className="px-4 py-2 rounded text-sm bg-green-700 hover:bg-green-600"
                >
                  ⬇ {op.title}
                </button>
              ))}
            </div>
          )}

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
            <div className="mt-5 mb-1 border-t border-gray-700 pt-5">
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#24183e] via-[#19142c] to-[#111827] p-5 text-center shadow-lg">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-bold tracking-wider text-purple-300">
                  ⭐ MIRAGRATIS VIP
                </div>

                <h3 className="mb-2 text-xl font-extrabold text-white">
                  ¡Disfruta sin interrupciones!
                </h3>

                <p className="mx-auto mb-4 max-w-sm text-sm leading-relaxed text-gray-300">
                  Únete a nuestra comunidad VIP de Telegram y disfruta de una experiencia más cómoda, sin anuncios durante la reproducción.
                </p>

                <div className="mb-5 flex flex-col gap-2 text-sm text-gray-200">
                  <span>✓ Experiencia sin interrupciones publicitarias</span>
                  <span>✓ Acceso a nuestra comunidad VIP</span>
                  <span>✓ Acceso exclusivo para miembros</span>
                  <span>✓ Soporte técnico y ayuda</span>
                </div>

                <a
                  href="/vip"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-500"
                >
                  QUIERO UNIRME A VIP
                  <span>→</span>
                </a>

                <p className="mt-3 text-xs text-gray-400">
                  Conoce cómo obtener tu acceso.
                </p>

              </div>
            </div>

            <ImageGallery images={movie.gallery} />
          </div>

          <AnuncioSidebar />
        </div>
      </div>

      {/* PELÍCULAS RELACIONADAS */}
      <div>
        {relatedMovies.length > 0 && (
          <div className="mt-8 text-black font-semibold">
            <MovieRow
              title="🍿 Películas relacionadas"
              items={relatedMovies}
            />
          </div>
        )}
      </div>
    </div>
  );
}
