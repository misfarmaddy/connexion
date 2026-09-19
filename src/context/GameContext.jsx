// CONNEXION - Global Game State Context
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { 
  subscribeRoundState, 
  updateRoundState as apiUpdateRoundState,
  subscribeQuestions, 
  subscribeTeams,
  subscribeScoreLog,
  submitAnswer as apiSubmitAnswer,
  autoScoreQuestion,
  lockAndComputeTop15 as apiLockTop15,
  resetGame as apiResetGame,
  deleteTeam as apiDeleteTeam,
  clearAllTeams as apiClearAllTeams,
  clearSubmissions as apiClearSubmissions
} from "../firebase/firestoreService";
import { 
  subscribeBuzzer, 
  armBuzzer as apiArmBuzzer, 
  resetBuzzer as apiResetBuzzer, 
  pressBuzzer as apiPressBuzzer 
} from "../firebase/realtimeBuzzerService";
import { mockSync } from "../firebase/mockSyncService";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [roundState, setRoundState] = useState(() => mockSync.getRoundState());

  const [buzzerState, setBuzzerState] = useState(() => (
    mockSync.getBuzzerState ? mockSync.getBuzzerState() : {
      armed: false,
      activeGroup: "A",
      currentQuestionId: null,
      armedTimestamp: null,
      firstBuzz: null,
      buzzQueue: []
    }
  ));

  const [questions, setQuestions] = useState(() => mockSync.getQuestions());
  const [teams, setTeams] = useState(() => mockSync.getTeams());
  const [scoreLog, setScoreLog] = useState(() => (mockSync.getScoreLog ? mockSync.getScoreLog() : []));
  const [timeRemaining, setTimeRemaining] = useState(30);

  // Subscriptions to live data sources
  useEffect(() => {
    const unsubRound = subscribeRoundState(setRoundState);
    const unsubBuzzer = subscribeBuzzer(setBuzzerState);
    const unsubQuestions = subscribeQuestions(setQuestions);
    const unsubTeams = subscribeTeams(setTeams);
    const unsubLogs = subscribeScoreLog(setScoreLog);

    return () => {
      unsubRound();
      unsubBuzzer();
      unsubQuestions();
      unsubTeams();
      unsubLogs();
    };
  }, []);

  // Server-authoritative timer countdown calculation (skew-proof using local baseline)
  useEffect(() => {
    const duration = typeof roundState.duration === "number" && !isNaN(roundState.duration) && roundState.duration > 0
      ? roundState.duration
      : 30;

    if (roundState.status !== "live") {
      if (roundState.status === "locked" || roundState.status === "revealed") {
        setTimeRemaining(0);
      } else {
        setTimeRemaining(duration);
      }
      return;
    }

    // Local baseline timestamp prevents clock drift crashes across devices
    const startTs = roundState.localReceivedAt || roundState.questionStartTimestamp || Date.now();

    const calcRemaining = () => {
      const now = Date.now();
      const elapsed = Math.max(0, (now - startTs) / 1000);
      const remaining = Math.max(0, Math.min(duration, duration - elapsed));
      const safe = !isNaN(remaining) ? Number(remaining.toFixed(1)) : 0;
      setTimeRemaining(safe);
      return safe;
    };

    const initialRem = calcRemaining();
    if (initialRem <= 0) return;

    const interval = setInterval(() => {
      const remaining = calcRemaining();
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [roundState.status, roundState.questionStartTimestamp, roundState.localReceivedAt, roundState.duration]);

  // Determine active question object
  const activeQuestion = useMemo(() => {
    return questions.find(q => q.id === roundState.currentQuestionId) || questions[0] || null;
  }, [questions, roundState.currentQuestionId]);

  // Round 1 Questions
  const round1Questions = useMemo(() => {
    return questions.filter(q => q.round === 1 && !q.isSuddenDeath);
  }, [questions]);

  // Sudden Death Questions
  const suddenDeathQuestions = useMemo(() => {
    return questions.filter(q => q.isSuddenDeath);
  }, [questions]);

  // Round 2 Questions
  const round2Questions = useMemo(() => {
    return questions.filter(q => q.round === 2);
  }, [questions]);

  // Round 3 Questions
  const round3Questions = useMemo(() => {
    return questions.filter(q => q.round === 3);
  }, [questions]);

  // Game Control Actions
  const updateRoundState = async (updates) => {
    return await apiUpdateRoundState(updates);
  };

  const armBuzzer = async (group, questionId) => {
    return await apiArmBuzzer(group, questionId);
  };

  const resetBuzzer = async () => {
    return await apiResetBuzzer();
  };

  const pressBuzzer = async (teamId, teamName) => {
    return await apiPressBuzzer(teamId, teamName);
  };

  const submitAnswer = (questionId, teamId, answer) => {
    return apiSubmitAnswer(questionId, teamId, answer, timeRemaining);
  };

  const triggerAutoScore = (questionId) => {
    const q = questions.find(item => item.id === questionId) || activeQuestion;
    const subs = mockSync.getSubmissions(questionId);
    return autoScoreQuestion(q, subs);
  };

  const lockAndComputeTop15 = () => {
    return apiLockTop15();
  };

  const resetGame = () => {
    apiResetGame();
  };

  const deleteTeam = (teamId) => {
    return apiDeleteTeam(teamId);
  };

  const clearAllTeams = () => {
    return apiClearAllTeams();
  };

  const clearSubmissions = (questionId = null) => {
    return apiClearSubmissions(questionId);
  };

  const resetRound = (roundNumber = 1) => {
    if (roundNumber === 1) {
      const firstQ = round1Questions.find(q => !q.isBackup && !q.isSuddenDeath) || round1Questions[0];
      apiClearSubmissions();
      updateRoundState({
        currentRound: 1,
        currentQuestionId: firstQ ? firstQ.id : "r1_q01",
        status: "waiting",
        questionStartTimestamp: null,
        duration: 30,
        suddenDeathActive: false,
        suddenDeathTeamIds: [],
        roundCompleted: false
      });
    } else if (roundNumber === 2) {
      const grpPool = round2Questions.filter(q => q.group === roundState.activeGroup);
      const firstQ = grpPool[0] || round2Questions[0];
      apiResetBuzzer();
      updateRoundState({
        currentRound: 2,
        currentQuestionId: firstQ ? firstQ.id : "r2_gA_q01",
        status: "waiting",
        questionStartTimestamp: null,
        duration: 20
      });
    } else if (roundNumber === 3) {
      const firstQ = round3Questions[0];
      apiResetBuzzer();
      updateRoundState({
        currentRound: 3,
        currentQuestionId: firstQ ? firstQ.id : "r3_q01",
        status: "waiting",
        questionStartTimestamp: null,
        duration: 20
      });
    }
  };

  const addQuestion = (newQuestion) => {
    const updated = [...questions, newQuestion];
    mockSync.saveQuestions(updated);
    setQuestions(updated);
    return updated;
  };

  const deleteQuestion = (questionId) => {
    const updated = questions.filter(q => q.id !== questionId);
    mockSync.saveQuestions(updated);
    setQuestions(updated);
    return updated;
  };

  const updateQuestion = (questionId, updates) => {
    const updated = questions.map(q => q.id === questionId ? { ...q, ...updates } : q);
    mockSync.saveQuestions(updated);
    setQuestions(updated);
    return updated;
  };

  return (
    <GameContext.Provider
      value={{
        roundState,
        buzzerState,
        questions,
        activeQuestion,
        round1Questions,
        suddenDeathQuestions,
        round2Questions,
        round3Questions,
        teams,
        scoreLog,
        timeRemaining,
        updateRoundState,
        armBuzzer,
        resetBuzzer,
        pressBuzzer,
        submitAnswer,
        triggerAutoScore,
        lockAndComputeTop15,
        resetGame,
        deleteTeam,
        clearAllTeams,
        resetRound,
        clearSubmissions,
        addQuestion,
        deleteQuestion,
        updateQuestion
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}