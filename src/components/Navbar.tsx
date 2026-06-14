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
className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 h-16 ${        scrolled ? "bg-black shadow-md" : "bg-gradient-to-b from-black to-transparent"
      }`}
    >
      {/* Logo */}
      <Link to="/">
        <h1 className="text-3xl font-bold text-red-600 cursor-pointer">
          MiraGratis
        </h1>
        <span className="text-xs text-gray-700"> Series y Pélículas gratis.</span>
      </Link>

      {/* Opciones */}
          <div className="flex items-center gap-6 text-sm">

            <button
              onClick={() => setShowSearch(!showSearch)}
              className="hover:text-red-500 transition"
            >
              {showSearch ? <X size={22} /> : <Search size={22} />}
            </button>

            <Link
              to="/"
              className="hover:text-red-500 transition"
            >
              Inicio
            </Link>

            <span className="hover:text-red-500 cursor-pointer transition">
              Películas
            </span>

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