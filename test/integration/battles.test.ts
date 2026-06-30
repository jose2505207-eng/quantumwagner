import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { signToken } from "@/server/auth";
import { createUser, cleanDb } from "./helpers";
import { POST as createBattle } from "@/app/api/battles/route";
import { POST as joinBattle } from "@/app/api/battles/[id]/join/route";
import { POST as increaseBattle } from "@/app/api/battles/[id]/increase/route";

/**
 * Battle event endpoints (integration, real db). In tests DEMO_MODE is on, so
 * REQUIRE_ONCHAIN is false: events record without a confirmed signature (which
 * is therefore stored as null) — the same honest path used outside production.
 *
 * We drive the actual route handlers with a minted JWT and pin: persistence +
 * server-authoritative XP + PDA-or-cuid resolution + create idempotency + the
 * "increase needs an existing position" precondition.
 *
 * cleanDb() does not touch MemeBattle/Entry/Transaction, so we wipe those here.
 */
function tokenFor(userId: string, wallet = "W"): string {
  return signToken({ sub: userId, wallet });
}
function req(token: string, body: unknown): Request {
  return new Request("http://t/api/battles", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

async function wipeBattles() {
  await prisma.transaction.deleteMany();
  await prisma.memeBattleVote.deleteMany();
  await prisma.memeBattleEntry.deleteMany();
  await prisma.memeBattle.deleteMany();
}

describe("battle event endpoints (integration, real db)", () => {
  beforeEach(async () => {
    await wipeBattles();
    await cleanDb();
  });

  afterAll(async () => {
    await wipeBattles();
    await prisma.$disconnect();
  });

  it("records a created battle + a Transaction, and is idempotent on the pda", async () => {
    const u = await createUser({ username: "creator" });
    const token = tokenFor(u.id, u.walletAddress);

    const res1 = await createBattle(
      req(token, { title: "Bulls vs Bears", pda: "PDA_ONE" })
    );
    expect(res1.status).toBe(201);
    const j1 = await res1.json();
    expect(j1.success).toBe(true);
    const battleId = j1.data.battle.id as string;

    const txCount = await prisma.transaction.count({
      where: { refId: battleId, kind: "battle" },
    });
    expect(txCount).toBe(1);

    // second call with the SAME pda dedupes — no duplicate row
    const res2 = await createBattle(
      req(token, { title: "Bulls vs Bears", pda: "PDA_ONE" })
    );
    expect(res2.status).toBe(200);
    expect((await res2.json()).data.deduped).toBe(true);
    expect(await prisma.memeBattle.count({ where: { pda: "PDA_ONE" } })).toBe(1);
  });

  it("records an entry resolved by PDA and awards XP server-side", async () => {
    const creator = await createUser({ username: "c" });
    const player = await createUser({ username: "p" });
    await createBattle(req(tokenFor(creator.id), { title: "Race A vs B", pda: "PDA_J" }));

    const res = await joinBattle(
      req(tokenFor(player.id), { side: "A", amount: 100 }),
      ctx("PDA_J") // resolves the battle by its on-chain pda, not the cuid
    );
    expect(res.status).toBe(201);
    const j = await res.json();
    expect(j.data.entry.side).toBe("A");
    expect(j.data.entry.amount).toBe(100);
    // no confirmed signature in demo => stored null (honest, never faked)
    expect(j.data.entry.txSignature).toBeNull();

    // value is granted server-side, not by the client
    const xp = await prisma.xPEvent.count({ where: { userId: player.id } });
    expect(xp).toBeGreaterThan(0);
  });

  it("join also resolves a battle by its cuid id", async () => {
    const creator = await createUser({ username: "c2" });
    const player = await createUser({ username: "p2" });
    const cr = await createBattle(
      req(tokenFor(creator.id), { title: "Id Lookup", pda: "PDA_ID" })
    );
    const battleId = (await cr.json()).data.battle.id as string;

    const res = await joinBattle(
      req(tokenFor(player.id), { side: "B", amount: 50 }),
      ctx(battleId)
    );
    expect(res.status).toBe(201);
  });

  it("increase needs an existing position, then bumps the entry amount", async () => {
    const creator = await createUser({ username: "c3" });
    const player = await createUser({ username: "p3" });
    await createBattle(req(tokenFor(creator.id), { title: "Inc Battle", pda: "PDA_INC" }));

    // no position yet → 409
    const noPos = await increaseBattle(
      req(tokenFor(player.id), { amount: 25 }),
      ctx("PDA_INC")
    );
    expect(noPos.status).toBe(409);

    // enter, then increase
    await joinBattle(req(tokenFor(player.id), { side: "A", amount: 100 }), ctx("PDA_INC"));
    const inc = await increaseBattle(
      req(tokenFor(player.id), { amount: 50 }),
      ctx("PDA_INC")
    );
    expect(inc.status).toBe(200);
    expect((await inc.json()).data.entry.amount).toBe(150);
  });
});
