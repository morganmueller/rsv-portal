import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TopBar from "./components/TopBar/TopBar";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import OverviewPage from "./pages/Overview/OverviewPage";
import DataExplorer from "./pages/DataExplorer/DataExplorer";
import EmergencyDeptPage from "./pages/DataExplorer/EmergencyDeptPage"; 
import CaseDataPage from "./pages/DataExplorer/CaseDataPage"; 
import CovidDeathPage from "./pages/DataExplorer/CovidDeathPage"; 
import AboutPage from "./pages/About/AboutPage"; 
import "../src/styles/mobile.css"

function App() {
  return (
    <Router>
      <TopBar />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/data" element={<Navigate to="/data/emergency-dept" replace />} />
          <Route path="/info" element={<AboutPage />} />

          {/* Route override for emergency dept */}
          <Route path="/data/emergency-dept" element={<EmergencyDeptPage />} />

          {/* Default fallback for other topics */}
          <Route path="/data/:topic" element={<DataExplorer />} />
          <Route path="/data/cases" element={<CaseDataPage />} />
          <Route path="/data/deaths" element={<CovidDeathPage />} />

        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
