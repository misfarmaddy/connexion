// CONNEXION - Main App Router with CASYUM'26 Symposium Branding
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SoundProvider } from "./context/SoundContext";
import { GameProvider } from "./context/GameContext";
import SymposiumHeader from "./components/SymposiumHeader";
import ParticipantPortal from "./pages/ParticipantPortal";
import AdminPortal from "./pages/AdminPortal";
import DisplayPortal from "./pages/DisplayPortal";
import LeaderboardPage from "./pages/LeaderboardPage";

function AppContent() {
  const location = useLocation();
  const isDisplayRoute = location.pathname === "/display";

  return (
    <div className="min-h-screen bg-[#0d0f22] text-slate-100 flex flex-col font-['Outfit',sans-serif] relative selection:bg-purple-600 selection:text-white">
      {/* Symposium Header with SRM + CASYUM'26 branding across ALL pages */}
      <SymposiumHeader isDisplayView={isDisplayRoute} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ParticipantPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/display" element={<DisplayPortal />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<ParticipantPortal />} />
        </Routes>
      </main>

      {!isDisplayRoute && (
        <footer className="py-4 border-t border-purple-900/40 bg-slate-950/60 backdrop-blur-md text-center text-xs text-purple-300/80 font-medium relative z-10">
          CASYUM'26 &bull; CONNEXION Image-Connection Quiz &bull; SRM Institute of Science and Technology, Ramapuram, Chennai
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SoundProvider>
          <GameProvider>
            <AppContent />
          </GameProvider>
        </SoundProvider>
      </AuthProvider>
    </Router>
  );
}
