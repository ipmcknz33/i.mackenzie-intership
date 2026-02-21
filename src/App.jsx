import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Author from "./pages/Author";
import ItemDetails from "./pages/ItemDetails";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out",
      once: true,
      offset: 60,
    });
  }, []);

  useEffect(() => {
    AOS.refreshHard();
  }, [location.pathname]);

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />

        <Route path="/author/:authorId" element={<Author />} />
        <Route path="/author" element={<Navigate to="/" replace />} />

        <Route path="/item-details/:id" element={<ItemDetails />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
