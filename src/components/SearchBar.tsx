import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { series } from "../data/series";
import { movies } from "../data/movies";

type SearchBarProps = {
  onClose?: () => void;
};

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const search = query.toLowerCase();

    const allContent = [
      ...movies.map((movie) => ({
        ...movie,
        type: "movie",
      })),
      ...series.map((serie) => ({
        ...serie,
        type: "serie",
      })),
    ];

    return allContent
      .filter((item) => {
        const genres = Array.isArray(item.genre)
          ? item.genre.join(" ")
          : item.genre || "";

        return (
          item.title.toLowerCase().includes(search) ||
          genres.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
        );
      })
      .slice(0, 20);
  }, [query]);

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar películas o series..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500"
      />

      {/* Resultados */}
      {results.length > 0 && (
        <div
          className="
            absolute
            left-0
            right-0
            mt-2
            bg-gray-900
            border
            border-gray-700
            rounded-lg
            overflow-y-auto
            max-h-[70vh]
            z-50
            shadow-2xl
          "
        >
          {results.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={`/${item.type}/${item.id}`}
              onClick={() => {
                setQuery("");
                onClose?.();
              }}
              className="flex gap-3 p-3 hover:bg-gray-800 transition border-b border-gray-800 last:border-b-0"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-16 h-24 object-cover rounded flex-shrink-0"
              />

              <div className="min-w-0">
                <h3 className="text-white font-medium truncate">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {item.year}
                </p>

                <p className="text-red-400 text-xs mt-1">
                  {item.type === "movie"
                    ? "Película"
                    : "Serie"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}