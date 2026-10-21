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
        src={"https://m.media-amazon.com/images/S/pv-target-images/e40e173c47496e67321c44007c0294a19773b36782477246615a8461e206b277._SX1080_FMjpg_.jpg"}
        className="w-full h-full object-cover"
      />

      {/* overlay oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* contenido */}
      <div className="absolute bottom-10 left-10 max-w-xl">
        <h1 className="text-4xl text-sky-600 font-bold mb-4">{"Black Clover Temporada 2"}</h1>

        <p className="text-gray-300 mb-4 line-clamp-3">
          {"Una violencia sin precedentes ha traído el caos al Reino del Trébol. La irrupción de la “Tríada Oscura” (Dark Triad), que alberga el poder de demonios de alto rango. Ni siquiera los capitanes de los Caballeros Mágicos pudieron resistir y fueron llevados; la última esperanza se derrumbó. En una situación desesperada, sin embargo, hay quien sigue levantándose una y otra vez.En un mundo donde la magia lo es todo, el único ser que está fuera de las leyes de la magia: Asta."}
        </p>

        <Link to={`/serie/${serie.id+6}`}>
          <button onClick={openAddirecto}
          className="bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition">
            
            ▶ Ver ahora
          </button>
        </Link>
      </div>
    </div>
  );
}