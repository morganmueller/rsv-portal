import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PageStateProvider } from "./components/hooks/usePageState";

import TopBar from "./components/TopBar/TopBar";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import OverviewPage from "./pages/Overview/OverviewPage";
import AboutPage from "./pages/About/AboutPage";

import CovidPage from "./pages/DataExplorer/CovidPage";
import FluPage from "./pages/DataExplorer/FluPage"
import RsvPage from "./pages/DataExplorer/RsvPage"
import VirusDataPage from "./pages/DataExplorer/VirusDataPage"


import "../src/styles/mobile.css"

function App() {
  return (
    <Router>
      <TopBar />
      {/* REMOVE <Header /> FROM HERE */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* <Route path="/data/covid-19" element={<CovidPage />} />
          <Route path="/data/influenza" element={<FluPage />} />
          <Route path="/data/rsv" element={<RsvPage />} /> */}
          <Route path="/data/:virus" element={<VirusDataPage />} />

          <Route path="/data" element={<Navigate to="/data/covid-19" replace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}



export default App;
