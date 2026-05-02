import type { Serie } from "../types/Serie";
import type { Movie } from "../types/Movie";
import { Link } from "react-router-dom";

export default function MovieCard({
  item,
  index,
}: {
  item: Movie | Serie;
  index: number;
}){
  // Detectar tipo automáticamente
  const isNew = index < 5;
  const isSerie = "seasons" in item; // o cualquier campo exclusivo de Serie

  const link = isSerie ? `/serie/${item.id}` : `/movie/${item.id}`;
  const image = item.thumbnail; // asumiendo que ambos lo tienen
  const title = item.title;
  const year = item.year;
  



  return (
    <Link to={link}>
      <div className="group cursor-pointer">
        
        {/* Contenedor con zoom */}
        <div className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105">
          
          {/* Imagen */}
          <img
            src={image}
            alt={title}
            className="w-full h-56 object-cover"
          />
           {isNew && (
              <span className="absolute top-1 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-bold">
             NUEVO
              </span>
            )}
         {"seasons" in item && index < 7 && (
          <span className="absolute top-1 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-bold">
             NUEVO CAPÍTULO
              </span>
          )

          }



          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex flex-col justify-end p-3">
            
            <h2 className="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold transition">
              {title}
            </h2>

            <p className="opacity-0 group-hover:opacity-100 text-white text-xs  transition">
              {year}
            </p>

          </div>
        </div>

      </div>
    </Link>
  );
}