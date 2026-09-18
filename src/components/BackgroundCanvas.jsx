// CONNEXION - Atmospheric Mixed Dark & Light Background Canvas
import React from "react";
import { 
  Sparkles, Zap, Puzzle, Lightbulb, Target, Brain, 
  Search, Award, Trophy, Key, Code, Terminal, Compass, Link2, Film, Crown
} from "lucide-react";

export default function BackgroundCanvas({ variant = "default", showFloaters = true }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* 1. VIBRANT MULTI-COLOR ATMOSPHERIC GLOWS (DARK + GAME + LIGHT MIXED) */}
      {/* Deep Cosmic Purple & Violet Top-Left */}
      <div className="absolute -top-24 -left-24 w-[38rem] h-[38rem] rounded-full bg-gradient-to-br from-indigo-600/35 via-purple-600/30 to-fuchsia-600/25 blur-[120px] animate-pulse" />
      
      {/* Neon Hot Magenta & Pink Top-Right */}
      <div className="absolute top-1/6 -right-28 w-[36rem] h-[36rem] rounded-full bg-gradient-to-bl from-pink-500/30 via-fuchsia-600/25 to-rose-600/20 blur-[130px]" />
      
      {/* Laser Cyan & Electric Blue Bottom-Left */}
      <div className="absolute -bottom-28 left-1/5 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-cyan-400/25 via-blue-600/25 to-indigo-600/30 blur-[130px]" />
      
      {/* Solar Amber & Golden Game Flare Center-Right */}
      <div className="absolute top-1/2 right-1/4 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-amber-400/25 via-orange-500/20 to-yellow-300/15 blur-[110px]" />
      
      {/* Game Energy Emerald Bottom-Right */}
      <div className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tl from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-[120px]" />

      {/* 2. SUBTLE HIGH-TECH CYBERNETIC DOT & GRID OVERLAY */}
      <div 
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.10]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #a855f7 1.5px, transparent 0)`,
          backgroundSize: "36px 36px"
        }}
      />

      {/* 3. ANIMATED CONSTELLATION CABLES & ENERGY LINES (CONNECTION NETWORK) */}
      <svg className="absolute inset-0 w-full h-full opacity-40">
        <defs>
          <linearGradient id="wireGradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="wireGradB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="wireGradC" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Diagonal Crossing Data Wires */}
        <path d="M -50,180 Q 300,70 650,300 T 1400,200" fill="none" stroke="url(#wireGradA)" strokeWidth="2.5" strokeDasharray="8 6" className="animate-dash" />
        <path d="M 50,750 Q 400,520 800,680 T 1500,450" fill="none" stroke="url(#wireGradB)" strokeWidth="2.5" strokeDasharray="8 6" className="animate-dash" />
        <path d="M 200,-50 Q 500,400 300,900" fill="none" stroke="url(#wireGradC)" strokeWidth="1.5" strokeDasharray="6 6" />
        <path d="M 1200,-50 Q 950,450 1150,950" fill="none" stroke="url(#wireGradA)" strokeWidth="1.5" strokeDasharray="6 6" />

        {/* Pulsing Game Junction Nodes */}
        <circle cx="650" cy="300" r="7" fill="#ec4899" className="animate-pulse" />
        <circle cx="800" cy="680" r="8" fill="#8b5cf6" className="animate-pulse" />
        <circle cx="300" cy="70" r="6" fill="#f59e0b" />
        <circle cx="1400" cy="200" r="7" fill="#06b6d4" className="animate-pulse" />
      </svg>

      {/* 4. COLORFUL FLOATERS & QUIZ ELEMENTS */}
      {/* Positioned strictly at vertically-centered left & right flanks of the central login card */}
      {/* 100% DISAPPEARS AFTER LOGGING IN */}
      {showFloaters && (
        <>
          {/* EXACT LEFT FLANK OF LOGIN BOX */}
          <div className="fixed left-3 lg:left-6 xl:left-14 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 z-10 max-w-[240px]">
            
            {/* Floating Clue Badge 1 */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl border-2 border-amber-400 shadow-2xl shadow-amber-500/20 -rotate-3 animate-float-slow">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                  CLUE #1 &bull; PUZZLE
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-slate-100">
                <span className="text-2xl">🧩</span>
                <span>4 Visual Clues</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                "Connect &bull; Reason &bull; Buzz"
              </p>
            </div>

            {/* Tamil & Math Hybrid Glyphs */}
            <div className="flex items-center gap-2.5 pl-2 opacity-95">
              <span className="text-sm font-black px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/90 text-purple-800 dark:text-purple-300 border border-purple-300 shadow-sm">
                தமிழ்
              </span>
              <span className="text-2xl font-mono font-black text-pink-500 drop-shadow-sm">∑</span>
              <span className="text-2xl font-mono font-black text-cyan-400 drop-shadow-sm">&infin;</span>
              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 shadow-sm">
                O(1)
              </span>
            </div>

            {/* Floating Kollywood Pill */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white px-4 py-2.5 rounded-full text-xs font-black shadow-xl shadow-purple-600/30 flex items-center gap-2 rotate-2 animate-float-reverse">
              <Film className="w-4 h-4 text-yellow-300" />
              <span>Kollywood &bull; Cinema &bull; Icons</span>
            </div>

            {/* Floating Tech Badges */}
            <div className="flex items-center gap-2.5 pl-2 opacity-95">
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-purple-500/50 text-[11px] font-mono font-bold text-pink-400 shadow-md">
                &lt;BCA /&gt;
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/50 text-[11px] font-mono font-bold text-cyan-300 shadow-md">
                &#123; AI: 2026 &#125;
              </span>
            </div>
          </div>

          {/* EXACT RIGHT FLANK OF LOGIN BOX */}
          <div className="fixed right-3 lg:right-6 xl:right-14 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 z-10 max-w-[240px] items-end">
            
            {/* Floating Live Arena Badge */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl border-2 border-pink-400 shadow-2xl shadow-pink-500/20 rotate-3 animate-float-slow text-right">
              <div className="flex items-center justify-end gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-950 bg-pink-100 dark:bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-300">
                  FAST BUZZER
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-black text-slate-900 dark:text-slate-100">
                <span>0ms Latency</span>
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                Zero-Bias Server Timestamp
              </p>
            </div>

            {/* Floating Symbols */}
            <div className="flex items-center gap-3 pr-2 opacity-95">
              <span className="text-2xl font-mono font-black text-amber-400 drop-shadow-sm">&pi;</span>
              <span className="text-2xl">🎯</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-200 border border-pink-300 shadow-sm">
                30s CLOCK
              </span>
              <span className="text-2xl">🧠</span>
            </div>

            {/* Floating Grand Trophy Badge */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-4 py-2.5 rounded-full text-xs font-black shadow-xl shadow-amber-500/30 flex items-center gap-2 -rotate-2 animate-float-slow">
              <Trophy className="w-4 h-4 text-yellow-200" />
              <span>CASYUM'26 Trophy</span>
            </div>

            {/* Floating Crown & Special Tag */}
            <div className="flex items-center gap-2 pr-2 opacity-95">
              <span className="px-3.5 py-1.5 rounded-xl bg-purple-900 text-white text-[11px] font-black border border-purple-400/60 shadow-lg shadow-purple-900/40 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span>Top 15 Cutoff</span>
              </span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
