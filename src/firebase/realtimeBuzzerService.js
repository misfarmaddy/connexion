// CONNEXION - Low-Latency Server-Authoritative Buzzer Engine
import { rtdb, isFirebaseConfigured } from "./config";
import { ref, onValue, set, runTransaction, serverTimestamp } from "firebase/database";
import { mockSync } from "./mockSyncService";

// Server time offset tracker
let serverTimeOffset = 0;

if (isFirebaseConfigured && rtdb) {
  const offsetRef = ref(rtdb, ".info/serverTimeOffset");
  onValue(offsetRef, (snap) => {
    serverTimeOffset = snap.val() || 0;
  });
}

export function getServerTime() {
  return Date.now() + serverTimeOffset;
}

export function subscribeBuzzer(callback) {
  if (isFirebaseConfigured && rtdb) {
    const buzzerRef = ref(rtdb, "buzzerState");
    return onValue(buzzerRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {
        armed: false,
        activeGroup: null,
        firstBuzz: null,
        buzzQueue: []
      });
    });
  }

  // Fallback / Mock Mode
  callback(mockSync.getBuzzerState());
  return mockSync.onEvent((event) => {
    if (
      event.type === "BUZZER_ARMED" ||
      event.type === "BUZZER_RESET" ||
      event.type === "BUZZER_PRESSED" ||
      event.type === "GAME_RESET"
    ) {
      callback(mockSync.getBuzzerState());
    }
  });
}

export async function armBuzzer(activeGroup, questionId) {
  if (isFirebaseConfigured && rtdb) {
    const buzzerRef = ref(rtdb, "buzzerState");
    const state = {
      armed: true,
      activeGroup: activeGroup || "A",
      currentQuestionId: questionId || null,
      armedTimestamp: Date.now() + serverTimeOffset,
      firstBuzz: null,
      buzzQueue: []
    };
    await set(buzzerRef, state);
    return state;
  }

  return mockSync.armBuzzer(activeGroup, questionId);
}

export async function resetBuzzer() {
  if (isFirebaseConfigured && rtdb) {
    const buzzerRef = ref(rtdb, "buzzerState");
    const state = {
      armed: false,
      activeGroup: null,
      currentQuestionId: null,
      armedTimestamp: null,
      firstBuzz: null,
      buzzQueue: []
    };
    await set(buzzerRef, state);
    return state;
  }

  return mockSync.resetBuzzer();
}

/**
 * Atomic buzzer press.
 * Realtime DB transaction guarantees that only the very first transaction wins firstBuzz.
 */
export async function pressBuzzer(teamId, teamName) {
  if (isFirebaseConfigured && rtdb) {
    const buzzerRef = ref(rtdb, "buzzerState");

    let isFirst = false;
    let buzzEntry = null;

    try {
      const result = await runTransaction(buzzerRef, (current) => {
        if (!current || !current.armed) return current; // Can't buzz if disarmed

        const now = Date.now() + serverTimeOffset;
        const latencyDeltaMs = current.armedTimestamp ? now - current.armedTimestamp : 0;

        if (!current.buzzQueue) current.buzzQueue = [];

        // Check if already buzzed
        const exists = current.buzzQueue.some((b) => b.teamId === teamId);
        if (exists) return current;

        buzzEntry = {
          teamId,
          teamName,
          serverTimestamp: now,
          latencyDeltaMs
        };

        if (!current.firstBuzz) {
          current.firstBuzz = buzzEntry;
          isFirst = true;
        }

        current.buzzQueue.push(buzzEntry);
        return current;
      });

      return {
        success: result.committed && Boolean(buzzEntry),
        isFirst,
        buzzEntry
      };
    } catch (e) {
      console.error("Buzzer transaction failed:", e);
      return { success: false, error: e.message };
    }
  }

  return mockSync.pressBuzzer(teamId, teamName);
}