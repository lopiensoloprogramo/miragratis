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
      .filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.genre.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
      )
      .slice(0, 10);
  }, [query]);

  return (
    <div className="relative max-w-3xl mx-auto">
      <input
        type="text"
        placeholder="Buscar películas o series..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500"
      />

      {results.length > 0 && (
        <div className="absolute left-6 right-6 mt-2 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden z-50">
          {results.map((item) => (
                <Link
                key={`${item.type}-${item.id}`}
                to={`/${item.type}/${item.id}`}
                onClick={() => {
                    setQuery("");
                    onClose?.();
                }}
                className="flex gap-3 p-3 hover:bg-gray-800 transition"
                >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-16 h-24 object-cover rounded"
              />

              <div>
                <h3 className="text-white font-medium">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {item.year}
                </p>

                <p className="text-red-400 text-xs">
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