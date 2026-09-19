// CONNEXION - Firestore Service Layer with Dual-Mode Support
import { db, isFirebaseConfigured } from "./config";
import { 
  collection, doc, getDoc, setDoc, updateDoc, onSnapshot, 
  query, orderBy, limit, addDoc, serverTimestamp 
} from "firebase/firestore";
import { mockSync } from "./mockSyncService";
import { isAnswerCorrect, computeRound1Score, computeRankings } from "../utils/scoring";

// ================= ROUND STATE =================
export function subscribeRoundState(callback) {
  if (isFirebaseConfigured && db) {
    const roundDoc = doc(db, "roundState", "active");
    return onSnapshot(roundDoc, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  }

  // Fallback / Mock Mode
  callback(mockSync.getRoundState());
  return mockSync.onEvent((event) => {
    if (event.type === "ROUND_STATE_UPDATED" || event.type === "GAME_RESET") {
      callback(mockSync.getRoundState());
    }
  });
}

export async function updateRoundState(updates) {
  if (isFirebaseConfigured && db) {
    const roundDoc = doc(db, "roundState", "active");
    await setDoc(roundDoc, { ...updates, lastUpdated: serverTimestamp() }, { merge: true });
    return updates;
  }
  return mockSync.updateRoundState(updates);
}

// ================= TEAMS =================

/**
 * Narrowly scoped single-team listener for participant mobile/laptop
 */
export function subscribeTeam(teamId, callback) {
  if (!teamId) return () => {};

  if (isFirebaseConfigured && db) {
    const teamDoc = doc(db, "teams", teamId);
    return onSnapshot(teamDoc, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      }
    });
  }

  callback(mockSync.getTeam(teamId));
  return mockSync.onEvent((event) => {
    if (
      event.type === "TEAMS_UPDATED" || 
      event.type === "TEAM_UPDATED" || 
      event.type === "TEAM_REGISTERED" || 
      event.type === "GAME_RESET"
    ) {
      callback(mockSync.getTeam(teamId));
    }
  });
}

/**
 * Subscribes to all teams (Admin & Leaderboard only)
 */
export function subscribeTeams(callback) {
  if (isFirebaseConfigured && db) {
    const teamsCol = collection(db, "teams");
    const q = query(teamsCol, orderBy("score", "desc"));
    return onSnapshot(q, (snapshot) => {
      const teams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(computeRankings(teams));
    });
  }

  callback(computeRankings(mockSync.getTeams()));
  return mockSync.onEvent((event) => {
    if (
      event.type === "TEAMS_UPDATED" || 
      event.type === "TEAM_REGISTERED" || 
      event.type === "TEAM_UPDATED" || 
      event.type === "GAME_RESET" || 
      event.type === "SCORE_LOGGED"
    ) {
      callback(computeRankings(mockSync.getTeams()));
    }
  });
}

export async function registerTeam(teamData) {
  if (isFirebaseConfigured && db) {
    const teamId = teamData.id || `team_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const teamDoc = doc(db, "teams", teamId);
    const data = {
      ...teamData,
      id: teamId,
      score: 0,
      totalResponseTime: 0,
      qualifiedRound2: false,
      qualifiedFinal: false,
      currentRound: 1,
      registeredAt: serverTimestamp()
    };
    await setDoc(teamDoc, data, { merge: true });
    return data;
  }

  return mockSync.registerTeam(teamData);
}

// ================= QUESTIONS =================

export function subscribeQuestions(callback) {
  callback(mockSync.getQuestions());
  return mockSync.onEvent((event) => {
    if (event.type === "QUESTIONS_UPDATED") {
      callback(mockSync.getQuestions());
    }
  });
}

export function saveQuestions(questions) {
  mockSync.saveQuestions(questions);
}

export function resetQuestionsToDefault() {
  return mockSync.resetQuestionsToDefault();
}

// ================= SUBMISSIONS & AUTO-SCORING =================

export function submitAnswer(questionId, teamId, answer, timeRemaining) {
  return mockSync.submitAnswer(questionId, teamId, answer, timeRemaining);
}

export function subscribeSubmissions(questionId, callback) {
  callback(mockSync.getSubmissions(questionId));
  return mockSync.onEvent((event) => {
    if (event.type === "SUBMISSION_RECORDED" && event.payload.questionId === questionId) {
      callback(mockSync.getSubmissions(questionId));
    }
  });
}

/**
 * Automated server/admin scoring for Round 1
 * Evaluates all submissions, awards points + speed bonus, updates scoreLog
 */
export function autoScoreQuestion(question, submissions = []) {
  if (!question || !Array.isArray(submissions) || submissions.length === 0) {
    return { correctCount: 0, wrongCount: 0, total: 0 };
  }

  const teams = mockSync.getTeams();
  const log = mockSync.getScoreLog();
  let correctCount = 0;
  let wrongCount = 0;
  let teamsChanged = false;

  submissions.forEach((sub) => {
    const team = teams.find(t => t.id === sub.teamId);
    if (!team) return;

    const isCorrect = isAnswerCorrect(sub.answer, question.correctAnswer, question.aliases);

    if (isCorrect) {
      correctCount++;
      const { totalPoints, bonus, answeredTime } = computeRound1Score(
        sub.timeRemaining, 
        question.points || 10, 
        question.speedBonus || 5
      );

      const entry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        teamId: team.id,
        teamName: team.teamName,
        questionId: question.id,
        pointsAwarded: totalPoints,
        verdict: "correct",
        details: `Correct answer "${sub.answer}". Base: ${question.points || 10} + Speed Bonus: ${bonus} (${answeredTime}s)`,
        timestamp: Date.now()
      };
      log.unshift(entry);

      // Update team stats & score directly in memory
      team.score = (Number(team.score) || 0) + totalPoints;
      team.totalResponseTime = (Number(team.totalResponseTime) || 0) + answeredTime;
      team.answerCount = (Number(team.answerCount) || 0) + 1;
      team.lastActive = Date.now();
      teamsChanged = true;
    } else {
      wrongCount++;
      const entry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        teamId: team.id,
        teamName: team.teamName,
        questionId: question.id,
        pointsAwarded: 0,
        verdict: "wrong",
        details: `Submitted "${sub.answer}". Correct was "${question.correctAnswer}".`,
        timestamp: Date.now()
      };
      log.unshift(entry);
    }
  });

  // Single batch persistence to prevent cloud network choking
  if (teamsChanged) {
    mockSync.saveTeamsDirect(teams);
  }
  mockSync.saveScoreLogDirect(log);

  return { correctCount, wrongCount, total: submissions.length };
}

// ================= SCORE LOG / AUDIT TRAIL =================

export function subscribeScoreLog(callback) {
  callback(mockSync.getScoreLog());
  return mockSync.onEvent((event) => {
    if (event.type === "SCORE_LOGGED" || event.type === "GAME_RESET") {
      callback(mockSync.getScoreLog());
    }
  });
}

export function recordScoreLog(entry) {
  return mockSync.logScore(entry);
}

// ================= TEAM MANAGEMENT =================

export function deleteTeam(teamId) {
  return mockSync.deleteTeam(teamId);
}

export function clearAllTeams() {
  return mockSync.clearAllTeams();
}

export function clearSubmissions(questionId = null) {
  return mockSync.clearSubmissions(questionId);
}

// ================= ADVANCEMENT & RESET =================

export function lockAndComputeTop15() {
  return mockSync.lockAndComputeTop15();
}

export function qualifyTop3Finalists() {
  return mockSync.qualifyTop3Finalists();
}

export function resetGame() {
  return mockSync.resetGame();
}
export async function joinTeamByCode(registeredName, teamCode) {
  return await mockSync.joinTeamByCode(registeredName, teamCode);
}
