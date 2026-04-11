import { movies } from "../data/movies";
import MovieRow from "../components/MovieRow";
import HeroBanner from "../components/HeroBanner";


export default function Home() {
  return (
    <div className="pt-20">
      {/* banner principal */}
      <HeroBanner movie={movies[0]} />

     <div className="px-6 pb-6 pt-2">
        <MovieRow title="Accion" movies={movies} />
        <MovieRow title="Recomendadas" movies={movies} />
      </div>

       
    </div>
  );
}