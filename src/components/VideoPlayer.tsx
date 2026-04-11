import { useState, useEffect } from "react";

export default function VideoPlayer({ file }: { file: string }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const getVideoUrl = async (file: string) => {
    const res = await fetch(
      `https://us-central1-miragratis.cloudfunctions.net/getVideoUrl?file=${encodeURIComponent(file)}`
    );

    const data = await res.json();
    return data.url;
  };

  useEffect(() => {
    if (!file) return;

    const load = async () => {
      setLoading(true);
      const url = await getVideoUrl(file);
      setVideoUrl(url);
    };

    load();
  }, [file]);

  return (
    <div className="w-full aspect-[16/8] bg-black rounded-lg overflow-hidden relative">
      
      {/* 🎬 VIDEO */}
      {videoUrl && (
        <video
          controls
          autoPlay
          className={`w-full h-full ${loading ? "opacity-0" : "opacity-100"} transition`}
          onLoadedData={() => setLoading(false)}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* 🔥 LOADER BONITO */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}