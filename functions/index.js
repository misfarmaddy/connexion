const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();

/**
 * Server-authoritative atomic buzzer transaction handler
 */
exports.onBuzzerPress = functions.database.ref('/buzzerState/buzzQueue/{pushId}')
  .onCreate(async (snapshot, context) => {
    const buzz = snapshot.val();
    const buzzerRef = rtdb.ref('/buzzerState');

    await buzzerRef.transaction((current) => {
      if (!current || !current.armed) return current;
      if (!current.firstBuzz) {
        current.firstBuzz = {
          ...buzz,
          serverTimestamp: admin.database.ServerValue.TIMESTAMP
        };
      }
      return current;
    });
  });

/**
 * Server-authoritative Round 1 scoring
 */
exports.autoScoreRound1 = functions.https.onCall(async (data, context) => {
  const { questionId, correctAnswer, aliases, basePoints, maxSpeedBonus } = data;
  const submissionsSnap = await db.collection('submissions').where('questionId', '==', questionId).get();
  
  const batch = db.batch();
  let correctCount = 0;

  submissionsSnap.forEach((doc) => {
    const sub = doc.data();
    const cleanSub = (sub.answer || '').toLowerCase().trim();
    const validAnswers = [correctAnswer, ...(aliases || [])].map(a => (a || '').toLowerCase().trim());
    
    const isCorrect = validAnswers.includes(cleanSub);
    if (isCorrect) {
      correctCount++;
      const timeRemaining = Number(sub.timeRemaining) || 0;
      const bonus = Math.round((Math.max(0, Math.min(30, timeRemaining)) / 30) * (maxSpeedBonus || 5));
      const totalPoints = (basePoints || 10) + bonus;

      const teamRef = db.collection('teams').doc(sub.teamId);
      batch.update(teamRef, {
        score: admin.firestore.FieldValue.increment(totalPoints),
        totalResponseTime: admin.firestore.FieldValue.increment(30 - timeRemaining)
      });

      const logRef = db.collection('scoreLog').doc();
      batch.set(logRef, {
        teamId: sub.teamId,
        questionId,
        pointsAwarded: totalPoints,
        verdict: 'correct',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

  await batch.commit();
  return { success: true, correctCount, total: submissionsSnap.size };
});
