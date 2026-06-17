# 🌙 MoodBites

> **Conquer food decision fatigue.** MoodBites is an AI-powered Swiggy ordering assistant that decides what you should eat — on demand or on autopilot — so you never have to choose.

MoodBites is engineered for the **Swiggy Builders Club**, designed to integrate seamlessly with Swiggy's upcoming **Model Context Protocol (MCP)** tool chains. It bridges the gap between decision fatigue and autonomous food ordering by mapping user moods, dietary restrictions, and schedules directly to restaurant menus.

---

## ✨ Key Features

### 🎲 1. One-Tap "Surprise Me"
- **Instant Matches:** Filters restaurants and dishes in real time using your preferences (veg/non-veg, spice tolerance, max budget).
- **AI Scoring Reason:** Explains *why* a dish was chosen (e.g., *"nearby restaurant, excellent value for your budget, mild spice level"*).
- **One-Click Checkout:** Instantly handles checkout simulation for a specific recommendation or its alternatives.
- **Reshuffle:** Don't like the pick? Hit "Try Another Surprise" for a fresh pick instantly.

### 🎭 2. Mood-Based Recommendations
- **Dynamic Mood Mapping:** Select from curated moods like **Comfort Food**, **Healthy**, **Energizing**, **Cheat Meal**, or **Celebration**.
- **Cuisine Matching:** Automatically maps moods to cuisine filters, price boundaries, and restaurant ratings.

### 📅 3. Autonomous Daily Meal Scheduling (Autopilot)
- **Cron-Scheduled Ordering:** Set your schedule (e.g., weekday lunch at 1:30 PM) with per-slot budget and dietary rules.
- **Auto-Checkout:** A background worker automatically places orders at the configured times via the Swiggy MCP client.
- **Pause / Resume / Delete:** Full schedule management from the UI.

### 🔄 4. Adaptive Feedback Loop
- **Post-Meal Ratings:** Submit quick feedback (*liked*, *disliked*, *too spicy*, *too oily*, etc.) after every order.
- **Score Adaptation:** Feedback is stored and shifts the recommendation scoring engine for future picks.

### 🕐 5. Order History
- Browse all past orders (Surprise, Mood, Scheduled, and Auto flows) with timestamps and feedback status.

---

## 🎨 Swiggy-Native UI Highlights

MoodBites is designed to feel like a native Swiggy micro-app:
- **Orange brand header** (`#FC8019` gradient) with location chip and white SVG logo.
- **Bottom navigation bar** with 4 tabs, SVG icons, and animated active indicators.
- **Split dish cards** — Swiggy-style layout with food image, rating badge, veg dot, delivery ETA, and overlapping **+ ORDER** CTA.
- **Order receipt tracker** — animated preparation stepper + full Swiggy-style bill breakdown (subtotal, delivery fee, packaging, GST, total).
- **Skeleton loaders**, **toast notifications**, **CTA shimmer sweep**, and **stagger card animations**.

---

## 🔌 Architecture & MCP-Ready Design

MoodBites is built for **zero-refactor swap** from mock to live Swiggy MCP servers:

```
[Web UI Frontend]
      │  HTTP REST
      ▼
[Express + TypeScript Backend]
      │
      ├─► [Decision / Scoring Engine]   ← scorer.ts, surpriseEngine.ts, moodEngine.ts
      ├─► [Background Cron Worker]      ← node-cron autonomous order placement
      └─► [Prisma ORM + SQLite DB]      ← schedules, feedback, order history
                    │
                    ▼
      [Swiggy MCP Client Layer]         ← swiggyMcp.ts (mock → live swap point)
                    │  OAuth 2.1 + PKCE
                    ▼
      [Live Swiggy MCP Servers]         ← Post Builders Club approval
```

The mock client simulates the exact tool signatures for:
- `discovery` — search restaurants by location
- `menu` — fetch restaurant dishes
- `cart` — create cart and add items
- `order` — place order and track

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Steps

**1. Clone the repository:**
```bash
git clone https://github.com/shukla-0007/moon-bites.git
cd moon-bites
```

**2. Install dependencies:**
```bash
cd backend
npm install
```

**3. Set up the database:**
```bash
npx prisma db push
```
This creates `backend/prisma/dev.db` and applies the full schema (Users, Schedules, OrderHistory, Feedback).

**4. Start the development server:**
```bash
npm run dev
```
The server starts on **http://localhost:3000** and serves the frontend automatically.

**5. Open in browser:**
```
http://localhost:3000
```

> No separate frontend server needed — the Express backend serves the static HTML/CSS/JS files directly.

---

## 🗂️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, Vanilla CSS, JavaScript |
| Backend | Node.js, TypeScript, Express |
| Database | SQLite via Prisma ORM |
| Scheduling | node-cron |
| MCP Client | TypeScript interface layer (mock → live) |
| Auth (Phase 6) | OAuth 2.1 + PKCE |

---

## 📁 Key Files

```
moon-bites/
├── frontend/
│   ├── index.html        # App shell, bottom nav, tab panels
│   ├── style.css         # Design system, animations, Swiggy theme
│   └── app.js            # All UI logic, API calls, renderers
└── backend/
    └── src/
        ├── index.ts                   # Express server entry point
        ├── integration/
        │   └── swiggyMcp.ts           # MCP client (mock now, live later)
        ├── engine/
        │   ├── scorer.ts              # AI scoring algorithm
        │   ├── surpriseEngine.ts      # Surprise Me flow
        │   ├── moodEngine.ts          # Mood-based flow
        │   └── scheduleEngine.ts      # Schedule preview flow
        ├── routes/
        │   ├── surprise.ts            # POST /api/surprise
        │   ├── mood.ts                # POST /api/mood
        │   ├── schedules.ts           # CRUD /api/schedules
        │   ├── feedback.ts            # POST /api/feedback
        │   └── history.ts             # GET /api/history
        └── worker/
            └── cronWorker.ts          # Autonomous background scheduler
```

---

## 🔐 Security
- Input validation and boundary checks on all API routes (budget, time format, day names, spice level).
- HTML escaping on all dynamic content rendered in the frontend (`escapeHtml` utility).
- Production error boundary that redacts internal error messages from API responses.
- `.gitignore` excludes local databases, logs, and build artifacts.

---

## 📬 Swiggy Builders Club

This project is built specifically to integrate with the **Swiggy Food MCP Server**. Once API access is granted, the only change needed is replacing the mock `SwiggyMcpClient` in `backend/src/integration/swiggyMcp.ts` with a live HTTP client using OAuth 2.1 credentials. All engines, routes, and the frontend remain unchanged.
