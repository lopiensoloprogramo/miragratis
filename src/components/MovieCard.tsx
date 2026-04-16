import type { Movie } from "../types/Movie";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="group cursor-pointer">
        
        {/* Contenedor con zoom */}
        <div className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105">
          
          {/* Imagen */}
          <img
            src={movie.thumbnail}
            alt={movie.title}
            className="w-full h-56 object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex flex-col justify-end p-3">
            
            <h2 className="opacity-0 group-hover:opacity-100 text-sm font-semibold transition">
              {movie.title}
            </h2>

            <p className="opacity-0 group-hover:opacity-100 text-xs text-gray-300 transition">
              {movie.year}
            </p>

          </div>
        </div>

      </div>
    </Link>
  );
}