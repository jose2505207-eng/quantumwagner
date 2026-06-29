/**
 * Provider-agnostic monitoring hooks. NO-OP by default — capturing only happens
 * when a monitoring endpoint is configured, so absence keeps today's behavior
 * byte-for-byte (nothing is sent, nothing throws).
 *
 * Gating:
 *   - MONITORING_DSN unset                  -> total no-op.
 *   - MONITORING_ENABLED === "false"        -> forced off even if a DSN is set.
 *   - MONITORING_DSN set (+ not forced off) -> POST a minimal JSON event via
 *                                              `fetch` to that endpoint.
 *
 * No npm dependency: the wire format is a small JSON body any HTTP collector can
 * accept. Capturing is fire-and-forget and self-contained: it never throws and
 * never changes an HTTP response (callers `void` the returned promise).
 */

type EventLevel = "error" | "info";

interface MonitoringEvent {
  level: EventLevel;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

function dsn(): string | undefined {
  if (process.env.MONITORING_ENABLED === "false") return undefined;
  const value = process.env.MONITORING_DSN;
  return value && value.length > 0 ? value : undefined;
}

/** True when a monitoring endpoint is configured (i.e. not a no-op). */
export function monitoringEnabled(): boolean {
  return dsn() !== undefined;
}

async function send(event: MonitoringEvent): Promise<void> {
  const endpoint = dsn();
  if (!endpoint) return; // no-op when unconfigured
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch (err) {
    // Monitoring must never destabilize the app: swallow transport errors.
    console.warn("monitoring: failed to deliver event:", err);
  }
}

/** Capture an exception/error. No-op unless a monitoring endpoint is set. */
export async function captureException(
  err: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  if (!monitoringEnabled()) return;
  await send({
    level: "error",
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  });
}

/** Capture an informational message. No-op unless a monitoring endpoint is set. */
export async function captureMessage(
  message: string,
  context?: Record<string, unknown>,
): Promise<void> {
  if (!monitoringEnabled()) return;
  await send({
    level: "info",
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}
