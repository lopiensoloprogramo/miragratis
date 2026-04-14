import { useState } from "react";

export default function Live() {
  const [eventIndex, setEventIndex] = useState(0);

  const showAd = () => {
    console.log("💰 anuncio");
  };

  // 🔥 EVENTOS
  const events = [
    {
      title: "🔴 Atlético de Madrid vs Barcelona FC",
      servers: [
        "https://cartelive.club/player/capo/87",
        "https://la14hd.com/vivo/canal.php?stream=espn",
        "https://rojadirectatve.com/repro/espn.html",
        "https://la14hd.com/vivo/canal.php?stream=tudn",
        "https://rojadirectatve.com/repro/tudnusa.html", 
        "https://rodrixtv.store/tv/canal45.html",
        "https://www2.sportzzonline.click/channels/pt/sporttv3.php",
        "https://elcanaldeportivo.com/espn2hd.php",
        "http://bolaloca.my/player/1/68"
      ],
    },
    {
      title: "🔴 Liverpool vs PSG",
      servers: [
        "https://tutvlive.xyz/tvtodo/espn-2.php",
        "https://zonalive.click/player/wg/79",
        "https://la14hd.com/vivo/canal.php?stream=espn2",
        "https://www.capoplay.net/canal11.php",
        "https://rojadirectatve.com/repro/espn2.html",
        "https://zonalive.click/player/wg/55",
        "https://www2.sportzzonline.click/channels/pt/sporttv1.php",
        "https://www.capoplay.net/laliga5.php",
        "https://www.capoplay.net/ott5.php?id=max2"
      ],
    },
  ];

  const currentEvent = events[eventIndex];

  return (
    <div className="pt-20 p-6 text-white max-w-6xl mx-auto">

      {/* 🔥 SELECTOR DE EVENTOS */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {events.map((event, i) => (
          <button
            key={i}
            onClick={() => {
              showAd();
              setEventIndex(i);
            }}
            className={`px-4 py-2 rounded ${
              eventIndex === i
                ? "bg-red-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {event.title}
          </button>
        ))}
      </div>

      {/* 🎬 TITULO */}
      <h1 className="text-3xl text-black font-bold mb-6">
        {currentEvent.title}
      </h1>

      {/* 🎯 BOTÓN PRINCIPAL */}
      <button
        onClick={() => {
          showAd();
          window.open(currentEvent.servers[0], "_blank");
        }}
        className="mb-6 bg-red-600 px-6 py-3 rounded text-lg font-bold hover:bg-red-500"
      >
        ▶ Ver transmisión
      </button>

      {/* 🔥 SERVIDORES */}
      <div className="flex gap-3 flex-wrap">
        {currentEvent.servers.map((link, i) => (
          <button
            key={i}
            onClick={() => {
              showAd();
              window.open(link, "_blank");
            }}
            className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
          >
            Servidor {i + 1}
          </button>
        ))}
      </div>

    </div>
  );
}