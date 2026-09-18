// CONNEXION - Scoring, Fuzzy Matching & Ranking Algorithms

/**
 * Normalizes answer string for case-insensitive, punctuation-insensitive matching
 */
export function normalizeAnswer(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Phonetic transliteration helper for common Tamil-English spelling variances
 */
function phoneticSimplify(str) {
  if (!str) return "";
  return str
    .replace(/th/g, "t")
    .replace(/dh/g, "d")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/aa/g, "a")
    .replace(/zh/g, "l")
    .replace(/ck/g, "k");
}

/**
 * Checks if a submitted answer matches the correct answer or any valid alias
 * Tolerant to:
 * - Casing (uppercase/lowercase)
 * - Spacing mistakes (missing spaces, extra spaces, connected words)
 * - Minor spelling typos (Levenshtein distance 1-2)
 * - Common suffixes/prefixes ("movie", "film", "the", "dr", "sir")
 * - Tamil phonetic transliterations
 */
export function isAnswerCorrect(submitted, correctAnswer, aliases = []) {
  const cleanSubmitted = normalizeAnswer(submitted);
  if (!cleanSubmitted) return false;

  // Build list of valid targets
  const rawTargets = [correctAnswer, ...(aliases || [])].filter(Boolean);
  const validOptions = rawTargets.map(normalizeAnswer);

  // 1. Direct normalized match
  if (validOptions.includes(cleanSubmitted)) return true;

  // 2. Space-stripped match (e.g. "leo das" === "leodas", "anirudh ravichander" === "anirudhravichander")
  const noSpaceSubmitted = cleanSubmitted.replace(/\s+/g, "");
  const noSpaceOptions = validOptions.map(opt => opt.replace(/\s+/g, ""));
  if (noSpaceOptions.includes(noSpaceSubmitted)) return true;

  // 3. Prefix / Suffix stripped match (e.g., "leo movie" -> "leo", "the jailer" -> "jailer")
  const strippedSubmitted = cleanSubmitted
    .replace(/^(the|a|an|dr|mr)\s+/, "")
    .replace(/\s+(movie|film|cinema|sir)$/, "")
    .trim();
  if (strippedSubmitted && validOptions.includes(strippedSubmitted)) return true;
  if (strippedSubmitted && noSpaceOptions.includes(strippedSubmitted.replace(/\s+/g, ""))) return true;

  // 4. Substring / Containment match if length is reasonable
  for (const opt of validOptions) {
    if (opt.length >= 3 && cleanSubmitted.length >= 3) {
      if (opt === cleanSubmitted || opt.includes(cleanSubmitted) || cleanSubmitted.includes(opt)) {
        return true;
      }
    }
  }

  // 5. Significant word token match (e.g. submitted "parthiban" or "kalam" or "gukesh" or "vadivelu")
  const submittedWords = cleanSubmitted.split(" ").filter(w => w.length >= 3);
  for (const opt of validOptions) {
    const optWords = opt.split(" ").filter(w => w.length >= 3);
    for (const sw of submittedWords) {
      if (optWords.includes(sw)) return true;
      // Match with 1 typo on significant word of 5+ chars
      if (sw.length >= 5 && optWords.some(ow => ow.length >= 5 && getEditDistance(sw, ow) <= 1)) {
        return true;
      }
    }
  }

  // 6. Phonetic transliteration match
  const phonSubmitted = phoneticSimplify(noSpaceSubmitted);
  for (const opt of noSpaceOptions) {
    if (phoneticSimplify(opt) === phonSubmitted) return true;
  }

  // 7. Levenshtein edit distance tolerance for minor typos:
  // - 1 typo allowed for 4-6 char words
  // - 2 typos allowed for 7+ char words
  for (const opt of validOptions) {
    const noSpaceOpt = opt.replace(/\s+/g, "");
    const maxLen = Math.max(noSpaceSubmitted.length, noSpaceOpt.length);
    if (maxLen >= 4 && maxLen <= 6) {
      if (getEditDistance(noSpaceSubmitted, noSpaceOpt) <= 1) return true;
    } else if (maxLen >= 7) {
      if (getEditDistance(noSpaceSubmitted, noSpaceOpt) <= 2) return true;
    }
  }

  return false;
}

/**
 * Computes Levenshtein edit distance
 */
function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion / deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Computes Round 1 score: Base points + linear Speed bonus
 * Duration is 30s. If answered with 20s remaining, speed ratio = 20 / 30
 */
export function computeRound1Score(timeRemainingSeconds, basePoints = 10, maxSpeedBonus = 5) {
  const safeTime = Math.max(0, Math.min(30, timeRemainingSeconds || 0));
  const bonus = Math.round((safeTime / 30) * maxSpeedBonus);
  return {
    basePoints,
    bonus,
    totalPoints: basePoints + bonus,
    answeredTime: Number((30 - safeTime).toFixed(2))
  };
}

/**
 * Computes sorted standings from teams array.
 * Primary Sort: Score (descending)
 * Secondary Sort: Total Answer Speed / Time (ascending - faster is better)
 */
export function computeRankings(teams = []) {
  const sorted = [...teams].sort((a, b) => {
    // 1. Primary: Score
    const scoreA = Number(a.score) || 0;
    const scoreB = Number(b.score) || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;

    // 2. Secondary: Average / Total response time
    const speedA = Number(a.totalResponseTime) || 9999;
    const speedB = Number(b.totalResponseTime) || 9999;
    return speedA - speedB;
  });

  return sorted.map((team, idx) => ({
    ...team,
    rank: idx + 1
  }));
}

/**
 * Detects if there is an exact tie at rank 15 for Round 1 qualification.
 * If team at index 14 (rank 15) has the exact same score and speed as team at index 15 (rank 16),
 * a tie exists and sudden death is required!
 */
export function checkForTieAtRank15(rankedTeams = []) {
  if (rankedTeams.length <= 15) return { hasTie: false, tiedTeams: [] };

  const rank15Team = rankedTeams[14];
  const rank16Team = rankedTeams[15];

  const score15 = Number(rank15Team.score) || 0;
  const score16 = Number(rank16Team.score) || 0;

  const speed15 = Number(rank15Team.totalResponseTime) || 0;
  const speed16 = Number(rank16Team.totalResponseTime) || 0;

  if (score15 === score16 && Math.abs(speed15 - speed16) < 0.2) {
    // Collect all teams tied with rank 15
    const tied = rankedTeams.filter(t => (
      (Number(t.score) || 0) === score15 &&
      Math.abs((Number(t.totalResponseTime) || 0) - speed15) < 0.2
    ));
    return { hasTie: true, tiedTeams: tied };
  }

  return { hasTie: false, tiedTeams: [] };
}

/**
 * Partitions the Top 15 qualifiers into 3 balanced groups of 5 for Round 2
 * Uses serpentine seeding:
 * Group A: 1, 6, 7, 12, 13
 * Group B: 2, 5, 8, 11, 14
 * Group C: 3, 4, 9, 10, 15
 */
export function partitionIntoGroups(top15Teams = []) {
  const groups = {
    A: [],
    B: [],
    C: []
  };

  const groupKeys = ['A', 'B', 'C', 'C', 'B', 'A']; // Serpentine pattern

  top15Teams.slice(0, 15).forEach((team, idx) => {
    const groupKey = groupKeys[idx % groupKeys.length];
    groups[groupKey].push({
      ...team,
      group: groupKey
    });
  });

  return groups;
}