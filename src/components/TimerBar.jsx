// CONNEXION - Synced 30s Countdown Bar (Bright Festive Theme)
import React, { useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { useSound } from "../context/SoundContext";

export default function TimerBar({ timeRemaining, duration = 30, status = "live", isCompact = false }) {
  const { playTick } = useSound();
  const lastSecondRef = useRef(null);

  const percentage = Math.max(0, Math.min(100, (timeRemaining / duration) * 100));
  const isUrgent = timeRemaining <= 5 && timeRemaining > 0;
  const isWarning = timeRemaining <= 10 && timeRemaining > 5;
  const isExpired = timeRemaining <= 0 || status === "locked" || status === "revealed";

  // Sound ticking for last 5 seconds
  useEffect(() => {
    if (status !== "live") return;
    const currentInt = Math.ceil(timeRemaining);
    if (currentInt <= 5 && currentInt > 0 && currentInt !== lastSecondRef.current) {
      lastSecondRef.current = currentInt;
      playTick(true);
    }
  }, [timeRemaining, status, playTick]);

  const getColorClass = () => {
    if (isExpired) return "bg-slate-300";
    if (isUrgent) return "bg-gradient-to-r from-rose-500 via-pink-600 to-red-600 animate-pulse";
    if (isWarning) return "bg-gradient-to-r from-amber-500 to-orange-500";
    return "bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400";
  };

  const getBadgeStyle = () => {
    if (isExpired) return "bg-slate-100 border-slate-300 text-slate-600";
    if (isUrgent) return "bg-rose-100 border-rose-300 text-rose-800 animate-pulse";
    if (isWarning) return "bg-amber-100 border-amber-300 text-amber-800";
    return "bg-purple-100 border-purple-300 text-purple-900";
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`px-2.5 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 ${getBadgeStyle()}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{timeRemaining.toFixed(0)}s</span>
        </div>
        <div className="flex-1 h-2.5 bg-purple-100 rounded-full overflow-hidden border border-purple-200">
          <div
            className={`h-full transition-all duration-150 ${getColorClass()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black border shadow-sm ${getBadgeStyle()}`}>
            {isUrgent ? <AlertTriangle className="w-4 h-4 animate-bounce" /> : <Clock className="w-4 h-4" />}
            <span>{isExpired ? "TIME'S UP" : `${timeRemaining.toFixed(1)}s`}</span>
          </span>
          <span className="text-xs font-bold text-slate-500">
            {status === "live" ? "Server Timer Synced" : status.toUpperCase()}
          </span>
        </div>
        <span className="text-xs font-mono text-purple-700 font-bold">
          {percentage.toFixed(0)}% remaining
        </span>
      </div>

      {/* Main Progress Bar */}
      <div className="relative h-4 w-full bg-purple-100/80 rounded-full overflow-hidden p-0.5 border-2 border-purple-200 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-100 ease-linear shadow ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
