import { useParams } from "react-router-dom";
import { momentos } from "../data/momentos";
import VideoPlayer from "../components/VideoPlayer";
import Momentos from "../components/Momentos";

export default function MomentoDetail() {
  const { id } = useParams();

  const momento = momentos.find((m) => m.id === id);

  if (!momento) {
    return (
      <div className="text-white text-center py-20">
        Momento no encontrado.
      </div>
    );
  }
const openAddirecto = () => {
    let clicks = parseInt(localStorage.getItem("ad_clicks") || "0");

    // primer click SIEMPRE abre
    if (clicks === 0) {
      window.open("https://omg10.com/4/10893314", "_blank");
      clicks = 1;
    } else {
      clicks++;

      // cada 2 clics
      if (clicks % 2 !== 0) {
        window.open("https://omg10.com/4/10893314", "_blank");
      }
    }

    localStorage.setItem("ad_clicks", clicks.toString());
  };
openAddirecto();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

      {/* Información */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">

        <img
          src={momento.thumbnail}
          alt={momento.title}
          className="w-52 rounded-xl mx-auto md:mx-0"
        />

        <div className="flex-1">

          <span className="inline-block bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full mb-3">
            ⚡ MOMENTO CLAVE
          </span>

          <h1 className="text-3xl md:text-4xl font-bold text-black">
            {momento.title}
          </h1>

          <p className="text-gray-600 mt-2">
            ⏱ {momento.duration}
          </p>

          <p className="text-gray-500 mt-4 leading-7">
            {momento.description}
          </p>

        </div>

      </div>

      {/* Video */}
      <div className="mb-10">
       <VideoPlayer
            item={momento.video}
            showAd={true}
        />
      </div>

      {/* Otros momentos */}
      <Momentos />

    </div>
  );
}



