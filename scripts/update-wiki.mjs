#!/usr/bin/env node
/**
 * update-wiki.mjs — wiki staleness detector for Quantum Wager.
 *
 * Reads docs/wiki/wiki-manifest.json (page -> source-file mappings), figures out
 * which source files changed since a git ref (or the manifest's lastGenerated),
 * and reports which wiki pages are impacted so they can be reviewed/updated.
 *
 * It does NOT rewrite page prose — keeping authored, source-grounded text human-
 * (or agent-) owned is intentional. It only reports impact and can refresh the
 * manifest timestamp.
 *
 * Usage:
 *   node scripts/update-wiki.mjs                 # changes since last commit (HEAD~1)
 *   node scripts/update-wiki.mjs --since <ref>   # changes since a git ref/sha/tag
 *   node scripts/update-wiki.mjs --staged        # only staged changes
 *   node scripts/update-wiki.mjs --touch         # update manifest.lastGenerated to now
 *   node scripts/update-wiki.mjs --json          # machine-readable output
 *
 * No external dependencies — Node 18+ and git only.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const manifestPath = resolve(repoRoot, "docs/wiki/wiki-manifest.json");

const args = process.argv.slice(2);
const opt = (flag) => args.includes(flag);
const val = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

function git(cmd) {
  return execSync(`git ${cmd}`, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function loadManifest() {
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (e) {
    console.error(`Could not read manifest at ${manifestPath}: ${e.message}`);
    process.exit(1);
  }
}

function changedFiles() {
  if (opt("--staged")) {
    return git("diff --cached --name-only").split("\n").filter(Boolean);
  }
  const since = val("--since") || "HEAD~1";
  try {
    return git(`diff --name-only ${since} HEAD`).split("\n").filter(Boolean);
  } catch {
    // e.g. shallow clone / no parent commit — fall back to working-tree changes.
    return git("status --porcelain")
      .split("\n")
      .filter(Boolean)
      .map((l) => l.slice(3));
  }
}

/** A page source matches a changed file if the file is the source or sits under it (dir prefix). */
function pageMatches(sources, changed) {
  const hits = new Set();
  for (const src of sources) {
    for (const f of changed) {
      if (f === src || f.startsWith(src.endsWith("/") ? src : src + "/")) {
        hits.add(f);
      }
    }
  }
  return [...hits];
}

function main() {
  const manifest = loadManifest();
  const changed = changedFiles();

  // Ignore changes that are only inside the wiki itself.
  const codeChanged = changed.filter((f) => !f.startsWith("docs/wiki/"));

  const impacted = [];
  for (const page of manifest.pages || []) {
    const hits = pageMatches(page.sources || [], codeChanged);
    if (hits.length) impacted.push({ page: page.file, title: page.title, changedSources: hits });
  }

  if (opt("--json")) {
    console.log(JSON.stringify({ changed: codeChanged, impacted }, null, 2));
  } else {
    console.log("Quantum Wager — wiki sync report");
    console.log("=================================");
    console.log(`Changed source files: ${codeChanged.length}`);
    codeChanged.forEach((f) => console.log(`  - ${f}`));
    if (!impacted.length) {
      console.log("\nNo wiki pages impacted by these changes. ✅");
    } else {
      console.log(`\n${impacted.length} wiki page(s) need review:\n`);
      for (const i of impacted) {
        console.log(`  docs/wiki/${i.page}  (${i.title})`);
        i.changedSources.forEach((s) => console.log(`      ← ${s}`));
      }
      console.log("\nNext: update only the pages above in the same source-cited");
      console.log("style, refresh their `sources` in the manifest if needed, then");
      console.log("re-run with --touch to stamp lastGenerated.");
    }
  }

  if (opt("--touch")) {
    manifest.lastGenerated = new Date().toISOString();
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    if (!opt("--json")) console.log(`\nManifest lastGenerated → ${manifest.lastGenerated}`);
  }

  // Non-zero exit if pages are impacted, so CI can gate on it.
  process.exit(impacted.length ? 1 : 0);
}

main();
