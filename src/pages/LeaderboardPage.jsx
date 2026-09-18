// CONNEXION - Public Live Leaderboard (Bright Festive Theme)
import React, { useState } from "react";
import { Trophy, Search, Award, Clock, Users, Zap } from "lucide-react";
import { useGame } from "../context/GameContext";

export default function LeaderboardPage() {
  const { teams } = useGame();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredTeams = teams.filter((t) => {
    const matchesSearch = 
      t.teamName.toLowerCase().includes(search.toLowerCase()) ||
      t.collegeName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "top15") return t.qualifiedRound2 || t.rank <= 15;
    if (filter === "groupA") return t.round2Group === "A";
    if (filter === "groupB") return t.round2Group === "B";
    if (filter === "groupC") return t.round2Group === "C";
    if (filter === "finals") return t.qualifiedFinal;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white shadow-xl shadow-purple-500/20 mb-2">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          Tournament Official Standings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto font-medium">
          CASYUM'26 Symposium Live Leaderboard ? Ranked by Total Score then Response Speed
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {teams.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-md text-center space-y-2 flex flex-col justify-between">
            <div>
              <span className="w-9 h-9 mx-auto rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-black flex items-center justify-center text-sm mb-2">
                #2
              </span>
              <h3 className="font-black text-lg text-slate-900 truncate">{teams[1]?.teamName}</h3>
              <p className="text-xs text-slate-500 truncate">{teams[1]?.collegeName}</p>
            </div>
            <div className="text-2xl font-black font-mono text-purple-700 mt-2">
              {teams[1]?.score || 0} <span className="text-xs text-slate-400 font-normal">pts</span>
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-50 to-white border-3 border-amber-400 shadow-xl text-center space-y-2 flex flex-col justify-between scale-105">
            <div>
              <div className="w-11 h-11 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center text-base mb-2 shadow-md">
                ?? 1
              </div>
              <h3 className="font-black text-xl text-slate-900 truncate">{teams[0]?.teamName}</h3>
              <p className="text-xs text-amber-800 font-semibold truncate">{teams[0]?.collegeName}</p>
            </div>
            <div className="text-3xl font-black font-mono text-amber-600 mt-2">
              {teams[0]?.score || 0} <span className="text-xs text-amber-500 font-normal">pts</span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 p-5 rounded-3xl bg-white border-2 border-amber-100 shadow-md text-center space-y-2 flex flex-col justify-between">
            <div>
              <span className="w-9 h-9 mx-auto rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-black flex items-center justify-center text-sm mb-2">
                #3
              </span>
              <h3 className="font-black text-lg text-slate-900 truncate">{teams[2]?.teamName}</h3>
              <p className="text-xs text-slate-500 truncate">{teams[2]?.collegeName}</p>
            </div>
            <div className="text-2xl font-black font-mono text-purple-700 mt-2">
              {teams[2]?.score || 0} <span className="text-xs text-slate-400 font-normal">pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/95 border-2 border-purple-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Search team or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-purple-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 font-semibold"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Teams" },
            { id: "top15", label: "Top 15" },
            { id: "groupA", label: "Grp A" },
            { id: "groupB", label: "Grp B" },
            { id: "groupC", label: "Grp C" },
            { id: "finals", label: "Finalists" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === item.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border-2 border-purple-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-purple-50 text-purple-900 uppercase font-mono border-b border-purple-100 text-[11px]">
              <tr>
                <th className="p-3.5 sm:p-4">Rank</th>
                <th className="p-3.5 sm:p-4">Team Name</th>
                <th className="p-3.5 sm:p-4">College</th>
                <th className="p-3.5 sm:p-4">Score</th>
                <th className="p-3.5 sm:p-4">Total Speed</th>
                <th className="p-3.5 sm:p-4">Round Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTeams.map((team, idx) => (
                <tr key={team.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-mono font-black text-purple-700">
                    #{team.rank || idx + 1}
                  </td>
                  <td className="p-3.5 sm:p-4 font-black text-slate-900">
                    {team.teamName}
                  </td>
                  <td className="p-3.5 sm:p-4 text-slate-600">
                    {team.collegeName}
                  </td>
                  <td className="p-3.5 sm:p-4 font-mono font-black text-pink-600 text-base">
                    {team.score || 0} <span className="text-xs text-slate-400 font-normal">pts</span>
                  </td>
                  <td className="p-3.5 sm:p-4 font-mono text-xs text-slate-500">
                    {team.totalResponseTime ? `${team.totalResponseTime}s` : "-"}
                  </td>
                  <td className="p-3.5 sm:p-4">
                    {team.qualifiedFinal ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                        ?? Grand Finalist
                      </span>
                    ) : team.qualifiedRound2 ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Round 2 Qual (Grp {team.round2Group})
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">
                        Round 1 Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
