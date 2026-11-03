import type  { Serie } from "../types/Serie";
import { Link } from "react-router-dom";

const openAddirecto = () => {
  window.open("https://omg10.com/4/10893314", "_blank");
};

export default function HeroBanner({ serie }: { serie: Serie }) {
  return (
    <div className="relative w-full h-[85vh] mb-8">
      {/* imagen de fondo */}
      <img
        src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-xVnaHc8cWN69AaJln3giGCwnUUcmNWStzsHhVI2IAQ&s=10"}
        className="w-full h-full object-cover"
      />

      {/* overlay oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* contenido */}
      <div className="absolute bottom-10 left-10 max-w-xl">
        <h1 className="text-4xl text-sky-600 font-bold mb-4">{ "IT: Bienvenidos a Derry"}</h1>

        <p className="text-gray-300 mb-4 line-clamp-3">
          {"CAPITULO 9 ESPECIAL por Halloween de la famosa serie de IT, Welcome to Derry"}
        </p>

        <Link to={`/serie/${(serie.id).replace("1","8")}`}>
          <button onClick={openAddirecto}
          className="bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition">
            
            ▶ Ver ahora
          </button>
        </Link>
      </div>
    </div>
  );
}