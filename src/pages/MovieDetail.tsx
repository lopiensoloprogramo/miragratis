import { useParams } from "react-router-dom";
import { movies } from "../data/movies";
import VideoPlayer from "../components/VideoPlayer";
import { useState, useRef } from "react";

export default function MovieDetail() {
  const { id } = useParams();

  const movie = movies.find((m) => m.id === id);

  if (!movie) return <div>No encontrada</div>;

  const playerRef = useRef<HTMLDivElement>(null);

  const [selectedOption, setSelectedOption] = useState<any>(null);

  // 🔥 SCROLL PRECISO (con offset)
  const scrollToPlayer = () => {
    if (!playerRef.current) return;

    
  playerRef.current?.scrollIntoView({ behavior: "smooth" });

  };


  const openAddirecto = () => {
  window.open("https://omg10.com/4/10893314", "_blank");
};



  return (
    <div className="p-6 text-white max-w-9xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-6">

        {/* IZQUIERDA */}
        <div className="space-y-6 w-full">

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
                    <VideoPlayer item={movie.trailer} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 🎬 HEADER + BOTONES */}
          {movie.opcion?.length > 0 && (
            <div className="space-y-3">

              {/* 👇 TEXTO NUEVO */}
              <div className="flex items-center justify-between">
                <button className="text-lg font-semibold text-black" onClick={openAddirecto}>
                
           
                   🎬 VER AHORA
             

                </button>
              

             
              </div>

              {/* BOTONES */}
              <div className="flex gap-3 flex-wrap">
                {movie.opcion.map((op, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      openAddirecto
                      setSelectedOption(op); 

                      setTimeout(() => {
                        scrollToPlayer();
                      }, 100);
                    }}
                    className={`px-4 py-2 rounded text-sm transition ${
                      selectedOption?.file === op.file
                        ? "bg-blue-600"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    {op.title}
                  </button>
                  
                ))}
              </div>
            </div>
          )}

          {/* 🎬 PLAYER */}
          {selectedOption && (
            <div ref={playerRef} className="scroll-mt-24">
              <VideoPlayer item={selectedOption.file} />
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