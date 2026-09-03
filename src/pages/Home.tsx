import { series } from "../data/series";
import { movies } from "../data/movies";
import MovieRow from "../components/MovieRow";
import HeroBanner from "../components/HeroBanner";
import { Link } from "react-router-dom";
import Peliculas from "./Peliculas";

export default function Home() {
  return (
    <div className="pt-20">

  

      <HeroBanner serie={series[0]} />

      <div className="px-6 pb-6 pt-2">
        <MovieRow title="Recomendadas" items={series} />
        <MovieRow title="Series" items={series} />
       <MovieRow  title="Peliculas" items={movies} />
      </div>

    </div>
  );
}