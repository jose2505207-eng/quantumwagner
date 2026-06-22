# Quantum Wager — Game Loop

Quantum Wager is an **arena**, not a dashboard. Every screen answers four
questions: _What can I do? What can I win? What level am I? What's next?_

## Core loop

```
Connect wallet
   → complete daily quest
      → enter a market / battle / fast bet
         → place a prediction
            → resolve outcome (oracle/admin)
               → earn XP + rewards
                  → climb rank
                     → return tomorrow (streak)
```

## The 6-level journey

Defined as the single source of truth in [`lib/game/levels.ts`](../lib/game/levels.ts).

| Lv | Id                 | Mission                                              | XP  |
| -- | ------------------ | ---------------------------------------------------- | --- |
| 1  | `connect-wallet`   | Connect your wallet to unlock the arena.             | 100 |
| 2  | `first-prediction` | Place your first prediction and earn your first XP.  | 150 |
| 3  | `win-fast-bet`     | Win a speed round before the clock burns out.        | 250 |
| 4  | `join-meme-battle` | Enter a meme battle and back your side.              | 300 |
| 5  | `launch-token`     | Launch a token and rally your community.             | 400 |
| 6  | `enter-leaderboard`| Enter the leaderboard arena and prove your edge.     | 500 |

Levels unlock sequentially. A level becomes **complete** from a *real signal*
where one exists — never a fake pass:

- **Level 1** completes when a wallet is actually connected (`GameSync`).
- **Level 2** completes when the backend reports the user has predictions
  (`syncFromBackend` reads `total_predictions` / `positions`).
- Levels 3–6 currently complete from in-app actions on their respective
  screens; as on-chain/back-end signals for fast bets, battles, tokens and
  leaderboard become available, wire them into `GameSync` the same way.

## XP, ranks, streaks

- **XP** drives the open-ended rank ladder ([`lib/game/ranks.ts`](../lib/game/ranks.ts)):
  Unranked → Rookie → Signal Hunter → Market Mage → Quantum Shark → Oracle →
  Arena Legend.
- **Daily quests** ([`lib/game/quests.ts`](../lib/game/quests.ts)) reset each
  local day and grant XP. `derived` quests auto-complete from real actions;
  `claim` quests are tapped.
- **Streaks** advance on daily check-in and grant a small capped bonus.

## Honesty contract (important)

The progression layer is **client-side**, persisted in `localStorage`
(`store/useGameStore.ts`). It does **not** mint on-chain value. It is always
labelled in the UI with a `LOCAL` / `DEMO` badge. See
[`SECURITY_NOTES.md`](./SECURITY_NOTES.md) for why this matters and how to move
it server-side for a production launch.

Demo/seed data (markets, fast bets, sample positions) is only shown when
`DEMO_MODE` is on and the live source returned nothing, and is always rendered
with a `<DemoBadge/>`. No mock data is ever merged silently into live data.
