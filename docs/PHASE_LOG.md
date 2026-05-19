# Moon Bites – Phase Log

> Tracks what was planned, what was executed, and what changed at every phase.
> Read this alongside PROJECT_CONTEXT.md for the full picture.

---

## Phase 0 – Architecture & Planning

**Status:** In Progress  
**Goal:** Decide architecture and tech stack. Define all phases. Produce documentation that fully explains the project without writing any code.

### What Was Planned

- Clarify the problem and target users.
- Define 3 core product capabilities:
  - Surprise Me one-tap order.
  - Mood-based recommendations.
  - Autonomous daily meal scheduling.
- Decide that v1 UI is a mobile-friendly web app. Native mobile app comes later.
- Define high-level architecture with these components:
  - HTML + CSS + vanilla JS frontend.
  - Node.js + TypeScript backend API.
  - TypeScript decision engine.
  - node-cron scheduler for autonomous meal jobs.
  - Swiggy MCP integration layer (mocked in Phases 1–4, real in Phase 6).
  - SQLite via Prisma ORM for all persistent data.
- Establish mock-first strategy: all Swiggy MCP calls are mocked until Builders Club approval.
- Choose backend language (Node.js + TypeScript) based on fit with Swiggy MCP and AI-commerce ecosystem.
- Choose frontend approach (vanilla JS) to keep things lean and fast to build.
- Choose storage (SQLite + Prisma) as simple, file-based, type-safe, good for v1 scale.
- Set up PROJECT_CONTEXT.md and PHASE_LOG.md as permanent project references.

### What Was Executed

- PROJECT_CONTEXT.md created and finalized with:
  - Problem, users, and product overview.
  - Architecture description (Node.js + TypeScript, HTML/JS frontend, SQLite + Prisma, node-cron, MCP layer).
  - MCP strategy (mock-first, then real with OAuth 2.1 + PKCE after Builders Club approval).
  - Full tech stack table.
  - Phase overview and non-goals.
- PHASE_LOG.md created with Phase 0 entry and skeleton entries for Phases 1 to 6.
- Tech stack locked:
  - Backend: Node.js + TypeScript
  - Frontend: HTML + CSS + vanilla JavaScript
  - Storage: SQLite via Prisma
  - Scheduler: node-cron
  - MCP Client: TypeScript HTTP/JSON client (mocked until Phase 6)

### Decisions Still Pending (to resolve in Phase 1)

- Exact Node framework: Express vs Fastify.
- Exact Prisma schema design for users, preferences, schedules, feedback, and history tables.

### Notes

- This project is built from scratch for Swiggy MCP and AI-commerce agent use cases.
- Tech choices prioritize ecosystem fit with Swiggy Builders Club, type safety on MCP tool schemas, and minimal code verbosity to manage token limits.
- Documentation is the holy grail of this project. PROJECT_CONTEXT.md and PHASE_LOG.md are updated after every phase so any reader can fully understand the project at any point.

---

## Phase 1 – Skeleton Web App + Backend

**Status:** Not Started

**Planned Scope:**
- Minimal Node.js + TypeScript backend:
  - GET /health endpoint.
  - Placeholder POST endpoints for /surprise-me, /mood, and /schedule.
  - Static file serving for the frontend.
- Minimal HTML + CSS + JS frontend:
  - Landing page with navigation for the 3 flows.
  - No real logic yet, just the UI skeleton.
- Prisma schema v1: basic tables for users and preferences.
- Project folder structure set up in VS Code and pushed to GitHub.

---

## Phase 2 – Decision Engine with Mocked Data

**Status:** Not Started

**Planned Scope:**
- Implement Surprise Me logic: take constraints, score mock restaurants/dishes, return best pick.
- Implement mood-based logic: map mood inputs to cuisine/dish filters, return top 3 to 5 suggestions.
- All Swiggy data is mocked (fake restaurant list, fake menu, fake pricing).
- Endpoints from Phase 1 now return real responses from the decision engine.

---

## Phase 3 – Scheduling and Autonomous Flows (Mocked)

**Status:** Not Started

**Planned Scope:**
- Add schedule storage to Prisma schema (days, time slots, rules per user).
- Implement node-cron jobs that trigger the decision engine at scheduled times.
- Simulate end-to-end autonomous flow: decide meal → mock place order → log result.
- Add feedback endpoint so users can rate meals after eating.

---

## Phase 4 – MCP Integration Design (Interfaces Only)

**Status:** Not Started

**Planned Scope:**
- Define the exact TypeScript interfaces for each Swiggy MCP tool (discovery, menu, cart, order, history).
- Implement mock functions behind those interfaces (same as Phase 2/3 mocks, now typed to match real MCP schemas from Swiggy Builders Club reference docs).
- Document the tool chains for all 3 flows in MCP_TOOL_CHAINS.md inside docs/.

---

## Phase 5 – Demo-Ready Prototype and Docs

**Status:** Not Started

**Planned Scope:**
- Polish the UI for all 3 flows so it is presentable to Swiggy.
- Clean up and finalize all backend logic.
- Update PROJECT_CONTEXT.md and PHASE_LOG.md to reflect the complete prototype state.
- Record or prepare a walkthrough demo for Swiggy Builders Club review.

---

## Phase 6 – Real MCP Wiring (Post-Approval)

**Status:** Not Started

**Planned Scope:**
- Receive Builders Club access and OAuth credentials from Swiggy.
- Replace mock MCP module with real TypeScript MCP client using OAuth 2.1 + PKCE.
- Test all 3 flows end-to-end with live Swiggy data (real restaurants, real cart, real orders).
- No architecture changes needed — only the MCP layer is swapped.
