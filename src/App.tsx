import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Championshoy from "./pages/Championshoy";


export default function App() {
  return (
<Router>
  <Navbar />

  <Routes>
    {/* Home SIN padding */}
    <Route path="/" element={<Home />} />
 

    {/* Detalle CON padding */}
    <Route
      path="/movie/:id"
      element={
        <div className="pt-20">
          <MovieDetail />
        </div>
      }
    />
     <Route
    path="/championshoy"
    element={
      <div className="pt-20">
        <Championshoy />
      </div>
    }
  />
  </Routes>
 
   <Footer/>
   
</Router>

  );
}