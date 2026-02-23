# Riichi Mahjong (MVP)

Phase A MVP per spec: Web UI + Node/TS server + shared TS core.

## Monorepo Layout
- /contracts — JSON schema (source of truth)
- /packages/protocol — TS types + runtime validation (zod)
- /packages/core — deterministic rules engine (pure)
- /apps/server — Node WS authoritative server
- /apps/web — Next.js UI
- /tools — replay runner, fuzz tester, etc.
