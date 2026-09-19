// CONNEXION - High-Fidelity Cross-Device & Cross-Tab Live Synchronization Engine
// Uses BroadcastChannel + WebSockets / Cloud Relay (ntfy.sh) for multi-device sync on Vercel

import { INITIAL_QUESTIONS } from "./seedData";
import { computeRound1Score, computeRankings, checkForTieAtRank15, partitionIntoGroups } from "../utils/scoring";

const CHANNEL_NAME = "connexion_live_channel";
const CLOUD_TOPIC = "cnx_casyum26_srm_bca_live_v4";
const CLOUD_HTTP_URL = `https://ntfy.sh/${CLOUD_TOPIC}`;
const CLOUD_WS_URL = `wss://ntfy.sh/${CLOUD_TOPIC}/ws`;

// Unique client instance to prevent echoing self-published cloud events
const CLIENT_INSTANCE_ID = typeof window !== "undefined"
  ? `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  : "node_server";

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
  SUBMISSIONS: "cnx_submissions",
  DELETED_TEAM_IDS: "cnx_deleted_team_ids"
};

// Initial Default State
const DEFAULT_ROUND_STATE = {
  currentRound: 1, // 1, 2, 3
  activeGroup: "A", // For Round 2: "A", "B", "C"
  currentQuestionId: "r1_q01",
  status: "waiting", // "waiting", "live", "locked", "revealed", "completed"
  questionStartTimestamp: null,
  duration: 30, // seconds
  suddenDeathActive: false,
  suddenDeathTeamIds: [],
  roundCompleted: false,
  updatedAt: 0
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

// Helper: Normalize team code for ultra-forgiving comparisons
export function normalizeCode(code) {
  if (!code) return "";
  return String(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Helper: Match team code flexibly (supports "4821", "CNX-4821", "cnx 4821", "cnx4821")
export function isCodeMatch(inputCode, storedCode) {
  const normInput = normalizeCode(inputCode);
  const normStored = normalizeCode(storedCode);
  if (!normInput || !normStored) return false;

  // Exact normalized match (e.g. "CNX4821" === "CNX4821")
  if (normInput === normStored) return true;

  // Extract digits for fast 4-digit code matching
  const storedDigits = normStored.replace(/\D/g, "");
  const inputDigits = normInput.replace(/\D/g, "");
  if (storedDigits && inputDigits && storedDigits === inputDigits) return true;

  // Substring ends-with match
  if (normStored.endsWith(normInput) || normInput.endsWith(normStored)) return true;

  return false;
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

// Dispatch to local browser tabs only (NO cloud bounce)
function notifyLocal(type, payload) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cnx_sync_event", { detail: { type, payload } }));
  }
}

// Push to Cloud Relay (ntfy.sh) for multi-device sync
function pushToCloud(type, payload) {
  if (typeof window === "undefined") return;
  try {
    const msg = JSON.stringify({
      senderId: CLIENT_INSTANCE_ID,
      type,
      payload,
      timestamp: Date.now()
    });

    fetch(CLOUD_HTTP_URL, {
      method: "POST",
      body: msg,
      headers: { "Title": type }
    }).catch(() => {
      // Non-blocking background push
    });
  } catch (e) {
    // Non-blocking
  }
}

// Broadcast to local tabs + Cloud Relay
function broadcast(type, payload) {
  notifyLocal(type, payload);
  pushToCloud(type, payload);
}

// Cloud WebSocket & Polling Manager
let cloudWs = null;
let reconnectTimeout = null;
let isCloudInitialized = false;
let lastPollTimestamp = null;
let isPolling = false;

function initCloudSync() {
  if (typeof window === "undefined" || isCloudInitialized) return;
  isCloudInitialized = true;

  // 1. Initial Cloud History Pull (last 60s only) to catch up on any existing active states
  mockSync.pullFromCloud();

  // 2. Setup WebSocket for real-time live events across devices
  function connectWs() {
    try {
      if (cloudWs) {
        try { cloudWs.close(); } catch(e) {}
      }

      cloudWs = new WebSocket(CLOUD_WS_URL);

      cloudWs.onopen = () => {
        console.log("⚡ CONNEXION: Multi-device cloud sync connected!");
      };

      cloudWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "message" && data.message) {
            const parsed = typeof data.message === "string" ? JSON.parse(data.message) : data.message;
            if (parsed && parsed.senderId !== CLIENT_INSTANCE_ID) {
              mockSync.applyRemoteEvent(parsed, true);
            }
          }
        } catch (e) {}
      };

      cloudWs.onerror = () => {};

      cloudWs.onclose = () => {
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connectWs();
          }, 3000);
        }
      };
    } catch (e) {
      console.warn("WebSocket init failed, fallback to polling:", e);
    }
  }

  connectWs();

  // 3. Auto-sync on window focus & mobile screen resume (throttled to avoid choking)
  let lastFocusSync = 0;
  const throttledPull = () => {
    const now = Date.now();
    if (now - lastFocusSync > 3000) {
      lastFocusSync = now;
      mockSync.pullFromCloud();
    }
  };

  window.addEventListener("focus", throttledPull);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) throttledPull();
  });

  // 4. Background heartbeat poll (every 15s) to safeguard against mobile sleep
  setInterval(() => {
    mockSync.pullFromCloud();
  }, 15000);
}

// Ensure Initial Seed & Auto-Upgrade to Tamil Connection Bank
export function initializeStorage() {
  const existingQuestions = load(STORAGE_KEYS.QUESTIONS, null);
  // Auto-upgrade if empty, outdated, or fewer than 70 questions or if still using old spoiler IDs like r1_q01_leo
  if (!existingQuestions || !Array.isArray(existingQuestions) || existingQuestions.length < 70 || !existingQuestions.some(q => q.id === "r1_q01")) {
    save(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const curRound = load(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
    if (!curRound.currentQuestionId || curRound.currentQuestionId.includes("_leo") || curRound.currentQuestionId === "r1_q01_leo") {
      save(STORAGE_KEYS.ROUND_STATE, { ...curRound, currentQuestionId: "r1_q01", updatedAt: Date.now() });
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROUND_STATE)) {
    save(STORAGE_KEYS.ROUND_STATE, { ...DEFAULT_ROUND_STATE, updatedAt: Date.now() });
  } else {
    // Sanitize any existing dirty question IDs in round state
    const curRound = load(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
    if (curRound && curRound.currentQuestionId) {
      let cleanId = curRound.currentQuestionId;
      if (typeof cleanId === "string" && (cleanId.startsWith("r1_") || cleanId.startsWith("r3_"))) {
        const parts = cleanId.split("_");
        if (parts.length > 2) {
          cleanId = `${parts[0]}_${parts[1]}`;
        }
      }
      if (cleanId !== curRound.currentQuestionId || !curRound.updatedAt) {
        save(STORAGE_KEYS.ROUND_STATE, { ...curRound, currentQuestionId: cleanId, updatedAt: curRound.updatedAt || Date.now() });
      }
    }
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

  // Start cloud synchronization
  initCloudSync();
}

// ================= SYNC LISTENERS & MANAGERS =================

export const mockSync = {
  initializeStorage,

  // Incremental lightweight cloud poll (never loads 12 hours of old history)
  async pullFromCloud() {
    if (typeof window === "undefined" || isPolling) return;
    isPolling = true;
    try {
      const now = Date.now();
      // Incremental polling: query only recent window (60s on startup, or delta since last poll)
      let querySince = "60s";
      if (lastPollTimestamp) {
        const secondsAgo = Math.max(5, Math.min(300, Math.floor((now - lastPollTimestamp) / 1000) + 2));
        querySince = `${secondsAgo}s`;
      }

      const res = await fetch(`${CLOUD_HTTP_URL}/json?poll=1&since=${querySince}`, {
        headers: { "Accept": "application/x-ndjson, text/plain" }
      });
      lastPollTimestamp = now;

      if (!res.ok) return;
      const text = await res.text();
      if (!text) return;
      const lines = text.trim().split("\n");

      const validEvents = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const row = JSON.parse(line);
          if (row.event === "message" && row.message) {
            const data = typeof row.message === "string" ? JSON.parse(row.message) : row.message;
            if (data && data.senderId !== CLIENT_INSTANCE_ID && data.type) {
              validEvents.push(data);
            }
          }
        } catch (e) {}
      }

      if (validEvents.length > 0) {
        // Sort chronologically before applying
        validEvents.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));

        for (const ev of validEvents) {
          this.applyRemoteEvent(ev, false);
        }

        // Filter out any tombstoned / deleted teams after bulk catch-up
        const deletedIds = load(STORAGE_KEYS.DELETED_TEAM_IDS, []);
        if (deletedIds.length > 0) {
          const remainingTeams = load(STORAGE_KEYS.TEAMS, []).filter(t => !deletedIds.includes(t.id));
          save(STORAGE_KEYS.TEAMS, remainingTeams);
        }

        // Notify once after bulk catch-up
        notifyLocal("TEAMS_UPDATED", this.getTeams());
        notifyLocal("ROUND_STATE_UPDATED", this.getRoundState());
      }
    } catch (e) {
      console.warn("Cloud poll warning:", e);
    } finally {
      isPolling = false;
    }
  },

  // Apply an event received from another device
  applyRemoteEvent(eventData, shouldNotify = true) {
    const { type, payload } = eventData;
    if (!type) return;

    if (type === "TEAM_DELETED") {
      const teamId = payload?.teamId;
      if (teamId) {
        const deleted = load(STORAGE_KEYS.DELETED_TEAM_IDS, []);
        if (!deleted.includes(teamId)) {
          deleted.push(teamId);
          save(STORAGE_KEYS.DELETED_TEAM_IDS, deleted);
        }
        const teams = load(STORAGE_KEYS.TEAMS, []).filter(t => t.id !== teamId);
        save(STORAGE_KEYS.TEAMS, teams);
        if (shouldNotify) notifyLocal("TEAMS_UPDATED", teams);
      }
    } else if (type === "TEAMS_CLEARED") {
      const currentTeams = load(STORAGE_KEYS.TEAMS, []);
      const deleted = load(STORAGE_KEYS.DELETED_TEAM_IDS, []);
      currentTeams.forEach(t => {
        if (!deleted.includes(t.id)) deleted.push(t.id);
      });
      save(STORAGE_KEYS.DELETED_TEAM_IDS, deleted);
      save(STORAGE_KEYS.TEAMS, []);
      save(STORAGE_KEYS.SCORE_LOG, []);
      save(STORAGE_KEYS.SUBMISSIONS, {});
      if (shouldNotify) {
        notifyLocal("TEAMS_UPDATED", []);
        notifyLocal("SCORE_LOG_UPDATED", []);
      }
    } else if (type === "TEAM_REGISTERED" || type === "TEAM_UPDATED") {
      const incomingTeam = payload?.team || payload;
      const deleted = load(STORAGE_KEYS.DELETED_TEAM_IDS, []);
      if (incomingTeam && incomingTeam.id && !deleted.includes(incomingTeam.id)) {
        const teams = load(STORAGE_KEYS.TEAMS, []);
        const idx = teams.findIndex(t => t.id === incomingTeam.id || t.teamName.toLowerCase() === (incomingTeam.teamName || "").toLowerCase());
        if (idx >= 0) {
          teams[idx] = { ...teams[idx], ...incomingTeam };
        } else {
          teams.push(incomingTeam);
        }
        save(STORAGE_KEYS.TEAMS, teams);
        if (shouldNotify) {
          notifyLocal("TEAM_UPDATED", { team: incomingTeam });
          notifyLocal("TEAMS_UPDATED", teams);
        }
      }
    } else if (type === "TEAMS_UPDATED") {
      const incomingTeams = payload?.teams || (Array.isArray(payload) ? payload : null);
      if (Array.isArray(incomingTeams)) {
        const deleted = load(STORAGE_KEYS.DELETED_TEAM_IDS, []);
        const currentTeams = load(STORAGE_KEYS.TEAMS, []);
        const map = new Map();
        currentTeams.forEach(t => {
          if (!deleted.includes(t.id)) map.set(t.id, t);
        });
        incomingTeams.forEach(t => {
          if (t && t.id && !deleted.includes(t.id)) {
            if (map.has(t.id)) {
              map.set(t.id, { ...map.get(t.id), ...t });
            } else {
              map.set(t.id, t);
            }
          }
        });
        const merged = Array.from(map.values());
        save(STORAGE_KEYS.TEAMS, merged);
        if (shouldNotify) notifyLocal("TEAMS_UPDATED", merged);
      }
    } else if (type === "SUBMISSIONS_CLEARED") {
      save(STORAGE_KEYS.SUBMISSIONS, {});
      if (shouldNotify) notifyLocal("SUBMISSION_RECORDED", { cleared: true });
    } else if (type === "ROUND_STATE_UPDATED") {
      const incomingRound = payload?.roundState || payload;
      if (incomingRound) {
        const current = load(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
        const incomingTime = Number(incomingRound.updatedAt || eventData.timestamp || 0);
        const currentTime = Number(current.updatedAt || 0);

        // Strict monotonic check: Discard stale or out-of-order events
        if (incomingTime && currentTime && incomingTime < currentTime) {
          return;
        }

        let cleanQId = incomingRound.currentQuestionId;
        if (cleanQId && typeof cleanQId === "string" && (cleanQId.startsWith("r1_") || cleanQId.startsWith("r3_"))) {
          const parts = cleanQId.split("_");
          if (parts.length > 2) {
            cleanQId = `${parts[0]}_${parts[1]}`;
          }
        }

        const updated = {
          ...current,
          ...incomingRound,
          currentQuestionId: cleanQId || incomingRound.currentQuestionId,
          updatedAt: Math.max(incomingTime, currentTime, Date.now())
        };
        save(STORAGE_KEYS.ROUND_STATE, updated);
        if (shouldNotify) notifyLocal("ROUND_STATE_UPDATED", updated);
      }
    } else if (type === "BUZZER_ARMED" || type === "BUZZER_RESET" || type === "BUZZER_PRESSED") {
      const buzzer = payload?.buzzerState || payload;
      if (buzzer) {
        save(STORAGE_KEYS.BUZZER, buzzer);
        if (shouldNotify) notifyLocal(type, payload);
      }
    } else if (type === "SUBMISSION_RECORDED") {
      const { questionId, submission } = payload || {};
      if (questionId && submission) {
        const allSubs = load(STORAGE_KEYS.SUBMISSIONS, {});
        if (!allSubs[questionId]) allSubs[questionId] = [];
        const idx = allSubs[questionId].findIndex(s => s.teamId === submission.teamId);
        if (idx >= 0) allSubs[questionId][idx] = submission;
        else allSubs[questionId].push(submission);
        save(STORAGE_KEYS.SUBMISSIONS, allSubs);
        if (shouldNotify) notifyLocal("SUBMISSION_RECORDED", payload);
      }
    } else if (type === "SCORE_LOGGED") {
      const entry = payload?.entry || payload;
      if (entry && entry.id) {
        const log = load(STORAGE_KEYS.SCORE_LOG, []);
        if (!log.some(e => e.id === entry.id)) {
          log.unshift(entry);
          save(STORAGE_KEYS.SCORE_LOG, log);
          if (shouldNotify) notifyLocal("SCORE_LOGGED", entry);
        }
      }
    } else if (type === "GAME_RESET") {
      const incomingTime = Number(eventData.timestamp || payload?.timestamp || 0);
      const current = load(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
      const currentTime = Number(current.updatedAt || 0);
      if (incomingTime && currentTime && incomingTime < currentTime) {
        return;
      }
      const resetRound = { ...DEFAULT_ROUND_STATE, updatedAt: incomingTime || Date.now() };
      save(STORAGE_KEYS.ROUND_STATE, resetRound);
      save(STORAGE_KEYS.BUZZER, DEFAULT_BUZZER_STATE);
      save(STORAGE_KEYS.SCORE_LOG, []);
      save(STORAGE_KEYS.SUBMISSIONS, {});
      const teams = load(STORAGE_KEYS.TEAMS, []).map(t => ({
        ...t, score: 0, totalResponseTime: 0, answerCount: 0, round2Group: null, qualifiedRound2: false, qualifiedFinal: false, finalRank: null
      }));
      save(STORAGE_KEYS.TEAMS, teams);
      if (shouldNotify) {
        notifyLocal("GAME_RESET", {});
        notifyLocal("ROUND_STATE_UPDATED", resetRound);
        notifyLocal("BUZZER_RESET", DEFAULT_BUZZER_STATE);
        notifyLocal("TEAMS_UPDATED", teams);
      }
    }
  },

  // Listen for broadcast messages across tabs & devices
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
    if (typeof window !== "undefined") {
      window.addEventListener("cnx_sync_event", windowHandler);
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener("message", channelHandler);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("cnx_sync_event", windowHandler);
      }
    };
  },

  // --- ROUND STATE ---
  getRoundState() {
    return load(STORAGE_KEYS.ROUND_STATE, DEFAULT_ROUND_STATE);
  },

  updateRoundState(updates) {
    const current = this.getRoundState();
    const now = Date.now();
    const updated = { ...current, ...updates, updatedAt: now };
    save(STORAGE_KEYS.ROUND_STATE, updated);
    broadcast("ROUND_STATE_UPDATED", { roundState: updated });
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
    const trimmedTeamName = (teamData.teamName || "").trim();
    const existingIndex = teams.findIndex(
      t => (teamData.id && t.id === teamData.id) || 
           t.teamName.toLowerCase() === trimmedTeamName.toLowerCase()
    );

    const cleanLeader = (teamData.leaderName || (teamData.members && teamData.members[0]) || "").trim();
    const rawMembers = Array.isArray(teamData.members) && teamData.members.length > 0
      ? teamData.members.map(m => (m || "").trim()).filter(Boolean)
      : [cleanLeader].filter(Boolean);

    const membersList = rawMembers.includes(cleanLeader) ? rawMembers : [cleanLeader, ...rawMembers];

    if (existingIndex >= 0) {
      // Existing team found: update details and return
      const existing = teams[existingIndex];
      const updated = {
        ...existing,
        collegeName: (teamData.collegeName || existing.collegeName || "").trim(),
        leaderName: cleanLeader || existing.leaderName,
        members: membersList.length > 0 ? membersList : existing.members,
        contactEmail: teamData.contactEmail || existing.contactEmail || "",
        contactPhone: teamData.contactPhone || existing.contactPhone || "",
        lastActive: Date.now()
      };
      teams[existingIndex] = updated;
      save(STORAGE_KEYS.TEAMS, teams);
      broadcast("TEAM_UPDATED", { team: updated });
      return updated;
    }

    const assignedCode = teamData.teamCode || generateTeamCode(teams);

    const newTeam = {
      id: teamData.id || `team_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      teamName: trimmedTeamName,
      teamCode: assignedCode,
      leaderName: cleanLeader,
      collegeName: (teamData.collegeName || "").trim(),
      members: membersList,
      contactEmail: teamData.contactEmail || "",
      contactPhone: teamData.contactPhone || "",
      score: 0,
      totalResponseTime: 0,
      answerCount: 0,
      currentRound: 1,
      round2Group: null,
      qualifiedRound2: false,
      qualifiedFinal: false,
      finalRank: null,
      registeredAt: Date.now(),
      lastActive: Date.now()
    };

    teams.push(newTeam);
    save(STORAGE_KEYS.TEAMS, teams);
    broadcast("TEAM_REGISTERED", { team: newTeam });
    return newTeam;
  },

  /**
   * Teammate Join with Code & Registered Name
   * Features:
   * 1. Auto-pulls latest teams from Cloud Relay
   * 2. Tolerant code matching (e.g. 4821, CNX-4821, cnx 4821)
   * 3. Flexible name matching (case-insensitive, substring, leader name)
   * 4. Auto-enrolls new teammate into team if code is valid and slots are available (< 3 members)
   */
  async joinTeamByCode(registeredName, teamCode) {
    // 1. Immediately pull fresh cloud data in case another device registered
    await this.pullFromCloud();

    let teams = this.getTeams();
    const cleanInputName = (registeredName || "").trim();
    const cleanInputCode = (teamCode || "").trim();

    if (!cleanInputCode) {
      return { success: false, message: "Please enter your 4-digit Team Code (e.g. 4821 or CNX-4821)." };
    }
    if (!cleanInputName) {
      return { success: false, message: "Please enter your Registered Name." };
    }

    // Helper to find team by code or team name
    const findMatchingTeam = (teamList) => {
      return teamList.find(t => 
        isCodeMatch(cleanInputCode, t.teamCode) || 
        (t.teamName && t.teamName.trim().toLowerCase() === cleanInputCode.toLowerCase()) ||
        isCodeMatch(cleanInputName, t.teamCode) ||
        (t.teamName && t.teamName.trim().toLowerCase() === cleanInputName.toLowerCase())
      );
    };

    let matchedTeam = findMatchingTeam(teams);

    // If not found in current memory, try a second forced pull from cloud
    if (!matchedTeam) {
      await this.pullFromCloud();
      teams = this.getTeams();
      matchedTeam = findMatchingTeam(teams);
    }

    if (!matchedTeam) {
      return { 
        success: false, 
        message: `No team found for code "${cleanInputCode}". Please ask your Team Leader for the 4-digit code shown on their screen.` 
      };
    }

    // Team code is valid! Now verify or enroll name
    const lowerInputName = cleanInputName.toLowerCase();
    const currentMembers = Array.isArray(matchedTeam.members) ? [...matchedTeam.members] : [];

    const isLeader = (matchedTeam.leaderName || "").trim().toLowerCase() === lowerInputName;
    const isTeamName = (matchedTeam.teamName || "").trim().toLowerCase() === lowerInputName;

    const memberIndex = currentMembers.findIndex(m => {
      const cleanM = (m || "").trim().toLowerCase();
      if (!cleanM) return false;
      if (cleanM === lowerInputName) return true;
      if (cleanM.length > 2 && lowerInputName.length > 2) {
        if (cleanM.includes(lowerInputName) || lowerInputName.includes(cleanM)) return true;
      }
      return false;
    });

    if (isLeader || isTeamName || memberIndex >= 0) {
      // Recognized member of team!
      return {
        success: true,
        team: matchedTeam,
        message: `Welcome, ${cleanInputName}! Connected to team ${matchedTeam.teamName}.`
      };
    }

    // If team has fewer than 3 members, auto-enroll this teammate!
    if (currentMembers.length < 3) {
      currentMembers.push(cleanInputName);
      matchedTeam.members = currentMembers;
      this.updateTeam(matchedTeam.id, { members: currentMembers });
      return {
        success: true,
        team: matchedTeam,
        message: `Successfully enrolled and connected to team ${matchedTeam.teamName}!`
      };
    }

    // If team is full with 3 members, allow this teammate device to connect
    if (!matchedTeam.connectedMembers) matchedTeam.connectedMembers = [];
    if (!matchedTeam.connectedMembers.includes(cleanInputName)) {
      matchedTeam.connectedMembers.push(cleanInputName);
      this.updateTeam(matchedTeam.id, { connectedMembers: matchedTeam.connectedMembers });
    }
    return {
      success: true,
      team: matchedTeam,
      message: `Connected to team ${matchedTeam.teamName} as ${cleanInputName}!`
    };
  },

  updateTeam(teamId, updates) {
    const teams = this.getTeams();
    const index = teams.findIndex(t => t.id === teamId);
    if (index >= 0) {
      teams[index] = { ...teams[index], ...updates, lastActive: Date.now() };
      save(STORAGE_KEYS.TEAMS, teams);
      broadcast("TEAM_UPDATED", { team: teams[index] });
      return teams[index];
    }
    return null;
  },

  deleteTeam(teamId) {
    if (!teamId) return { success: false };
    const deleted = load(STORAGE_KEYS.DELETED_TEAM_IDS, []);
    if (!deleted.includes(teamId)) {
      deleted.push(teamId);
      save(STORAGE_KEYS.DELETED_TEAM_IDS, deleted);
    }
    const teams = this.getTeams().filter(t => t.id !== teamId);
    save(STORAGE_KEYS.TEAMS, teams);

    // Clean up submissions for this team
    const allSubs = load(STORAGE_KEYS.SUBMISSIONS, {});
    let subsChanged = false;
    Object.keys(allSubs).forEach(qId => {
      if (Array.isArray(allSubs[qId])) {
        const filtered = allSubs[qId].filter(s => s.teamId !== teamId);
        if (filtered.length !== allSubs[qId].length) {
          allSubs[qId] = filtered;
          subsChanged = true;
        }
      }
    });
    if (subsChanged) save(STORAGE_KEYS.SUBMISSIONS, allSubs);

    // Clean up score logs
    const log = load(STORAGE_KEYS.SCORE_LOG, []).filter(e => e.teamId !== teamId);
    save(STORAGE_KEYS.SCORE_LOG, log);

    broadcast("TEAM_DELETED", { teamId });
    broadcast("TEAMS_UPDATED", teams);
    return { success: true, teams };
  },

  clearAllTeams() {
    const teams = this.getTeams();
    const deleted = load(STORAGE_KEYS.DELETED_TEAM_IDS, []);
    teams.forEach(t => {
      if (!deleted.includes(t.id)) deleted.push(t.id);
    });
    save(STORAGE_KEYS.DELETED_TEAM_IDS, deleted);
    save(STORAGE_KEYS.TEAMS, []);
    save(STORAGE_KEYS.SCORE_LOG, []);
    save(STORAGE_KEYS.SUBMISSIONS, {});

    broadcast("TEAMS_CLEARED", { timestamp: Date.now() });
    broadcast("TEAMS_UPDATED", []);
    return { success: true };
  },

  clearSubmissions(questionId = null) {
    if (questionId) {
      const allSubs = load(STORAGE_KEYS.SUBMISSIONS, {});
      delete allSubs[questionId];
      save(STORAGE_KEYS.SUBMISSIONS, allSubs);
      broadcast("SUBMISSION_RECORDED", { questionId, submission: null, total: 0 });
    } else {
      save(STORAGE_KEYS.SUBMISSIONS, {});
      broadcast("SUBMISSIONS_CLEARED", {});
    }
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
    const now = Date.now();
    const resetRound = { ...DEFAULT_ROUND_STATE, updatedAt: now };
    save(STORAGE_KEYS.ROUND_STATE, resetRound);
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

    broadcast("GAME_RESET", { timestamp: now });
    broadcast("ROUND_STATE_UPDATED", { roundState: resetRound });
    broadcast("BUZZER_RESET", DEFAULT_BUZZER_STATE);
    broadcast("TEAMS_UPDATED", teams);
  }
};