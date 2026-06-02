# Mood Bites – Phase Log

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

**Status:** ✅ Complete

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

**Status:** ✅ Complete

**Planned Scope:**
- Implement Surprise Me logic: take constraints, score mock restaurants/dishes, return best pick.
- Implement mood-based logic: map mood inputs to cuisine/dish filters, return top 3 to 5 suggestions.
- All Swiggy data is mocked (fake restaurant list, fake menu, fake pricing).
- Endpoints from Phase 1 now return real responses from the decision engine.

---

## Phase 3 – Scheduling and Autonomous Flows (Mocked)

**Status:** ✅ Complete

**Planned Scope:**
- Add schedule storage to Prisma schema (days, time slots, rules per user).
- Implement node-cron jobs that trigger the decision engine at scheduled times.
- Simulate end-to-end autonomous flow: decide meal → mock place order → log result.
- Add feedback endpoint so users can rate meals after eating.

---

## Phase 4 – MCP Integration Design (Interfaces Only)

**Status:** ✅ Complete

**Planned Scope:**
- Define the exact TypeScript interfaces for each Swiggy MCP tool (discovery, menu, cart, order, history).
- Implement mock functions behind those interfaces (same as Phase 2/3 mocks, now typed to match real MCP schemas from Swiggy Builders Club reference docs).
- Document the tool chains for all 3 flows in MCP_TOOL_CHAINS.md inside docs/.

---

## Phase 5 – Demo-Ready Prototype and Docs

**Status:** ✅ Complete

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

## Phase 1 Execution Log

- Implemented Node.js + TypeScript backend using Express.
- Added 3 placeholder API routes: POST /api/surprise, /api/mood, /api/schedule.
- Implemented static frontend served from backend (index.html + app.js + style.css).
- Verified end-to-end: backend on :3000, /health → {"status":"ok"}.
- Prisma schema created (User, Preferences, OrderHistory); migrated to SQLite.

---

## Phase 2 Execution Log

### Decision Engine
- Created `src/engine/types.ts` – shared types (Dish, Restaurant, UserConstraints, DishRecommendation, SurpriseResult, ScheduledMeal).
- Created `src/engine/scorer.ts` – 100-point scoring function (rating 40%, distance 20%, price 20%, spice 20%).
- Created `src/engine/surpriseEngine.ts` – filter → score → ±5% jitter → pick + 2 alternatives.
- Created `src/engine/moodEngine.ts` – 6 moods (comfort, healthy, celebration, workday, cheat-meal, high-protein), tag+budget mapping, returns top 5.
- Created `src/engine/scheduleEngine.ts` – per-day surprise picks with variety constraint (no repeated dishes).

### Mock Data
- Expanded `mockRestaurants.ts` from 5 → 8 restaurants, added 3 dishes each (24 total).
- Dishes have `spiceLevel`, `isVeg`, and `tags` aligned to mood/schedule engine.

### Prisma / SQLite
- Installed prisma v7, @prisma/client, @prisma/adapter-better-sqlite3, better-sqlite3.
- Created `prisma/schema.prisma` with User, Preferences, OrderHistory models.
- Ran migration → `prisma/dev.db` created.
- Created `src/lib/prisma.ts` singleton (Prisma v7 adapter pattern).
- `/api/surprise` now saves every pick to OrderHistory; response includes `saved: true`.

### Routes Refactored
- All 3 routes are thin wrappers — validation + engine call + HTTP response only.
- Surprise route now async (DB write).

### Frontend Full Redesign
- `index.html` – semantic tab nav (Surprise/Mood/Schedule), rich form controls.
- `style.css` – Inter font, dark navy bg (#0a0f1e), orange gradient accent, glassmorphism cards, full component library.
- `app.js` – tab switching, form state, card rendering with delivery times + veg dots, loading/error states, reshuffle button.

### Verified
- `/health` → `{"status":"ok"}`
- `/api/surprise` with budget+veg+spiceLevel → pick (score 92.8) + 2 alternatives + `saved: true`
- `/api/mood` with mood=comfort → 5 ranked dishes from 3+ restaurants
- `/api/schedule` with Mon/Tue/Wed → 3-day plan with variety (different dish each day)
- Frontend: tab switching, cards render, reshuffle works

---

## Phase 3 Execution Log

### Database Schema Additions
- Updated [schema.prisma](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/prisma/schema.prisma) to add `Schedule` and `Feedback` models, linking `Feedback` 1:1 with `OrderHistory`.
- Ran database migrations (`phase3`) and generated Prisma Client.

### Background Worker & Cron Jobs
- Implemented [cronWorker.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/worker/cronWorker.ts) leveraging `node-cron` to execute automated food ordering for saved user schedules.
- Dynamically schedules, registers, and cancels background tasks in response to user updates at runtime.
- Automatically stores simulated chronologically placed orders into the `OrderHistory` table.

### Backend Endpoints
- Added schedules CRUD endpoints (`/api/schedules`).
- Added order rating/feedback submission endpoint (`/api/feedback`).
- Added history query endpoint (`/api/history`).

### Frontend Dashboards
- Upgraded the UI with a new **History** tab displaying past orders and allowing inline feedback (positive/negative ratings, tag selection).
- Implemented visual listings for saved recurring meal schedules (label, days, budget, veg status) with inline toggle options to pause or delete.

### Verified
- Tested schedule persistence, cron triggers, order listing retrieval, and feedback submission, confirming they all function properly and sync with the database.

---

## Phase 4 Execution Log

### Integration Layer
- Created [swiggyMcp.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/integration/swiggyMcp.ts) defining standard Swiggy Food MCP tool interfaces (`McpRestaurant`, `McpDish`, `McpCart`, `McpOrderResult`).
- Implemented `SwiggyMcpClient` providing an async mock wrapper client around our catalog.
- Added robust error handling mock simulation (e.g. 5% random failure rate throwing timeouts/rate-limit exceptions) to verify application resilience.

### Decoupling & Refactoring
- Updated types in [types.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/engine/types.ts) and the scoring algorithm [scorer.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/engine/scorer.ts) to accept MCP data types.
- Refactored all decision logic modules [surpriseEngine.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/engine/surpriseEngine.ts), [moodEngine.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/engine/moodEngine.ts), and [scheduleEngine.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/engine/scheduleEngine.ts) to be `async` and query Swiggy data via `SwiggyMcpClient` rather than direct file imports.
- Updated all router handlers ([surprise.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/routes/surprise.ts), [mood.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/routes/mood.ts), [schedule.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/routes/schedule.ts)) and the daemon worker [cronWorker.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/worker/cronWorker.ts) to support the async flow and gracefully catch checkout failures.

### Frontend Robustness
- Updated [app.js](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/frontend/app.js) to display specific server errors (e.g. Swiggy API timeout) in the UI.
- Upgraded the UI results section to render a dedicated, card-based order summary receipt when a Swiggy order goes through successfully.

### Documented MCP tool chains
- Documented all three agent interaction sequences in [MCP_TOOL_CHAINS.md](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/docs/MCP_TOOL_CHAINS.md).

### Verified
- Build compiles cleanly without errors.
- Verified healthy API endpoints an## Phase 5 Execution Log

### Frontend & Swiggy Branding Polish
- Redesigned the visual theme of the web app in [style.css](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/frontend/style.css) using a clean, light-colored Swiggy theme (Swiggy Orange, dark charcoal body headings `#282c3f`, soft description grays `#686b78`, and green rating labels `#48c47d`) to make the UI look exactly like a native part of the real Swiggy website.
- Formatted the `.app-shell` as a centered viewport mockup frame on desktop screens, scaling fluidly on mobile viewports.
- Integrated a Swiggy-native header layout containing an custom vector SVG logo (orange crescent moon merging with the Swiggy ribbon) and a location selection widget (`Office • Indiranagar, Bangalore ▾`).
- Swapped tab emojis (🎲, 😊, 📅, 🕐) in [index.html](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/frontend/index.html) for crisp inline SVGs, styled with smooth orange underline indicator line animations (`.tab-btn::after`).
- Styled recommended dish cards into Swiggy's signature split menu-item grid:
  - **Left column**: Veg/Non-veg custom indicator box, bestseller/top pick label, dish name, price, green star rating badge, distance/ETA pills, and AI recommendation rationale.
  - **Right column**: An image container with a dynamic background gradient + food emoji (e.g. 🍔, 🍕, 🍛, 🍲, 🥗 based on tags) and an absolute-positioned white "ORDER NOW" button overlapping the bottom.
- Enhanced the success screen to render a live delivery tracking progress bar (`[Ordered] ➔ [Preparing] ➔ [Arriving]`) alongside a detailed Swiggy bill breakdown (Subtotal, Delivery Fee, Packaging Charge, GST & Taxes, and total bill).

### Interactive Specific Dish Checkout
- Bound the "ORDER NOW" button on all recommendation cards to trigger a direct order checkout using `/api/surprise` with the `retryDishId` request param. This makes recommendations in the Mood, Alternatives, and History tabs instantly actionable.

### Robust Checkout Retry Mechanism
- Refactored the `/api/surprise` router in [surprise.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/routes/surprise.ts) to return partial results (recommendation cards) and mock exception messages inside a 200 payload if the Swiggy checkout simulation encounters errors.
- Added a custom `retryDishId` request parameter to bypass decision selection and directly retry checkout on the same dish.
- Implemented a custom **"Checkout Failed"** alert card on the UI displaying the specific error message and offering a **"🔄 Retry Checkout"** button to allow users to retry ordering immediately without reshuffling.

### Backend Error Boundaries
- Integrated a global Express unhandled exception boundary middleware in [index.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/index.ts) to log and respond gracefully to unexpected exceptions.

### Verified
- Built clean TypeScript outputs (`npm run build`).
- Verified happy-path checkout progress receipts, direct one-click orders, and simulated checkout error tracking retry flows via curl API tests and browser validation.