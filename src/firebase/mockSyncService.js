// CONNEXION - High-Fidelity Cross-Tab Live Synchronization Engine
// Uses BroadcastChannel + localStorage to simulate Firestore & Realtime DB with zero-latency multi-tab sync

import { INITIAL_QUESTIONS } from "./seedData";
import { computeRound1Score, computeRankings, checkForTieAtRank15, partitionIntoGroups } from "../utils/scoring";

const CHANNEL_NAME = "connexion_live_channel";
let broadcastChannel = null;

if (typeof window !== "undefined" && window.BroadcastChannel) {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
}

// Storage Keys
const STORAGE_KEYS = {
  ROUND_STATE: "cnx_round_state",
  TEAMS: "cnx_teams",
  BUZZER: "cnx_buzzer_state",
  SCORE_LOG: "cnx_score_log",
  QUESTIONS: "cnx_questions",
  SUBMISSIONS: "cnx_submissions"
};

// Initial Default State
const DEFAULT_ROUND_STATE = {
  currentRound: 1, // 1, 2, 3
  activeGroup: "A", // For Round 2: "A", "B", "C"
  currentQuestionId: "r1_q01_leo",
  status: "waiting", // "waiting", "live", "locked", "revealed", "completed"
  questionStartTimestamp: null,
  duration: 30, // seconds
  suddenDeathActive: false,
  suddenDeathTeamIds: [],
  roundCompleted: false
};

const DEFAULT_BUZZER_STATE = {
  armed: false,
  activeGroup: "A",
  currentQuestionId: null,
  armedTimestamp: null,
  firstBuzz: null, // { teamId, teamName, serverTimestamp, latencyDeltaMs }
  buzzQueue: [] // [{ teamId, teamName, serverTimestamp, latencyDeltaMs }]
};

// Helpers for localStorage
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage save error", e);
  }
}

// Helper: Generate Unique Team Code (e.g. CNX-4821)
export function generateTeamCode(existingTeams = []) {
  let code = "";
  let exists = true;
  while (exists) {
    const num = Math.floor(1000 + Math.random() * 9000);
    code = `CNX-${num}`;
    exists = existingTeams.some(t => t.teamCode === code);
  }
  return code;
}

// Ensure Initial Seed & Auto-Upgrade to Tamil Connection Bank
export function initializeStorage() {
  const existingQuestions = load(STORAGE_KEYS.QUESTIONS, null);
  // Auto-upgrade if empty, outdated, or fewer than 70 questions (new full Tamil 72-question bank)
  if (!existingQuestions || !Array.isArray(existingQuestions) || existingQuestions.length < 70 || !existingQuestions.some(q => q.id === "r1_q01_leo" || q.tamilCategory)) {
    save(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    // If active question was an old one, update round state to point to Leo
    const curRound = load(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
    if (!curRound.currentQuestionId || curRound.currentQuestionId === "r1_q01") {
      save(STORAGE_KEYS.ROUND_STATE, { ...curRound, currentQuestionId: "r1_q01_leo" });
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROUND_STATE)) {
    save(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUZZER)) {
    save(STORAGE_KEYS.BUZZER, DEFAULT_BUZZER_STATE);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
    save(STORAGE_KEYS.TEAMS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCORE_LOG)) {
    save(STORAGE_KEYS.SCORE_LOG, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    save(STORAGE_KEYS.SUBMISSIONS, {});
  }
}

// Broadcast an event to all tabs
function broadcast(type, payload) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
  // Also dispatch window custom event for current tab
  window.dispatchEvent(new CustomEvent("cnx_sync_event", { detail: { type, payload } }));
}

// ================= SYNC LISTENERS & MANAGERS =================

export const mockSync = {
  initializeStorage,

  // Listen for broadcast messages across tabs
  onEvent(handler) {
    const channelHandler = (event) => {
      handler(event.data);
    };
    const windowHandler = (event) => {
      handler(event.detail);
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener("message", channelHandler);
    }
    window.addEventListener("cnx_sync_event", windowHandler);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener("message", channelHandler);
      }
      window.removeEventListener("cnx_sync_event", windowHandler);
    };
  },

  // --- ROUND STATE ---
  getRoundState() {
    return load(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
  },

  updateRoundState(updates) {
    const current = this.getRoundState();
    const updated = { ...current, ...updates };
    save(STORAGE_KEYS.ROUND_STATE, updated);
    broadcast("ROUND_STATE_UPDATED", updated);
    return updated;
  },

  // --- QUESTIONS ---
  getQuestions() {
    return load(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },

  saveQuestions(questions) {
    save(STORAGE_KEYS.QUESTIONS, questions);
    broadcast("QUESTIONS_UPDATED", questions);
  },

  resetQuestionsToDefault() {
    save(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    broadcast("QUESTIONS_UPDATED", INITIAL_QUESTIONS);
    return INITIAL_QUESTIONS;
  },

  // --- TEAMS ---
  getTeams() {
    return load(STORAGE_KEYS.TEAMS, []);
  },

  getTeam(teamId) {
    const teams = this.getTeams();
    return teams.find(t => t.id === teamId) || null;
  },

  registerTeam(teamData) {
    const teams = this.getTeams();
    const existingIndex = teams.findIndex(t => t.id === teamData.id || t.teamName.toLowerCase() === teamData.teamName.toLowerCase());

    const newTeam = {
      id: teamData.id || `team_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      teamName: teamData.teamName.trim(),
      teamCode: teamData.teamCode || generateTeamCode(teams),
      leaderName: (teamData.leaderName || (teamData.members && teamData.members[0]) || "").trim(),
      collegeName: teamData.collegeName.trim(),
      members: teamData.members || [],
      contactEmail: teamData.contactEmail || "",
      contactPhone: teamData.contactPhone || "",
      score: 0,
      totalResponseTime: 0,
      answerCount: 0,
      currentRound: 1,
      round2Group: null, // "A", "B", "C"
      qualifiedRound2: false,
      qualifiedFinal: false,
      finalRank: null,
      registeredAt: Date.now(),
      lastActive: Date.now()
    };

    if (existingIndex >= 0) {
      // Return existing team session
      return teams[existingIndex];
    }

    teams.push(newTeam);
    save(STORAGE_KEYS.TEAMS, teams);
    broadcast("TEAMS_UPDATED", teams);
    return newTeam;
  },

  
  joinTeamByCode(registeredName, teamCode) {
    const teams = this.getTeams();
    const cleanCode = (teamCode || "").trim().toUpperCase();
    const cleanName = (registeredName || "").trim().toLowerCase();

    if (!cleanCode) {
      return { success: false, message: "Please enter the Unique Team Code." };
    }
    if (!cleanName) {
      return { success: false, message: "Please enter your Registered Name." };
    }

    const team = teams.find(t => {
      const codeMatch = (t.teamCode || "").toUpperCase() === cleanCode;
      const isMemberMatch = Array.isArray(t.members) && t.members.some(
        m => (m || "").trim().toLowerCase() === cleanName
      );
      const isLeaderMatch = (t.leaderName || "").trim().toLowerCase() === cleanName;
      const isTeamNameMatch = (t.teamName || "").trim().toLowerCase() === cleanName;
      return codeMatch && (isMemberMatch || isLeaderMatch || isTeamNameMatch);
    });

    if (!team) {
      return { 
        success: false, 
        message: `No matching team found for code "${cleanCode}" with registered name "${registeredName}". Please verify your name was registered by your Team Leader.` 
      };
    }

    return { success: true, team };
  },

  updateTeam(teamId, updates) {
    const teams = this.getTeams();
    const index = teams.findIndex(t => t.id === teamId);
    if (index >= 0) {
      teams[index] = { ...teams[index], ...updates, lastActive: Date.now() };
      save(STORAGE_KEYS.TEAMS, teams);
      broadcast("TEAMS_UPDATED", teams);
      return teams[index];
    }
    return null;
  },

  // --- SUBMISSIONS (Round 1) ---
  getSubmissions(questionId) {
    const allSubs = load(STORAGE_KEYS.SUBMISSIONS, {});
    return allSubs[questionId] || [];
  },

  submitAnswer(questionId, teamId, answer, timeRemaining) {
    const allSubs = load(STORAGE_KEYS.SUBMISSIONS, {});
    if (!allSubs[questionId]) {
      allSubs[questionId] = [];
    }

    // Check if team already submitted for this question
    const existingIndex = allSubs[questionId].findIndex(s => s.teamId === teamId);
    const submission = {
      questionId,
      teamId,
      answer: (answer || "").trim(),
      timeRemaining: Number(timeRemaining) || 0,
      timestamp: Date.now()
    };

    if (existingIndex >= 0) {
      allSubs[questionId][existingIndex] = submission;
    } else {
      allSubs[questionId].push(submission);
    }

    save(STORAGE_KEYS.SUBMISSIONS, allSubs);
    broadcast("SUBMISSION_RECORDED", { questionId, submission, total: allSubs[questionId].length });
    return submission;
  },

  // --- BUZZER (Round 2 & 3) ---
  getBuzzerState() {
    return load(STORAGE_KEYS.BUZZER, DEFAULT_BUZZER_STATE);
  },

  armBuzzer(activeGroup, questionId) {
    const state = {
      armed: true,
      activeGroup,
      currentQuestionId: questionId,
      armedTimestamp: Date.now(),
      firstBuzz: null,
      buzzQueue: []
    };
    save(STORAGE_KEYS.BUZZER, state);
    broadcast("BUZZER_ARMED", state);
    return state;
  },

  resetBuzzer() {
    const state = {
      armed: false,
      activeGroup: null,
      currentQuestionId: null,
      armedTimestamp: null,
      firstBuzz: null,
      buzzQueue: []
    };
    save(STORAGE_KEYS.BUZZER, state);
    broadcast("BUZZER_RESET", state);
    return state;
  },

  /**
   * Atomic first-buzz resolution.
   * Only the earliest write gets firstBuzz!
   */
  pressBuzzer(teamId, teamName) {
    const state = this.getBuzzerState();

    if (!state.armed) {
      return { success: false, reason: "Buzzer is not armed!" };
    }

    const now = Date.now();
    const latencyDeltaMs = state.armedTimestamp ? now - state.armedTimestamp : 0;

    // Check if this team is already in queue
    if (state.buzzQueue.some(b => b.teamId === teamId)) {
      return { success: false, reason: "Already buzzed for this question." };
    }

    const buzzEntry = {
      teamId,
      teamName,
      serverTimestamp: now,
      latencyDeltaMs
    };

    const isFirst = !state.firstBuzz;

    if (isFirst) {
      state.firstBuzz = buzzEntry;
      state.buzzQueue.push(buzzEntry);
    } else {
      state.buzzQueue.push(buzzEntry);
    }

    save(STORAGE_KEYS.BUZZER, state);
    broadcast("BUZZER_PRESSED", { state, buzzEntry, isFirst });

    return {
      success: true,
      isFirst,
      buzzEntry,
      diffToFirst: isFirst ? 0 : now - state.firstBuzz.serverTimestamp
    };
  },

  // --- SCORE LOG & AUDIT TRAIL ---
  getScoreLog() {
    return load(STORAGE_KEYS.SCORE_LOG, []);
  },

  logScore({ teamId, teamName, questionId, pointsAwarded, verdict, details }) {
    const log = this.getScoreLog();
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      teamId,
      teamName: teamName || "Unknown Team",
      questionId,
      pointsAwarded: Number(pointsAwarded) || 0,
      verdict, // "correct", "wrong", "speed_bonus", "penalty", "manual_adjustment"
      details: details || "",
      timestamp: Date.now()
    };

    log.unshift(entry); // newest first
    save(STORAGE_KEYS.SCORE_LOG, log);

    // Update team score in database
    const teams = this.getTeams();
    const team = teams.find(t => t.id === teamId);
    if (team) {
      team.score = (Number(team.score) || 0) + Number(pointsAwarded);
      save(STORAGE_KEYS.TEAMS, teams);
      broadcast("TEAMS_UPDATED", teams);
    }

    broadcast("SCORE_LOGGED", entry);
    return entry;
  },

  // --- ADVANCED GAME ACTIONS ---

  /**
   * Lock Round 1 and calculate Top 15 qualifiers
   */
  lockAndComputeTop15() {
    const teams = this.getTeams();
    const ranked = computeRankings(teams);

    // Check tiebreaker at rank 15
    const tieCheck = checkForTieAtRank15(ranked);

    if (tieCheck.hasTie) {
      // Trigger sudden death for tied teams
      const tiedIds = tieCheck.tiedTeams.map(t => t.id);
      this.updateRoundState({
        suddenDeathActive: true,
        suddenDeathTeamIds: tiedIds,
        currentQuestionId: "r1_sd01",
        status: "live",
        duration: 30,
        questionStartTimestamp: Date.now()
      });
      return { hasTie: true, tiedTeams: tieCheck.tiedTeams };
    }

    // Mark Top 15 as qualified for Round 2 and partition into 3 groups of 5
    const groups = partitionIntoGroups(ranked);

    ranked.forEach((team, idx) => {
      if (idx < 15) {
        team.qualifiedRound2 = true;
        // Assign group
        if (groups.A.some(t => t.id === team.id)) team.round2Group = "A";
        else if (groups.B.some(t => t.id === team.id)) team.round2Group = "B";
        else if (groups.C.some(t => t.id === team.id)) team.round2Group = "C";
      } else {
        team.qualifiedRound2 = false;
        team.round2Group = null;
      }
    });

    save(STORAGE_KEYS.TEAMS, ranked);
    broadcast("TEAMS_UPDATED", ranked);

    this.updateRoundState({
      roundCompleted: true,
      status: "completed",
      suddenDeathActive: false
    });

    return { hasTie: false, top15: ranked.slice(0, 15), groups };
  },

  /**
   * Reset entire game state for fresh demo / tournament run
   */
  resetGame() {
    save(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
    save(STORAGE_KEYS.BUZZER, DEFAULT_BUZZER_STATE);
    save(STORAGE_KEYS.SCORE_LOG, []);
    save(STORAGE_KEYS.SUBMISSIONS, {});

    // Clear scores from teams
    const teams = this.getTeams().map(t => ({
      ...t,
      score: 0,
      totalResponseTime: 0,
      answerCount: 0,
      round2Group: null,
      qualifiedRound2: false,
      qualifiedFinal: false,
      finalRank: null
    }));
    save(STORAGE_KEYS.TEAMS, teams);

    broadcast("GAME_RESET", {});
    broadcast("ROUND_STATE_UPDATED", DEFAULT_ROUND_STATE);
    broadcast("BUZZER_RESET", DEFAULT_BUZZER_STATE);
    broadcast("TEAMS_UPDATED", teams);
  }
};