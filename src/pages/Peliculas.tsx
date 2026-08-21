import { useMemo, useState } from "react";
import MovieCard from "../components/MovieCard";
import { movies } from "../data/movies";

export default function Peliculas() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Todos");
  const [sort, setSort] = useState("recent");

  // Obtener todos los géneros disponibles
  const genres = useMemo(() => {
    const allGenres = movies.flatMap((movie) => movie.genre);

    return ["Todos", ...Array.from(new Set(allGenres))];
  }, []);

  // Filtrar y ordenar películas
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Buscar por título
    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((movie) =>
        movie.title.toLowerCase().includes(query)
      );
    }

    // Filtrar por género
    if (genre !== "Todos") {
      result = result.filter((movie) =>
        movie.genre.includes(genre)
      );
    }

    // Ordenar
    switch (sort) {
      case "recent":
        result.sort((a, b) => Number(b.id) - Number(a.id));
        break;

      case "old":
        result.sort((a, b) => Number(a.id) - Number(b.id));
        break;

      case "az":
        result.sort((a, b) =>
          a.title.localeCompare(b.title, "es")
        );
        break;

      case "za":
        result.sort((a, b) =>
          b.title.localeCompare(a.title, "es")
        );
        break;
    }

    return result;
  }, [search, genre, sort]);

  return (
    <main className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-12">

      {/* Encabezado */}
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Películas
          </h1>

          <p className="text-gray-400">
            Explora nuestro catálogo de películas.
          </p>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar una película..."
            className="
              w-full
              bg-zinc-900
              border border-zinc-800
              rounded-lg
              px-4
              py-3
              text-white
              placeholder-gray-500
              outline-none
              focus:border-red-600
              transition
            "
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">

          {/* Géneros */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">
              Género
            </label>

            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="
                w-full
                bg-zinc-900
                border border-zinc-800
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-red-600
              "
            >
              {genres.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Orden */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">
              Ordenar
            </label>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="
                w-full
                bg-zinc-900
                border border-zinc-800
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-red-600
              "
            >
              <option value="recent">
                Más recientes
              </option>

              <option value="old">
                Más antiguas
              </option>

              <option value="az">
                A - Z
              </option>

              <option value="za">
                Z - A
              </option>
            </select>
          </div>

        </div>

        {/* Cantidad */}
        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-semibold">
            Todas las películas
          </h2>

          <span className="text-sm text-gray-500">
            {filteredMovies.length} películas
          </span>

        </div>

        {/* Grid */}
        {filteredMovies.length > 0 ? (

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
            {filteredMovies.map((movie, index) => (
              <div key={movie.id}>
                <MovieCard
                  item={movie}
                  index={index}
                />
              </div>
            ))}
          </div>

        ) : (

          <div className="text-center py-20">

            <div className="text-5xl mb-4">
              🎬
            </div>

            <h3 className="text-xl font-semibold mb-2">
              No encontramos películas
            </h3>

            <p className="text-gray-500">
              Prueba con otro nombre o género.
            </p>

          </div>

        )}

      </div>

    </main>
  );
}