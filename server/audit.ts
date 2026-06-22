import { prisma } from "./db";

/** Append an audit log entry for an important action. Never throws. */
export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  target?: string | null;
  meta?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        target: params.target ?? null,
        meta: params.meta ? JSON.stringify(params.meta) : null,
      },
    });
  } catch (e) {
    console.error("audit log failed", e);
  }
}
