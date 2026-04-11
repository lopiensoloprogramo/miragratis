import type  { Movie } from "../types/Movie";
import { Link } from "react-router-dom";

export default function HeroBanner({ movie }: { movie: Movie }) {
  return (
    <div className="relative w-full h-[85vh] mb-8">
      {/* imagen de fondo */}
      <img
        src={movie.thumbnail}
        className="w-full h-full object-cover"
      />

      {/* overlay oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* contenido */}
      <div className="absolute bottom-10 left-10 max-w-xl">
        <h1 className="text-4xl text-sky-600 font-bold mb-4">{movie.title}</h1>

        <p className="text-gray-300 mb-4 line-clamp-3">
          {movie.description}
        </p>

        <Link to={`/movie/${movie.id}`}>
          <button className="bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition">
            ▶ Ver ahora
          </button>
        </Link>
      </div>
    </div>
  );
}