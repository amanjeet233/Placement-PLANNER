<div align="center">

# 🚀 CodeTrack 360 PRO — Placement & Govt-Exam Command Center
### *Ultra-High-Density 119-Day Engineering Placement, DSA Mastery & Quantitative Aptitude System*

[![Deploy to GitHub Pages](https://github.com/amanjeet233/Placement-PLANNER/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/amanjeet233/Placement-PLANNER/actions/workflows/deploy-pages.yml)
[![Placement Reminder Push](https://github.com/amanjeet233/Placement-PLANNER/actions/workflows/reminder-push.yml/badge.svg)](https://github.com/amanjeet233/Placement-PLANNER/actions/workflows/reminder-push.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-indigo.svg)](https://amanjeet233.github.io/Placement-PLANNER/)
[![Cost: ₹0 / $0](https://img.shields.io/badge/Cost-₹0%20%2F%20Free%20Forever-success.svg)](https://firebase.google.com/)
[![Firebase Firestore](https://img.shields.io/badge/Cloud%20Sync-Real--Time%20Firestore-orange.svg)](https://firebase.google.com/)

[**🌐 Live Interactive Portal**](https://amanjeet233.github.io/Placement-PLANNER/) • [**🗺️ 119-Day Table Blueprint**](https://amanjeet233.github.io/Placement-PLANNER/roadmap.html) • [**⚡ Quickstart Guide**](#-1-click-quickstart--fork-guide) • [**🤖 AI Master Prompt**](#-master-prompt-for-generating-custom-roadmaps)

</div>

---

## 🌟 Executive Overview

**CodeTrack 360** is a production-grade, full-stack Progressive Web Application (PWA) designed for engineering undergraduates, software career transitioners, and government competitive exam aspirants (SSC CGL, CHSL, Bank PO, Railways).

It unifies **Daily Habit Tracking**, **337 Topic-by-Topic DSA Placement Curriculum**, **24 Quantitative Aptitude Master Chapters**, **Automated FCM HTTP v1 Push Reminders via GitHub Actions Cron**, and **Real-Time Multi-Device Cloud Sync** into a zero-latency, ₹0 free-tier architecture.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CODETRACK 360 ECOSYSTEM                                │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│  📱 Executive Dashboard  │  🧩 337 DSA Topics Mapped   │  📊 24 Aptitude Chapters      │
│  • Linear-grade UI       │  • Striver SDE Sheet        │  • Abhinay Sharma Batches     │
│  • Tactile Habit Stepper │  • LeetCode Problem Bank    │  • 96 Interactive MCQs        │
│  • Streak Engine (100%)  │  • Deduplication Algorithm  │  • Timed Solution Breakdown   │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│  ⏰ FCM HTTP v1 Cron     │  ☁️ Real-Time Cloud Sync    │  📦 Master Backup & Restore   │
│  • 15-Min GitHub Action  │  • Firebase Firestore NoSQL │  • 1-Click JSON Export/Import │
│  • Pure Node.js RS256    │  • Phone ↔ Laptop ↔ Web     │  • Zero Data Loss Guarantee   │
│  • Works When Closed     │  • Offline Persistence      │  • Cross-Origin Portable      │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

---

## ✨ Key Feature Architecture

### 1. 🖥️ Executive Command Center (`index.html` / `dashboard.html`)
- **Unified Hero Masthead**: Integrated live countdown clock (to Dec 31, 2026), dynamic motivational quote ticker, and mountain progress summit illustration.
- **Tactile Habit Steppers**: Daily micro-steppers for **DSA (3 topics/day)**, **Aptitude (2 chapters/day)**, **Spoken English**, **Gym/Health**, and **Night Revision**.
- **Real Calendar Date Streak Engine**: Calendar-aware streak calculator that detects missed days, awards daily consistency badges, and tracks all-time personal best streaks.
- **Weighted Progress Matrix**: Holistic formula weighting DSA (50%), Aptitude (30%), and Foundation (20%) into a true readiness score.

### 2. 🧩 337 DSA Placement Roadmap (`dsa_roadmap_337_data.js`)
- **Striver SDE Sheet + CTO Bhaiya Cross-Checked**: Complete topic breakdown covering Arrays, Two Pointers, Sliding Window, Trees, Graphs, Dynamic Programming, and Trie.
- **Smart Deduplication Engine**: Counts and syncs unique LeetCode problems across overlapping tracks without inflating counts.
- **Instant Practice Links**: One-click direct navigation to LeetCode, GeekforGeeks, and Striver sheet problem statements.

### 3. 📊 24 Quantitative Aptitude Chapters (`aptitude_roadmap_24_data.js`)
- **Zero-Shortcut Conceptual Batches**: Mapped directly to Abhinay Sharma comprehensive foundations.
- **Interactive MCQ Engine**: 96 curated benchmark questions with embedded countdown timer, score evaluator, and step-by-step mathematical derivations.

### 4. ⏰ Automated Background Push Notifications (FCM HTTP v1 + GitHub Actions)
- **Zero-Cost Background Cron**: Scheduled GitHub Actions workflow (`.github/workflows/reminder-push.yml`) triggers every 15 minutes (`*/15 * * * *`).
- **Pure Node.js RS256 OAuth2 Signer**: Uses native `crypto` and `https` modules to sign JWT assertions for Google OAuth2—**zero npm runtime dependencies**!
- **Works When Browser Is Closed**: FCM delivers OS-level banners to desktop and mobile devices even when your laptop is locked or browser is completely terminated.

### 5. ☁️ Firebase Firestore Real-Time Auto-Sync (`firebase-firestore-sync.js`)
- **Seamless Multi-Device Sync**: Any habit checked on your laptop immediately appears on your smartphone without manual refresh.
- **Offline First**: Fully functional without active internet connection; auto-syncs whenever connectivity is restored.

---

## 🚀 1-Click Quickstart & Fork Guide

Want to use this portal for your own placement preparation? You can set it up in **under 3 minutes**:

### Step 1: Fork & Clone
```bash
# 1. Fork this repo on GitHub: https://github.com/amanjeet233/Placement-PLANNER/fork
# 2. Clone your forked repo
git clone https://github.com/YOUR_USERNAME/Placement-PLANNER.git
cd Placement-PLANNER
```

### Step 2: Enable GitHub Pages (Free Hosting)
1. Go to your repo **Settings → Pages**.
2. Under **Build and deployment → Source**, select **"Deploy from a branch"** (Branch: `main` / `root`).
3. Click **Save**. Your site is now live at `https://YOUR_USERNAME.github.io/Placement-PLANNER/`!

### Step 3: Configure Free Firebase (Optional for FCM & Cloud Sync)
1. Create a free project at [Firebase Console](https://console.firebase.google.com/) (Spark Plan = ₹0).
2. Register a Web App and paste your config into [firebase-config.js](file:///d:/CU/SEM%207/90DAY/firebase-config.js).
3. Generate a Service Account Private Key (`.json`) from **Project Settings → Service Accounts**.
4. In GitHub repo **Settings → Secrets and variables → Actions**, add:
   - `FIREBASE_PROJECT_ID` = `your-project-id`
   - `FIREBASE_CLIENT_EMAIL` = `your-service-account@...iam.gserviceaccount.com`
   - `FIREBASE_PRIVATE_KEY` = Complete `-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----`
   - `FCM_DEVICE_TOKEN` = Token copied from your live dashboard's FCM Diagnostics card.

---

## 🤖 MASTER PROMPT: Generate Custom Roadmaps for Any Student

If a new student or developer wants to adapt this planner for a completely custom schedule (e.g. **60-Day FAANG Sprint**, **30-Day Service-Company Prep**, **GATE CS 2027**, or **Python/C++ Track**), copy and paste this **Master Prompt** into **Antigravity**, **ChatGPT**, **Claude**, or **Gemini**:

<details>
<summary><b>👉 Click to Expand the Universal AI Master Prompt</b></summary>

```markdown
# UNIVERSAL PLACEMENT PLANNER & ROADMAP GENERATOR PROMPT

You are an expert Technical Interview Coach and Senior Curriculum Architect. 
Your task is to generate a comprehensive, structured placement dataset tailored to my target goals, timeline, and tech stack, formatted to integrate directly into the CodeTrack 360 / Placement-PLANNER architecture.

## MY PROFILE & GOALS:
1. Target Goal: [e.g. Tier-1 FAANG SDE / Tier-2 FinTech / TCS NQT & Service Companies / GATE CS / Government Quantitative Exams]
2. Timeline: [e.g. 30 Days / 60 Days / 90 Days / 119 Days / 180 Days]
3. Primary Programming Language: [e.g. Java / C++ / Python / JavaScript]
4. Current Level: [e.g. Absolute Beginner / Intermediate DSA / Revision Only]
5. Daily Available Hours: [e.g. 4 Hours / 6 Hours / 8 Hours]

## REQUIRED OUTPUT SPECIFICATIONS:

### 1. Daily Phase Schedule (JSON Structure)
Create a structured phase-by-phase breakdown dividing the timeline into 4-5 progressive milestones:
- Phase 1: Core Foundations & Language Mastery
- Phase 2: Fundamental Data Structures & Sorting/Searching Algorithms
- Phase 3: Advanced Linear & Hierarchical Data Structures (Trees, BST, Heaps, Graphs)
- Phase 4: Dynamic Programming, System Design & Core CS Subjects (OS, DBMS, CN)
- Phase 5: Mock Interviews, Company-Specific Sheets & Final Timed Sprints

### 2. DSA Topic Dataset (`custom_dsa_data.js`)
Provide an array of topics with:
- `topicId`: Unique ID (1 to N)
- `category`: Category name (e.g., Arrays, Binary Search, Sliding Window, DP)
- `title`: Problem title
- `difficulty`: "Easy" | "Medium" | "Hard"
- `leetcodeUrl`: Direct LeetCode problem URL
- `solutionVideo`: Recommended concept video title / search query

### 3. Quantitative Aptitude Dataset (`custom_aptitude_data.js`)
Provide a 24-chapter quantitative and logical syllabus with:
- `chapterId`: Chapter code (e.g., "ch-01")
- `chapterName`: Chapter title (e.g., Percentage, Time & Work, PnC, Probability)
- `mcqs`: 4 conceptual benchmark questions per chapter with options, correct answer index, and step-by-step explanation.

### 4. Daily Habit & Routine Steppers:
Recommend the optimal daily targets for:
- DSA problems per day (e.g., 3 problems)
- Aptitude chapters per day (e.g., 1-2 chapters)
- Core CS / English / Revision intervals

Make the plan realistic, intense, and structured for maximum retention with zero redundant shortcuts!
```
</details>

---

## 🛠️ Tech Stack & ₹0 Free-Tier Engineering

| Layer | Technologies Used | Hosting / Cost |
| :--- | :--- | :--- |
| **Frontend UI** | Vanilla HTML5, Vanilla JavaScript (ES6+), Vanilla CSS, TailwindCSS CDN, Lucide Icons | GitHub Pages (**₹0 / Free Forever**) |
| **PWA & Offline** | Service Worker v3.1, Cache Storage API, Web App Manifest | Client Browser (**Offline First**) |
| **State & Habits** | Unified Local Vault (`prep_vault_v1`), Real-Time LocalStorage Observer | Client Storage (**Zero Latency**) |
| **Cloud Database** | Google Firebase Firestore (NoSQL Document Store) | Firebase Spark Tier (**₹0 / Free**) |
| **Push Notifications**| Firebase Cloud Messaging (FCM HTTP v1 API) | Google FCM (**₹0 / Free**) |
| **Cron Automation** | GitHub Actions (`actions/setup-node@v4`, scheduled cron `*/15 * * * *`) | GitHub Free Public Runners (**₹0**) |
| **OAuth2 Security** | Native Node.js `crypto` (RS256 JWT assertion signing) | Pure Node.js Standard Library |

---

## 📁 Repository Directory Map

```
Placement-PLANNER/
├── index.html                     # Primary Executive Command Center (Dashboard)
├── dashboard.html                 # Direct Dashboard View
├── roadmap.html                   # Full 119-Day Static Reference Blueprint Table
├── dashboard.js                   # Dashboard Controller & DOM Bindings
├── dashboard.css                  # Custom SaaS & Glassmorphic Design Tokens
├── prep-sync.js                   # Unified Reactive State Engine & Streak Logic
├── firebase-config.js             # Firebase Web App & VAPID Configuration
├── firebase-firestore-sync.js     # Real-Time Bi-Directional Cloud Sync Engine
├── firebase-messaging-sw.js       # Background FCM Service Worker Handler
├── service-worker.js              # PWA Offline Caching & Notification Handler (v3.1)
├── dsa_roadmap_337_data.js        # 337 DSA Placement Topics Dataset
├── aptitude_roadmap_24_data.js    # 24 Quantitative Aptitude Chapters Dataset
├── manifest.webmanifest           # Progressive Web App Manifest
├── package.json                   # Automated Test Scripts & Project Metadata
├── LICENSE                        # Open Source MIT License
├── SETUP.md                       # Step-by-Step Firebase & FCM Deployment Guide
├── README_FCM_GITHUB_ACTIONS.md   # Deep-dive FCM HTTP v1 Protocol Architecture
├── .nojekyll                      # GitHub Pages Jekyll Bypass Configuration
├── .github/workflows/
│   ├── deploy-pages.yml           # Automatic GitHub Pages Deployment
│   └── reminder-push.yml          # 15-Minute Automated FCM Push Dispatcher
└── scripts/
    └── send-fcm-reminders.js      # Pure Node.js RS256 FCM HTTP v1 Sender Engine
```

---

## 🧪 Automated Testing & Integrity Audits

To run the full suite of automated unit tests, timezone converters, FCM payload mocks, and roadmap deduplication audits:

```bash
# Run all unit test suites
npm test
```

Test coverage includes:
- ✅ **Workflow & Cron Audit**: Verifies GitHub Actions cron schedule, secrets binding, and workflow dispatch inputs.
- ✅ **IST Timezone Conversions**: Validates precise UTC to `Asia/Kolkata` evaluation across day-of-week boundaries.
- ✅ **PEM Key Normalization**: Tests RS256 JWT signing against escaped `\n`, quotes, PKCS#1, PKCS#8, and JSON payloads.
- ✅ **DSA Problem Deduplication**: Verifies unique problem count accuracy across all 337 topics.
- ✅ **Streak Continuity Engine**: Validates real calendar date arithmetic, streak freezing, and missed day resets.
- ✅ **Master Backup Roundtrip**: Verifies 100% loss-free serialization and restoration across all sub-systems.

---

## 🤝 Contributing & Community

Contributions, feature suggestions, and pull requests are warmly welcomed!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License & Attribution

Distributed under the **MIT License**. See [`LICENSE`](file:///d:/CU/SEM%207/90DAY/LICENSE) for more information.

Developed with ❤️ by **[Amanjeet](https://github.com/amanjeet233)** for students and developers worldwide. If you find this project helpful, give it a ⭐ on GitHub!
