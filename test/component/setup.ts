/**
 * Setup for the jsdom COMPONENT test project (see vitest.component.config.ts).
 *
 * Unlike the node authority-layer setup (test/setup.ts), this never provisions a
 * database — component specs render React in jsdom and must stay DB-free so they
 * run fast, offline, and in parallel with the node suite. It only wires
 * @testing-library/jest-dom matchers and auto-unmounts between tests.
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
