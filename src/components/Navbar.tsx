
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 w-full z-50 px-4 md:px-6 py-3 flex justify-between items-center transition-all duration-300 h-16 ${
          scrolled
            ? "bg-black shadow-md"
            : "bg-gradient-to-b from-black to-transparent"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-bold text-red-600">
            MiraGratis
          </h1>

          <span className="hidden md:block text-xs text-gray-400">
            Series y Películas gratis.
          </span>
        </Link>

        {/* Opciones */}
        <div className="flex items-center gap-3 md:gap-6 text-sm">

          {/* Buscador */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-white hover:text-red-500 transition"
          >
            {showSearch ? <X size={22} /> : <Search size={22} />}
          </button>

          {/* Inicio */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hidden md:block relative py-2 transition-all duration-300 ${
                isActive
                  ? "text-red-500 font-semibold"
                  : "text-white hover:text-red-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Inicio

                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </>
            )}
          </NavLink>

          {/* Películas */}
          <NavLink
            to="/peliculas"
            className={({ isActive }) =>
              `hidden md:block relative py-2 transition-all duration-300 ${
                isActive
                  ? "text-red-500 font-semibold"
                  : "text-white hover:text-red-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Películas

                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </>
            )}
          </NavLink>

          {/* Series */}
          <NavLink
            to="/series"
            className={({ isActive }) =>
              `hidden md:block relative py-2 transition-all duration-300 ${
                isActive
                  ? "text-red-500 font-semibold"
                  : "text-white hover:text-red-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Series

                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </>
            )}
          </NavLink>

          {/* Especiales */}
          <Link
            to="/momentos"
            className="text-black hover:bg-red-700 px-2 py-1 rounded-lg font-bold bg-yellow-500 text-xs md:text-sm transition"
          >
            Especiales
          </Link>

          {/* Solicitar */}
          <Link
            to="/requests"
            className="text-white hover:bg-red-700 px-2 py-1 rounded-lg font-semibold text-xs md:text-sm transition"
          >
            🎬 Solicitar
          </Link>
        </div>
      </div>

      {/* Buscador desplegable */}
      {showSearch && (
        <div className="fixed top-16 left-0 w-full bg-black/95 backdrop-blur-sm z-40 p-4">
          <SearchBar onClose={() => setShowSearch(false)} />
        </div>
      )}
    </>
  );
}

