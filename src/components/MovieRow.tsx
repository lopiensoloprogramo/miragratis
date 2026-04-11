import { useRef } from "react";
import type { Movie } from "../types/Movie";
import MovieCard from "../components/MovieCard";

export default function MovieRow({
  title,
  movies,
}: {
  title: string;
  movies: Movie[];
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;

    rowRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl mb-2 font-semibold">{title}</h2>

      <div className="relative">
        {/* botón izquierda */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 bg-black/50 px-3 opacity-0 group-hover:opacity-100"
        >
          ◀
        </button>

        {/* carrusel */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-scroll scrollbar-hide"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="min-w-[180px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* botón derecha */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 bg-black/50 px-3 opacity-0 group-hover:opacity-100"
        >
          ▶
        </button>
      </div>
    </div>
  );
}