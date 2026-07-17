import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const next = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="mt-4">

      <h3 className="text-xl font-bold text-white mb-3 text-center">
        📸 Galería
      </h3>

      <div className="relative w-full max-w-3xl mx-auto">

        {/* Imagen */}
        <div className="bg-black rounded-xl h-64 md:h-80 overflow-hidden flex items-center justify-center">

          <img
            src={images[current]}
            alt={`Imagen ${current + 1}`}
            className="w-full h-full object-contain select-none"
            loading="lazy"
            draggable={false}
          />

        </div>

        {/* Flecha izquierda */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 transition rounded-full p-2"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>

        {/* Flecha derecha */}
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 transition rounded-full p-2"
        >
          <ChevronRight size={28} className="text-white" />
        </button>

      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition ${
              current === index
                ? "bg-blue-600 scale-125"
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>

    </div>
  );
}