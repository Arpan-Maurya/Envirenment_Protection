<div align="center">

<img src="https://img.shields.io/badge/CarbonIQ-v1.0.0--HACKATHON-16a34a?style=for-the-badge&logo=leaf&logoColor=white" alt="CarbonIQ" />

# 🌿 CarbonIQ
### *Track, reduce, and master your environmental impact with intelligence.*

<p align="center">
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-FF6B35?style=flat-square&logo=npm&logoColor=white" />
</p>

<p align="center">
  <b>Full-stack · Gamified · AI-Powered · Real-time · Production-grade</b>
</p>

</div>

---

## 🧠 What is CarboniQ?

CarboniQ is a **hyper-personalized carbon footprint intelligence platform** that transforms passive environmental awareness into active, rewarding sustainability habits.

Traditional carbon calculators are static — you answer a questionnaire, see a number, and that's it. **CarboniQ is different.** It's a living, breathing ecosystem: your daily habits are tracked, your missions evolve, an AI coach responds to your actual data, and every action you take is rewarded in real-time with XP, EcoPoints, and level-ups.

> **Built for**: climate-conscious individuals, eco-activists, students, and corporate sustainability programs.

---

## ✨ Feature Showcase

### 🏠 Dashboard — Mission Control
Your sustainability command center. Displays live monthly footprint, carbon budget remaining, eco-level progress, footprint breakdown donut chart, and a 6-month trend line — all synchronized in real-time via Firestore `onSnapshot` listeners.

![Dashboard](assets/dashboard.png)

### 🧾 6-Step Carbon Profile Onboarding
A guided onboarding flow that captures:
- **Step 1** — Basics (Name, City, Country with regional grid factor, Occupation)
- **Step 2** — Transportation (Mode + daily commute distance slider)
- **Step 3** — Home Energy (Monthly kWh + daily AC hours)
- **Step 4** — Diet (Vegan / Vegetarian / Omnivore / Carnivore)
- **Step 5** — Shopping habits (Rarely / Monthly / Weekly)
- **Step 6** — Waste management (Recycling, Composting, Both, Neither)

Country selection dynamically selects the correct **regional electricity grid emission factor** (India: 0.71 kg CO₂e/kWh, USA: 0.39, UK: 0.23, etc.) for accurate calculations.

### 🤖 EcoAgent AI — Your Sustainability Copilot
Powered by **Google Gemini** via a secure Express.js proxy. EcoAgent knows your exact carbon breakdown, recent activities, active missions, city, and commute — giving hyper-personalized advice instead of generic tips.

```
User: "How can I reduce my carbon footprint?"

EcoAgent: "Hi Abhishek! Looking at your footprint of 907kg, your biggest areas
are Home Energy (393kg) and Food (210kg). You have an active mission to reduce
electricity usage by 10% — unplugging chargers and optimizing your AC usage
(currently 4 hours) can significantly help..."
```

The AI response above references **actual user data** — not generic advice.

### 📊 Footprint Breakdown — Interactive Radial Analysis
A responsive donut chart with time-period filters (Day / Week / Month / Year) showing Transport, Home Energy, Food, Shopping, and Waste contributions with exact kg CO₂e values and percentages.

### 🔭 What-If Simulator
Test lifestyle changes before committing. Add custom scenarios (e.g., "Switch to Metro 3 days/week") and instantly see the projected monthly CO₂e reduction. Results are saved to Firestore for historical tracking.

### 🎯 Action Plan — Personalized Challenge Engine
Monthly reduction goal with an adjustable slider, daily habit logger, and a ranked list of personalized action cards (each with carbon reduction, difficulty, cost, and time estimates). Completing actions awards XP and EcoPoints instantly.

### 🏆 Missions & Badges
Milestone-based achievement system with Active / Completed / Badges tabs. Current streak tracking with flame indicator. Badge gallery with locked/unlocked states (Carbon Saver → Eco Warrior → Earth Protector → Solar Soul → Planet Hero).

### 📈 Activity History — Sustainability Timeline
Chronological ledger of every logged habit, completed mission, unlocked badge, and level-up event — stored as immutable Firestore subcollection documents.

### 🥇 Global Leaderboard
Real-time competitive ranking by EcoPoints. Top-3 podium display with current user row highlighted. Paginated queries (limit 20) with cursor-based "Load More" to handle scale.

### ⚙️ Settings — Full Configuration Suite
- Edit profile info (name, city, occupation, diet, transport)
- Privacy & Security policy modal
- Notification preferences (Push, Mission Reminders, Weekly Reports, Goal Alerts)
- Language & Region (English / Hindi)
- Account management (password reset, sign out, delete account)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React 18 + Vite)                 │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐    │
│  │Dashboard │  │ Missions │  │Simulator │  │  Chat UI  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘    │
│       └──────────────┴──────────────┴──────────────┘        │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │   Zustand Store        │                     │
│              │  (Single Source of     │                     │
│              │   Truth — store.ts)    │                     │
│              └───────────┬───────────┘                      │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼──────────────────────────────────┐
│                  SERVER (Express + Node.js)                 │
│                                                             │
│  /api/carbon/calculate   →  carbon-engine.ts                │
│  /api/recommendations    →  recommendation-engine.ts        │
│  /api/missions           →  mission-engine.ts               │
│  /api/simulator          →  simulator-engine.ts             │
│  /api/gemini/chat        →  Gemini API (key secured)        │
│  /api/xp/award           →  Server-validated XP grants      │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │         Google Firebase             │
        │                                     │
        │  ┌─────────────┐  ┌──────────────┐  │
        │  │  Firestore  │  │ Firebase Auth │ │
        │  │  (Realtime  │  │ (Google OAuth)│ │
        │  │  onSnapshot)│  └──────────────┘  │
        │  └─────────────┘                    │
        └─────────────────────────────────────┘
```

---

## 🔬 Scientific Carbon Engine

CarboniQ uses **documented emission factors** from internationally recognized sources:

| Category | Factor Source | Example Value |
|---|---|---|
| Transport (Car/Petrol) | DEFRA 2023 | 0.17 kg CO₂e/km |
| Transport (EV) | DEFRA 2023 | 0.05 kg CO₂e/km |
| Transport (Metro) | IPCC AR6 | 0.03 kg CO₂e/km |
| Transport (Bus) | DEFRA 2023 | 0.10 kg CO₂e/km |
| Electricity — India | CEA 2023 | 0.71 kg CO₂e/kWh |
| Electricity — USA | EPA eGRID 2023 | 0.39 kg CO₂e/kWh |
| Electricity — UK | DEFRA 2023 | 0.23 kg CO₂e/kWh |
| Food — Vegan/day | Oxford/Poore 2018 | 2.9 kg CO₂e |
| Food — Vegetarian/day | Oxford/Poore 2018 | 3.8 kg CO₂e |
| Food — Omnivore/day | Oxford/Poore 2018 | 7.0 kg CO₂e |

Carbon equivalencies are displayed using **EPA Greenhouse Gas Equivalencies**:
- 1 tree absorbs ~21.77 kg CO₂/year
- Average petrol car emits ~0.17 kg CO₂/km
- 210 kg CO₂e saved ≈ **9.6 trees worth of annual absorption** (shown on Dashboard)

---

## 🔐 Security Architecture

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      // Owner-only access — no cross-user data leakage
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /activities/{activityId} { allow read, write: if isOwner(uid); }
      match /notifications/{id}      { allow read, write: if isOwner(uid); }
      match /missions/{id}           { allow read, write: if isOwner(uid); }
      match /achievements/{id}       { allow read, write: if isOwner(uid); }
    }

    match /leaderboard/{uid} {
      // Anyone authenticated can read; only owner can write their own entry
      allow list, get: if request.auth != null;
      allow write:     if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Anti-Cheat XP Protection
XP, Level, and EcoPoints mutations are validated server-side via `/api/xp/award` before any Firestore write. Each action type has a hard maximum gain:

```ts
const XP_LIMITS = { habit: 5, action: 15, mission: 100 };
```

Client-side DevTools manipulation is caught and rejected by both the API validation layer and Firestore rule write guards.

### AI Prompt Injection Protection
All `/api/gemini/*` endpoints sanitize input against known injection patterns before reaching the Gemini API:
```ts
// Patterns filtered: "ignore previous instructions", "system prompt", "act as", "jailbreak"
const sanitized = sanitizeAIInput(userMessage);
```

### API Key Security
The `GEMINI_API_KEY` never reaches the browser. All Gemini calls are proxied through the Express server, which is compiled into `dist/server.cjs` with env vars loaded at runtime via `dotenv`.

---

## ⚡ Performance & Scalability

| Optimization | Implementation |
|---|---|
| Optimistic UI | Habit toggles, action completions update local state instantly; Firestore write happens async with rollback on failure |
| Selective onSnapshot | Only `user` doc and `notifications` use live listeners; `activities` uses one-time `getDocs` to reduce streaming overhead |
| Leaderboard pagination | Cursor-based `startAfter(lastDoc)` queries with `limit(20)` — scales to 100k+ users |
| Tree-shaking | ES module imports prevent dead code in production bundle |
| Memoized charts | Recharts components are self-contained and avoid triggering parent re-renders |
| Activity local append | `addActivity()` appends to local state immediately rather than waiting for Firestore round-trip |

---

## 🎮 Gamification Engine

```
Action Completed  →  +15 XP  +20 EcoPoints
Habit Toggled     →  +5 XP   +5 EcoPoints
Mission Completed →  +XP (mission-specific, up to +200)
Level Up          →  Every 500 XP  →  Level++  →  Notification + Activity log
Streak            →  Daily active sessions tracked via ISO date comparison
Badge Unlock      →  Milestone kg CO₂e saved (50 / 100 / 250 / 500 / 1000 kg)
```

The XP progression curve, streak reset logic, and badge unlock system are all persisted in Firestore and synchronized via `onSnapshot` across all open browser contexts.

---

## 🖥️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | Latest | Dev Server + Build |
| Zustand | Latest | Global State Management |
| React Router | v6 | Client-side Routing |
| Recharts | Latest | Data Visualization |
| Tailwind CSS | v4 | Styling |
| Shadcn/UI + Radix | Latest | Accessible Component Primitives |
| Motion (Framer) | Latest | Animations |
| Lucide React | Latest | Icons |
| react-markdown | Latest | AI response rendering |
| jsPDF | Latest | Report generation |
| Sonner | Latest | Toast notifications |
| Zod + react-hook-form | Latest | Form validation |

### Backend
| Technology | Purpose |
|---|---|
| Express.js | REST API Server |
| Google Gemini (`@google/genai`) | AI Coach (server-side, key secured) |
| Esbuild | Server compilation to `dist/server.cjs` |
| dotenv | Environment variable management |

### Firebase
| Service | Usage |
|---|---|
| Firebase Authentication | Google OAuth sign-in |
| Cloud Firestore | Real-time database, `onSnapshot` listeners |
| Firestore Security Rules | Owner-scoped auth, anti-cheat guards |

---

## 📁 Project Structure

```
carboniAi-main/
├── src/
│   ├── components/
│   │   ├── ai/              # AIContextAgent
│   │   ├── auth/            # AuthContext (Firebase Auth)
│   │   ├── dashboard/       # ActionModal, HabitManager
│   │   ├── layout/          # AppLayout, Sidebar, MobileNav, NotificationsPopover
│   │   ├── onboarding/      # Multi-step Onboarding flow
│   │   ├── profile/         # ProfileModals
│   │   ├── settings/        # SettingsModals
│   │   └── ui/              # Shadcn primitives (button, card, dialog, etc.)
│   │
│   ├── lib/
│   │   ├── carbon-engine.ts        # Core footprint calculation logic
│   │   ├── emission-factors.ts     # EPA/DEFRA/CEA emission coefficients + regional grid map
│   │   ├── recommendation-engine.ts # Action ranking by impact × difficulty
│   │   ├── mission-engine.ts       # Weekly mission generation
│   │   ├── simulator-engine.ts     # What-If scenario projection
│   │   ├── gemini-client.ts        # Gemini API client wrapper
│   │   ├── report-generator.ts     # jsPDF report builder
│   │   ├── firestore-utils.ts      # Error handling + OperationType enum
│   │   ├── firebase.ts             # Firebase app init
│   │   └── utils.ts                # safeDivide, carbonEquivalency, cn()
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx           # Main hub
│   │   ├── FootprintBreakdown.tsx  # Radial donut + time filters
│   │   ├── DetailedAnalysis.tsx    # Category deep-dive charts
│   │   ├── WhatIfSimulator.tsx     # Scenario playground
│   │   ├── ActionPlan.tsx          # Goals + habit logger + actions
│   │   ├── Missions.tsx            # Active / Completed / Badges tabs
│   │   ├── Chat.tsx                # EcoAgent AI chat interface
│   │   ├── ActivityHistory.tsx     # Timeline ledger
│   │   ├── Leaderboard.tsx         # Paginated global ranking
│   │   ├── Profile.tsx             # User stats card
│   │   ├── Settings.tsx            # App configuration
│   │   └── Login.tsx               # Google sign-in page
│   │
│   ├── store.ts                    # Zustand store (single source of truth)
│   ├── types.ts                    # Shared TypeScript interfaces
│   ├── App.tsx                     # Router + auth guard
│   └── main.tsx                    # Entry point
│
├── server.ts                       # Express API server
├── firestore.rules                 # Production Firestore security rules
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore and Authentication enabled
- A Google Gemini API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/carboniq.git
cd carboniq

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
# .env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** and **Authentication** (Google provider)
3. Copy your Firebase config into `src/lib/firebase.ts`
4. Deploy Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

### Running Locally

```bash
# Development (starts both Vite frontend + Express backend)
npm run dev

# Production build
npm run build
npm start
```

App runs at `http://localhost:3000`

---

## ♿ Accessibility

CarboniQ is built to **WCAG AA** compliance standards:

- All icon-only buttons have `aria-label` attributes
- All chart wrappers include `aria-label` and `role="img"`
- All form inputs have associated `<label>` elements with `htmlFor`
- Color contrast ratios meet 4.5:1 minimum (AA) across all text/background combinations
- No nested interactive elements (button-in-button patterns eliminated)
- Keyboard navigation fully supported throughout all modals and forms

---

## 🛣️ Roadmap

- [ ] Gemini Function Calling — AI directly creates missions and actions inside the app
- [ ] Offline-first support with IndexedDB sync queue
- [ ] Corporate team challenges and group leaderboards
- [ ] Carbon offset marketplace integration
- [ ] Weekly AI-generated sustainability report (PDF download)
- [ ] Push notifications for streak reminders

---

## 👥 Team

| Role | Contributor |
|---|---|
| Full-Stack Development | Abhishek Gupta |
*Built with 💚 for a greener future — CarboniQ promptwar 2026*

---

<div align="center">

**CARBONIQ V1.0.0-HACKATHON · CRAFTED FOR A GREENER FUTURE**

<img src="https://img.shields.io/badge/Made_with-💚-16a34a?style=flat-square" />
<img src="https://img.shields.io/badge/Carbon_Neutral-Goal-16a34a?style=flat-square&logo=leaf" />

</div>
