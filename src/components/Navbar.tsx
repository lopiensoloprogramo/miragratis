import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${
        scrolled ? "bg-black shadow-md" : "bg-gradient-to-b from-black to-transparent"
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
      <div className="flex gap-6 text-sm">
        <Link to="/" className="hover:text-red-500 transition">
          Inicio
        </Link>

        <span className="hover:text-red-500 cursor-pointer transition">
          Películas
        </span>
      </div>
    </div>
  );
}