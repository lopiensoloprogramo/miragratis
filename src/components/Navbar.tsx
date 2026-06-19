import { Link } from "react-router-dom";
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

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="hover:text-red-500 transition"
          >
            {showSearch ? <X size={22} /> : <Search size={22} />}
          </button>

          {/* Solo visible en PC */}
          <Link
            to="/"
            className="hidden md:block hover:text-red-500 transition"
          >
            Inicio
          </Link>

          <span className="hidden md:block hover:text-red-500 cursor-pointer transition">
            Películas
          </span>

          {/* Visible siempre */}
          <Link
            to="/requests"
            className="text black-500 hover:bg-red-700 px-2 py-1 rounded-lg text-white font-semibold text-xs md:text-sm transition"
          >
            🎬 Solicitar
          </Link>
        </div>
      </div>

      {showSearch && (
        <div className="fixed top-16 left-0 w-full bg-black/95 backdrop-blur-sm z-40 p-4">
          <SearchBar onClose={() => setShowSearch(false)} />
        </div>
      )}
    </>
  );
}