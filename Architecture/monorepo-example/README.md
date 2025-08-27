monorepo-example/
│
├── apps/
│   ├── frontend/         # Next.js 15 app (Bun + TypeScript)
│   │   ├── public/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── bun.lockb
│   │   └── tsconfig.json
│   │
│   └── backend/          # Express API (Bun + TypeScript + Prisma)
│       ├── src/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── package.json
│       ├── bun.lockb
│       └── tsconfig.json
│
├── packages/             # Shared code (optional)
│   └── utils/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── node_modules/
├── package.json          # Root (optional, for scripts and dependencies)
├── bun.lockb
└── tsconfig.json         # Root config (references others)