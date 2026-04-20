import { useParams } from "react-router-dom";
import { movies } from "../data/movies";
import VideoPlayer from "../components/VideoPlayer";
import { useState, useRef } from "react";
import AnuncioSidebar from "../components/AnunciosSidebar";

export default function MovieDetail() {
  const { id } = useParams();

  const movie = movies.find((m) => m.id === id);
  if (!movie) return <div>No encontrada</div>;

  const playerRef = useRef<HTMLDivElement>(null);

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [mode, setMode] = useState<"view" | "download" | null>(null);
  // 🔥 SCROLL
  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔥 ADS CONTROL
  const openAddirecto = () => {
    let clicks = parseInt(localStorage.getItem("ad_clicks") || "0");

    // primer click SIEMPRE abre
    if (clicks === 0) {
      window.open("https://omg10.com/4/10893314", "_blank");
      clicks = 1;
    } else {
      clicks++;

      // cada 2 clics
      if (clicks % 2 !== 0) {
        window.open("https://omg10.com/4/10893314", "_blank");
      }
    }

    localStorage.setItem("ad_clicks", clicks.toString());
  };



  return (
    <div className="p-4 md:p-6 text-white max-w-9xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-6">

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

              <p className="mt-3 text-black text-sm md:text-base leading-relaxed">
                {movie.description}
              </p>

              {/* TRAILER */}
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

              {/* 🎬 VER */}
            <button
              onClick={() => {
                openAddirecto();
                setMode("view");
                setShowDownloadOptions(false);
                setShowOptions(true);
              }}
              className={`font-bold py-2 px-5 rounded shadow transition ${
                mode === "view"
                  ? "bg-blue-700  ring-2 ring-blue-300"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              🎬 VER AHORA
            </button>

              {/* ⬇️ DESCARGAR */}

            
            </div>

              {/* 🎬 OPCIONES DE REPRODUCCIÓN */}
                {showOptions &&!showDownloadOptions&& (
                  
              <div className="flex gap-3 flex-wrap">
                <p className="text-black">Elije entre las opciones</p>
                {movie.opcion.map((op, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      openAddirecto();
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

          {/* 🎬 PLAYER */}
          {selectedOption && (
            <div ref={playerRef} className="scroll-mt-24">
              <VideoPlayer item={selectedOption.file} />
            </div>
          )}
            <button
              onClick={() => {
                setSelectedOption(null);
                setMode("download");
                setShowDownloadOptions(true);
                setShowOptions(true);
              }}
              className={`font-bold py-2 px-5 rounded shadow transition ${

                mode === "download"
                  ? "bg-green-700  ring-2 ring-green-300"
                  : "bg-green-700 hover:bg-green-600"
                
              }`
            
            }
            >
              ⬇️ DESCARGAR
            </button>
                          {/* ⬇️ OPCIONES DE DESCARGA */}
              { showOptions&&showDownloadOptions && (
                
                <div className="flex gap-3 flex-wrap mt-3">
                  <p className="text-black">Elije entre las opciones</p>
                  {movie.opcion.map((op, index) => (
                    
                    <button
                      key={index}
                      onClick={() => {
                        openAddirecto();

                        window.location.href = `/go/movie-${movie.id}-${index}`;
                      }}
                      className="px-4 py-2 rounded text-sm bg-green-700 hover:bg-green-600 "
                    >
                      ⬇ {op.title}
                    </button>
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

          <AnuncioSidebar />
        </div>

      </div>
    </div>
  );
}