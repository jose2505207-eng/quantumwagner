# Quantum Wager — Engineering Wiki

> A living, source-grounded guide to how this codebase actually works — written
> so a smart engineer joining tomorrow can build a real mental model fast.

This wiki is a **map of the machine**: why each part exists, how the pieces
connect, how to run it, and how to change it safely. Every major claim cites the
real file it came from (`Source: path`).

If you read nothing else, read **[00-overview](./00-overview.md)** then
**[01-architecture](./01-architecture.md)**.

## Table of contents

| Page | What's inside |
| --- | --- |
| [00-overview](./00-overview.md) | What Quantum Wager is, who it's for, the shortest true mental model |
| [01-architecture](./01-architecture.md) | The system as layers + diagrams: frontend, in-repo API, chain |
| [02-repo-map](./02-repo-map.md) | Guided tour of the directories by responsibility; where to start |
| [03-core-flows](./03-core-flows.md) | Real traced flows: auth, predict, resolve, XP, on-chain bet |
| [04-local-development](./04-local-development.md) | Verified setup / run / test / lint / db commands |
| [05-configuration](./05-configuration.md) | Env vars, demo/honesty flags, on-chain constants |
| [06-api-and-interfaces](./06-api-and-interfaces.md) | Every REST route handler + on-chain instruction surface |
| [07-data-and-state](./07-data-and-state.md) | Prisma schema, Zustand stores, localStorage, on-chain accounts |
| [08-testing-and-quality](./08-testing-and-quality.md) | What tests exist, what they protect, gaps |
| [09-deployment](./09-deployment.md) | Deploying the app, the DB, and the contract |
| [10-agent-guide](./10-agent-guide.md) | Safe-change protocol for future AI agents / devs |
| [11-troubleshooting](./11-troubleshooting.md) | Known failure modes and fixes |
| [12-roadmap-and-open-questions](./12-roadmap-and-open-questions.md) | Unfinished areas, risks, confirmed gaps |

## Conventions used here

- **`Source: path`** — the file backing a claim. **`Relevant files:`** — several.
- **`Unknown from current repo`** — genuinely not determinable from the code,
  with a note on how to verify.
- Diagrams are Mermaid and only used where they clarify.

The machine-readable companion is [`wiki-manifest.json`](./wiki-manifest.json),
which maps every page to the source files it documents (used to detect when a
page goes stale).
