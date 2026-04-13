import { useState, useEffect } from "react";

export default function VideoPlayer({ file }: { file: string }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 detectar si es Drive
  const isDrive = file?.startsWith("drive:");
  const driveId = isDrive ? file.replace("drive:", "") : null;

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

    // 🔥 SI ES DRIVE → NO LLAMAR API
    if (isDrive) {
      setLoading(false);
      return;
    }

    // 🔥 SI ES VIDEO NORMAL
    const load = async () => {
      setLoading(true);
      const url = await getVideoUrl(file);
      setVideoUrl(url);
      setLoading(false);
    };

    load();
  }, [file]);

  return (
    <div className="w-full aspect-[16/8] bg-black rounded-lg overflow-hidden relative">

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
      {!isDrive && videoUrl && (
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
      {!loading && !isDrive && !videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Video no disponible
        </div>
      )}

      {/* 🔥 LOADER */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}