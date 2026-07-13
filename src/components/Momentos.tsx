import { useRef } from "react";
import { Link } from "react-router-dom";
import { momentos } from "../data/momentos";

export default function Momentos() {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;

    rowRef.current.scrollBy({
      left: rowRef.current.clientWidth,
      behavior: "smooth",
    });

    if (dir === "left") {
      rowRef.current.scrollBy({
        left: -rowRef.current.clientWidth * 2,
        behavior: "smooth",
      });
    }
  };

  if (!momentos.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-Black">
            🔥 MOMENTOS CLAVE
          </h2>

          <p className="text-gray-800 text-sm">
            Revive las escenas más épicas en menos de 10 minutos.
          </p>
        </div>

        <Link
          to="/momentos"
          className="hidden md:block text-blue-400 hover:text-blue-300"
        >
          Ver todos →
        </Link>
      </div>

      <div className="relative">

        {/* Gradientes */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Flechas */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 items-center justify-center px-4 bg-black/40 hover:bg-black/70 transition"
        >
          ◀
        </button>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 items-center justify-center px-4 bg-black/40 hover:bg-black/70 transition"
        >
          ▶
        </button>

        {/* Carrusel */}
        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
        >
          {momentos.map((item) => (
            <Link
              key={item.id}
              to={`/momento/${item.id}`}
              className="flex-none w-[180px] snap-start group"
            >
              <div className="relative overflow-hidden rounded-xl">

                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-[260px] object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Oscurecido */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Play */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition">
                    ▶
                  </div>
                </div>

                {/* Duración */}
                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  ⏱ {item.duration}
                </div>

                {/* Badge */}
                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                  MOMENTO
                </div>
              </div>

              <h3 className="mt-3 text-black font-semibold">
                {item.title}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}