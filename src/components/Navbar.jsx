// CONNEXION - Responsive Festive Navbar
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Volume2, VolumeX, Shield, Tv, Trophy, Users, Zap } from "lucide-react";
import { useSound } from "../context/SoundContext";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";

export default function Navbar() {
  const location = useLocation();
  const { isMuted, toggleMute, playTick } = useSound();
  const { currentTeam, isAdmin } = useAuth();
  const { roundState } = useGame();

  const getRoundLabel = () => {
    if (roundState.suddenDeathActive) return "⚡ SUDDEN DEATH TIEBREAKER";
    if (roundState.currentRound === 1) return "Round 1: Connection Challenge";
    if (roundState.currentRound === 2) return `Round 2: Group ${roundState.activeGroup} Buzzer`;
    if (roundState.currentRound === 3) return "Grand Finale: Buzzer War";
    return "Symposium Live";
  };

  const navLinks = [
    { to: "/", label: "Participant", icon: Users },
    { to: "/display", label: "Big Screen", icon: Tv },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/admin", label: "Admin", icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-purple-900/40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Round Indicator */}
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tight text-white group"
          >
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </span>
            <span>
              CONN<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400">EXION</span>
            </span>
          </Link>

          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/70 text-purple-300 border border-purple-800/60 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {getRoundLabel()}
          </span>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Active Team Pill (if logged in on participant device) */}
          {currentTeam && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-semibold text-slate-200">{currentTeam.teamName}</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 font-mono font-bold">
                {currentTeam.score || 0} pts
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => playTick()}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              toggleMute();
              playTick();
            }}
            title={isMuted ? "Sound Muted" : "Sound Enabled"}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? "bg-slate-900 text-slate-500 border-slate-800"
                : "bg-purple-950/60 text-purple-300 border-purple-800/80 hover:bg-purple-900/60 hover:text-white"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}