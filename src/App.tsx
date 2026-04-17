import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SerieDetail from "./pages/SeriesDetail";


export default function App() {
  return (
<Router>
  <Navbar />

  <Routes>
    {/* Home SIN padding */}
    <Route path="/" element={<Home />} />
 



   <Route path="/serie/:id" element={<SerieDetail />} />
    {/* Detalle CON padding */}
    <Route
      path="/movie/:id"
      element={
        <div className="pt-20">
          <MovieDetail />
        </div>
      }
    />
 


  </Routes>
 
   <Footer/>
   
</Router>

  );
}