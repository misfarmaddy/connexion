// CONNEXION - Big-Screen Display View for Auditorium Projectors (/display)
import React, { useState } from "react";
import { Maximize, Minimize, Award, Clock, Zap } from "lucide-react";
import { useGame } from "../context/GameContext";
import ImageClueCard from "../components/ImageClueCard";
import TimerBar from "../components/TimerBar";

export default function DisplayPortal() {
  const { roundState, buzzerState, activeQuestion, timeRemaining, teams } = useGame();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const top5 = teams.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/90 via-purple-50/80 to-pink-50/90 text-slate-900 flex flex-col justify-between p-4 sm:p-8">
      
      {/* Top Controls & Fullscreen */}
      <div className="flex items-center justify-between border-b-2 border-purple-200 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1 rounded-full bg-purple-100 border-2 border-purple-300 text-purple-900 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {roundState.currentRound === 1 && "ROUND 1: CONNECTIONS CHALLENGE"}
              {roundState.currentRound === 2 && `ROUND 2: GROUP ${roundState.activeGroup} BUZZER CLASH`}
              {roundState.currentRound === 3 && "GRAND FINALE: CHAMPIONSHIP BATTLE"}
            </span>
          </span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Auditorium Stage Display */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full my-auto space-y-6">
        
        {/* ROUND 1 VIEW */}
        {roundState.currentRound === 1 && activeQuestion && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <TimerBar 
              timeRemaining={timeRemaining} 
              duration={roundState.duration || 30} 
              status={roundState.status} 
            />

            {/* Question Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border-2 border-purple-200 text-center shadow-xl backdrop-blur-md">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-purple-700 block mb-1">
                {activeQuestion.id} ? {activeQuestion.type === "mcq" ? "Multiple Choice" : "Connection Challenge"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
                {activeQuestion.prompt}
              </h2>
            </div>

            {/* 4 Connection Clue Cards */}
            {activeQuestion.clues && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {activeQuestion.clues.map((clue, idx) => (
                  <ImageClueCard
                    key={clue.id || idx}
                    clue={clue}
                    index={idx}
                    totalClues={activeQuestion.clues.length}
                    isLarge={true}
                  />
                ))}
              </div>
            )}

            {/* Answer Reveal Screen */}
            {roundState.status === "revealed" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-center shadow-2xl animate-in zoom-in-95">
                <span className="text-xs uppercase font-mono font-black tracking-widest text-purple-100 block mb-1">
                  Connection Solution
                </span>
                <h3 className="text-3xl sm:text-5xl font-black tracking-wide">
                  {activeQuestion.correctAnswer}
                </h3>
                {activeQuestion.explanation && (
                  <p className="text-sm sm:text-base text-purple-50 mt-2 max-w-2xl mx-auto font-medium">
                    {activeQuestion.explanation}
                  </p>
                )}
              </div>
            )}

          </div>
        )}

        {/* ROUND 2 & 3 BUZZER STAGE */}
        {(roundState.currentRound === 2 || roundState.currentRound === 3) && (
          <div className="space-y-8 animate-in fade-in">
            {buzzerState.firstBuzz ? (
              <div className="p-8 sm:p-14 rounded-3xl bg-emerald-50 border-4 border-emerald-500 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase bg-emerald-600 text-white inline-block mb-4 shadow-md">
                  ? FIRST BUZZ REGISTERED
                </span>
                <h2 className="text-4xl sm:text-7xl font-black text-slate-900 uppercase tracking-tight">
                  {buzzerState.firstBuzz.teamName}
                </h2>
                <div className="mt-4 flex items-center justify-center gap-3 text-emerald-800 font-mono text-base font-bold">
                  <Clock className="w-5 h-5" />
                  <span>Reaction Time: +{buzzerState.firstBuzz.latencyDeltaMs}ms after arm</span>
                </div>
              </div>
            ) : buzzerState.armed ? (
              <div className="p-12 sm:p-16 rounded-3xl bg-rose-50 border-3 border-rose-500 text-center shadow-xl animate-pulse">
                <Zap className="w-16 h-16 mx-auto text-rose-600 mb-4 animate-bounce" />
                <h2 className="text-3xl sm:text-5xl font-black text-rose-700 uppercase tracking-widest">
                  BUZZER ARMED!
                </h2>
                <p className="text-sm sm:text-base text-slate-700 mt-2 font-bold">
                  Awaiting first team to tap buzzer on their device...
                </p>
              </div>
            ) : (
              <div className="p-12 sm:p-16 rounded-3xl bg-white border-2 border-purple-200 text-center shadow-sm">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-700 uppercase">
                  {roundState.currentRound === 3 ? "Grand Finale Stage" : `Round 2: Group ${roundState.activeGroup} Stage`}
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Standby for Quiz Master to present question and arm buzzers...
                </p>
              </div>
            )}

            {/* Display Question Clues if available */}
            {activeQuestion?.clues && activeQuestion.clues.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activeQuestion.clues.map((clue, idx) => (
                  <ImageClueCard
                    key={clue.id || idx}
                    clue={clue}
                    index={idx}
                    totalClues={activeQuestion.clues.length}
                    isLarge={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Bottom Ticker: Live Leaderboard Top 5 */}
      <footer className="border-t-2 border-purple-200 pt-4 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Auditorium Standings:</span>
          </span>

          <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1">
            {top5.map((team, idx) => (
              <div
                key={team.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-xs shadow-sm whitespace-nowrap"
              >
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold font-mono text-[11px]">
                  #{idx + 1}
                </span>
                <span className="font-bold text-slate-900">{team.teamName}</span>
                <span className="font-mono text-pink-600 font-black">{team.score || 0} pts</span>
              </div>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
