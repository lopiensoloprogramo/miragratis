import { useRef } from "react";
import type { Serie } from "../types/Serie";
import type { Movie } from "../types/Movie";
import MovieCard from "../components/MovieCard";

export default function MovieRow({
  title,
  items,
}: {
  title: string;
  items: (Movie | Serie)[];
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;

    const scrollAmount = rowRef.current.clientWidth;

    rowRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl mb-3 font-semibold">{title}</h2>

      <div className="relative">
        {/* Gradientes laterales (opcional pero pro) */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Botón izquierda (solo desktop) */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex items-center justify-center absolute left-0 top-0 bottom-0 z-20 bg-black/50 px-4 opacity-70 hover:opacity-100 transition"
        >
          ◀
        </button>

        {/* Carrusel */}
        <div
          ref={rowRef}
          className="
            flex gap-4 
            overflow-x-auto scrollbar-hide 
            scroll-smooth
            snap-x snap-mandatory
            md:overflow-x-hidden
          "
        >
          {items.map((item) => (
            <div key={item.id} className="min-w-[180px] snap-start">
              <MovieCard item={item} />
            </div>
          ))}
        </div>

        {/* Botón derecha (solo desktop) */}
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex items-center justify-center absolute right-0 top-0 bottom-0 z-20 bg-black/50 px-4 opacity-70 hover:opacity-100 transition"
        >
          ▶
        </button>
      </div>
    </div>
  );
}