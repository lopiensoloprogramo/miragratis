import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Tv, LogOut, Search, Play, ChevronDown, ShieldCheck } from "lucide-react";

interface MovieOption {
  title: string;
  file: string;
}
interface VipMovie {
  id: string;
  title: string;
  year: number;
  description: string;
  languaje?: string[];
  thumbnail: string;
  genre?: string[];
  opcion: MovieOption[];
}
interface VipEpisode {
  title: string;
  file: string;
}
interface VipSeason {
  seasonNumber: number;
  episodes: VipEpisode[];
}
interface VipSeries {
  id: string;
  title: string;
  year: number;
  description: string;
  languaje?: string[];
  thumbnail: string;
  genre?: string[];
  seasons: VipSeason[];
}
interface CatalogResponse {
  success: boolean;
  message?: string;
  data?: { movies: VipMovie[]; series: VipSeries[] };
}

type Section = "movies" | "series";

export default function VipLibrary() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("movies");
  const [movies, setMovies] = useState<VipMovie[]>([]);
  const [series, setSeries] = useState<VipSeries[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const response = await fetch("/api/vip", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "catalog" })
        });
        const result = (await response.json()) as CatalogResponse;

        if (response.status === 401) {
          navigate("/vip-acceso", { replace: true });
          return;
        }
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "No se pudo cargar la biblioteca.");
        }

        if (!cancelled) {
          setMovies(result.data.movies || []);
          setSeries(result.data.series || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ocurrió un error al cargar.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCatalog();
    return () => { cancelled = true; };
  }, [navigate]);

  const filteredMovies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return movies;
    return movies.filter((movie) =>
      [movie.title, movie.description, ...(movie.genre || [])].join(" ").toLowerCase().includes(term)
    );
  }, [movies, search]);

  const filteredSeries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return series;
    return series.filter((item) =>
      [item.title, item.description, ...(item.genre || [])].join(" ").toLowerCase().includes(term)
    );
  }, [series, search]);

  async function logout() {
    try {
      await fetch("/api/vip", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "memberLogout" })
      });
    } finally {
      navigate("/vip-acceso", { replace: true });
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-purple-300">
              <ShieldCheck size={17} /> MIRAGRATIS VIP
            </div>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Tu biblioteca privada</h1>
            <p className="mt-2 text-sm text-slate-400">Películas y series disponibles para miembros VIP.</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            <LogOut size={17} /> Cerrar sesión
          </button>
        </header>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => setSection("movies")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${section === "movies" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Film size={17} /> Películas <span className="text-xs opacity-75">({movies.length})</span>
            </button>
            <button
              onClick={() => setSection("series")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${section === "series" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Tv size={17} /> Series <span className="text-xs opacity-75">({series.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Buscar ${section === "movies" ? "películas" : "series"}...`}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {loading && (
          <div className="py-20 text-center text-slate-400">Cargando tu biblioteca privada...</div>
        )}
        {!loading && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
            {error}
            <div className="mt-3"><Link to="/vip-acceso" className="font-semibold underline">Volver al acceso VIP</Link></div>
          </div>
        )}

        {!loading && !error && section === "movies" && (
          filteredMovies.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMovies.map((movie) => (
                <article key={movie.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="aspect-[2/3] overflow-hidden bg-slate-800">
                    <img src={movie.thumbnail} alt={movie.title} loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-bold leading-snug">{movie.title}</h2>
                      <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">{movie.year}</span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{movie.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(movie.languaje || []).map((language) => <span key={language} className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-300">{language}</span>)}
                      {(movie.genre || []).slice(0, 2).map((genre) => <span key={genre} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">{genre}</span>)}
                    </div>
                    <div className="mt-4 space-y-2">
                      {movie.opcion.map((option, index) => (
                        <a key={`${movie.id}-${index}`} href={option.file} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2.5 text-sm font-bold transition hover:bg-purple-500">
                          <Play size={15} fill="currentColor" /> Ver {option.title || `Opción ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <EmptyState text="No encontramos películas con esa búsqueda." />
        )}

        {!loading && !error && section === "series" && (
          filteredSeries.length ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredSeries.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="flex flex-col sm:flex-row">
                    <div className="aspect-[2/3] w-full shrink-0 bg-slate-800 sm:aspect-auto sm:w-44">
                      <img src={item.thumbnail} alt={item.title} loading="lazy" className="h-full max-h-80 w-full object-cover sm:max-h-full" />
                    </div>
                    <div className="min-w-0 flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-bold">{item.title}</h2>
                        <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">{item.year}</span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-400">{item.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(item.languaje || []).map((language) => <span key={language} className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-300">{language}</span>)}
                        {(item.genre || []).slice(0, 2).map((genre) => <span key={genre} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">{genre}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 p-4">
                    <h3 className="mb-3 text-sm font-bold text-slate-200">Temporadas y episodios</h3>
                    <div className="space-y-2">
                      {item.seasons.map((season) => (
                        <details key={`${item.id}-${season.seasonNumber}`} className="group rounded-xl border border-slate-800 bg-slate-950/60">
                          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-slate-800/60">
                            <span>Temporada {season.seasonNumber} · {season.episodes.length} episodios</span>
                            <ChevronDown size={17} className="transition group-open:rotate-180" />
                          </summary>
                          <div className="space-y-2 border-t border-slate-800 p-3">
                            {season.episodes.map((episode, index) => (
                              <a key={`${item.id}-${season.seasonNumber}-${index}`} href={episode.file} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-purple-500/10 hover:text-white">
                                <span>{episode.title || `Episodio ${index + 1}`}</span>
                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-purple-300"><Play size={13} fill="currentColor" /> Ver</span>
                              </a>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <EmptyState text="No encontramos series con esa búsqueda." />
        )}
      </div>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-16 text-center text-slate-400">{text}</div>;
}
