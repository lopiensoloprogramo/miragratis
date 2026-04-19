import { useState, useEffect } from "react";

export default function VideoPlayer({ item }: { item: string }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 detectar tipos
  const isDrive = item?.startsWith("drive:");
  const driveId = isDrive ? item.replace("drive:", "") : null;

  const isYoutube = item?.startsWith("youtube:");
  const youtubeId = isYoutube ? item.replace("youtube:", "") : null;

  const getVideoUrl = async (item: string) => {
    try {
      const res = await fetch(
        `https://us-central1-miragratis.cloudfunctions.net/getVideoUrl?item=${encodeURIComponent(item)}`
      );

      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Error obteniendo video:", err);
      return "";
    }
  };

  useEffect(() => {
    if (!item) {
      setLoading(false);
      return;
    }

    // 🔥 SI ES DRIVE o YOUTUBE → NO LLAMAR API
    if (isDrive || isYoutube) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const url = await getVideoUrl(item);
      setVideoUrl(url);
      setLoading(false);
    };

    load();
  }, [item]);

  return (
    <div className="w-full aspect-[16/8] md:aspect-[16/9] ... bg-black rounded-lg overflow-hidden relative">

      {/* 🎬 YOUTUBE */}
      {isYoutube && youtubeId && (
        <iframe
          key={youtubeId}
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}

      {/* 🎬 DRIVE */}
      {isDrive && driveId && (
        <iframe
          key={driveId}
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          className="w-full h-full"
          allow="autoplay"
          allowFullScreen
        />
      )}

      {/* 🎬 BUNNY / MP4 */}
      {!isDrive && !isYoutube && videoUrl && (
        <video
          key={videoUrl}
          controls
          autoPlay
          className="w-full h-full"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* ❌ ERROR */}
      {!loading && !isDrive && !isYoutube && !videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Video no disponible
        </div>
      )}

      {/* 🔥 LOADER */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}