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
    <header className="w-full relative z-20 bg-transparent pt-3 pb-1 transition-all">
      
      {/* 1. TOP BRANDING ROW (SRM - CONNEXION - CASYUM'26) */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* TOP-LEFT: Official SRM Institute of Science and Technology Logo */}
        <div className="flex items-center group flex-shrink-0">
          <div className="bg-white/95 p-1.5 rounded-2xl shadow-md border border-white/30 backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
            <img
              src="/srm-logo.png"
              alt="SRM Institute of Science and Technology, Chennai Ramapuram"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain"
            />
          </div>
        </div>

        {/* CENTER: CONNEXION Logo with Connected Clue Nodes */}
        <div className="text-center my-1 md:my-0 flex flex-col items-center">
          
          {/* Styled CONNEXION Wordmark with embedded connection game elements */}
          <div className="relative left-0 md:left-[74.9375px] lg:left-0 inline-flex items-center gap-1.5 select-none">
            
            {/* Clue Node Visual: 4 dots connected by line */}
            <div className="hidden sm:flex items-center gap-1 opacity-90 mr-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 border border-amber-300 animate-pulse shadow-xs" />
              <span className="w-2.5 h-0.5 bg-gradient-to-r from-amber-400 to-pink-500" />
              <span className="w-2 h-2 rounded-full bg-pink-500 border border-pink-400 shadow-xs" />
              <span className="w-2.5 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500" />
            </div>

            {/* Typography with connection micro-elements */}
            <span className="relative text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(168,85,247,0.5)]">
              C
              <span className="relative inline-block text-purple-400">
                O
                <span className="absolute -top-1.5 -right-1 text-[10px] transform rotate-12 pointer-events-none">🧩</span>
              </span>
              NN
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
                E
                <span className="relative inline-block">
                  X
                  <span className="absolute -bottom-1 -right-1 text-[9px] text-amber-400 animate-pulse pointer-events-none">⚡</span>
                </span>
                ION
              </span>
            </span>

            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-purple-900/90 to-pink-900/90 text-purple-200 border border-purple-400/60 shadow-md ml-1.5">
              IMAGE QUIZ
            </span>

            <div className="hidden sm:flex items-center gap-1 opacity-90 ml-1">
              <span className="w-2.5 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 border border-cyan-300 shadow-xs" />
            </div>
          </div>

          <p className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1">
            An event of <strong className="text-purple-300 font-black">CASYUM'26</strong> &mdash; SRM Institute of Science and Technology, Ramapuram, Chennai
          </p>
        </div>

        {/* TOP-RIGHT: Official CASYUM Symposium Logo */}
        <div className="flex items-center gap-3 justify-end group flex-shrink-0">
          <div className="text-right hidden lg:block">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs sm:text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 uppercase">
                CASYUM '26
              </span>
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
            </div>
            <p className="text-[10px] text-purple-200/80 font-bold leading-tight">
              National Level Technical Symposium
            </p>
            <p className="text-[10px] font-black text-slate-200 leading-tight">
              Dept. of Computer Applications (BCA)
            </p>
          </div>

          <div className="bg-white/95 p-1.5 rounded-2xl shadow-md border border-white/30 backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
            <img
              src="/casyum-logo.png"
              alt="CASYUM Logo"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain rounded-xl"
            />
          </div>
        </div>

      </div>

      {/* 2. NAVIGATION ROW (2 PORTALS ONLY: PARTICIPANT & ADMIN) */}
      {!isDisplayView && (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 flex items-center justify-center lg:justify-between gap-4">
          
          {/* Round Status Chip (hidden on tablet and mobile per design) */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-950/80 via-pink-950/80 to-amber-950/80 text-purple-200 border border-purple-500/50 shadow-md backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50" />
              <span>{getRoundBadge()}</span>
            </span>
          </div>

          {/* Nav Controls: ONLY 2 PORTALS (Participant & Admin) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Team Session Badge */}
            {currentTeam && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-purple-500/40 text-xs shadow-md backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-100">{currentTeam.teamName}</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-mono font-black shadow-xs">
                  {currentTeam.score || 0} pts
                </span>
              </div>
            )}

            <nav className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-purple-500/40 shadow-lg">
              <Link
                to="/"
                onClick={() => playTick()}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all ${
                  location.pathname === "/"
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-purple-500/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Participant Portal</span>
              </Link>

              {/* Show Admin badge ONLY when the authorized user navigated directly to /admin */}
              {location.pathname === "/admin" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-purple-950/90 text-purple-300 border border-purple-500/60 shadow-xs">
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
              className={`p-2 rounded-xl border transition-all shadow-md ${
                isMuted
                  ? "bg-slate-900/80 text-slate-400 border-purple-900/60 hover:bg-slate-800"
                  : "bg-slate-900/90 text-purple-300 border-purple-500/40 hover:bg-purple-950/60"
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
