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
          <Route path="/data-explorer" element={<Navigate to="/data-explorer/emergency-dept" replace />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Route override for emergency dept */}
          <Route path="/data-explorer/emergency-dept" element={<EmergencyDeptPage />} />

          {/* Default fallback for other topics */}
          <Route path="/data-explorer/:topic" element={<DataExplorer />} />
          <Route path="/data-explorer/cases" element={<CaseDataPage />} />
          <Route path="/data-explorer/deaths" element={<CovidDeathPage />} />

        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
