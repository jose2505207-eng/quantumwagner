import { prisma } from "@/server/db";

let walletCounter = 0;

/** Create a real User row (with the wallet the schema requires unique). */
export async function createUser(opts: { username?: string } = {}) {
  walletCounter += 1;
  const walletAddress = `TestWallet${Date.now()}_${walletCounter}`;
  return prisma.user.create({
    data: { walletAddress, username: opts.username },
  });
}

/**
 * Wipe every table the authority-layer tests touch, in FK-safe order, so each
 * test starts from a clean slate and they never interfere with one another.
 */
export async function cleanDb() {
  await prisma.oracleResolution.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.xPEvent.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.market.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.leaderboardSeason.deleteMany();
  await prisma.user.deleteMany();
}
