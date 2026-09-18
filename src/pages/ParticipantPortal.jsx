// CONNEXION - Participant Portal with 3 Member Rows, Team Code & Teammate Join Flow
import React, { useState, useEffect } from "react";
import { 
  Users, Send, Award, Clock, AlertCircle, CheckCircle2, 
  Sparkles, Zap, ShieldAlert, LogOut, ArrowRight, Trophy, X,
  GraduationCap, UserCheck, Phone, Mail, Link2, KeyRound, Copy, Check, Crown,
  Lock, Edit3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import { useSound } from "../context/SoundContext";
import ImageClueCard from "../components/ImageClueCard";
import TimerBar from "../components/TimerBar";
import BuzzerButton from "../components/BuzzerButton";
import BackgroundCanvas from "../components/BackgroundCanvas";

export default function ParticipantPortal() {
  const { currentTeam, loginTeam, joinTeam, logoutTeam } = useAuth();
  const { 
    roundState, 
    buzzerState, 
    activeQuestion, 
    timeRemaining, 
    submitAnswer, 
    pressBuzzer,
    teams
  } = useGame();
  const { playCorrect, playWrong, playTick } = useSound();

  // Mode: "register" (Leader) or "join" (Teammate with code)
  const [authMode, setAuthMode] = useState("register");

  // Registration Form State (3 Separate Rows for Members)
  const [formData, setFormData] = useState({
    teamName: "",
    collegeName: "",
    leaderName: "", // Member 1 (Mandatory)
    member2: "",    // Member 2 (Optional)
    member3: "",    // Member 3 (Optional)
    contactEmail: "",
    contactPhone: ""
  });

  // Join Existing Team Form State
  const [joinData, setJoinData] = useState({
    registeredName: "",
    teamCode: ""
  });

  const [authError, setAuthError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  useEffect(() => {
    setTypedAnswer("");
    setSubmittedAnswer(null);
    setIsAnswerLocked(false);
  }, [roundState.currentQuestionId]);

  // Handle Team Leader Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!formData.teamName.trim() || !formData.collegeName.trim() || !formData.leaderName.trim()) {
      setAuthError("Please fill in Team Name, College Name, and Team Leader (Member 1) Name.");
      return;
    }

    try {
      const membersList = [
        formData.leaderName.trim(),
        formData.member2.trim(),
        formData.member3.trim()
      ].filter(Boolean);

      await loginTeam({
        teamName: formData.teamName.trim(),
        collegeName: formData.collegeName.trim(),
        leaderName: formData.leaderName.trim(),
        members: membersList,
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim()
      });
      playCorrect();
    } catch (err) {
      setAuthError("Registration failed. Please try again.");
    }
  };

  // Handle Teammate Join with Code
  const handleJoin = async (e) => {
    e.preventDefault();
    setAuthError("");

    const cleanName = joinData.registeredName.trim();
    const cleanCode = joinData.teamCode.trim();

    if (!cleanName || !cleanCode) {
      setAuthError("Please enter both your Registered Name and Team Code.");
      return;
    }

    setIsJoining(true);
    try {
      const res = await joinTeam(cleanName, cleanCode);
      if (res.success) {
        playCorrect();
      } else {
        setAuthError(res.message || "Failed to join team. Please verify your registered name and team code.");
        playWrong();
      }
    } catch (err) {
      setAuthError("Could not connect to team session. Please check your network and try again.");
      playWrong();
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    playTick();
  };

  const handleLockAnswer = (chosenAnswer) => {
    const answerToLock = (chosenAnswer || typedAnswer || "").trim();
    if (!answerToLock || timeRemaining <= 0) return;
    
    // Lock with current timeRemaining for exact speed bonus
    submitAnswer(activeQuestion?.id, currentTeam.id, answerToLock, timeRemaining);
    setSubmittedAnswer({ answer: answerToLock, timeRemaining });
    setTypedAnswer(answerToLock);
    setIsAnswerLocked(true);
    playTick();
  };

  const handleModifyAnswer = () => {
    if (timeRemaining <= 0 || roundState.status !== "live") return;
    setIsAnswerLocked(false);
  };

  useEffect(() => {
    if (roundState.status === "live" && timeRemaining <= 0) {
      if (typedAnswer.trim() && (!submittedAnswer || !isAnswerLocked)) {
        handleLockAnswer(typedAnswer);
      }
    }
  }, [timeRemaining, roundState.status]);

  const myLiveRank = teams.findIndex(t => t.id === currentTeam?.id) + 1;

  // ================= 1. REGISTRATION / JOIN PORTAL VIEW =================
  if (!currentTeam) {
    return (
      <div className="relative min-h-[85vh] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        
        {/* Unified Atmospheric Background Canvas */}
        <BackgroundCanvas variant="participant" />

        {/* MAIN CARD */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="p-[2.5px] rounded-[2.5rem] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.35)]">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[2.4rem] p-6 sm:p-8">
              
              {/* Card Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 text-purple-950 text-[11px] font-black uppercase tracking-wider border border-purple-200 shadow-sm mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>CASYUM'26 Symposium Image Quiz</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="relative inline-block select-none my-1">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                      C
                      <span className="relative inline-block text-purple-600">
                        O
                        <span className="absolute -top-2 -right-1 text-xs animate-bounce">🧩</span>
                      </span>
                      NN
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
                        E
                        <span className="relative inline-block">
                          X
                          <span className="absolute -bottom-1 -right-1.5 text-[10px] text-amber-500 animate-pulse">⚡</span>
                        </span>
                        ION
                      </span>
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    Department of Computer Applications (BCA)
                  </p>
                </div>

                {/* MODE TOGGLE TABS (Register New Team vs Join with Team Code) */}
                <div className="mt-5 p-1 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      authMode === "register"
                        ? "bg-white text-purple-950 shadow-md shadow-purple-500/10 border border-purple-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Register New Team</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("join");
                      setAuthError("");
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      authMode === "join"
                        ? "bg-white text-purple-950 shadow-md shadow-purple-500/10 border border-purple-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-pink-500" />
                    <span>Join with Team Code</span>
                  </button>
                </div>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* TAB 1: TEAM LEADER REGISTRATION (3 SEPARATE ROWS FOR MEMBERS) */}
              {authMode === "register" ? (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  
                  {/* Team Name */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Team Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cyber Titans"
                      value={formData.teamName}
                      onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-purple-100 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white font-bold"
                    />
                  </div>

                  {/* College / Institution */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-pink-600" />
                      <span>College / Institution *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SRM Institute of Science and Technology"
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-purple-100 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white font-bold"
                    />
                  </div>

                  {/* 3 SEPARATE ROWS FOR PARTICIPANTS */}
                  <div className="space-y-2 pt-1 border-t border-purple-100">
                    <span className="block text-[11px] font-black uppercase tracking-wider text-purple-900">
                      Team Participants (Up to 3 Members)
                    </span>

                    {/* Row 1: Team Leader (MANDATORY) */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-purple-900 font-black">
                          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>Member 1 (Team Leader) Name *</span>
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Mandatory
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex (Team Leader - Required)"
                        value={formData.leaderName}
                        onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50/50 border-2 border-purple-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white font-black"
                      />
                    </div>

                    {/* Row 2: Member 2 (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-pink-500" />
                          <span>Member 2 Name</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Optional</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Maya"
                        value={formData.member2}
                        onChange={(e) => setFormData({ ...formData, member2: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-purple-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white font-semibold"
                      />
                    </div>

                    {/* Row 3: Member 3 (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                          <span>Member 3 Name</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Optional</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jordan"
                        value={formData.member3}
                        onChange={(e) => setFormData({ ...formData, member3: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-purple-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white font-semibold"
                      />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-100">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-amber-600" />
                        <span>Phone</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-purple-100 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-purple-600" />
                        <span>Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="lead@college.edu"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-purple-100 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-4 py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Register Team &amp; Generate Unique Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* TAB 2: TEAMMATE QUICK JOIN WITH CODE & REGISTERED NAME */
                <form onSubmit={handleJoin} className="space-y-4 py-2">
                  <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Joining an existing team session?</span>
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Enter your <strong>Registered Name</strong> and the <strong>Unique Team Code</strong> (e.g. 4-digit code like <strong>4821</strong> or <strong>CNX-4821</strong>) given by your Team Leader.
                    </p>
                  </div>

                  {/* Registered Name Input */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span>Your Name / Registered Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul, Priya, Alex"
                      value={joinData.registeredName}
                      onChange={(e) => setJoinData({ ...joinData, registeredName: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-purple-100 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white font-black"
                    />
                  </div>

                  {/* Unique Team Code Input */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-pink-600" />
                        <span>Unique Team Code *</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">e.g. 4821 or CNX-4821</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4821 or CNX-4821"
                      value={joinData.teamCode}
                      onChange={(e) => setJoinData({ ...joinData, teamCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-purple-200 text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white font-mono font-black uppercase tracking-widest text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isJoining}
                    className="w-full mt-4 py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to Team Session...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect to Team Session</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>

      </div>
    );
  }

  // ================= 2. ACTIVE TEAM SESSION VIEW =================
  const isSuddenDeathActive = roundState.suddenDeathActive;
  const isTeamInSuddenDeath = roundState.suddenDeathTeamIds?.includes(currentTeam.id);
  const leaderDisplayName = currentTeam.leaderName || (currentTeam.members && currentTeam.members[0]) || "Team Leader";
  const allMembers = currentTeam.members && currentTeam.members.length > 0 ? currentTeam.members : [leaderDisplayName];

  return (
    <div className="relative min-h-screen">
      <BackgroundCanvas variant="participant" showFloaters={false} />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-5">
      
      {/* 1. TEAM DASHBOARD STATUS BAR */}
      <div className="bg-white/95 rounded-3xl border-2 border-purple-200 p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/25">
            {currentTeam.teamName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {currentTeam.teamName}
              </h2>
              {currentTeam.qualifiedRound2 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 border border-emerald-300 text-emerald-800">
                  Round 2 Qual (Grp {currentTeam.round2Group || "A"})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {currentTeam.collegeName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-700">
              {currentTeam.score || 0} <span className="text-xs text-slate-400 font-normal">pts</span>
            </span>
          </div>

          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rank</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-pink-600">
              #{myLiveRank > 0 ? myLiveRank : "-"}
            </span>
          </div>

          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors shadow-sm"
            title="View Standings"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={logoutTeam}
            title="Switch Team / Logout"
            className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PROMINENT UNIQUE TEAM CODE & ROSTER SHARE BANNER */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-4 sm:p-5 text-white shadow-xl border-2 border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Team Access Code</span>
            </span>
            <span className="text-xs text-purple-200/90 font-medium">
              Share this code with your teammates to sync devices
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Code:</span>
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-amber-300 select-all drop-shadow-md">
                {currentTeam.teamCode || "CNX-ACTIVE"}
              </span>
            </div>

            <button
              onClick={() => handleCopyCode(currentTeam.teamCode || "CNX-ACTIVE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                copiedCode 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                  : "bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/30"
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-purple-300/80">
            Registered Leader: <strong className="text-white font-bold">{leaderDisplayName}</strong>
          </p>
        </div>

        {/* Members Roster Chips */}
        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider text-purple-300/80">
            Team Members ({allMembers.length}/3)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {allMembers.map((member, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  i === 0 
                    ? "bg-amber-400/20 text-amber-200 border border-amber-400/40" 
                    : "bg-white/10 text-purple-100 border border-white/15"
                }`}
              >
                {i === 0 ? (
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                ) : (
                  <UserCheck className="w-3 h-3 text-pink-300" />
                )}
                <span>{member}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SUDDEN DEATH NOTICE */}
      {isSuddenDeathActive && (
        <div className={`p-4 rounded-3xl border-2 ${isTeamInSuddenDeath ? "bg-amber-50 border-amber-400 animate-pulse" : "bg-white border-purple-200"}`}>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-amber-900 uppercase">
                Sudden Death Tiebreaker Active!
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {isTeamInSuddenDeath
                  ? "Your team is TIED at Rank 15! Answer this sudden-death tiebreaker to secure the final qualification spot!"
                  : "A tiebreaker question is currently live between tied teams for Rank 15."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. ROUND 1 VIEW */}
      {roundState.currentRound === 1 && !roundState.roundCompleted && (
        <div className="space-y-5">
          {roundState.status === "waiting" && (
            <div className="py-20 text-center rounded-3xl bg-white/95 border-2 border-purple-200 p-6 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-300">
                <Clock className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Waiting for Quiz Master to Start Question...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 font-medium">
                Keep this screen open! The connection clues and 30-second timer will sync automatically when the question starts.
              </p>
            </div>
          )}

          {roundState.status !== "waiting" && activeQuestion && (!isSuddenDeathActive || isTeamInSuddenDeath) && (
            <div className="space-y-5">
              <TimerBar 
                timeRemaining={timeRemaining} 
                duration={roundState.duration || 30} 
                status={roundState.status} 
              />

              <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border-2 border-purple-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-purple-100 text-purple-800 border border-purple-300">
                    Question {activeQuestion.id} &bull; {activeQuestion.type === "mcq" ? "Multiple Choice" : "Connection Challenge"}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600">
                    {activeQuestion.points || 10} pts (+{activeQuestion.speedBonus || 5} max speed bonus)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {activeQuestion.prompt}
                </h3>
              </div>

              {activeQuestion.clues && activeQuestion.clues.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {activeQuestion.clues.map((clue, idx) => (
                    <ImageClueCard
                      key={clue.id || idx}
                      clue={clue}
                      index={idx}
                      totalClues={activeQuestion.clues.length}
                    />
                  ))}
                </div>
              )}

              {/* Submission Box */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border-2 border-purple-200 shadow-sm">
                {isAnswerLocked && submittedAnswer ? (
                  /* STATE 1: ANSWER IS CURRENTLY LOCKED */
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 shadow-sm space-y-3 animate-in zoom-in-95">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/30">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                              Answer Locked In!
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black bg-emerald-200 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                              <span>{submittedAnswer.timeRemaining.toFixed(1)}s Speed Bonus Secured</span>
                            </span>
                          </div>
                          <p className="text-base font-black text-slate-900 mt-1">
                            "{submittedAnswer.answer}"
                          </p>
                        </div>
                      </div>

                      {roundState.status === "live" && timeRemaining > 0 && (
                        <button
                          onClick={handleModifyAnswer}
                          className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-100 border-2 border-emerald-400 text-emerald-800 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 text-emerald-700" />
                          <span>Modify Answer ({timeRemaining.toFixed(0)}s left)</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 border-t border-emerald-200/60 pt-2">
                      {roundState.status === "live" && timeRemaining > 0
                        ? "Your speed bonus is currently locked. If you wish to change your answer before the 30 seconds run out, click 'Modify Answer' above."
                        : "Question time has ended. Waiting for Quiz Master to reveal the connection solution..."}
                    </p>
                  </div>
                ) : roundState.status === "live" && timeRemaining > 0 ? (
                  /* STATE 2: ANSWERING / MODIFYING (TIMER STILL RUNNING) */
                  <div className="space-y-3">
                    {submittedAnswer && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>
                            Modifying your answer. Previous locked time was <strong>{submittedAnswer.timeRemaining.toFixed(1)}s</strong>. Click <strong>"LOCK ANSWER"</strong> when ready to secure your updated speed bonus!
                          </span>
                        </div>
                        <button
                          onClick={() => setIsAnswerLocked(true)}
                          className="text-[11px] font-black text-amber-800 hover:underline flex-shrink-0 cursor-pointer"
                        >
                          Cancel &amp; Keep Previous
                        </button>
                      </div>
                    )}

                    {activeQuestion.type === "mcq" ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeQuestion.options?.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setTypedAnswer(opt)}
                              className={`p-4 rounded-2xl text-left font-black text-sm transition-all active:scale-[0.98] shadow-sm flex items-center justify-between ${
                                typedAnswer === opt 
                                  ? "bg-purple-100 border-2 border-purple-600 text-purple-950 shadow-purple-500/10" 
                                  : "bg-slate-50 border-2 border-purple-200 hover:border-purple-400 text-slate-800"
                              }`}
                            >
                              <div>
                                <span className="inline-block w-6 text-purple-700 font-mono">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                <span>{opt}</span>
                              </div>
                              {typedAnswer === opt && <Check className="w-4 h-4 text-purple-700" />}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => handleLockAnswer(typedAnswer)}
                          disabled={!typedAnswer.trim()}
                          className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 cursor-pointer"
                        >
                          <Lock className="w-4 h-4" />
                          <span>LOCK ANSWER (Save {timeRemaining.toFixed(1)}s Time Bonus)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Type your connection answer here..."
                            value={typedAnswer}
                            onChange={(e) => setTypedAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLockAnswer(typedAnswer)}
                            className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-purple-200 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 font-bold"
                          />
                          <button
                            onClick={() => handleLockAnswer(typedAnswer)}
                            disabled={!typedAnswer.trim()}
                            className="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Lock className="w-4 h-4" />
                            <span>LOCK ANSWER (+{timeRemaining.toFixed(1)}s Bonus)</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>Speed bonus points are awarded based on the exact second you click <strong>"LOCK ANSWER"</strong>. You can modify before the 30s timer ends.</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* STATE 3: TIME EXPIRED OR WAITING */
                  <div className="text-center py-5 text-xs font-bold text-slate-500">
                    {submittedAnswer 
                      ? `Answer Locked: "${submittedAnswer.answer}" (${submittedAnswer.timeRemaining.toFixed(1)}s remaining). Waiting for solution reveal.` 
                      : "Time's up! No answer was locked for this question."}
                  </div>
                )}

                {roundState.status === "revealed" && (
                  <div className="mt-4 p-4 rounded-2xl bg-purple-50 border-2 border-purple-300 animate-in fade-in">
                    <span className="text-[10px] uppercase font-black text-purple-700 block">
                      Official Connection Solution
                    </span>
                    <h4 className="text-lg font-black text-purple-900">
                      {activeQuestion.correctAnswer}
                    </h4>
                    {activeQuestion.explanation && (
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        {activeQuestion.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. ROUND 2 & 3 BUZZER VIEW */}
      {(roundState.currentRound === 2 || roundState.currentRound === 3) && (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-white/95 border-2 border-purple-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-purple-700 uppercase">
                {roundState.currentRound === 2 ? `Round 2 — Group ${roundState.activeGroup}` : "Grand Finale"}
              </span>
              <p className="text-xs text-slate-500 font-medium">Live Buzzer Battle on Stage</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-300">
              Zero-Bias Referee
            </span>
          </div>

          <BuzzerButton
            buzzerState={buzzerState}
            currentTeam={currentTeam}
            onPress={() => pressBuzzer(currentTeam.id, currentTeam.teamName)}
            isEligibleGroup={
              roundState.currentRound === 3 
                ? Boolean(currentTeam.qualifiedFinal)
                : currentTeam.round2Group === buzzerState.activeGroup
            }
          />
        </div>
      )}

      {/* 6. BETWEEN ROUNDS COMPLETED VIEW */}
      {roundState.roundCompleted && roundState.currentRound === 1 && (
        <div className="p-8 rounded-3xl bg-white border-2 border-purple-200 text-center space-y-4 shadow-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white flex items-center justify-center shadow-lg">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Round 1 Completed!</h3>
          {currentTeam.qualifiedRound2 ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 max-w-md mx-auto">
              <p className="font-black text-base">🎉 Congratulations! You qualified for Round 2!</p>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                You are in <strong className="text-emerald-950 font-bold">Group {currentTeam.round2Group || "A"}</strong>. Watch the auditorium screen!
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 max-w-md mx-auto text-xs font-medium">
              Thank you for playing! Final Round 1 Score: <strong className="text-slate-900">{currentTeam.score || 0} pts</strong>.
            </div>
          )}
        </div>
      )}

      {/* 7. LEADERBOARD MODAL */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border-2 border-purple-300 rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Tournament Standings</h3>
              </div>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {teams.slice(0, 15).map((t, idx) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between text-xs ${
                    t.id === currentTeam.id
                      ? "bg-purple-50 border-purple-400 font-bold"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-mono font-black text-purple-700">#{idx + 1}</span>
                    <div>
                      <span className="font-black text-slate-900">{t.teamName}</span>
                      <span className="text-[10px] text-slate-500 block font-semibold">{t.collegeName}</span>
                    </div>
                  </div>
                  <span className="font-mono font-black text-purple-700 text-sm">{t.score || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
