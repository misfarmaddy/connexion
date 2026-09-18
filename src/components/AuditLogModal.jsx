// CONNEXION - Audit Trail Modal (Bright Festive Theme)
import React, { useState } from "react";
import { X, Search, ShieldCheck, Clock, Award, AlertCircle } from "lucide-react";

export default function AuditLogModal({ isOpen, onClose, scoreLog = [] }) {
  const [search, setSearch] = useState("");
  const [filterVerdict, setFilterVerdict] = useState("all");

  if (!isOpen) return null;

  const filteredLogs = scoreLog.filter((entry) => {
    const matchesSearch = 
      (entry.teamName || "").toLowerCase().includes(search.toLowerCase()) ||
      (entry.questionId || "").toLowerCase().includes(search.toLowerCase()) ||
      (entry.details || "").toLowerCase().includes(search.toLowerCase());
    const matchesVerdict = filterVerdict === "all" || entry.verdict === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-4xl h-[85vh] bg-white border-2 border-purple-300 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-100 bg-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Official Score Audit Trail
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Immutable ledger of all points awarded, verdicts, and speed bonuses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-purple-100 bg-white flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Search team, question ID or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-purple-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-semibold"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto">
            {["all", "correct", "wrong", "speed_bonus", "penalty"].map((v) => (
              <button
                key={v}
                onClick={() => setFilterVerdict(v)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors ${
                  filterVerdict === v
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {v.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm font-medium">
              No audit records found matching criteria.
            </div>
          ) : (
            filteredLogs.map((entry) => {
              const isPositive = (entry.pointsAwarded || 0) > 0;
              const isNegative = (entry.pointsAwarded || 0) < 0;

              return (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-purple-100 shadow-sm hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 p-2 rounded-xl ${
                        isPositive
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : isNegative
                          ? "bg-rose-100 text-rose-700 border border-rose-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {isPositive ? <Award className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {entry.teamName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-800 border border-purple-200">
                          {entry.verdict}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {entry.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 text-xs">
                    <span
                      className={`font-mono font-black text-sm ${
                        isPositive
                          ? "text-emerald-700"
                          : isNegative
                          ? "text-rose-700"
                          : "text-slate-600"
                      }`}
                    >
                      {isPositive ? `+${entry.pointsAwarded}` : entry.pointsAwarded} pts
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 px-6 bg-white border-t border-purple-100 text-xs text-slate-500 font-semibold flex justify-between items-center">
          <span>Total Log Records: {filteredLogs.length}</span>
          <span>CASYUM'26 Audit Protocol v1.0</span>
        </div>

      </div>
    </div>
  );
}
