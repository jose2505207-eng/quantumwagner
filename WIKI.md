# Quantum Wager — Wiki

This repository has a living, source-grounded engineering wiki written in the
"codebase as a book" style: it explains **why** each part exists and **how** the
pieces connect, with every major claim citing a real file.

➡️ **Start here: [`docs/wiki/index.md`](docs/wiki/index.md)**

## Pages

| Page | What's inside |
| --- | --- |
| [00 · Overview](docs/wiki/00-overview.md) | What Quantum Wager is + the shortest true mental model |
| [01 · Architecture](docs/wiki/01-architecture.md) | Layers + diagrams: UI, in-repo API, Solana program |
| [02 · Repo Map](docs/wiki/02-repo-map.md) | Directory tour by responsibility |
| [03 · Core Flows](docs/wiki/03-core-flows.md) | Traced flows: auth, predict, resolve, XP, on-chain bet |
| [04 · Local Development](docs/wiki/04-local-development.md) | Verified setup / run / test / db commands |
| [05 · Configuration](docs/wiki/05-configuration.md) | Env vars, demo flags, on-chain constants |
| [06 · API & Interfaces](docs/wiki/06-api-and-interfaces.md) | REST routes + on-chain instructions + hooks |
| [07 · Data & State](docs/wiki/07-data-and-state.md) | Prisma models, Zustand, localStorage, PDAs |
| [08 · Testing & Quality](docs/wiki/08-testing-and-quality.md) | What's tested, what's not |
| [09 · Deployment](docs/wiki/09-deployment.md) | App, DB, and contract deployment |
| [10 · Agent Guide](docs/wiki/10-agent-guide.md) | Safe-change protocol for agents/devs |
| [11 · Troubleshooting](docs/wiki/11-troubleshooting.md) | Known failures and fixes |
| [12 · Roadmap & Open Questions](docs/wiki/12-roadmap-and-open-questions.md) | Gaps, risks, next steps |

## Keeping it in sync

The wiki maps each page to the source files it documents in
[`docs/wiki/wiki-manifest.json`](docs/wiki/wiki-manifest.json). After changing
code, find which pages are impacted:

```bash
node scripts/update-wiki.mjs            # pages impacted since last commit
node scripts/update-wiki.mjs --since <git-ref>
node scripts/update-wiki.mjs --touch    # stamp lastGenerated after updating
```

Update only the impacted pages, preserving the source-cited style. See
[10 · Agent Guide](docs/wiki/10-agent-guide.md).
