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
        src={"https://m.media-amazon.com/images/S/pv-target-images/315debcb615b93a216d9099ef391e902648cab102220f90f4d977355f1a08ea3._UR1920,1080_.jpg"}
        className="w-full h-full object-cover"
      />

      {/* overlay oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* contenido */}
      <div className="absolute bottom-10 left-10 max-w-xl">
        <h1 className="text-4xl text-sky-600 font-bold mb-4">{ "LOS JUEGOS DEL HAMBRE: EN LLAMAS"}</h1>

        <p className="text-gray-300 mb-4 line-clamp-3">
          {"Cuando Katniss Everdeen regresa sana y salva a casa tras ganar la 74ª edición anual de los Juegos del Hambre, junto a su compañero tributo Peeta Mellark. Ganar significa tener que dejar atrás a su familia y amigos, para emprender una 'Gira de la Victoria' por los diferentes distritos."}
        </p>

        <Link to={`/serie/${(serie.id).replace("1","85")}`}>
          <button onClick={openAddirecto}
          className="bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition">
            
            ▶ Ver ahora
          </button>
        </Link>
      </div>
    </div>
  );
}