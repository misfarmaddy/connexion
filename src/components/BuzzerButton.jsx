// CONNEXION - Tactile Arcade Buzzer Component (Bright Festive Theme)
import React from "react";
import { Zap, Lock, Award, Clock } from "lucide-react";
import { useSound } from "../context/SoundContext";

export default function BuzzerButton({ 
  buzzerState, 
  currentTeam, 
  onPress, 
  disabled = false,
  isEligibleGroup = true,
  currentRound = 2
}) {
  const { playBuzz } = useSound();

  const isArmed = buzzerState.armed;
  const firstBuzz = buzzerState.firstBuzz;
  const hasAnyoneBuzzed = Boolean(firstBuzz);
  const didWeBuzzFirst = firstBuzz?.teamId === currentTeam?.id;

  const handleClick = () => {
    if (!isArmed || hasAnyoneBuzzed || disabled || !isEligibleGroup) return;
    playBuzz();
    if (onPress) onPress();
  };

  // 1. Not in Active Group
  if (!isEligibleGroup) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white border-2 border-purple-200 text-center max-w-md mx-auto shadow-sm">
        <div className="p-4 rounded-full bg-purple-50 text-purple-600 mb-3 border border-purple-200">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900">
          {currentRound === 3 ? "Grand Finale In Progress" : `Group ${buzzerState.activeGroup || "A"} On Stage`}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {currentRound === 3
            ? "The 3 finalist teams are battling live on stage. Watch the auditorium screen!"
            : `Your team is in Group ${currentTeam?.round2Group || "another group"}. Watch the auditorium big screen until your group is called!`}
        </p>
      </div>
    );
  }

  // 2. We buzzed first! (Winner)
  if (didWeBuzzFirst) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl bg-emerald-50 border-3 border-emerald-500 text-center max-w-lg mx-auto shadow-xl animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 border-2 border-emerald-400 animate-bounce shadow-md">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-emerald-900 uppercase tracking-wide">
          🔔 YOU BUZZED FIRST!
        </h2>
        <p className="text-sm font-bold text-emerald-800 mt-2">
          Answer out loud to the Quiz Master!
        </p>
        <div className="mt-4 px-4 py-1.5 rounded-full bg-white border border-emerald-400 text-xs font-mono font-black text-emerald-800 shadow-sm">
          Response Latency: {firstBuzz.latencyDeltaMs}ms
        </div>
      </div>
    );
  }

  // 3. Someone else buzzed first (Locked Out)
  if (hasAnyoneBuzzed && !didWeBuzzFirst) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl bg-rose-50 border-2 border-rose-300 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-rose-900">
          LOCKED OUT!
        </h3>
        <p className="text-sm text-slate-700 mt-2 font-medium">
          <strong className="text-rose-700 font-bold">{firstBuzz.teamName}</strong> buzzed first!
        </p>
        <div className="mt-3 text-xs font-mono text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Locked in {firstBuzz.latencyDeltaMs}ms</span>
        </div>
      </div>
    );
  }

  // 4. Armed or Disarmed Buzzer Button
  return (
    <div className="flex flex-col items-center justify-center text-center py-4">
      {/* Visual Status Indicator */}
      <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-purple-200 text-xs font-black shadow-sm">
        <span 
          className={`w-2.5 h-2.5 rounded-full ${
            isArmed ? "bg-emerald-500 animate-ping" : "bg-amber-400"
          }`} 
        />
        <span className={isArmed ? "text-emerald-700 font-black" : "text-slate-500"}>
          {isArmed ? "⚡ BUZZER ARMED — READY TO PRESS!" : "BUZZER DISARMED — WAIT FOR QUIZ MASTER"}
        </span>
      </div>

      {/* Big Arcade Button */}
      <button
        onClick={handleClick}
        disabled={!isArmed || disabled}
        className={`buzzer-btn relative w-56 h-56 sm:w-64 sm:h-64 rounded-full font-black text-2xl sm:text-3xl uppercase tracking-wider flex flex-col items-center justify-center gap-2 select-none active:scale-95 transition-all ${
          isArmed
            ? "bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 text-white cursor-pointer border-4 border-rose-300 shadow-2xl animate-pulse"
            : "bg-slate-200 text-slate-400 border-4 border-slate-300"
        }`}
      >
        <Zap className={`w-12 h-12 sm:w-16 sm:h-16 fill-current ${isArmed ? "text-yellow-300" : "text-slate-400"}`} />
        <span>BUZZ</span>
        <span className="text-[11px] font-sans font-bold tracking-normal opacity-90">
          {isArmed ? "TAP TO LOCK IN" : "LOCKED"}
        </span>
      </button>

      <p className="text-xs text-slate-500 mt-6 max-w-xs font-semibold">
        {isArmed 
          ? "Atomic server timestamp guarantees zero-bias refereeing." 
          : "Keep your finger ready on the screen!"}
      </p>
    </div>
  );
}
