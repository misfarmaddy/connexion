// CONNEXION - Atmospheric Mixed Dark & Light Background Canvas
import React from "react";
import { 
  Sparkles, Zap, Puzzle, Lightbulb, Target, Brain, 
  Search, Award, Trophy, Key, Code, Terminal, Compass, Link2, Film, Crown
} from "lucide-react";

export default function BackgroundCanvas({ variant = "default", showFloaters = true }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* 1. ATMOSPHERIC RADIANT MESH GRADIENTS (MIXED DARK & LIGHT) */}
      <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-600/20 to-pink-500/15 blur-[100px] animate-pulse" />
      <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] rounded-full bg-gradient-to-bl from-pink-500/20 via-fuchsia-600/15 to-purple-600/20 blur-[110px]" />
      <div className="absolute -bottom-36 left-1/4 w-[38rem] h-[38rem] rounded-full bg-gradient-to-tr from-cyan-500/15 via-indigo-500/20 to-amber-400/15 blur-[120px]" />
      <div className="absolute top-1/2 left-1/3 w-[24rem] h-[24rem] rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 blur-[90px]" />

      {/* 2. SUBTLE CYBERNETIC DOT & GRID OVERLAY */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #7c3aed 1.5px, transparent 0)`,
          backgroundSize: "32px 32px"
        }}
      />

      {/* 3. ANIMATED CONSTELLATION CABLES (CONNECTION NETWORK) */}
      <svg className="absolute inset-0 w-full h-full opacity-35">
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
        <path d="M -50,160 Q 300,50 650,280 T 1400,180" fill="none" stroke="url(#wireGradA)" strokeWidth="2" strokeDasharray="8 6" className="animate-dash" />
        <path d="M 50,750 Q 400,520 800,680 T 1500,450" fill="none" stroke="url(#wireGradB)" strokeWidth="2" strokeDasharray="8 6" className="animate-dash" />
        <path d="M 200,-50 Q 500,400 300,900" fill="none" stroke="url(#wireGradC)" strokeWidth="1.5" strokeDasharray="6 6" />
        <path d="M 1200,-50 Q 950,450 1150,950" fill="none" stroke="url(#wireGradA)" strokeWidth="1.5" strokeDasharray="6 6" />

        {/* Pulsing Junction Nodes */}
        <circle cx="650" cy="280" r="7" fill="#ec4899" className="animate-pulse" />
        <circle cx="800" cy="680" r="8" fill="#8b5cf6" className="animate-pulse" />
        <circle cx="300" cy="50" r="6" fill="#f59e0b" />
        <circle cx="1400" cy="180" r="7" fill="#06b6d4" className="animate-pulse" />
      </svg>

      {/* 4. COLORFUL FLOATERS & QUIZ ELEMENTS (Active ONLY when showFloaters is true) */}
      {showFloaters && (
        <>
          {/* LEFT FLANK */}
          <div className="hidden lg:flex flex-col gap-8 absolute left-6 top-16 z-0 max-w-[230px]">
            
            {/* Floating Clue Badge 1 */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border-2 border-amber-300 shadow-xl shadow-amber-500/15 -rotate-6 animate-float-slow">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                  CLUE #1 &bull; ORIGIN
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                <span className="text-2xl">🧩</span>
                <span>4 Visual Puzzles</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                "Connect &bull; Reason &bull; Buzz"
              </p>
            </div>

            {/* Tamil & Math Hybrid Glyphs */}
            <div className="flex items-center gap-2.5 pl-2 opacity-80">
              <span className="text-xl font-bold px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 border border-purple-300 shadow-xs">
                தமிழ்
              </span>
              <span className="text-2xl font-mono font-black text-pink-500">∑</span>
              <span className="text-2xl font-mono font-black text-cyan-500">&infin;</span>
              <span className="text-xs font-mono font-black px-2 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                O(1)
              </span>
            </div>

            {/* Floating Kollywood Pill */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-2 rotate-3 animate-float-reverse">
              <Film className="w-3.5 h-3.5 text-yellow-300" />
              <span>Kollywood &bull; Cinema &bull; Icons</span>
            </div>

            {/* Floating Tech Badges */}
            <div className="flex items-center gap-2.5 pl-2 opacity-80">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-purple-500/40 text-[11px] font-mono font-bold text-pink-400 shadow-sm">
                &lt;BCA /&gt;
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-cyan-500/40 text-[11px] font-mono font-bold text-cyan-300 shadow-sm">
                &#123; AI: 2026 &#125;
              </span>
            </div>
          </div>

          {/* RIGHT FLANK */}
          <div className="hidden lg:flex flex-col gap-8 absolute right-6 top-16 z-0 max-w-[230px] items-end">
            
            {/* Floating Live Arena Badge */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border-2 border-pink-300 shadow-xl shadow-pink-500/15 rotate-6 animate-float-slow text-right">
              <div className="flex items-center justify-end gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-900 bg-pink-100 px-2 py-0.5 rounded-full">
                  FAST BUZZER
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                <span>0ms Latency</span>
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                Zero-Bias Server Timestamp
              </p>
            </div>

            {/* Floating Symbols */}
            <div className="flex items-center gap-3 pr-2 opacity-80">
              <span className="text-2xl font-mono font-black text-amber-500">&pi;</span>
              <span className="text-xl">🎯</span>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-pink-100 text-pink-700 border border-pink-300">
                30s CLOCK
              </span>
              <span className="text-xl">🧠</span>
            </div>

            {/* Floating Grand Trophy Badge */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-2 -rotate-3 animate-float-slow">
              <Trophy className="w-4 h-4 text-yellow-200" />
              <span>CASYUM'26 Trophy</span>
            </div>

            {/* Floating Crown & Special Tag */}
            <div className="flex items-center gap-2 pr-2 opacity-85">
              <span className="px-3 py-1 rounded-xl bg-purple-900 text-white text-[11px] font-bold border border-purple-400/40 shadow-sm flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span>Top 15 Cutoff</span>
              </span>
            </div>
          </div>

          {/* CORNER ACCENTS */}
          <div className="absolute bottom-12 left-10 opacity-40 text-4xl font-mono font-black text-purple-400 select-none">
            &#10022;
          </div>
          <div className="absolute bottom-16 right-16 opacity-40 text-5xl font-mono font-black text-pink-400 select-none">
            &#10023;
          </div>
          <div className="absolute top-1/2 left-8 opacity-35 text-3xl font-mono font-black text-cyan-400 select-none">
            &#9671;
          </div>
          <div className="absolute top-1/2 right-10 opacity-35 text-3xl font-mono font-black text-amber-400 select-none">
            &#9672;
          </div>
        </>
      )}

    </div>
  );
}
