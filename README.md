# ? CONNEXION ? Master Image-Connection Quiz Platform

> **Full-Stack Symposium Image Quiz & Live Buzzer Battle System**  
> Designed for college department symposiums to host **50+ teams (100+ concurrent devices)** with zero-bias buzzer resolution, automated scoring, real-time sync, and projector display.

---

## ?? Key Highlights & Architecture

- **Dual-Mode Sync Engine**:
  - **Instant Zero-Config Mode**: Uses `BroadcastChannel` and cross-tab synchronization so you can open Admin, Big-Screen Display, and multiple Participant tabs on the same computer or local network and run the entire competition immediately with zero configuration!
  - **Production Firebase Mode**: Connects to Google Cloud / Firebase (`Firestore` for persistent teams/questions/scores, and `Firebase Realtime Database` for sub-millisecond atomic first-buzz resolution).
- **Zero-Bias Atomic Buzzer**:
  - Employs Realtime DB atomic transactions and server timestamp offsets (`.info/serverTimeOffset`).
  - Only the very earliest millisecond write claims `#1 First Buzz`; all subsequent taps are timestamped and placed in an audited queue.
- **Server-Authoritative Round 1 Timer**:
  - 30-second countdown synchronized to the server start timestamp, completely immune to client device clock discrepancies.
  - Auto-submits typed answers when the timer reaches zero.
- **Dynamic Speed Bonus Scoring**:
  - `Total Points = Base Points + round((Time Remaining / 30) * Max Speed Bonus)`
  - Rewards sharp, instantaneous recognition while preserving fair base points.
- **Automated Cutoff & Sudden-Death Tiebreaker**:
  - One-click locks the Top 15 qualifiers into 3 serpentine groups of 5 for Round 2.
  - Detects if there is an exact tie at Rank 15 and automatically launches a sudden-death question shown *only* to the tied teams!
- **Auditorium Projector View (`/display`)**:
  - 16:9 / 4K broadcast-optimized route featuring clue cards, giant synchronized timer gauge, dramatic buzzer announcements, and a live top-5 ticker.
- **Native Web Audio API Sound Generator**:
  - Authentic game-show buzzer horns, countdown tension ticks, ascending victory arpeggios, penalty buzzers, and winner fanfares built straight into the browser (zero external audio file dependencies).
- **Full Audit Trail (`scoreLog`)**:
  - Every single point awarded or penalty applied is logged immutably with timestamp, teamId, verdict, and reason.

---

## ?? Portals & Routes

| Route | Portal | Description |
|---|---|---|
| `/` | **Participant Portal** | Team registration/login, live connection clue images, 30s countdown, typed/MCQ answer submission, tactile Round 2/3 arcade buzzer, live standing & qualification cards. |
| `/admin` | **Admin Command Center** | Protected gate (passcode: `admin123`). Push questions, start/stop timers, live submission counter, auto-scoring engine, lock Top 15 with sudden-death tiebreaker detection, Round 2/3 group buzzer referee with Correct/Wrong verdict buttons, score audit log, and 50-team load simulator. |
| `/display` | **Big-Screen Projector** | Full-screen broadcast view for symposium auditorium projectors. Shows large clue cards, giant countdown clock, and glowing buzzer winner banners. |
| `/leaderboard` | **Live Leaderboard** | Public real-time standings with search, podium rankings, speed metrics, and qualification filter tabs (Top 15, Groups A/B/C, Finalists). |

---

## ??? Quick Start & Local Demo

### 1. Start Vite dev server
```bash
npm run dev
```

### 2. Multi-Tab Testing Workflow (Instant Demo)
1. Open **Tab 1** at `http://localhost:3000/admin` (Passcode: `admin123`).
2. Open **Tab 2** at `http://localhost:3000/display` (Projector view).
3. Open **Tab 3** at `http://localhost:3000/` and register **Team Alpha** (College X).
4. Open **Tab 4** (or Incognito window) at `http://localhost:3000/` and register **Team Beta** (College Y).
5. In the Admin tab, click **Spawn 25 Teams** under the Symposium Load Simulator.
6. Push **Question 1** live:
   - Watch the 30-second timer count down synchronously across all tabs!
   - Submit answers from Team Alpha and Team Beta.
   - Click **Run Auto-Scorer** in Admin -> scores and speed bonuses are calculated instantly!
7. Advance through Round 1, click **Lock & Seed Top 15**.
8. Switch to **Round 2 (Buzzer)** in Admin:
   - Select Group A and click **ARM BUZZER**.
   - Press **BUZZ** in Team Alpha and Team Beta tabs.
   - Observe the atomic resolution: the earliest tap wins `#1 First Buzz (+140ms)` and immediately locks out the competitor!
   - Mark **Correct (+20 pts)** in Admin -> celebratory sounds and confetti trigger!

---

## ?? Production Deployment to Firebase

1. Copy `.env.example` to `.env` and fill in your Firebase project credentials.
2. Build for production:
   ```bash
   npm run build
   ```
3. Deploy rules, functions, and hosting:
   ```bash
   firebase deploy
   ```
