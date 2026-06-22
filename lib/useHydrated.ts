"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after the component has mounted on the client.
 * Used to gate rendering of localStorage-backed progression so server and
 * first client render match (avoids hydration mismatches).
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
