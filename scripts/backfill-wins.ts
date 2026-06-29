/**
 * Idempotent reconciliation/backfill for `PlayerProfile.wins` (and the active
 * season's `LeaderboardEntry.wins`).
 *
 * WHY THIS EXISTS
 * ---------------
 * Loop 5 (commit d663145) fixed a real bug: `settleFastBet`'s first-win branch
 * (`priorWins === 0`) granted the Level-3 milestone via `completeLevelServer`
 * WITHOUT `win:true`, so a player's FIRST fast-bet win never incremented
 * `profile.wins` (nor the season leaderboard, which `awardXp` SETS to the
 * authoritative `profile.wins`). That fix is FORWARD-ONLY: players whose first
 * win predates it remain under-counted by one. This script reconciles them.
 *
 * SOURCE OF TRUTH (no heuristic)
 * ------------------------------
 * The live value paths increment `profile.wins` by exactly one per winning
 * record, via `awardXp({ win: true })`:
 *   - `server/fastbetSettlement.ts`  -> one win per `FastBetEntry.won === true`
 *   - `server/oracle.ts#applyResolution` -> one win per `Prediction.won === true`
 *   - `app/api/battles/[id]/resolve` -> one win per `MemeBattleEntry` whose
 *     `side === battle.winner` on a RESOLVED battle (battle entries carry no
 *     `won` column, so the win is derived from the battle's recorded winner).
 * The TRUE `wins` for a player is therefore the count of those authoritative
 * settled records — the SAME records the live settlement path counted. We do
 * not invent a number; we recount the ledger.
 *
 * IDEMPOTENCY
 * -----------
 * The script SETS `wins` to the recomputed count (not an increment). A second
 * `--apply` recomputes the identical count from the same settled records, finds
 * zero diffs, and writes nothing.
 *
 * SAFETY
 * ------
 * Defaults to `--dry-run` (reports diffs, writes nothing). Only `--apply`
 * writes. No schema change is required. `losses` is intentionally untouched —
 * the bug was wins-only.
 *
 * Run:
 *   tsx scripts/backfill-wins.ts            # dry-run (default), writes nothing
 *   tsx scripts/backfill-wins.ts --apply    # writes the reconciled counts
 */
import { fileURLToPath } from "node:url";
import { prisma } from "@/server/db";

export interface WinChange {
  userId: string;
  before: number;
  after: number;
}

export interface BackfillReport {
  applied: boolean;
  profilesInspected: number;
  profilesChanged: number;
  leaderboardEntriesChanged: number;
  profileChanges: WinChange[];
  leaderboardChanges: WinChange[];
}

/**
 * Recompute the authoritative win count per userId from the settled record
 * ledger. Returns a Map keyed by userId; users with zero wins are simply absent
 * (callers default to 0). This is the single source of truth the reconciliation
 * compares against — identical to what the live `awardXp({win:true})` paths
 * would have summed.
 */
export async function computeTrueWins(): Promise<Map<string, number>> {
  const wins = new Map<string, number>();
  const add = (userId: string, n: number) => wins.set(userId, (wins.get(userId) ?? 0) + n);

  // Fast-bet wins: one per winning entry.
  const fastBetWins = await prisma.fastBetEntry.groupBy({
    by: ["userId"],
    where: { won: true },
    _count: { _all: true },
  });
  for (const row of fastBetWins) add(row.userId, row._count._all);

  // Prediction-market wins: one per settled winning prediction.
  const predictionWins = await prisma.prediction.groupBy({
    by: ["userId"],
    where: { won: true },
    _count: { _all: true },
  });
  for (const row of predictionWins) add(row.userId, row._count._all);

  // Meme-battle wins: entries carry no `won` flag, so derive from the resolved
  // battle's recorded winner (the same condition the resolve route checks).
  const resolvedBattles = await prisma.memeBattle.findMany({
    where: { status: "RESOLVED", winner: { not: null } },
    select: { winner: true, entries: { select: { userId: true, side: true } } },
  });
  for (const battle of resolvedBattles) {
    for (const entry of battle.entries) {
      if (entry.side === battle.winner) add(entry.userId, 1);
    }
  }

  return wins;
}

/**
 * Reconcile every `PlayerProfile.wins` (and the active season's matching
 * `LeaderboardEntry.wins`) to the recomputed authoritative count.
 *
 * `apply: false` (default) computes and reports diffs but performs NO writes.
 */
export async function backfillWins(opts: { apply: boolean }): Promise<BackfillReport> {
  const { apply } = opts;
  const trueWins = await computeTrueWins();

  const profiles = await prisma.playerProfile.findMany({
    select: { userId: true, wins: true },
  });

  // The active season's leaderboard entries are the ones `awardXp` keeps in sync
  // with `profile.wins`. Read it directly (do NOT use getActiveSeason, which
  // lazily CREATES a season — a write that must never happen in a dry-run).
  const activeSeason = await prisma.leaderboardSeason.findFirst({
    where: { active: true },
    orderBy: { startsAt: "desc" },
    select: { id: true },
  });

  const profileChanges: WinChange[] = [];
  const leaderboardChanges: WinChange[] = [];

  for (const profile of profiles) {
    const expected = trueWins.get(profile.userId) ?? 0;

    if (profile.wins !== expected) {
      profileChanges.push({ userId: profile.userId, before: profile.wins, after: expected });
      if (apply) {
        await prisma.playerProfile.update({
          where: { userId: profile.userId },
          data: { wins: expected },
        });
      }
    }

    if (activeSeason) {
      // Mirror awardXp: the active-season entry tracks the authoritative
      // profile.wins. Only reconcile an entry that ALREADY exists (the bug's
      // first win already created one) — a backfill must not fabricate
      // leaderboard participation for a season a player never entered.
      const entry = await prisma.leaderboardEntry.findUnique({
        where: { seasonId_userId: { seasonId: activeSeason.id, userId: profile.userId } },
        select: { wins: true },
      });
      if (entry && entry.wins !== expected) {
        leaderboardChanges.push({ userId: profile.userId, before: entry.wins, after: expected });
        if (apply) {
          await prisma.leaderboardEntry.update({
            where: { seasonId_userId: { seasonId: activeSeason.id, userId: profile.userId } },
            data: { wins: expected },
          });
        }
      }
    }
  }

  return {
    applied: apply,
    profilesInspected: profiles.length,
    profilesChanged: profileChanges.length,
    leaderboardEntriesChanged: leaderboardChanges.length,
    profileChanges,
    leaderboardChanges,
  };
}

/** Pretty-print the audit summary to stdout. */
function logReport(report: BackfillReport): void {
  const mode = report.applied ? "APPLY (writing)" : "DRY-RUN (no writes)";
  console.log(`\n=== backfill-wins :: ${mode} ===`);
  console.log(`profiles inspected:          ${report.profilesInspected}`);
  console.log(`profiles needing change:     ${report.profilesChanged}`);
  console.log(`leaderboard entries to sync: ${report.leaderboardEntriesChanged}`);
  if (report.profileChanges.length > 0) {
    console.log("\nprofile.wins diffs (before -> after):");
    for (const c of report.profileChanges) {
      console.log(`  ${c.userId}: ${c.before} -> ${c.after}`);
    }
  }
  if (report.leaderboardChanges.length > 0) {
    console.log("\nactive-season LeaderboardEntry.wins diffs (before -> after):");
    for (const c of report.leaderboardChanges) {
      console.log(`  ${c.userId}: ${c.before} -> ${c.after}`);
    }
  }
  if (!report.applied && report.profilesChanged + report.leaderboardEntriesChanged > 0) {
    console.log("\nThis was a DRY-RUN. Re-run with --apply to write these changes.");
  } else if (report.applied) {
    console.log("\nDone. Re-running with --apply again is a no-op (idempotent).");
  } else {
    console.log("\nNothing to reconcile — all counts already match.");
  }
  console.log("");
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  // `--dry-run` is the default; accepting the flag explicitly is purely for
  // operator clarity. `--apply` is the only thing that enables writes.
  const report = await backfillWins({ apply });
  logReport(report);
  await prisma.$disconnect();
}

// Only run as a CLI when invoked directly (not when imported by a test).
const invokedDirectly =
  process.argv[1] !== undefined && process.argv[1] === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch(async (err) => {
    console.error("backfill-wins failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
}
