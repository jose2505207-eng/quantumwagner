import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./errors";

/** Standard JSON success envelope. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

/** Standard JSON error envelope. */
export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json(
    { success: false, message, ...(extra ? { details: extra } : {}) },
    { status }
  );
}

/** Wrap a handler with consistent error handling (zod + generic). */
export function handler<A extends unknown[]>(
  fn: (...args: A) => Promise<Response>
) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return fail("Validation failed", 422, err.flatten().fieldErrors);
      }
      if (err instanceof HttpError) {
        return fail(err.message, err.status);
      }
      console.error("API error:", err);
      return fail("Internal server error", 500);
    }
  };
}

// Re-export so existing `import { HttpError } from "@/server/http"` keeps working.
export { HttpError } from "./errors";
