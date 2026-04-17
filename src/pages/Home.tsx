import { series } from "../data/series";
import {movies} from "../data/movies"
import MovieRow from "../components/MovieRow";
import HeroBanner from "../components/HeroBanner";


export default function Home() {
  return (
    <div className="pt-20">
      {/* banner principal */}
      <HeroBanner serie={series[0]} />

     <div className="px-6 pb-6 pt-2">
        <MovieRow title="Recomendadas" items={series} />
        <MovieRow title="Series" items={series} />
        <MovieRow title="Peliculas" items={movies}/>
      </div>

       
    </div>
  );
}