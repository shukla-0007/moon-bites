# Mood Bites – Project Context

> Master reference for the Mood Bites project. Updated after every phase.
> Any human or ML model reading this file + PHASE_LOG.md should fully understand the project.

**Current Phase:** Phase 5 – Demo-Ready Prototype and Docs ✅  
**Last Updated:** Phase 5

---

## 1. Problem & Users

### 1.1 Problem

Many Swiggy users open the app, see hundreds of options, and cannot decide what to eat. They suffer from decision fatigue, repeat the same orders, and struggle to balance taste, health, budget, and delivery time. Some users want daily meal planning handled for them entirely.

### 1.2 Target Users

- Students and working professionals who order from Swiggy regularly.
- Users who want convenience but also light control over health goals and spend limits.
- Users who are tired of making food decisions daily and want an assistant to handle it autonomously.

---

## 2. Product Overview

### 2.1 One-Liner

Mood Bites is an AI-powered Swiggy ordering assistant that decides what you should eat — on demand or on a schedule — so you never have to.

### 2.2 Core Capabilities

#### Capability 1 – Surprise Me One-Tap Order
- User sets constraints: budget, veg/non-veg, spice level, delivery time tolerance.
- Mood Bites picks a restaurant and dishes from Swiggy and prepares an order.
- User reviews the pick and confirms or reshuffles.

#### Capability 2 – Mood-Based Recommendations
- User selects a mood or goal: comfort food, healthy, high-protein, light lunch, cheat meal, etc.
- Mood Bites maps this to cuisine types, dish types, and price ranges.
- Returns 3 to 5 concrete suggestions from Swiggy with a single Order this action.

#### Capability 3 – Autonomous Daily Meal Scheduling
- User sets a schedule (e.g., weekday lunch at 1 pm, dinner at 8 pm) with rules:
  - Budget per meal
  - Dietary preferences (veg, low-carb, high-protein, etc.)
  - Cuisine rotation preferences
  - Blacklisted restaurants or dishes
- Once authorized, the assistant plans the meal, places the order on Swiggy, and handles payment.
- The user only gives quick feedback after eating (liked / disliked / too spicy / too oily, etc.).
- Feedback improves future scheduling decisions.

> Note: In Phases 1 to 4, Swiggy calls are mocked. After Builders Club approval (Phase 6), real Swiggy MCP tools replace the mocks with zero architecture change.

---

## 3. Architecture

### 3.1 Components

| Component | Role |
|---|---|
| Web Frontend (v1) | Mobile-friendly web app (HTML + CSS + vanilla JS). Handles user interaction for all 3 flows. |
| Backend API | Node.js + TypeScript HTTP API. Hosts decision logic and user data. |
| Decision Engine | Core logic for Surprise Me, mood-based, and schedule-based picks. Implemented in TypeScript. |
| Scheduling / Worker | Node-based scheduler (node-cron) triggering orders at the right time per user schedules. |
| Swiggy MCP Integration Layer | TypeScript module wrapping all Swiggy Food MCP tool calls. Mocked in early phases, real in Phase 6. |
| Database Layer | Prisma ORM with SQLite. Stores users, preferences, schedules, feedback, and order history. |

### 3.2 Data Flow

1. User interacts with the web app (configures Surprise Me, picks a mood, or manages their schedule).
2. Frontend sends HTTP requests to the Node.js + TypeScript backend API.
3. Backend loads user preferences, schedules, and feedback from SQLite via Prisma.
4. Decision engine selects restaurant and dish candidates based on rules, history, and user input.
5. Swiggy integration layer is called (mock or real) to: search restaurants, fetch menu, create cart, place order.
6. After the meal, user submits feedback in the web app.
7. Feedback is stored and used to refine future decisions.

### 3.3 Mock vs Real MCP Strategy

- Phases 1 to 4: all Swiggy-facing calls hit a local mock module returning fake but correctly shaped data.
- The mock module interface mirrors the real MCP tool signatures (same inputs, same outputs) as documented in Swiggy Builders Club reference docs.
- Phase 6 (post-approval): mock module is replaced with a real TypeScript MCP client and live Swiggy tool calls using OAuth 2.1 + PKCE. No other layer changes.

---

## 4. Tech Stack (Locked for v1)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | HTML + CSS + vanilla JavaScript | Mobile-friendly web UI served as static files from the backend. |
| Backend | Node.js + TypeScript | Express or Fastify for REST API. Decision TBD in Phase 1. |
| Database | SQLite via Prisma ORM | File-based DB (dev.db). Stores users, preferences, schedules, feedback, history. |
| Scheduling / Worker | node-cron | In-process Node scheduler for autonomous meal jobs. |
| MCP Client | TypeScript HTTP/JSON client | Wraps Swiggy Food MCP tools. Mocked until Phase 6. |
| Auth (Swiggy) | OAuth 2.1 + PKCE | As per Swiggy Builders Club documentation. Implemented in Phase 6. |
| Hosting | TBD | Railway, Render, or Fly.io. Decided in Phase 5. |

---

## 5. Swiggy Builders Club Integration

### 5.1 MCP Servers Needed

- Swiggy Food (required from Phase 4 onwards)
- Swiggy Instamart (future extension, not needed for v1 demo)

### 5.2 Planned MCP Tool Chains (Conceptual)

- Surprise Me flow: discovery tool → menu tool → cart tool → order tool
- Mood flow: discovery tool (with mood-derived filters) → menu tool → cart tool → order tool
- Schedule flow: same as Surprise Me but triggered by background worker (node-cron) on a timer

### 5.3 Access Status

- Currently awaiting Builders Club approval via application form.
- Mock data is used until approval is granted.
- After approval: plug in OAuth 2.1 + PKCE tokens and real MCP server manifest. Swap mock module with real MCP client. No other changes.

---

## 6. Phase Overview

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Architecture & Planning | ✅ Complete |
| Phase 1 | Skeleton Web App + Backend | ✅ Complete |
| Phase 2 | Decision Engine with Mocked Data | ✅ Complete |
| Phase 3 | Scheduling and Autonomous Flows (Mocked) | ✅ Complete |
| Phase 4 | MCP Integration Design (Interfaces Only) | ✅ Complete |
| Phase 5 | Demo-Ready Prototype and Docs | ✅ Complete |
| Phase 6 | Real MCP Wiring (Post-Approval) | In Progress |

---

## 7. Non-Goals for v1

- No native mobile app. Web app first; mobile after v1 is stable.
- No complex analytics dashboards.
- No multi-tenant or enterprise features.
- No hard real-time guarantees for scheduling. Best-effort is sufficient for v1.
