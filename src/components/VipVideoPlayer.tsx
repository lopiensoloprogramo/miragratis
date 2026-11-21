import { useEffect, useRef, useState } from "react";
import {
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

type VideoSource =
  | { type: "iframe"; url: string; provider: "Google Drive" | "MEGA" | "YouTube" }
  | { type: "direct"; url: string }
  | { type: "invalid"; message: string };

function resolveVideoSource(item: string): VideoSource {
  const value = String(item || "").trim();

  if (!value) {
    return { type: "invalid", message: "No se proporcionó un enlace de video." };
  }

  // Prefijo interno mega:ID#CLAVE o mega:URL.
  if (value.startsWith("mega:")) {
    const rest = value.slice("mega:".length).trim();
    if (rest.startsWith("http://") || rest.startsWith("https://")) {
      return resolveVideoSource(rest);
    }
    const [id, key] = rest.split("#");
    return id
      ? { type: "iframe", url: `https://mega.nz/embed/${id}${key ? `#${key}` : ""}`, provider: "MEGA" }
      : { type: "invalid", message: "El identificador de MEGA está vacío." };
  }

  // Google Drive: acepta drive:ID y enlaces compartidos normales.
  if (value.startsWith("drive:")) {
    const id = value.slice("drive:".length).trim();
    return id
      ? { type: "iframe", url: `https://drive.google.com/file/d/${id}/preview`, provider: "Google Drive" }
      : { type: "invalid", message: "El identificador de Google Drive está vacío." };
  }

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (host.includes("drive.google.com") || host === "docs.google.com") {
      let id = "";
      const match = url.pathname.match(/\/file\/d\/([^/]+)/);
      if (match?.[1]) id = match[1];
      if (!id) id = url.searchParams.get("id") || "";

      return id
        ? { type: "iframe", url: `https://drive.google.com/file/d/${id}/preview`, provider: "Google Drive" }
        : { type: "invalid", message: "No se pudo identificar el archivo de Google Drive." };
    }

    // MEGA: admite mega:URL, enlaces /file/ID#KEY y enlaces /embed/ID#KEY.
    if (host.includes("mega.nz") || host.includes("mega.co.nz")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const fileIndex = parts.findIndex((part) => part === "file" || part === "embed");
      const legacyMatch = url.hash.match(/^#!([^!]+)!?([^!]*)$/);
      const id = fileIndex >= 0 ? parts[fileIndex + 1] : (legacyMatch?.[1] || "");
      const key = legacyMatch ? legacyMatch[2] : url.hash.replace(/^#/, "");

      if (!id) {
        return { type: "invalid", message: "No se pudo identificar el archivo de MEGA. Comprueba que sea un enlace a un archivo y no a una carpeta." };
      }

      return {
        type: "iframe",
        url: `https://mega.nz/embed/${id}${key ? `#${key}` : ""}`,
        provider: "MEGA",
      };
    }

    if (host.includes("youtube.com") || host === "youtu.be") {
      let id = "";
      if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
      else if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
      else {
        const parts = url.pathname.split("/").filter(Boolean);
        const marker = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
        if (marker >= 0) id = parts[marker + 1] || "";
      }

      return id
        ? { type: "iframe", url: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, provider: "YouTube" }
        : { type: "invalid", message: "No se pudo identificar el video de YouTube." };
    }

    // Los enlaces directos de video sí permiten controles HTML5 propios.
    if (/\.(mp4|webm|ogg)(?:$|[?#])/i.test(url.href)) {
      return { type: "direct", url: url.href };
    }

    return {
      type: "invalid",
      message: "Este enlace no es un archivo de video directo ni un enlace reconocido de Drive o MEGA.",
    };
  } catch {
    return { type: "invalid", message: "El enlace de video no tiene un formato válido." };
  }
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  const hours = Math.floor(minutes / 60);
  const minutePart = hours ? String(minutes % 60).padStart(2, "0") : String(minutes);
  const secondPart = String(remaining).padStart(2, "0");
  return hours
    ? `${hours}:${minutePart}:${secondPart}`
    : `${minutePart}:${secondPart}`;
}

export default function VipVideoPlayer({
  item,
  title,
}: {
  item: string;
  title?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const source = resolveVideoSource(item);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoError(false);
  }, [item]);

  useEffect(() => {
    if (source.type !== "direct" || !videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = muted;
  }, [source.type, volume, muted]);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setVideoError(true);
      }
    } else {
      video.pause();
    }
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = value;
    setCurrentTime(value);
  }

  async function toggleFullscreen() {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Algunos navegadores o dispositivos pueden restringir pantalla completa.
    }
  }

  if (source.type === "invalid") {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-red-500/20 bg-black p-6 text-center text-sm text-slate-300">
        <div>
          <p className="font-semibold text-red-300">No se puede reproducir este enlace</p>
          <p className="mt-2 text-slate-400">{source.message}</p>
        </div>
      </div>
    );
  }

  if (source.type === "iframe") {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-black">
        <div className="relative aspect-video w-full">
          <iframe
            key={source.url}
            src={source.url}
            title={title || `Reproductor de ${source.provider}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group overflow-hidden rounded-xl border border-slate-800 bg-black"
    >
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={source.url}
          playsInline
          preload="metadata"
          className="h-full w-full"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
          onEnded={() => setPlaying(false)}
          onError={() => setVideoError(true)}
        />

        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-5 text-center text-sm text-red-300">
            No se pudo cargar este video. Comprueba que el enlace permita reproducción directa.
          </div>
        )}
      </div>

      <div className="space-y-2 bg-slate-950 px-3 py-3 sm:px-4">
        <input
          aria-label="Progreso del video"
          type="range"
          min={0}
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seek(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer accent-purple-500"
        />

        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="rounded-md p-1.5 transition hover:bg-slate-800"
          >
            {playing ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
          </button>

          <span className="min-w-[76px] text-xs tabular-nums text-slate-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            aria-label={muted ? "Activar sonido" : "Silenciar"}
            className="rounded-md p-1.5 transition hover:bg-slate-800"
          >
            {muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>

          <input
            aria-label="Volumen"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(event) => {
              setVolume(Number(event.target.value));
              setMuted(false);
            }}
            className="w-20 cursor-pointer accent-purple-500"
          />

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Pantalla completa"
            className="ml-auto rounded-md p-1.5 transition hover:bg-slate-800"
          >
            <Maximize size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
