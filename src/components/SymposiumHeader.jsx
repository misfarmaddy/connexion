// CONNEXION - SRM Institute of Science and Technology | CASYUM'26 Header
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Volume2, VolumeX, Shield, Users, Zap, Sparkles } from "lucide-react";
import { useSound } from "../context/SoundContext";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";

export default function SymposiumHeader({ isDisplayView = false }) {
  const location = useLocation();
  const { isMuted, toggleMute, playTick } = useSound();
  const { currentTeam } = useAuth();
  const { roundState } = useGame();

  const getRoundBadge = () => {
    if (roundState.suddenDeathActive) return "? SUDDEN DEATH TIEBREAKER";
    if (roundState.currentRound === 1) return "Round 1: Connection Challenge";
    if (roundState.currentRound === 2) return `Round 2: Group ${roundState.activeGroup} Buzzer`;
    if (roundState.currentRound === 3) return "Grand Finale: Championship Buzzer";
    return "Symposium Live";
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b-2 border-purple-200/80 shadow-sm sticky top-0 z-50">
      
      {/* 1. TOP BRANDING ROW (SRM - CONNEXION - CASYUM'26) */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-purple-100">
        
        {/* TOP-LEFT: Official SRM Institute of Science and Technology Logo */}
        <div className="flex items-center group flex-shrink-0">
          <img
            src="/srm-logo.png"
            alt="SRM Institute of Science and Technology, Chennai Ramapuram"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* CENTER: CONNEXION Logo with Connected Clue Nodes */}
        <div className="text-center my-1 md:my-0 flex flex-col items-center">
          
          {/* Styled CONNEXION Wordmark with embedded connection game elements */}
          <div className="relative left-0 md:left-[74.9375px] lg:left-0 inline-flex items-center gap-1.5 select-none">
            
            {/* Clue Node Visual: 4 dots connected by line */}
            <div className="hidden sm:flex items-center gap-1 opacity-75 mr-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 border border-amber-500 animate-pulse" />
              <span className="w-2.5 h-0.5 bg-gradient-to-r from-amber-400 to-pink-500" />
              <span className="w-2 h-2 rounded-full bg-pink-500 border border-pink-600" />
              <span className="w-2.5 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600" />
            </div>

            {/* Typography with connection micro-elements */}
            <span className="relative text-2xl sm:text-3xl font-black tracking-tight text-slate-900 drop-shadow-xs">
              C
              <span className="relative inline-block text-purple-600">
                O
                <span className="absolute -top-1.5 -right-1 text-[10px] transform rotate-12 pointer-events-none">🧩</span>
              </span>
              NN
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
                E
                <span className="relative inline-block">
                  X
                  <span className="absolute -bottom-1 -right-1 text-[9px] text-amber-500 animate-pulse pointer-events-none">⚡</span>
                </span>
                ION
              </span>
            </span>

            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border border-purple-300 shadow-sm ml-1.5">
              IMAGE QUIZ
            </span>

            <div className="hidden sm:flex items-center gap-1 opacity-75 ml-1">
              <span className="w-2.5 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-500" />
              <span className="w-2 h-2 rounded-full bg-cyan-500 border border-cyan-600" />
            </div>
          </div>

          <p className="text-[11px] sm:text-xs font-bold text-slate-600 mt-1">
            An event of <strong className="text-purple-700 font-black">CASYUM'26</strong> &mdash; SRM Institute of Science and Technology, Ramapuram, Chennai
          </p>
        </div>

        {/* TOP-RIGHT: Official CASYUM Symposium Logo */}
        <div className="flex items-center gap-3 justify-end group flex-shrink-0">
          <div className="text-right hidden lg:block">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs sm:text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 uppercase">
                CASYUM '26
              </span>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold leading-tight">
              National Level Technical Symposium
            </p>
            <p className="text-[10px] font-black text-slate-800 leading-tight">
              Dept. of Computer Applications (BCA)
            </p>
          </div>

          <img
            src="/casyum-logo.png"
            alt="CASYUM Logo"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain rounded-2xl shadow-sm border border-purple-200/80 transition-transform duration-200 group-hover:scale-105"
          />
        </div>

      </div>

      {/* 2. NAVIGATION ROW (2 PORTALS ONLY: PARTICIPANT & ADMIN) */}
      {!isDisplayView && (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 flex items-center justify-center lg:justify-between gap-4">
          
          {/* Round Status Chip (hidden on tablet and mobile per design) */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 text-purple-950 border border-purple-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{getRoundBadge()}</span>
            </span>
          </div>

          {/* Nav Controls: ONLY 2 PORTALS (Participant & Admin) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Team Session Badge */}
            {currentTeam && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800">{currentTeam.teamName}</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-mono font-black">
                  {currentTeam.score || 0} pts
                </span>
              </div>
            )}

            <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <Link
                to="/"
                onClick={() => playTick()}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all ${
                  location.pathname === "/"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Participant Portal</span>
              </Link>

              {/* Show Admin badge ONLY when the authorized user navigated directly to /admin */}
              {location.pathname === "/admin" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-slate-900 text-purple-300 border border-purple-500/40 shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Admin Control</span>
                </span>
              )}
            </nav>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                toggleMute();
                playTick();
              }}
              title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? "bg-slate-100 text-slate-400 border-slate-200"
                  : "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 shadow-sm"
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

          </div>

        </div>
      )}

    </header>
  );
}
