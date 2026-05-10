# ts-enterprise-hub

Universal Academic Portfolio System is a Bun + TypeScript backend for profile management, database persistence, HTTP delivery, and MCP tooling.

## Table Of Contents

- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Language Guides](#language-guides)
- [Useful Entry Points](#useful-entry-points)

## Quick Start

```bash
bun install
wsl -e docker compose up -d
bunx prisma generate
bun run index.ts
```

## Documentation

- [Project guide - English](docs/README.md)
- [Project guide - ไทยผสมอังกฤษ](docs/README.th.md)
- [Contributing guide - English](docs/CONTRIBUTING.md)
- [Contributing guide - ไทยผสมอังกฤษ](docs/CONTRIBUTING.th.md)

## Language Guides

- If you want the full explanation in English, start with [docs/README.md](docs/README.md).
- If you want the Thai mixed-English version, start with [docs/README.th.md](docs/README.th.md).
- For contribution workflow, use [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) or [docs/CONTRIBUTING.th.md](docs/CONTRIBUTING.th.md).

## What This Repo Contains

- Clean Architecture layers under [src/](src)
- Prisma schema and config under [prisma/](prisma)
- REST API in [src/delivery/ProfileApiServer.ts](src/delivery/ProfileApiServer.ts)
- AI/MCP adapter in [src/integration/McpToolAdapter.ts](src/integration/McpToolAdapter.ts)
- Unit tests in [tests/](tests)

## Useful Entry Points

- [index.ts](index.ts) wires the app together.
- [src/core/types.ts](src/core/types.ts) defines the shared profile model.
- [src/domain/ProfileService.ts](src/domain/ProfileService.ts) contains the main use-case logic.
- [src/infrastructure/PrismaProfileRepository.ts](src/infrastructure/PrismaProfileRepository.ts) talks to the database.
- [src/delivery/ProfileApiServer.ts](src/delivery/ProfileApiServer.ts) serves HTTP requests.
