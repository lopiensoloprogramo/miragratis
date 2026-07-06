import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SerieDetail from "./pages/SeriesDetail";
import GoPage from "./components/GoPage";
import MovieRequest from "./components/MovieRequest"
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "./components/analytics";
export default function App() {

  function AnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        trackPageView(
            location.pathname +
            location.search +
            location.hash
        );
    }, [location]);

    return null;
}
  return (
<Router>
  <Navbar />
<AnalyticsTracker />
  <Routes>
    {/* Home SIN padding */}
    <Route path="/" element={<Home />} />
    <Route path="/go/:slug" element={<GoPage />} />
        <Route
          path="/requests"
          element={
            <div className="pt-14">
              <MovieRequest />
            </div>
          }
        />


   <Route path="/serie/:id" element={
    <div className="pt-14">
   <SerieDetail />
    </div>
 
    
    
    } />
    {/* Detalle CON padding */}
    <Route
      path="/movie/:id"
      element={
        <div className="pt-14">
          <MovieDetail />
        </div>
      }
    />
 


  </Routes>
 
   <Footer/>
   
</Router>

  );
}