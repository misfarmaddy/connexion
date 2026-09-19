// CONNEXION - Admin Command Center with AI Question Studio & Multi-Admin Security
import React, { useState } from "react";
import { 
  Shield, Play, Square, CheckCircle, XCircle, RotateCcw, 
  Users, Trophy, Eye, Zap, Tv, HelpCircle, 
  Settings, Award, Clock, ArrowRight, ExternalLink, ChevronDown, ChevronUp,
  Sparkles, Plus, Trash2, FileText, Upload, Youtube, Image as ImageIcon,
  Wand2, RefreshCw, Search, Check, AlertCircle, Copy, Key, UserCheck, 
  Lock, Mail, User, Layers, Brain, Lightbulb, Edit3, Shuffle
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import { useSound } from "../context/SoundContext";
import { mockSync } from "../firebase/mockSyncService";
import AuditLogModal from "../components/AuditLogModal";
import TeamSimulator from "../components/TeamSimulator";
import BackgroundCanvas from "../components/BackgroundCanvas";
import AdminManagementModal from "../components/AdminManagementModal";
import QuestionEditModal from "../components/QuestionEditModal";
import { 
  synthesizeQuestionsFromDataset, 
  generateSimilarQuestions, 
  extractYouTubeInfo 
} from "../utils/aiQuestionService";

export default function AdminPortal() {
  const { isAdmin, currentAdmin, loginAdmin, logoutAdmin } = useAuth();
  const { 
    roundState, 
    buzzerState, 
    questions, 
    activeQuestion, 
    round1Questions,
    round2Questions,
    round3Questions,
    teams, 
    scoreLog, 
    timeRemaining,
    updateRoundState,
    armBuzzer,
    resetBuzzer,
    triggerAutoScore,
    lockAndComputeTop15,
    resetGame,
    deleteTeam,
    clearAllTeams,
    resetRound,
    addQuestion,
    deleteQuestion,
    updateQuestion
  } = useGame();
  const { playCorrect, playWrong, playTick, playFanfare } = useSound();

  // Admin Login State
  const [loginIdentifier, setLoginIdentifier] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Portal View & Modal States
  const [adminSection, setAdminSection] = useState("live"); // "live", "teams", "questions", "leaderboard", "audit"
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [liveRoundView, setLiveRoundView] = useState(roundState.currentRound || 1);

  // AI Question Studio States
  const [questionSubTab, setQuestionSubTab] = useState("explorer"); // "explorer" | "ai_studio" | "similar"
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionRoundFilter, setQuestionRoundFilter] = useState("all");
  
  // AI Dataset Ingestion States
  const [aiDatasetType, setAiDatasetType] = useState("text"); // "text" | "pdf" | "youtube" | "images"
  const [aiTextContent, setAiTextContent] = useState("");
  const [aiYoutubeUrl, setAiYoutubeUrl] = useState("");
  const [aiTargetRound, setAiTargetRound] = useState(1);
  const [aiQuestionType, setAiQuestionType] = useState("text"); // "text" | "mcq"
  const [aiQuestionCount, setAiQuestionCount] = useState(2);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedDrafts, setAiGeneratedDrafts] = useState([]);
  const [aiNotice, setAiNotice] = useState({ type: "", text: "" });

  // Custom 4-Images Ingestion State
  const [customImageInputs, setCustomImageInputs] = useState([
    { label: "Clue 1", url: "" },
    { label: "Clue 2", url: "" },
    { label: "Clue 3", url: "" },
    { label: "Clue 4", url: "" }
  ]);
  const [customExpectedAnswer, setCustomExpectedAnswer] = useState("");

  // AI Similar Question Generator State
  const [similarTargetQ, setSimilarTargetQ] = useState(null);
  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState(false);
  const [similarDrafts, setSimilarDrafts] = useState([]);

  // Question Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState(null);

  const currentSubmissions = mockSync.getSubmissions(roundState.currentQuestionId);

  // Handle Admin Login with Username or Email + Password
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");

    const res = loginAdmin(loginIdentifier, loginPassword);
    if (!res.success) {
      setAuthError(res.message);
      playWrong();
    } else {
      setAuthError("");
      playCorrect();
    }
  };

  // ================= 1. ADMIN LOGIN GATE VIEW =================
  if (!isAdmin) {
    return (
      <div className="relative flex items-center justify-center px-4 py-4 sm:py-8">
        <BackgroundCanvas />

        <div className="relative z-10 w-full max-w-md">
          <div className="p-[2.5px] rounded-[2.5rem] bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)]">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.4rem] p-6 sm:p-8 text-center shadow-inner">
              
              {/* Shield Icon Badge */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Shield className="w-8 h-8 fill-current text-yellow-300 animate-pulse" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-950 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>CASYUM'26 BCA Command Gate</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Admin Control Gate</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 font-medium">
                Authorized symposium officials &amp; quiz masters only
              </p>

              {authError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5 text-left">
                {/* Username or Email Input */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Username or Email *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter username or email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-pink-600" />
                    <span>Password *</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <span>Access Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Security Advisory */}
              <div className="mt-5 pt-4 border-t border-purple-100 dark:border-purple-900/60 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Encrypted Session &bull; Symposium Operations Control</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= ROUND CONTROLS & SHUFFLING =================
  const handlePushQuestion = (qId) => {
    const targetQ = questions.find(item => item.id === qId);
    updateRoundState({
      currentRound: targetQ?.round || 1,
      activeGroup: targetQ?.group || roundState.activeGroup,
      currentQuestionId: qId,
      status: "live",
      duration: targetQ?.round === 1 ? 30 : 20,
      questionStartTimestamp: Date.now()
    });
    playTick();
  };

  const handleSelectQuestion = (qId) => {
    const targetQ = questions.find(q => q.id === qId);
    if (!targetQ) return;
    updateRoundState({
      currentRound: targetQ.round,
      activeGroup: targetQ.group || roundState.activeGroup,
      currentQuestionId: qId,
      status: "waiting",
      duration: targetQ.round === 1 ? 30 : 20,
      questionStartTimestamp: null
    });
    playTick();
  };

  const handleShuffleQuestion = (roundNum, grp = null) => {
    let pool = questions.filter(q => q.round === roundNum);
    if (roundNum === 2 && grp) {
      pool = pool.filter(q => q.group === grp);
    }
    if (pool.length === 0) return;
    const others = pool.filter(q => q.id !== roundState.currentQuestionId);
    const chosen = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : pool[0];
    updateRoundState({
      currentRound: roundNum,
      activeGroup: chosen.group || grp || roundState.activeGroup,
      currentQuestionId: chosen.id,
      status: "waiting",
      duration: roundNum === 1 ? 30 : 20,
      questionStartTimestamp: null
    });
    playTick();
  };

  const handleStartTimer = () => {
    updateRoundState({ status: "live", questionStartTimestamp: Date.now() });
    playTick();
  };

  const handleForceEnd = () => {
    updateRoundState({ status: "locked" });
    playWrong();
  };

  const handleRevealAnswer = () => {
    updateRoundState({ status: "revealed" });
    playTick();
  };

  const handleAutoScore = () => {
    const result = triggerAutoScore(roundState.currentQuestionId);
    playCorrect();
    alert(`Auto-Scoring Completed! Correct: ${result.correctCount} | Wrong: ${result.wrongCount} | Total: ${result.total}`);
  };

  const handleNextQuestion = (shouldAutoStart = false) => {
    const autoStartTimer = shouldAutoStart === true;
    if (roundState.currentRound === 1) {
      // Auto-score pending submissions if any exist
      if (currentSubmissions.length > 0 && roundState.status !== "waiting") {
        try { triggerAutoScore(roundState.currentQuestionId); } catch(e) {}
      }

      const coreQuestions = round1Questions.filter(q => !q.isBackup && !q.isSuddenDeath);
      let curIdx = coreQuestions.findIndex(q => q.id === roundState.currentQuestionId);
      if (curIdx === -1 && roundState.currentQuestionId) {
        const prefix = roundState.currentQuestionId.split('_').slice(0, 2).join('_');
        curIdx = coreQuestions.findIndex(q => q.id === prefix);
      }

      let nextQ = null;
      if (curIdx === -1) {
        // If current question is missing or not in core list, start from Question 1
        nextQ = coreQuestions[0] || round1Questions[0];
      } else if (curIdx < coreQuestions.length - 1) {
        // Advance to next core question
        nextQ = coreQuestions[curIdx + 1];
      } else {
        // Reached end of core questions: check backup pool first, else cycle back to Q1
        const fullList = round1Questions.filter(q => !q.isSuddenDeath);
        const fullIdx = fullList.findIndex(q => q.id === roundState.currentQuestionId);
        if (fullIdx >= 0 && fullIdx < fullList.length - 1) {
          nextQ = fullList[fullIdx + 1];
        } else {
          // Wrap around safely so admin never gets blocked
          nextQ = coreQuestions[0] || round1Questions[0];
        }
      }

      if (nextQ) {
        updateRoundState({
          currentRound: 1,
          currentQuestionId: nextQ.id,
          status: autoStartTimer ? "live" : "waiting",
          duration: 30,
          questionStartTimestamp: autoStartTimer ? Date.now() : null
        });
        playTick();
      }
    } else if (roundState.currentRound === 2) {
      const grpPool = round2Questions.filter(q => q.group === roundState.activeGroup);
      let curIdx = grpPool.findIndex(q => q.id === roundState.currentQuestionId);
      if (curIdx === -1 && roundState.currentQuestionId) {
        const prefix = roundState.currentQuestionId.split('_').slice(0, 3).join('_');
        curIdx = grpPool.findIndex(q => q.id === prefix);
      }
      let nextQ = null;
      if (curIdx === -1) {
        nextQ = grpPool[0] || round2Questions[0];
      } else if (curIdx < grpPool.length - 1) {
        nextQ = grpPool[curIdx + 1];
      } else {
        nextQ = grpPool[0]; // loop safely
      }
      if (nextQ) {
        updateRoundState({
          currentRound: 2,
          currentQuestionId: nextQ.id,
          status: autoStartTimer ? "live" : "waiting",
          duration: 20,
          questionStartTimestamp: autoStartTimer ? Date.now() : null
        });
        resetBuzzer();
        playTick();
      }
    } else if (roundState.currentRound === 3) {
      const curIdx = round3Questions.findIndex(q => q.id === roundState.currentQuestionId);
      let nextQ = null;
      if (curIdx === -1) {
        nextQ = round3Questions[0];
      } else if (curIdx < round3Questions.length - 1) {
        nextQ = round3Questions[curIdx + 1];
      } else {
        nextQ = round3Questions[0]; // loop safely
      }
      if (nextQ) {
        updateRoundState({
          currentRound: 3,
          currentQuestionId: nextQ.id,
          status: autoStartTimer ? "live" : "waiting",
          duration: 20,
          questionStartTimestamp: autoStartTimer ? Date.now() : null
        });
        resetBuzzer();
        playTick();
      }
    }
  };

  const handleNextAndStartTimer = () => {
    handleNextQuestion(true);
  };

  const handleResetRound = () => {
    const rNum = roundState.currentRound || 1;
    if (window.confirm(`🔄 RESET ROUND ${rNum}?\n\nThis will return to Question 1 of Round ${rNum}, reset the 30s timer, and clear submissions for this round. Continue?`)) {
      resetRound(rNum);
      playTick();
    }
  };

  const handleDeleteTeam = (teamId, teamName) => {
    if (window.confirm(`🗑️ Delete team "${teamName}"?\n\nThis team and their submissions will be permanently removed. Continue?`)) {
      deleteTeam(teamId);
      playWrong();
    }
  };

  const handleClearAllTeams = () => {
    if (window.confirm(`⚠️ CLEAR ALL REGISTERED TEAMS (${teams.length})?\n\nThis will permanently delete all test, sample, and registered teams, along with all team scores and submissions.\n\nAre you sure you want to proceed?`)) {
      clearAllTeams();
      playWrong();
    }
  };

  const handleLockTop15 = () => {
    const res = lockAndComputeTop15();
    if (res.hasTie) {
      alert(`⚠️ TIE DETECTED AT RANK 15! ${res.tiedTeams.length} teams tied. Sudden Death initiated!`);
    } else {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      playFanfare();
      alert("🎉 Top 15 locked and seeded into 3 Round 2 groups successfully!");
    }
  };

  const handleArmBuzzer = (group, qId) => {
    armBuzzer(group, qId || activeQuestion?.id);
    playTick();
  };

  const handleBuzzerVerdict = (isCorrect) => {
    if (!buzzerState.firstBuzz) return;
    const { teamId, teamName } = buzzerState.firstBuzz;
    const pts = isCorrect ? (roundState.currentRound === 3 ? 30 : 20) : -10;

    const team = teams.find(t => t.id === teamId);
    if (team) {
      const newScore = Math.max(0, (team.score || 0) + pts);
      mockSync.updateTeam(teamId, { score: newScore });
      mockSync.logScore({
        teamId,
        teamName,
        round: roundState.currentRound,
        delta: pts,
        reason: isCorrect ? "Buzzer Answer Correct" : "Buzzer Answer Wrong (Penalty)",
        timestamp: Date.now()
      });
    }

    if (isCorrect) {
      playCorrect();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } else {
      playWrong();
    }
    resetBuzzer();
  };

  const handleCrownWinner = (team) => {
    confetti({ particleCount: 250, spread: 100, origin: { y: 0.5 } });
    playFanfare();
    alert(`🏆 CHAMPION CROWNED! Congratulations to ${team.teamName} from ${team.collegeName}!`);
  };

  // ================= AI QUESTION SYNTHESIS HANDLERS =================
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setAiTextContent(typeof content === "string" ? content : "");
      setAiNotice({ type: "success", text: `Loaded file '${file.name}' (${(file.size / 1024).toFixed(1)} KB)` });
    };
    reader.readAsText(file);
  };

  const handleRunAiSynthesis = async () => {
    setAiNotice({ type: "", text: "" });
    setIsAiGenerating(true);

    try {
      let customImagesPayload = [];
      if (aiDatasetType === "images") {
        customImagesPayload = customImageInputs.map((item, idx) => ({
          label: item.label || `Clue #${idx + 1}`,
          url: item.url.trim(),
          expectedAnswer: customExpectedAnswer.trim()
        }));
      }

      const generated = await synthesizeQuestionsFromDataset({
        datasetType: aiDatasetType,
        textContent: aiTextContent,
        youtubeUrl: aiYoutubeUrl,
        customImages: customImagesPayload,
        targetRound: aiTargetRound,
        questionType: aiQuestionType,
        count: aiQuestionCount
      });

      setAiGeneratedDrafts(generated);
      setAiNotice({ type: "success", text: `AI successfully synthesized ${generated.length} connection questions!` });
      playCorrect();
    } catch (err) {
      setAiNotice({ type: "error", text: "Failed to generate questions. Please verify dataset inputs." });
      playWrong();
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApproveDraft = (draft) => {
    addQuestion(draft);
    setAiGeneratedDrafts(prev => prev.filter(d => d.id !== draft.id));
    setAiNotice({ type: "success", text: `Question '${draft.title}' approved and added to Question Bank!` });
    playTick();
  };

  const handleApproveAllDrafts = () => {
    aiGeneratedDrafts.forEach(draft => addQuestion(draft));
    setAiGeneratedDrafts([]);
    setAiNotice({ type: "success", text: `All ${aiGeneratedDrafts.length} questions approved and added!` });
    playCorrect();
  };

  const handleRunGenerateSimilar = async (targetQ) => {
    setSimilarTargetQ(targetQ);
    setQuestionSubTab("similar");
    setIsGeneratingSimilar(true);
    try {
      const similar = await generateSimilarQuestions(targetQ, 2);
      setSimilarDrafts(similar);
      playCorrect();
    } catch (err) {
      alert("Failed to generate similar questions.");
      playWrong();
    } finally {
      setIsGeneratingSimilar(false);
    }
  };

  // Filtered Questions Explorer
  const filteredQuestions = questions.filter(q => {
    const matchRound = questionRoundFilter === "all" ? true : 
      questionRoundFilter === "sudden" ? q.isSuddenDeath : 
      q.round === Number(questionRoundFilter);
    const matchSearch = !questionSearch.trim() ? true : 
      (q.title?.toLowerCase().includes(questionSearch.toLowerCase()) || 
       q.prompt?.toLowerCase().includes(questionSearch.toLowerCase()) || 
       q.correctAnswer?.toLowerCase().includes(questionSearch.toLowerCase()) ||
       q.id?.toLowerCase().includes(questionSearch.toLowerCase()));
    return matchRound && matchSearch;
  });

  const currentR1Core = round1Questions.filter(q => !q.isBackup && !q.isSuddenDeath);
  const currentR1Idx = currentR1Core.findIndex(q => q.id === roundState.currentQuestionId);
  const currentR1QNum = currentR1Idx >= 0 ? currentR1Idx + 1 : 1;
  const nextR1QNum = currentR1Idx >= 0 && currentR1Idx < currentR1Core.length - 1 
    ? currentR1Idx + 2 
    : (currentR1Idx >= currentR1Core.length - 1 ? 1 : 2);

  return (
    <div className="relative min-h-screen">
      <BackgroundCanvas variant="admin" showFloaters={false} />

      {/* Admin Credentials & Multi-Admin Modal */}
      <AdminManagementModal 
        isOpen={showAdminSettings} 
        onClose={() => setShowAdminSettings(false)} 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        
        {/* 1. ADMIN TOP BAR & SYSTEM STATS */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border-2 border-purple-200 dark:border-purple-800/60 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-purple-600/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                  Admin Command Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">
                  {currentAdmin?.name || "BCA Quiz Master"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero-Bias Live Referee &bull; CASYUM'26 Symposium Image Quiz
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="/display"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-500/20"
            >
              <Tv className="w-4 h-4" />
              <span>Big Screen</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            <button
              onClick={() => setShowAdminSettings(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
              title="Admin Accounts & Security"
            >
              <Settings className="w-4 h-4" />
              <span>Admin Accounts</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 2. SECTION NAVIGATION SWITCHER */}
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-purple-200/80">
          {[
            { id: "live", label: "⚡ Live Control" },
            { id: "teams", label: `📋 Teams Roster (${teams.length})` },
            { id: "questions", label: `❓ Questions & AI Studio (${questions.length})` },
            { id: "leaderboard", label: "🏆 Leaderboard View" },
            { id: "audit", label: `📜 Audit Trail (${scoreLog.length})` },
          ].map((tab) => {
            const isActive = adminSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminSection(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-purple-500/25"
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-purple-700 border border-purple-100 dark:border-purple-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3. LIVE CONTROL SECTION */}
        {adminSection === "live" && (
          <div className="space-y-6">
            <div className="bg-white/95 dark:bg-slate-900/95 p-3 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-sm flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-2">
                Select Round to Control:
              </span>
              <div className="flex gap-1.5">
                {[
                  { r: 1, label: "Round 1 (Connections)" },
                  { r: 2, label: "Round 2 (Buzzer Groups)" },
                  { r: 3, label: "Round 3 (Grand Finals)" },
                ].map(({ r, label }) => (
                  <button
                    key={r}
                    onClick={() => {
                      setLiveRoundView(r);
                      updateRoundState({ currentRound: r });
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                      liveRoundView === r
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {liveRoundView === 1 && (
              <div className="space-y-6">
                <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border-2 border-purple-200 dark:border-purple-800 p-6 shadow-sm space-y-4">
                  {/* Round 1 Question Navigation & Shuffle Bar */}
                  <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-purple-100 dark:border-purple-800/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase text-purple-700 dark:text-purple-300">
                        Round 1 Bank ({round1Questions.length} Qs):
                      </span>
                      <select
                        value={roundState.currentQuestionId}
                        onChange={(e) => handleSelectQuestion(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <optgroup label="Core Questions (10)">
                          {round1Questions.filter(q => !q.isBackup).map(q => (
                            <option key={q.id} value={q.id}>
                              {q.id.replace("r1_", "")} — {q.title}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Backup Questions (10)">
                          {round1Questions.filter(q => q.isBackup).map(q => (
                            <option key={q.id} value={q.id}>
                              🎲 [Backup] {q.id.replace("r1_", "")} — {q.title}
                            </option>
                          ))}
                        </optgroup>
                        {questions.filter(q => q.isSuddenDeath).length > 0 && (
                          <optgroup label="⚡ Sudden Death Tiebreakers">
                            {questions.filter(q => q.isSuddenDeath).map(q => (
                              <option key={q.id} value={q.id}>
                                ⚡ {q.id} — {q.title}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    <button
                      onClick={() => handleShuffleQuestion(1)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-black flex items-center gap-1.5 transition-colors border border-purple-300 dark:border-purple-700 shadow-sm"
                      title="Pick a random question from Round 1 bank"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-purple-600" />
                      <span>Shuffle Question</span>
                    </button>
                  </div>

                  {/* Active Question Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Active Stage Question</span>
                        {activeQuestion?.isBackup && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            🎲 Backup Pool
                          </span>
                        )}
                        {activeQuestion?.tamilCategory && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                            🎬 {activeQuestion.tamilCategory}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeQuestion?.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                          roundState.status === "live" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                          roundState.status === "locked" ? "bg-rose-100 text-rose-800 border border-rose-300" :
                          roundState.status === "revealed" ? "bg-purple-100 text-purple-800 border border-purple-300" :
                          "bg-slate-100 text-slate-600"
                        }`}>{roundState.status}</span>
                      </div>
                    </div>
                    <span className="text-3xl font-black font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-4 py-1.5 rounded-2xl border border-purple-200">
                      {(Number(timeRemaining) || 0).toFixed(1)}s
                    </span>
                  </div>

                  {/* Clues Preview */}
                  {activeQuestion?.clues && activeQuestion.clues.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {activeQuestion.clues.map((c, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800 bg-slate-100">
                          <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-white truncate text-center">
                            #{idx + 1}: {c.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 p-4 rounded-2xl border border-purple-100 dark:border-purple-800 space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Prompt: {activeQuestion?.prompt}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Answer: {activeQuestion?.correctAnswer}</p>
                  </div>

                  {/* Post-30s Question Concluded Banner with Quick Next Question Action */}
                  {(timeRemaining <= 0 || roundState.status === "locked" || roundState.status === "revealed") && roundState.status !== "waiting" && (
                    <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md animate-in fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 block">
                            30-Second Time's Up &bull; Question Concluded
                          </span>
                          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                            Submissions ({currentSubmissions.length}) collected. Ready to auto-score, reveal solution, or proceed directly to Next Question.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {roundState.status !== "revealed" && (
                          <button
                            onClick={handleRevealAnswer}
                            className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Reveal Answer</span>
                          </button>
                        )}
                        <button
                          onClick={handleNextAndStartTimer}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400 cursor-pointer animate-pulse"
                          title="Advances to next question AND starts the 30s countdown immediately!"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Next &amp; Start 30s (Q{nextR1QNum}/10)</span>
                        </button>
                        <button
                          onClick={() => handleNextQuestion(false)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <span>Next (Prepare)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleResetRound}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="Reset Round 1 back to Question 1"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reset Round</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button onClick={handleNextAndStartTimer} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer">
                      <Play className="w-4 h-4 fill-current" /> Next &amp; Start 30s (Q{nextR1QNum}/10)
                    </button>
                    <button onClick={handleStartTimer} className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer">
                      <Play className="w-4 h-4 fill-current" /> Start 30s Timer
                    </button>
                    <button onClick={handleForceEnd} className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer">
                      <Square className="w-4 h-4 fill-current" /> Force End &amp; Lock
                    </button>
                    <button onClick={handleRevealAnswer} className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer">
                      <Eye className="w-4 h-4" /> Reveal Answer
                    </button>
                    <button onClick={handleAutoScore} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer">
                      <Zap className="w-4 h-4 fill-current text-yellow-200" /> Auto-Score Submissions ({currentSubmissions.length})
                    </button>
                    <button onClick={() => handleNextQuestion(false)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer">
                      <span>Next (Prepare)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleResetRound}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                      title="Reset Round 1 back to Question 1 and clear round submissions"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      <span>Reset Round 1</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-sm">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Round 1 Top 15 Final Cutoff</h4>
                    <p className="text-xs text-slate-500">Lock standings and seed qualified teams into Groups A, B, C</p>
                  </div>
                  <button onClick={handleLockTop15} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md">
                    🏆 Compute &amp; Seed Top 15
                  </button>
                </div>
              </div>
            )}

            {liveRoundView === 2 && (
              <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border-2 border-purple-200 dark:border-purple-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Round 2: Stage Buzzer Battles</h3>
                    <p className="text-xs text-slate-500">30 Questions Total (10 per Group) • Fast lockout • Correct +20 pts, Wrong -5 pts</p>
                  </div>
                  <div className="flex gap-2">
                    {["A", "B", "C"].map(grp => (
                      <button
                        key={grp}
                        onClick={() => {
                          updateRoundState({ activeGroup: grp });
                          const firstOfGrp = round2Questions.find(q => q.group === grp);
                          if (firstOfGrp) handleSelectQuestion(firstOfGrp.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                          roundState.activeGroup === grp ? "bg-purple-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Group {grp} ({round2Questions.filter(q => q.group === grp).length} Qs)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group Question Selector & Shuffle */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-purple-100 dark:border-purple-800/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase text-purple-700 dark:text-purple-300">
                      Group {roundState.activeGroup} Questions:
                    </span>
                    <select
                      value={roundState.currentQuestionId}
                      onChange={(e) => handleSelectQuestion(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {round2Questions.filter(q => q.group === roundState.activeGroup).map(q => (
                        <option key={q.id} value={q.id}>
                          {q.id} — {q.title} ({q.correctAnswer})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleShuffleQuestion(2, roundState.activeGroup)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-black flex items-center gap-1.5 transition-colors border border-purple-300 dark:border-purple-700 shadow-sm"
                    title={`Pick a random question from Group ${roundState.activeGroup}`}
                  >
                    <Shuffle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Shuffle Group {roundState.activeGroup}</span>
                  </button>
                </div>

                {/* Active Question Clues & Prompt */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-purple-100 dark:border-purple-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-600">Active Buzzer Question</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{activeQuestion?.title}</h4>
                    </div>
                    {activeQuestion?.tamilCategory && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        {activeQuestion.tamilCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{activeQuestion?.prompt}</p>

                  {/* Clues */}
                  {activeQuestion?.clues && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {activeQuestion.clues.map((c, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800 bg-slate-100">
                          <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-white truncate text-center">
                            #{idx + 1}: {c.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs">
                    Answer: <strong className="text-emerald-700 dark:text-emerald-400 font-black">{activeQuestion?.correctAnswer}</strong>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleArmBuzzer(roundState.activeGroup)} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer">
                    <Zap className="w-4 h-4 fill-current" /> Arm Group {roundState.activeGroup} Buzzer
                  </button>
                  <button onClick={resetBuzzer} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer">
                    Reset Buzzer
                  </button>
                  <button onClick={() => handleNextQuestion(false)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer">
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={handleResetRound} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer">
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Reset Round 2</span>
                  </button>
                </div>

                {buzzerState.firstBuzz && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-800">1st Buzzer Press</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{buzzerState.firstBuzz.teamName}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleBuzzerVerdict(true)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                        Correct (+20 pts)
                      </button>
                      <button onClick={() => handleBuzzerVerdict(false)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">
                        Wrong (-5 pts)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {liveRoundView === 3 && (
              <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border-2 border-purple-200 dark:border-purple-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Round 3: Grand Finale Championship</h3>
                    <p className="text-xs text-slate-500">20 Championship Questions (10 Core + 10 Backup) • Top 3 Finalists</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleArmBuzzer("ALL")} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer">
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Arm Finals Buzzer</span>
                    </button>
                    <button onClick={resetBuzzer} className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer">
                      Reset
                    </button>
                    <button onClick={() => handleNextQuestion(false)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer">
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={handleResetRound} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset Finals</span>
                    </button>
                  </div>
                </div>

                {/* Round 3 Question Selector & Shuffle */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-purple-100 dark:border-purple-800/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase text-purple-700 dark:text-purple-300">
                      Finals Question Bank ({round3Questions.length} Qs):
                    </span>
                    <select
                      value={roundState.currentQuestionId}
                      onChange={(e) => handleSelectQuestion(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <optgroup label="Core Finals Questions (10)">
                        {round3Questions.filter(q => !q.isBackup).map(q => (
                          <option key={q.id} value={q.id}>
                            {q.id} — {q.title}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Backup Finals Questions (10)">
                        {round3Questions.filter(q => q.isBackup).map(q => (
                          <option key={q.id} value={q.id}>
                            🎲 [Backup] {q.id} — {q.title}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <button
                    onClick={() => handleShuffleQuestion(3)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-black flex items-center gap-1.5 transition-colors border border-purple-300 dark:border-purple-700 shadow-sm"
                    title="Pick a random question from Round 3 bank"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Shuffle Finals</span>
                  </button>
                </div>

                {/* Active Question Clues & Prompt */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-purple-100 dark:border-purple-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-600">Active Finals Question</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{activeQuestion?.title}</h4>
                    </div>
                    {activeQuestion?.tamilCategory && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        {activeQuestion.tamilCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{activeQuestion?.prompt}</p>

                  {/* Clues */}
                  {activeQuestion?.clues && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {activeQuestion.clues.map((c, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800 bg-slate-100">
                          <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-white truncate text-center">
                            #{idx + 1}: {c.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs">
                    Answer: <strong className="text-emerald-700 dark:text-emerald-400 font-black">{activeQuestion?.correctAnswer}</strong>
                  </div>
                </div>

                {buzzerState.firstBuzz && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-800">1st Buzzer Press</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{buzzerState.firstBuzz.teamName}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleBuzzerVerdict(true)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                        Correct (+30 pts)
                      </button>
                      <button onClick={() => handleBuzzerVerdict(false)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">
                        Wrong (-10 pts)
                      </button>
                    </div>
                  </div>
                )}

                {/* Final 3 Teams Podium */}
                <h4 className="text-xs font-black uppercase text-slate-500 pt-2">Qualified Finalist Teams</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {teams.filter(t => t.qualifiedFinal).map((team, idx) => (
                    <div key={team.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-800 text-center space-y-2">
                      <span className="w-9 h-9 mx-auto rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-sm">#{idx + 1}</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{team.teamName}</h4>
                      <div className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">{team.score} pts</div>
                      <button onClick={() => handleCrownWinner(team)} className="w-full py-2 bg-gradient-to-r from-amber-500 to-pink-600 text-white font-black text-xs rounded-xl shadow-md">
                        👑 Crown Champion
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. TEAMS ROSTER SECTION */}
        {adminSection === "teams" && (
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border-2 border-purple-200 dark:border-purple-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Registered Teams ({teams.length})</h3>
                <span className="text-xs text-slate-500 font-semibold">Ranked by Score then Avg Speed</span>
              </div>
              {teams.length > 0 && (
                <button
                  onClick={handleClearAllTeams}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Permanently remove all sample and registered test teams"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Test Teams ({teams.length})</span>
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-300 uppercase font-mono border-b border-purple-100">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Team Code</th>
                    <th className="p-3">Team Name</th>
                    <th className="p-3">Leader &amp; Members</th>
                    <th className="p-3">College</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Avg Speed</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {teams.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/30">
                      <td className="p-3 font-mono font-bold text-purple-700 dark:text-purple-400">#{idx + 1}</td>
                      <td className="p-3 font-mono font-black text-amber-600">
                        <span className="bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          {t.teamCode || "—"}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{t.teamName}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-bold text-purple-900 dark:text-purple-300">
                          <span>👑</span>
                          <span>{t.leaderName || (t.members && t.members[0]) || "Leader"}</span>
                        </div>
                        {t.members && t.members.length > 1 && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t.members.slice(1).join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{t.collegeName}</td>
                      <td className="p-3 font-mono font-black text-pink-600">{t.score || 0}</td>
                      <td className="p-3 font-mono text-slate-500">{t.totalResponseTime ? `${t.totalResponseTime}s` : "-"}</td>
                      <td className="p-3">
                        {t.qualifiedFinal ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">Finalist</span>
                        ) : t.qualifiedRound2 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Round 2 (Grp {t.round2Group})</span>
                        ) : (
                          <span className="text-slate-500 font-medium">Round 1</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteTeam(t.id, t.teamName)}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all active:scale-95 cursor-pointer"
                          title={`Delete team "${t.teamName}"`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 5. QUESTIONS & AI STUDIO (MAIN REQUESTED FEATURE) ================= */}
        {adminSection === "questions" && (
          <div className="space-y-5">
            
            {/* Questions Header & Sub-Tab Bar */}
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border-2 border-purple-200 dark:border-purple-800 p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white">
                      <Brain className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Questions &amp; AI Question Studio
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage active questions or synthesize brand new connection challenges from PDF, TXT, YouTube, &amp; images.
                  </p>
                </div>

                {/* Sub-Tabs */}
                <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-purple-200 dark:border-purple-800">
                  <button
                    onClick={() => setQuestionSubTab("explorer")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      questionSubTab === "explorer"
                        ? "bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-300 shadow-sm border border-purple-200"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Question Bank ({questions.length})</span>
                  </button>

                  <button
                    onClick={() => setQuestionSubTab("ai_studio")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      questionSubTab === "ai_studio"
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-purple-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>AI Dataset Studio</span>
                  </button>

                  <button
                    onClick={() => setQuestionSubTab("similar")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      questionSubTab === "similar"
                        ? "bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-300 shadow-sm border border-purple-200"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Similar Generator</span>
                  </button>
                </div>
              </div>

              {aiNotice.text && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                  aiNotice.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300" 
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {aiNotice.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{aiNotice.text}</span>
                </div>
              )}
            </div>

            {/* SUB-TAB A: QUESTION BANK EXPLORER */}
            {questionSubTab === "explorer" && (
              <div className="space-y-4">
                <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  
                  {/* Search bar */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search title, prompt, answer, or ID..."
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-purple-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Round filter tabs */}
                  <div className="flex gap-1 overflow-x-auto w-full sm:w-auto">
                    {[
                      { id: "all", label: "All" },
                      { id: "1", label: "Round 1" },
                      { id: "2", label: "Round 2" },
                      { id: "3", label: "Round 3" },
                      { id: "sudden", label: "Sudden Death" },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setQuestionRoundFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          questionRoundFilter === f.id
                            ? "bg-purple-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        if (window.confirm("Reload Official Tamil Connection Question Bank (80% Kollywood & Tamil Culture, 20% Tech)?")) {
                          mockSync.resetQuestionsToDefault();
                          window.location.reload();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-black shadow-sm hover:opacity-95 flex items-center gap-1"
                      title="Reset question bank to official Tamil connection seed"
                    >
                      <span>✨ Reload Tamil Bank</span>
                    </button>
                  </div>
                </div>

                {/* Question Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className={`p-5 rounded-3xl border-2 transition-all space-y-3 ${
                        q.id === roundState.currentQuestionId
                          ? "bg-purple-50/90 dark:bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10"
                          : "bg-white/95 dark:bg-slate-900/95 border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-pink-600 text-xs px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800">
                              {q.id}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                              Round {q.round} {q.isSuddenDeath ? "(Tiebreaker)" : ""}
                            </span>
                            {q.tamilCategory && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                🎬 {q.tamilCategory}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {q.type?.toUpperCase()}
                            </span>
                            {q.isAiGenerated && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-pink-500 text-white shadow-xs">
                                🤖 AI Synthesized
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1.5">{q.title}</h4>
                        </div>
                        <span className="font-mono font-black text-purple-700 dark:text-purple-300 text-xs">
                          {q.points} pts
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {q.prompt}
                      </p>

                      {/* 4 Image Clue Thumbnails */}
                      {q.clues && q.clues.length > 0 && (
                        <div className="grid grid-cols-4 gap-1.5 py-1">
                          {q.clues.map((c, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-purple-200 dark:border-purple-800 bg-slate-100 group">
                              <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-white p-0.5 truncate font-bold text-center">
                                #{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs space-y-1">
                        <div>
                          Answer: <strong className="text-emerald-700 dark:text-emerald-400 font-black">{q.correctAnswer}</strong>
                        </div>
                        {q.explanation && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {q.explanation}
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-purple-100 dark:border-purple-800/60">
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => handlePushQuestion(q.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 shadow-sm"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Push Live</span>
                          </button>

                          <button
                            onClick={() => setEditingQuestion(q)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 hover:bg-purple-100 flex items-center gap-1"
                            title="Edit question clues, title, images, and answer"
                          >
                            <Edit3 className="w-3 h-3 text-purple-600" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleRunGenerateSimilar(q)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 hover:bg-amber-100 flex items-center gap-1"
                            title="Generate similar connection questions"
                          >
                            <Wand2 className="w-3 h-3 text-amber-600" />
                            <span>Similar</span>
                          </button>
                        </div>

                        {questions.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete question '${q.title}'?`)) {
                                deleteQuestion(q.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB B: AI DATASET INGESTION & GENERATOR */}
            {questionSubTab === "ai_studio" && (
              <div className="space-y-6">
                
                {/* Dataset Ingestion Input Card */}
                <div className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-purple-200 dark:border-purple-800 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        AI Connection Dataset Ingestion Hub
                      </h4>
                    </div>
                    <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                      Step 1: Choose Dataset Source
                    </span>
                  </div>

                  {/* Dataset Type Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "text", label: "Text / Syllabus", icon: FileText },
                      { id: "pdf", label: "Upload Document / PDF", icon: Upload },
                      { id: "youtube", label: "YouTube Video URL", icon: Youtube },
                      { id: "images", label: "Custom 4-Images", icon: ImageIcon }
                    ].map(src => {
                      const Icon = src.icon;
                      const isSelected = aiDatasetType === src.id;
                      return (
                        <button
                          key={src.id}
                          type="button"
                          onClick={() => setAiDatasetType(src.id)}
                          className={`p-3 rounded-2xl text-xs font-black flex flex-col items-center gap-2 transition-all border-2 ${
                            isSelected
                              ? "bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-300 shadow-md"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:border-purple-300"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? "text-purple-600" : "text-slate-400"}`} />
                          <span>{src.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dataset Inputs based on Selection */}
                  <div className="space-y-3 pt-2">
                    
                    {/* Source: Raw Text / Syllabus */}
                    {aiDatasetType === "text" && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Paste Tamil Cinema Topics, Kollywood Movie Notes, or General Themes *
                        </label>
                        <textarea
                          rows={4}
                          placeholder="e.g. Kollywood movies, Vijay, Rajinikanth, Leo, Jailer, Amaran, Anirudh BGM hits, AR Rahman songs, Vadivelu comedy dialogues, Chennai culture, Abdul Kalam, Sundar Pichai..."
                          value={aiTextContent}
                          onChange={(e) => setAiTextContent(e.target.value)}
                          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    )}

                    {/* Source: File / PDF Upload */}
                    {aiDatasetType === "pdf" && (
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-purple-300 rounded-2xl p-6 text-center bg-purple-50/40 dark:bg-purple-950/20">
                          <Upload className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-xs font-black uppercase text-purple-700 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow border border-purple-200 hover:bg-purple-50">
                              Browse PDF / Text File
                            </span>
                            <input type="file" accept=".txt,.pdf,.md,.doc" onChange={handleFileUpload} className="hidden" />
                          </label>
                          <p className="text-[11px] text-slate-500 mt-2">
                            Upload movie question notes, symposium quiz docs, or syllabus files (.txt, .pdf)
                          </p>
                        </div>

                        {aiTextContent && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto">
                            <strong>Dataset Preview:</strong>
                            <p className="font-mono text-[11px] mt-1 line-clamp-3">{aiTextContent}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Source: YouTube URL */}
                    {aiDatasetType === "youtube" && (
                      <div className="space-y-3">
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          YouTube Video / Movie Trailer / Song / Connexion Episode URL *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="e.g. https://www.youtube.com/watch?v=... (Kollywood movie trailer, Vijay TV Connexion show, or tech talk)"
                            value={aiYoutubeUrl}
                            onChange={(e) => setAiYoutubeUrl(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          AI will analyze video title, context &amp; keywords to synthesize 4-clue image connection puzzles.
                        </p>
                      </div>
                    )}

                    {/* Source: Custom 4-Images Set */}
                    {aiDatasetType === "images" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {customImageInputs.map((img, idx) => (
                            <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-purple-100 space-y-1.5">
                              <span className="text-[11px] font-black uppercase text-purple-700">
                                Clue #{idx + 1} Image URL
                              </span>
                              <input
                                type="url"
                                placeholder={`https://images.unsplash.com/...`}
                                value={img.url}
                                onChange={(e) => {
                                  const copy = [...customImageInputs];
                                  copy[idx].url = e.target.value;
                                  setCustomImageInputs(copy);
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono text-slate-900 dark:text-white"
                              />
                              <input
                                type="text"
                                placeholder={`Clue #${idx + 1} Description Label`}
                                value={img.label}
                                onChange={(e) => {
                                  const copy = [...customImageInputs];
                                  copy[idx].label = e.target.value;
                                  setCustomImageInputs(copy);
                                }}
                                className="w-full px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                            Central Connecting Solution Answer *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Turing Machine"
                            value={customExpectedAnswer}
                            onChange={(e) => setCustomExpectedAnswer(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-200 text-sm font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Parameters: Target Round, Format & Count */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-purple-100">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Target Round
                        </label>
                        <select
                          value={aiTargetRound}
                          onChange={(e) => setAiTargetRound(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value={1}>Round 1 (Image Connection Challenge)</option>
                          <option value={2}>Round 2 (Buzzer Category)</option>
                          <option value={3}>Round 3 (Grand Finale)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Question Format
                        </label>
                        <select
                          value={aiQuestionType}
                          onChange={(e) => setAiQuestionType(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="text">Direct Typed Answer</option>
                          <option value="mcq">Multiple Choice (4 Options)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Questions to Generate
                        </label>
                        <select
                          value={aiQuestionCount}
                          onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value={1}>1 Question</option>
                          <option value={2}>2 Questions</option>
                          <option value={3}>3 Questions</option>
                          <option value={4}>4 Questions</option>
                        </select>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button
                      type="button"
                      disabled={isAiGenerating}
                      onClick={handleRunAiSynthesis}
                      className="w-full mt-3 py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      {isAiGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Analyzing Dataset &amp; Synthesizing 4 Clues...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 text-yellow-300" />
                          <span>Analyze Dataset &amp; Generate Connection Questions</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Generated Drafts Review Area */}
                {aiGeneratedDrafts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>AI Generated Questions Preview ({aiGeneratedDrafts.length})</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase">
                          Ready for Review
                        </span>
                      </h4>
                      <button
                        onClick={handleApproveAllDrafts}
                        className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-emerald-600 text-white hover:bg-emerald-700 shadow-md flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve All to Bank</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiGeneratedDrafts.map((draft, idx) => (
                        <div key={draft.id || idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-400 shadow-md space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Synthesized #{idx + 1} &bull; Round {draft.round}
                              </span>
                              <h5 className="text-base font-black text-slate-900 dark:text-white mt-1">{draft.title}</h5>
                            </div>
                            <span className="text-xs font-mono font-bold text-purple-700">{draft.points} pts</span>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300">{draft.prompt}</p>

                          {/* Clues Preview */}
                          <div className="grid grid-cols-4 gap-1.5">
                            {draft.clues.map((c, i) => (
                              <div key={i} className="aspect-video rounded-lg overflow-hidden border border-slate-200 relative group">
                                <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[7px] text-white p-0.5 truncate text-center font-bold">
                                  {c.label}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs">
                            Correct Answer: <strong className="text-emerald-900 dark:text-emerald-300 font-black">{draft.correctAnswer}</strong>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{draft.explanation}</p>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handleApproveDraft(draft)}
                              className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve &amp; Add to Bank</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SUB-TAB C: AI SIMILAR QUESTIONS GENERATOR */}
            {questionSubTab === "similar" && (
              <div className="space-y-5">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      AI Similar Questions Generator
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pick any question from the symposium question bank. The AI will extract its difficulty, connection logic, and archetype to create 2 parallel variations.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <select
                      value={similarTargetQ?.id || ""}
                      onChange={(e) => {
                        const selected = questions.find(q => q.id === e.target.value);
                        if (selected) setSimilarTargetQ(selected);
                      }}
                      className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="">Select a base question to model after...</option>
                      {questions.map(q => (
                        <option key={q.id} value={q.id}>
                          {q.id}: {q.title} &mdash; ({q.correctAnswer})
                        </option>
                      ))}
                    </select>

                    <button
                      disabled={!similarTargetQ || isGeneratingSimilar}
                      onClick={() => handleRunGenerateSimilar(similarTargetQ)}
                      className="px-5 py-2.5 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingSimilar ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      <span>Generate Variations</span>
                    </button>
                  </div>
                </div>

                {similarDrafts.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Generated Parallel Questions for '{similarTargetQ?.title}'
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {similarDrafts.map((draft, idx) => (
                        <div key={draft.id || idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-300 shadow-md space-y-3">
                          <div className="flex items-start justify-between">
                            <h5 className="text-sm font-black text-slate-900 dark:text-white">{draft.title}</h5>
                            <span className="text-xs font-mono font-bold text-purple-700">{draft.points} pts</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{draft.prompt}</p>

                          <div className="grid grid-cols-4 gap-1.5">
                            {draft.clues.map((c, i) => (
                              <div key={i} className="aspect-video rounded-lg overflow-hidden border border-slate-200 relative">
                                <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[7px] text-white p-0.5 truncate text-center">
                                  #{i + 1}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-xs">
                            Answer: <strong className="text-purple-900 dark:text-purple-300 font-bold">{draft.correctAnswer}</strong>
                          </div>

                          <button
                            onClick={() => {
                              addQuestion(draft);
                              setSimilarDrafts(prev => prev.filter(d => d.id !== draft.id));
                              setAiNotice({ type: "success", text: `Added '${draft.title}' to question bank!` });
                            }}
                            className="w-full py-2 bg-purple-600 text-white text-xs font-black uppercase rounded-xl shadow hover:bg-purple-700"
                          >
                            Approve &amp; Add Question
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* 6. LEADERBOARD VIEW SECTION */}
        {adminSection === "leaderboard" && (
          <div className="space-y-4">
            <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Tournament Standings</h3>
                <p className="text-xs text-slate-500">Live rankings visible on auditorium projector</p>
              </div>
              <a
                href="/display"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 uppercase"
              >
                <Tv className="w-4 h-4" />
                <span>Open Projector Screen</span>
              </a>
            </div>

            <div className="space-y-2">
              {teams.slice(0, 15).map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 font-mono font-black text-purple-700 dark:text-purple-400 text-sm">#{idx + 1}</span>
                    <div>
                      <span className="font-black text-slate-900 dark:text-white">{t.teamName}</span>
                      <span className="text-slate-500 block text-[11px]">{t.collegeName}</span>
                    </div>
                  </div>
                  <span className="font-mono font-black text-pink-600 text-base">{t.score || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. AUDIT TRAIL SECTION */}
        {adminSection === "audit" && (
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border-2 border-purple-200 dark:border-purple-800 p-5 shadow-sm space-y-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Audit Trail &amp; Scoring Log</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scoreLog.length === 0 ? (
                <p className="text-xs text-slate-500">No score events logged yet.</p>
              ) : (
                scoreLog.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{log.teamName}</span>
                      <span className="text-slate-500 ml-2">{log.reason}</span>
                    </div>
                    <span className={`font-mono font-black ${log.delta > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {log.delta > 0 ? `+${log.delta}` : log.delta} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Admin Management Modal */}
        <AdminManagementModal
          isOpen={showAdminSettings}
          onClose={() => setShowAdminSettings(false)}
        />

        {/* Question Edit Modal */}
        {editingQuestion && (
          <QuestionEditModal
            isOpen={!!editingQuestion}
            question={editingQuestion}
            onClose={() => setEditingQuestion(null)}
            onSave={(qId, updates) => {
              updateQuestion(qId, updates);
              setEditingQuestion(null);
            }}
          />
        )}

      </div>
    </div>
  );
}
