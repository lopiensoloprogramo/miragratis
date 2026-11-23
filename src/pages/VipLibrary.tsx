import { useEffect, useMemo, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import VipVideoPlayer from "../components/VipVideoPlayer";

import {

  Film,

  Tv,

  LogOut,

  Search,

  Play,

  ChevronDown,

  ShieldCheck,

  X,

  ArrowLeft,

} from "lucide-react";

interface MovieOption {

  title: string;

  file: string;

}

interface VipMovie {

  id: string;

  title: string;

  year: number;

  createdAt?: string;

  description: string;

  trailer?: string;

  languaje?: string[];

  thumbnail: string;

  genre?: string[];

  opcion: MovieOption[];

}

interface VipEpisode {

  title: string;

  file: string;

  createdAt?: string;

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

  trailer?: string;

  languaje?: string[];

  thumbnail: string;

  genre?: string[];

  seasons: VipSeason[];

}

interface CatalogResponse {

  success: boolean;

  message?: string;

  data?: {

    movies: VipMovie[];

    series: VipSeries[];

    access?: "admin" | "member";

  };

}

type Section = "movies" | "series";

type SelectedContent =

  | { type: "movie"; item: VipMovie }

  | { type: "series"; item: VipSeries }

  | null;

type RecentItem =

  | { type: "movie"; date: number; movie: VipMovie }

  | {
      type: "episode";
      date: number;
      series: VipSeries;
      episode: VipEpisode;
      seasonNumber: number;
      episodeNumber: number;
    };

function getTrailerEmbedUrl(trailer?: string): string | null {

  if (!trailer) return null;

  const value = trailer.trim();

  let videoId = "";

  if (value.startsWith("youtube:")) {

    videoId = value.slice("youtube:".length).trim();

  } else {

    try {

      const url = new URL(value);

      if (url.hostname.includes("youtu.be")) {

        videoId = url.pathname.replace(/^\/+/, "").split("/")[0];

      } else if (url.hostname.includes("youtube.com")) {

        if (url.pathname === "/watch") {

          videoId = url.searchParams.get("v") || "";

        } else {

          const parts = url.pathname.split("/").filter(Boolean);

          const markerIndex = parts.findIndex((part) =>

            ["embed", "shorts", "live"].includes(part)

          );

          if (markerIndex >= 0) videoId = parts[markerIndex + 1] || "";

        }

      }

    } catch {

      return null;

    }

  }

  if (!/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) return null;

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

}

export default function VipLibrary() {

  const navigate = useNavigate();

  const [section, setSection] = useState<Section>("movies");

  const [movies, setMovies] = useState<VipMovie[]>([]);

  const [series, setSeries] = useState<VipSeries[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [access, setAccess] = useState<"admin" | "member">("member");

  const [selected, setSelected] = useState<SelectedContent>(null);

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [activePlayback, setActivePlayback] = useState<{ title: string; file: string } | null>(null);
  const playbackContainerRef = useRef<HTMLDivElement | null>(null);

  const trailerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    let cancelled = false;

    async function loadCatalog() {

      try {

        const response = await fetch("/api/vip", {

          method: "POST",

          credentials: "include",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ action: "catalog" }),

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

          setAccess(result.data.access || "member");

        }

      } catch (err) {

        if (!cancelled) {

          setError(

            err instanceof Error ? err.message : "Ocurrió un error al cargar."

          );

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    }

    loadCatalog();

    return () => {

      cancelled = true;

    };

  }, [navigate]);

  useEffect(() => {

    if (!trailerOpen || !trailerContainerRef.current) return;

    trailerContainerRef.current.scrollIntoView({

      behavior: "smooth",

      block: "center",

    });

  }, [trailerOpen]);

  useEffect(() => {
    if (!activePlayback || !playbackContainerRef.current) return;

    playbackContainerRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activePlayback]);

  useEffect(() => {

    if (!selected) {

      setTrailerOpen(false);

      return;

    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {

      if (event.key === "Escape") closeModal();

    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {

      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);

    };

  }, [selected]);

  const filteredMovies = useMemo(() => {

    const term = search.trim().toLowerCase();

    if (!term) return movies;

    return movies.filter((movie) =>

      [movie.title, movie.description, ...(movie.genre || [])]

        .join(" ")

        .toLowerCase()

        .includes(term)

    );

  }, [movies, search]);

  const recentItems = useMemo<RecentItem[]>(() => {
    const items: RecentItem[] = [];

    movies.forEach((movie) => {
      const date = movie.createdAt ? new Date(movie.createdAt).getTime() : NaN;
      if (Number.isFinite(date)) {
        items.push({ type: "movie", date, movie });
      }
    });

    series.forEach((item) => {
      item.seasons?.forEach((season) => {
        season.episodes?.forEach((episode, index) => {
          const date = episode.createdAt
            ? new Date(episode.createdAt).getTime()
            : NaN;

          if (Number.isFinite(date)) {
            items.push({
              type: "episode",
              date,
              series: item,
              episode,
              seasonNumber: season.seasonNumber,
              episodeNumber: index + 1,
            });
          }
        });
      });
    });

    return items.sort((a, b) => b.date - a.date).slice(0, 8);
  }, [movies, series]);

  const filteredSeries = useMemo(() => {

    const term = search.trim().toLowerCase();

    if (!term) return series;

    return series.filter((item) =>

      [item.title, item.description, ...(item.genre || [])]

        .join(" ")

        .toLowerCase()

        .includes(term)

    );

  }, [series, search]);

  function openMovie(movie: VipMovie) {

    setTrailerOpen(false);

    setActivePlayback(null);

    setSelected({ type: "movie", item: movie });

  }

  function openSeries(item: VipSeries) {

    setTrailerOpen(false);

    setActivePlayback(null);

    setSelected({ type: "series", item });

  }

  function openRecentEpisode(item: Extract<RecentItem, { type: "episode" }>) {
    setTrailerOpen(false);
    setSelected({ type: "series", item: item.series });
    setActivePlayback({
      title: `${item.series.title} · T${item.seasonNumber} · ${item.episode.title || `Episodio ${item.episodeNumber}`}`,
      file: item.episode.file,
    });
  }

  function closeModal() {

    setSelected(null);

    setTrailerOpen(false);

    setActivePlayback(null);

  }

  async function logout() {

    if (access === "admin") {

      navigate("/vip-admin", { replace: true });

      return;

    }

    try {

      await fetch("/api/vip", {

        method: "POST",

        credentials: "include",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ action: "memberLogout" }),

      });

    } finally {

      navigate("/vip-acceso", { replace: true });

    }

  }

  const selectedItem = selected?.item;

  const trailerUrl = selectedItem

    ? getTrailerEmbedUrl(selectedItem.trailer)

    : null;

  return (

    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:py-12">

      <div className="mx-auto max-w-7xl">

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-purple-300">

              <ShieldCheck size={17} /> MIRAGRATIS VIP

            </div>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">

              Tu biblioteca privada

            </h1>

            <p className="mt-2 text-sm text-slate-400">

              Películas y series disponibles para miembros VIP.

            </p>

          </div>

          <button

            onClick={logout}

            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"

          >

            {access === "admin" ? (

              <>

                <ShieldCheck size={17} /> Volver al panel

              </>

            ) : (

              <>

                <LogOut size={17} /> Cerrar sesión

              </>

            )}

          </button>

        </header>

        {!loading && !error && recentItems.length > 0 && (
          <section className="mb-10">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                  Actualizaciones
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Lo último en MiraGratis VIP
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Descubre las últimas películas y episodios agregados.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {recentItems.map((item) => (
                <button
                  key={
                    item.type === "movie"
                      ? `movie-${item.movie.id}`
                      : `episode-${item.series.id}-${item.seasonNumber}-${item.episodeNumber}`
                  }
                  type="button"
                  onClick={() =>
                    item.type === "movie"
                      ? openMovie(item.movie)
                      : openRecentEpisode(item)
                  }
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left transition duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-950/40"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
                    <img
                      src={item.type === "movie" ? item.movie.thumbnail : item.series.thumbnail}
                      alt={item.type === "movie" ? item.movie.title : item.series.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                    <span
                      className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[9px] font-black tracking-wide text-white sm:text-[10px] ${
                        item.type === "movie" ? "bg-purple-600" : "bg-emerald-600"
                      }`}
                    >
                      {item.type === "movie" ? "PELÍCULA" : "NUEVO EPISODIO"}
                    </span>
                    <span className="absolute bottom-3 left-3 right-3">
                      <span className="block text-sm font-black leading-snug text-white sm:text-base">
                        {item.type === "movie" ? item.movie.title : item.series.title}
                      </span>
                      {item.type === "episode" ? (
                        <span className="mt-1 block text-xs text-purple-200">
                          T{item.seasonNumber} · E{item.episodeNumber} — {item.episode.title || `Episodio ${item.episodeNumber}`}
                        </span>
                      ) : (
                        <span className="mt-1 block text-xs text-slate-300">
                          {item.movie.year}
                        </span>
                      )}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-xl">
                        <Play size={22} fill="currentColor" />
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1">

            <button

              onClick={() => setSection("movies")}

              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${

                section === "movies"

                  ? "bg-purple-600 text-white"

                  : "text-slate-400 hover:text-white"

              }`}

            >

              <Film size={17} /> Películas{" "}

              <span className="text-xs opacity-75">({movies.length})</span>

            </button>

            <button

              onClick={() => setSection("series")}

              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${

                section === "series"

                  ? "bg-purple-600 text-white"

                  : "text-slate-400 hover:text-white"

              }`}

            >

              <Tv size={17} /> Series{" "}

              <span className="text-xs opacity-75">({series.length})</span>

            </button>

          </div>

          <div className="relative w-full sm:max-w-sm">

            <Search

              size={18}

              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"

            />

            <input

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              placeholder={`Buscar ${

                section === "movies" ? "películas" : "series"

              }...`}

              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500"

            />

          </div>

        </div>

        {loading && (

          <div className="py-20 text-center text-slate-400">

            Cargando tu biblioteca privada...

          </div>

        )}

        {!loading && error && (

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">

            {error}

            <div className="mt-3">

              <Link

                to="/vip-acceso"

                className="font-semibold underline"

              >

                Volver al acceso VIP

              </Link>

            </div>

          </div>

        )}

        {!loading && !error && section === "movies" && (

          filteredMovies.length ? (

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">

              {filteredMovies.map((movie) => (

                <article

                  key={movie.id}

                  className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-purple-500/60"

                >

                  <button

                    type="button"

                    onClick={() => openMovie(movie)}

                    className="block w-full text-left"

                    aria-label={`Ver detalles de ${movie.title}`}

                  >

                    <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">

                      <img

                        src={movie.thumbnail}

                        alt={movie.title}

                        loading="lazy"

                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"

                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">

                        <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-purple-600 text-white opacity-0 shadow-xl transition group-hover:scale-100 group-hover:opacity-100">

                          <Play size={22} fill="currentColor" />

                        </span>

                      </div>

                      <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">

                        {movie.year}

                      </span>

                    </div>

                    <div className="p-3 sm:p-4">

                      <h2 className="line-clamp-2 min-h-10 font-bold leading-snug">

                        {movie.title}

                      </h2>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">

                        {movie.description}

                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">

                        {(movie.genre || []).slice(0, 2).map((genre) => (

                          <span

                            key={genre}

                            className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-400"

                          >

                            {genre}

                          </span>

                        ))}

                      </div>

                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-300">

                        Ver detalles <Play size={12} fill="currentColor" />

                      </span>

                    </div>

                  </button>

                </article>

              ))}

            </div>

          ) : (

            <EmptyState text="No encontramos películas con esa búsqueda." />

          )

        )}

        {!loading && !error && section === "series" && (

          filteredSeries.length ? (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {filteredSeries.map((item) => (

                <article

                  key={item.id}

                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-purple-500/60"

                >

                  <button

                    type="button"

                    onClick={() => openSeries(item)}

                    className="flex w-full flex-col text-left sm:flex-row"

                    aria-label={`Ver detalles de ${item.title}`}

                  >

                    <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden bg-slate-800 sm:aspect-auto sm:w-36">

                      <img

                        src={item.thumbnail}

                        alt={item.title}

                        loading="lazy"

                        className="h-full max-h-80 w-full object-cover transition duration-300 hover:scale-105 sm:max-h-full"

                      />

                    </div>

                    <div className="min-w-0 flex-1 p-4">

                      <div className="flex items-start justify-between gap-3">

                        <h2 className="text-lg font-bold">{item.title}</h2>

                        <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">

                          {item.year}

                        </span>

                      </div>

                      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-400">

                        {item.description}

                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">

                        {(item.genre || []).slice(0, 3).map((genre) => (

                          <span

                            key={genre}

                            className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400"

                          >

                            {genre}

                          </span>

                        ))}

                      </div>

                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-300">

                        Ver detalles <Play size={12} fill="currentColor" />

                      </span>

                    </div>

                  </button>

                  <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-400">

                    {item.seasons?.length || 0} temporadas ·{" "}

                    {item.seasons?.reduce(

                      (total, season) => total + (season.episodes?.length || 0),

                      0

                    ) || 0}{" "}

                    episodios

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <EmptyState text="No encontramos series con esa búsqueda." />

          )

        )}

      </div>

      {selected && (

        <div

          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) closeModal();

          }}

        >

          <section

            role="dialog"

            aria-modal="true"

            aria-labelledby="vip-modal-title"

            className="relative my-auto max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"

          >

            <button

              type="button"

              onClick={closeModal}

              aria-label="Cerrar detalles"

              className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/60 p-2 text-white transition hover:bg-purple-600"

            >

              <X size={20} />

            </button>

            <div className="relative min-h-56 bg-slate-800 sm:min-h-80">

              <img

                src={selected.item.thumbnail}

                alt=""

                className="absolute inset-0 h-full w-full object-cover opacity-35"

              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/55 to-black/20" />

              <div className="relative flex min-h-56 items-end gap-4 p-5 sm:min-h-80 sm:gap-6 sm:p-8">

                <img

                  src={selected.item.thumbnail}

                  alt={selected.item.title}

                  className="hidden aspect-[2/3] w-32 rounded-xl object-cover shadow-2xl sm:block sm:w-40"

                />

                <div className="min-w-0 pb-1">

                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-purple-600/20 px-3 py-1 text-xs font-bold text-purple-200">

                    {selected.type === "movie" ? (

                      <Film size={13} />

                    ) : (

                      <Tv size={13} />

                    )}

                    {selected.type === "movie" ? "PELÍCULA" : "SERIE"}

                  </span>

                  <h2

                    id="vip-modal-title"

                    className="text-2xl font-black leading-tight sm:text-4xl"

                  >

                    {selected.item.title}

                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300 sm:text-sm">

                    <span>{selected.item.year}</span>

                    {(selected.item.languaje || []).map((language) => (

                      <span

                        key={language}

                        className="rounded-md bg-white/10 px-2 py-1"

                      >

                        {language}

                      </span>

                    ))}

                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">

                    {(selected.item.genre || []).map((genre) => (

                      <span

                        key={genre}

                        className="rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-xs text-slate-200"

                      >

                        {genre}

                      </span>

                    ))}

                  </div>

                </div>

              </div>

            </div>

            <div className="space-y-6 p-5 sm:p-8">

              <div>

                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-purple-300">

                  Sinopsis

                </h3>

                <p className="whitespace-pre-line text-sm leading-7 text-slate-300">

                  {selected.item.description || "Sin sinopsis disponible."}

                </p>

              </div>

              {activePlayback && (
                <div ref={playbackContainerRef} className="scroll-mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                        Reproduciendo
                      </h3>
                      <p className="mt-1 truncate text-sm text-slate-200">
                        {activePlayback.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePlayback(null)}
                      aria-label="Cerrar reproductor"
                      title="Cerrar reproductor"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition hover:border-purple-500 hover:bg-purple-600 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <VipVideoPlayer
                    key={activePlayback.file}
                    item={activePlayback.file}
                    title={activePlayback.title}
                  />
                </div>
              )}

              {trailerOpen && trailerUrl ? (

                <div ref={trailerContainerRef} className="scroll-mt-6">

                  <div className="mb-3 flex items-center justify-between gap-3">

                    <h3 className="text-sm font-bold text-white">Tráiler</h3>

                    <button

                      type="button"

                      onClick={() => setTrailerOpen(false)}

                      aria-label="Cerrar tráiler"

                      title="Cerrar tráiler"

                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition hover:border-purple-500 hover:bg-purple-600 hover:text-white"

                    >

                      <X size={18} />

                    </button>

                  </div>

                  <div className="aspect-video overflow-hidden rounded-xl bg-black">

                    <iframe

                      src={trailerUrl}

                      title={`Tráiler de ${selected.item.title}`}

                      className="h-full w-full"

                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"

                      referrerPolicy="strict-origin-when-cross-origin"

                      allowFullScreen

                    />

                  </div>

                </div>

              ) : (

                <div className="flex flex-wrap gap-3">

                  {trailerUrl ? (

                    <button

                      type="button"

                      onClick={() => setTrailerOpen(true)}

                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"

                    >

                      <Play size={16} fill="currentColor" /> Ver tráiler

                    </button>

                  ) : (

                    <span className="text-xs text-slate-500">

                      Tráiler no disponible.

                    </span>

                  )}

                  {selected.type === "movie" &&

                    selected.item.opcion?.map((option, index) => (

                      <button
                        key={`${selected.item.id}-${index}`}
                        type="button"
                        onClick={() =>
                          setActivePlayback({
                            title: `${selected.item.title} · ${option.title || `Opción ${index + 1}`}`,
                            file: option.file,
                          })
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-500"
                      >
                        <Play size={16} fill="currentColor" />
                        Reproducir {option.title || `Opción ${index + 1}`}
                      </button>
                    ))}

                </div>

              )}

              {selected.type === "series" && (

                <div>

                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-purple-300">

                    Temporadas y episodios

                  </h3>

                  {selected.item.seasons?.length ? (

                    <div className="space-y-2">

                      {selected.item.seasons.map((season, seasonIndex) => (

                        <details

                          key={`${selected.item.id}-${season.seasonNumber}`}

                          open={seasonIndex === 0}

                          className="group rounded-xl border border-slate-700 bg-slate-950/60"

                        >

                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold hover:bg-slate-800/60">

                            <span>

                              Temporada {season.seasonNumber} ·{" "}

                              {season.episodes?.length || 0} episodios

                            </span>

                            <ChevronDown

                              size={17}

                              className="shrink-0 transition group-open:rotate-180"

                            />

                          </summary>

                          <div className="space-y-1 border-t border-slate-800 p-3">

                            {season.episodes?.map((episode, index) => (

                              <button
                                key={`${selected.item.id}-${season.seasonNumber}-${index}`}
                                type="button"
                                onClick={() =>
                                  setActivePlayback({
                                    title: `${selected.item.title} · T${season.seasonNumber} · ${episode.title || `Episodio ${index + 1}`}`,
                                    file: episode.file,
                                  })
                                }
                                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-purple-500/10 hover:text-white"
                              >
                                <span>
                                  {episode.title || `Episodio ${index + 1}`}
                                </span>
                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-purple-300">
                                  <Play size={13} fill="currentColor" /> Reproducir
                                </span>
                              </button>

                            ))}

                          </div>

                        </details>

                      ))}

                    </div>

                  ) : (

                    <p className="text-sm text-slate-400">

                      Todavía no hay episodios disponibles.

                    </p>

                  )}

                </div>

              )}

              <button

                type="button"

                onClick={closeModal}

                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"

              >

                <ArrowLeft size={16} /> Volver a la biblioteca

              </button>

            </div>

          </section>

        </div>

      )}

    </main>

  );

}

function EmptyState({ text }: { text: string }) {

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-16 text-center text-slate-400">

      {text}

    </div>

  );

}
