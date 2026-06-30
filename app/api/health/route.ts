import { prisma } from "@/server/db";
import { ok, fail } from "@/server/http";
import { limiterStatus } from "@/server/rateLimit";
import { monitoringEnabled } from "@/server/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({
      status: "healthy",
      db: "up",
      limiter: limiterStatus(),
      monitoring: monitoringEnabled() ? "on" : "off",
      time: new Date().toISOString(),
    });
  } catch {
    return fail("database unreachable", 503);
  }
}
