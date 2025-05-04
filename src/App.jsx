import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TopBar from "./components/TopBar/TopBar";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import OverviewPage from "./pages/Overview/OverviewPage";
import DataExplorer from "./pages/DataExplorer/DataExplorer";
import EmergencyDeptPage from "./pages/DataExplorer/EmergencyDeptPage"; // ⬅️ New import

function App() {
  return (
    <Router>
      <TopBar />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/data-explorer" element={<Navigate to="/data-explorer/ed-visits" replace />} />

          {/* Route override for /ed-visits */}
          <Route path="/data-explorer/ed-visits" element={<EmergencyDeptPage />} />

          {/* Default fallback for other topics */}
          <Route path="/data-explorer/:topic" element={<DataExplorer />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
