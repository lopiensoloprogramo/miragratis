import { useMemo, useState } from "react";
import MovieCard from "../components/MovieCard";
import { series } from "../data/series";

export default function Series() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Todos");
  const [sort, setSort] = useState("recent");

  // Obtener todos los géneros disponibles
  const genres = useMemo(() => {
    const allGenres = series.flatMap((serie) => serie.genre);

    return ["Todos", ...Array.from(new Set(allGenres))];
  }, []);

  // Filtrar y ordenar
  const filteredSeries = useMemo(() => {
    let result = [...series];

    // 🔎 BUSCAR
    if (search.trim()) {
      const searchText = search.toLowerCase();

      result = result.filter((serie) =>
        serie.title.toLowerCase().includes(searchText)
      );
    }

    // 🎭 FILTRO DE GÉNERO
    if (genre !== "Todos") {
      result = result.filter((serie) =>
        serie.genre.includes(genre)
      );
    }

    // ↕️ ORDENAR
    switch (sort) {
      case "recent":
        result.sort((a, b) => b.year - a.year);
        break;

      case "oldest":
        result.sort((a, b) => a.year - b.year);
        break;

      case "az":
        result.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;

      case "za":
        result.sort((a, b) =>
          b.title.localeCompare(a.title)
        );
        break;
    }

    return result;
  }, [search, genre, sort]);

  return (
        <main className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-12">

      {/* TÍTULO */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">
          📺 Series
        </h1>

        <p className="text-gray-600 mt-2">
          Explora nuestra colección de series y encuentra tu próxima favorita.
        </p>
      </div>

      {/* CONTROLES */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">

        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="🔎 Buscar serie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full md:flex-1
            px-4 py-3
            rounded-lg
            border border-gray-300
            bg-white
            text-black
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

        {/* GÉNERO */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="
            px-4 py-3
            rounded-lg
            border border-gray-300
            bg-white
            text-black
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* ORDEN */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="
            px-4 py-3
            rounded-lg
            border border-gray-300
            bg-white
            text-black
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >
          <option value="recent">
            Más recientes
          </option>

          <option value="oldest">
            Más antiguas
          </option>

          <option value="az">
            Nombre A-Z
          </option>

          <option value="za">
            Nombre Z-A
          </option>
        </select>

      </div>

      {/* RESULTADOS */}
      <div className="mb-4 text-gray-600">
        {filteredSeries.length}{" "}
        {filteredSeries.length === 1 ? "serie encontrada" : "series encontradas"}
      </div>

      {/* GRID */}
      {filteredSeries.length > 0 ? (

        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-6
            gap-4
          "
        >
          {filteredSeries.map((serie, index) => (
            <div key={serie.id}>
              <MovieCard
                item={serie}
                index={index}
              />
            </div>
          ))}
        </div>

      ) : (

        <div className="text-center py-16">

          <div className="text-5xl mb-4">
            😕
          </div>

          <h2 className="text-xl font-semibold">
            No encontramos series
          </h2>

          <p className="text-gray-500 mt-2">
            Intenta cambiar el nombre o el género.
          </p>

        </div>

      )}

    </main>
  );
}