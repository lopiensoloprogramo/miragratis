import type { Movie } from "../types/Movie";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="relative group cursor-pointer">
        <img
          src={movie.thumbnail}
          className="rounded-xl w-full h-56 object-cover transition duration-300 group-hover:scale-110"
        />

        {/* overlay */}
        <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 transition pointer-events-none flex flex-col justify-end p-3">
          
          <h2 className="opacity-0 group-hover:opacity-100 text-sm font-semibold transition">
            {movie.title}
          </h2>

          <p className="opacity-0 group-hover:opacity-100 text-xs text-gray-300 transition">
            {movie.year}
          </p>

        </div>
      </div>
    </Link>
  );
}