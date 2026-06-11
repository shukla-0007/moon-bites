# 🌙 MoodBites

> **Conquer food decision fatigue.** MoodBites is an AI-powered Swiggy ordering assistant that decides what you should eat—on demand or on autopilot—so you never have to choose.

MoodBites is engineered for the **Swiggy Builders Club**, designed to integrate seamlessly with Swiggy’s upcoming **Model Context Protocol (MCP)** tool chains. It bridges the gap between decision fatigue and autonomous food ordering by mapping user moods, dietary restrictions, and schedules directly to restaurant menus.

---

## ✨ Key Capabilities & Features

### 🎲 1. One-Tap "Surprise Me"
* **Instant Matches:** Filters restaurants and dishes in real time using preferences (veg/non-veg, spice tolerance, max budget).
* **AI Scoring Reason:** Explains *why* a dish was chosen (e.g., *"nearby restaurant, excellent value for your budget, mild spice level"*).
* **One-Click Checkout:** Instantly handles checkout simulation for a specific recommendation or its alternatives.

### 🎭 2. Mood-Based Recommendations
* **Dynamic Mood Mapping:** Select from curated moods like **Comfort Food**, **Healthy**, **Energizing**, **Cheat Meal**, or **Celebration**.
* **Cuisine Matching:** Maps moods to physical cuisine filters, price boundaries, and restaurant ratings automatically.

### 📅 3. Autonomous Daily Meal Scheduling (Autopilot)
* **Cron-Scheduled Ordering:** Set your schedule (e.g., weekday lunch at 1:30 PM, Sunday dinner at 8:00 PM) with unique budget and veg-only rules.
* **Auto-Checkout:** The system automatically places the order via the Swiggy MCP client in the background.

### 🔄 4. Adaptive Feedback Loop
* **Refinement Scorer:** Submit quick post-meal feedback (*liked*, *disliked*, *too spicy*, *too oily*).
* **Score Shifts:** Feedback is stored in SQLite and adjusts restaurant/dish recommendation scoring dynamically for future orders.

---

## 🎨 Unique Highlights & Swiggy-Native Polish

MoodBites features a **v6 Swiggy Premium Native Theme** designed to feel like an official Swiggy micro-app:
* **Brand Header:** A sticky header in Swiggy's brand gradient (`#FC8019`) featuring location status widgets (`Office • Indiranagar, Bangalore ▾`).
* **Bottom-Fixed Navigation:** A mobile-native navigation bar with custom inline SVGs and smooth scale/underline active states.
* **Split Dish Cards:** Matches Swiggy's physical dish layout, separating description tags, rating stars (`★ 4.4`), and veggie dots from the food image container and overlapping **ORDER NOW** actions.
* **Interactive Receipt Tracker:** Order successes animate a preparation stepper (`[Ordered] ➔ [Preparing] ➔ [Arriving]`) alongside a complete tax, delivery, and subtotal fee breakdown.
* **Micro-Animations:** Fluid CSS transitions, stagger-delayed card load fades, shimmer sweeps on primary CTA actions, and content skeleton loaders during API fetch states.

---

## 🔌 Architecture & MCP-Ready Design

MoodBites is designed with **zero-code-refactor readiness**. It uses standard interfaces modeled after the official Swiggy Builders Club MCP server definition:

```
[Web UI Frontend]
      │ (HTTP REST APIs)
      ▼
[Express Backend API]
      │
      ├─► [Decision/Scoring Engine]
      ├─► [Background Cron Worker]
      │
      └─► [Prisma SQLite Database]
            │
            ▼
      [Swiggy MCP Client Layer (swiggyMcp.ts)]
            │ (OAuth 2.1 + PKCE)
            ▼
      [Live Swiggy MCP Servers] (Post Builders Club Approval)
```

Until the live Swiggy MCP servers are plugged in, MoodBites runs against a **Mock MCP client** simulating the exact input/output payloads of:
* `discovery` (searching restaurants)
* `menu` (fetching items)
* `cart` (adding items)
* `order` (checking out and tracking)

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)

### Setup & Run
1. **Clone the repository and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Initialize the SQLite database (using Prisma):**
   ```bash
   npx prisma db push
   ```
   *This will automatically generate the database file `backend/prisma/dev.db` and apply the database schema.*

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The server runs on **http://localhost:3000** and serves the static frontend files automatically.*

4. **Access the application:**
   Open your browser and navigate to **http://localhost:3000** to test the Surprise Me tab, choose a mood, or schedule a recurring meal plan.

---

## 📁 Codebase Navigation

* **Frontend UI:**
  * [frontend/index.html](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/frontend/index.html) – Mobile-native shell structure, bottom-tabs container, and Steppers.
  * [frontend/style.css](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/frontend/style.css) – Design system token definitions, animations, brand colors, and shimmers.
  * [frontend/app.js](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/frontend/app.js) – State managers, transition controls, toast helper functions, and endpoint integrations.

* **Backend Engine:**
  * [backend/src/index.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/index.ts) – Server router, health points, static asset providers, and unhandled exception guards.
  * [backend/src/integration/swiggyMcp.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/integration/swiggyMcp.ts) – Contract-based MCP tools client and mocks.
  * [backend/src/engine/scorer.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/engine/scorer.ts) – Decision logic evaluating distance, ratings, price constraints, and prior food feedback.
  * [backend/src/worker/cronWorker.ts](file:///Users/sigma-7/Documents/VS-Code/MoodBites-Swiggy%20Builder/VSCode_MoodBites-Swiggy%20Builder/moon-bites/backend/src/worker/cronWorker.ts) – Background daemon register loading schedules and executing auto-orders.
