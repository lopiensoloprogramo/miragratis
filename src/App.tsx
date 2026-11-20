
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SerieDetail from "./pages/SeriesDetail";
import GoPage from "./components/GoPage";
import MovieRequest from "./components/MovieRequest";
import { trackPageView } from "./components/analytics";
import MomentosPage from "./pages/MomentosPage";
import MomentoDetail from "./pages/MomentoDetail";
import Peliculas from "./pages/Peliculas";
import Series from "./pages/Series";
import Vip from "./pages/Vip";
import VipAdmin from "./pages/VipAdmin";
import VipAccess from "./pages/VipAccess";
import VipLibrary from "./pages/VipLibrary";

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

function AppContent() {
  const location = useLocation();

  // La biblioteca VIP tendrá navegación independiente.
  const isVipLibrary = location.pathname === "/vip-biblioteca";

  return (
    <>
      {!isVipLibrary && <Navbar />}

      <AnalyticsTracker />

      <Routes>
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

        <Route
          path="/momentos"
          element={
            <div className="pt-14">
              <MomentosPage />
            </div>
          }
        />

        <Route
          path="/momentos/:id"
          element={
            <div className="pt-14">
              <MomentoDetail />
            </div>
          }
        />

        <Route
          path="/serie/:id"
          element={
            <div className="pt-14">
              <SerieDetail />
            </div>
          }
        />

        <Route
          path="/movie/:id"
          element={
            <div className="pt-14">
              <MovieDetail />
            </div>
          }
        />

        <Route path="/peliculas" element={<Peliculas />} />
        <Route path="/series" element={<Series />} />

        <Route
          path="/vip"
          element={
            <div className="pt-14">
              <Vip />
            </div>
          }
        />

        <Route
          path="/vip-admin"
          element={
            <div className="pt-14">
              <VipAdmin />
            </div>
          }
        />

        <Route path="/vip-acceso" element={<VipAccess />} />
        <Route path="/vip-biblioteca" element={<VipLibrary />} />
      </Routes>

      {!isVipLibrary && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
