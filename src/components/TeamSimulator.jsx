// CONNEXION - Team Simulator Tool for Admin Stress-Testing (Bright Theme)
import React, { useState } from "react";
import { Users, Play, Trash2, Cpu, CheckCircle2 } from "lucide-react";
import { mockSync } from "../firebase/mockSyncService";

const SAMPLE_COLLEGES = [
  "SRM Institute of Science and Technology", "IIT Madras", "Anna University CEG", 
  "BITS Pilani", "PSG College of Technology", "Stanford University",
  "SSN College of Engineering", "Vellore Institute of Technology", 
  "National Institute of Technology", "Loyola College Chennai"
];

const SAMPLE_TEAM_NAMES = [
  "Binary Bandits", "Cyber Ninjas", "Neural Nomads", "Silicon Knights",
  "Quantum Questers", "Byte Busters", "Data Dragons", "Kernel Panic",
  "Syntax Sorcerers", "Turing Titans", "Algorithmic Aces", "Git Gurus",
  "Stack Overflowers", "Cache Commanders", "Pixel Pioneers", "Bug Hunters",
  "Logic Lords", "Crypto Crew", "Terminal Terminators", "Cloud Crusaders"
];

export default function TeamSimulator({ onTeamsUpdated }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [spawnCount, setSpawnCount] = useState(20);

  const handleSpawnTeams = () => {
    setIsSimulating(true);
    try {
      const existing = mockSync.getTeams();
      for (let i = 0; i < spawnCount; i++) {
        const nameIdx = i % SAMPLE_TEAM_NAMES.length;
        const nameSuffix = i >= SAMPLE_TEAM_NAMES.length ? ` #${Math.floor(i / SAMPLE_TEAM_NAMES.length) + 1}` : "";
        const teamName = `${SAMPLE_TEAM_NAMES[nameIdx]}${nameSuffix}`;
        const collegeName = SAMPLE_COLLEGES[i % SAMPLE_COLLEGES.length];

        if (!existing.some(t => t.teamName.toLowerCase() === teamName.toLowerCase())) {
          mockSync.registerTeam({
            teamName,
            collegeName,
            members: [`Lead_${i + 1}`, `CoLead_${i + 1}`],
            contactEmail: `team${i + 1}@srm.edu`,
            contactPhone: `98765432${(i + 10).toString().slice(-2)}`
          });
        }
      }
      if (onTeamsUpdated) onTeamsUpdated();
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateAnswers = (question) => {
    if (!question) return;
    setIsSimulating(true);
    try {
      const teams = mockSync.getTeams();
      teams.forEach((team) => {
        const isCorrect = Math.random() < 0.75;
        let simulatedAnswer = isCorrect ? question.correctAnswer : "Misinterpreted Clue";
        if (question.type === "mcq") {
          simulatedAnswer = isCorrect ? question.correctAnswer : (question.options?.find(o => o !== question.correctAnswer) || "Wrong Option");
        }
        const remaining = Number((Math.random() * 23 + 4).toFixed(1));
        mockSync.submitAnswer(question.id, team.id, simulatedAnswer, remaining);
      });
      if (onTeamsUpdated) onTeamsUpdated();
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearTeams = () => {
    if (window.confirm("Clear all registered teams?")) {
      mockSync.save("cnx_teams", []);
      window.location.reload();
    }
  };

  return (
    <div className="rounded-2xl bg-purple-50/70 border-2 border-purple-200 p-4 shadow-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">
            Symposium Load & Team Simulator
          </h4>
          <p className="text-xs text-slate-500">
            Stress-test 50+ concurrent teams, live answers, and auto-scoring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white border border-purple-100 flex flex-col justify-between gap-2 shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-800">1. Spawn Teams</span>
            <p className="text-[11px] text-slate-500">Inject test teams with colleges</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <select
              value={spawnCount}
              onChange={(e) => setSpawnCount(Number(e.target.value))}
              className="bg-slate-50 border border-purple-200 text-xs text-slate-800 rounded-lg px-2 py-1 font-semibold"
            >
              <option value={15}>15 Teams</option>
              <option value={25}>25 Teams</option>
              <option value={50}>50 Teams</option>
            </select>
            <button
              onClick={handleSpawnTeams}
              disabled={isSimulating}
              className="flex-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Spawn
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-purple-100 flex flex-col justify-between gap-2 shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-800">2. Simulate Answers</span>
            <p className="text-[11px] text-slate-500">Submit random answers with speeds</p>
          </div>
          <button
            onClick={() => handleSimulateAnswers(mockSync.getQuestions()[0])}
            disabled={isSimulating}
            className="w-full mt-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-black transition-all shadow-sm"
          >
            Submit for Active Q
          </button>
        </div>

        <div className="p-3 rounded-xl bg-white border border-purple-100 flex flex-col justify-between gap-2 shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-800">3. Clear Test Roster</span>
            <p className="text-[11px] text-slate-500">Reset teams back to empty</p>
          </div>
          <button
            onClick={handleClearTeams}
            className="w-full mt-1 px-3 py-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-bold transition-all"
          >
            Clear Roster
          </button>
        </div>
      </div>
    </div>
  );
}
