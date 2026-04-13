import { useState, useEffect } from "react";

export default function VideoPlayer({ file }: { file: string }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 detectar tipos
  const isDrive = file?.startsWith("drive:");
  const driveId = isDrive ? file.replace("drive:", "") : null;

  const isYoutube = file?.startsWith("youtube:");
  const youtubeId = isYoutube ? file.replace("youtube:", "") : null;

  const getVideoUrl = async (file: string) => {
    try {
      const res = await fetch(
        `https://us-central1-miragratis.cloudfunctions.net/getVideoUrl?file=${encodeURIComponent(file)}`
      );

      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Error obteniendo video:", err);
      return "";
    }
  };

  useEffect(() => {
    if (!file) {
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
      const url = await getVideoUrl(file);
      setVideoUrl(url);
      setLoading(false);
    };

    load();
  }, [file]);

  return (
    <div className="w-full aspect-[16/9] bg-black rounded-lg overflow-hidden relative">

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