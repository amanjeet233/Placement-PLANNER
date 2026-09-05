---
name: placement-roadmap-manager
description: Domain knowledge, schema specifications, and workflow instructions for managing, maintaining, and enhancing the 119-Day Placement Preparation Roadmap portal, including 337 DSA Topics and 24 Aptitude Chapters.
---

# Placement Roadmap Manager Skill

## 1. Project Overview & Architecture

This repository hosts an all-in-one, production-grade **SaaS Placement Preparation Portal** designed for Tier-1 engineering placements (119 Days / 17 Weeks).

### Core Files
- **`index.html`**: The single-page application (SPA) containing the master UI, styles, interactive engines, and 11 distinct views:
  1. `page-overview`: Daily schedule, 119-day master timeline, and habit tracker.
  2. `page-foundation`: Week 1–2 foundation modules.
  3. `page-phase-1`: Phase 1 roadmap (Days 1–21).
  4. `page-phase-2`: Phase 2 roadmap (Days 22–42).
  5. `page-phase-3`: Phase 3 roadmap (Days 43–63).
  6. `page-phase-4`: Phase 4 roadmap (Days 64–91).
  7. `page-phase-5`: Phase 5 final sprint & mocks (Days 92–119).
  8. `page-leetcode`: **DSA Placement Roadmap — 337 Topics** (cross-checked with Striver SDE Sheet & LeetCode).
  9. `page-aptitude`: **Placement Aptitude Roadmap — 24 Chapters** (Abhinay Sharma full courses, 0 revision playlists, 96 interactive MCQs).
  10. `page-guides`: Resume, HR, and interview preparation guides.
  11. `page-tracker`: Interactive checklist, habit tracker, and milestone progress.
- **`dsa_roadmap_337_data.js`**: External JavaScript dataset defining `window.dsaRoadmapData` (337 DSA topics with YouTube video URLs, curated LeetCode questions, and Striver SDE Sheet problems).
- **`aptitude_roadmap_24_data.js`**: External JavaScript dataset defining `window.aptitudeRoadmapData` (24 quantitative aptitude chapters with Abhinay Sharma full courses, descriptions, and 96 placement-level practice MCQs with step-by-step mathematical explanations).

---

## 2. Data Models & Schemas

### DSA Topic Schema (`window.dsaRoadmapData[i]`)
```json
{
  "topicId": 1,
  "topicNumber": "#001",
  "name": "Introduction to Dynamic Programming",
  "category": "Dynamic Programming",
  "categoryIcon": "⚡",
  "week": "Week 11–12",
  "difficulty": "Easy",
  "youtubeTitle": "Introduction to Dynamic Programming | Memoization | Tabulation",
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "description": "Understanding Overlapping Subproblems and Optimal Substructure.",
  "problems": [
    {
      "id": "70",
      "name": "Climbing Stairs",
      "url": "https://leetcode.com/problems/climbing-stairs/",
      "difficulty": "Easy",
      "isStriver": true
    }
  ]
}
```

### Aptitude Chapter Schema (`window.aptitudeRoadmapData[i]`)
```json
{
  "chapterId": 1,
  "chapterNumber": "#01",
  "name": "Number System",
  "category": "Arithmetic",
  "categoryIcon": "🟦",
  "week": "Week 1–2",
  "difficulty": "Easy",
  "lessons": "21 Lessons",
  "youtubeTitle": "Number System By Abhinay Sharma (Abhinay Maths)",
  "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhYjYuuCUr9zgqiBUESVwmYD",
  "description": "Divisibility, unit digit, remainder theorem, and factors.",
  "questions": [
    {
      "id": "apt_1_1",
      "question": "Find the unit digit in (7^95 - 3^58).",
      "options": ["0", "4", "6", "7"],
      "correctIndex": 1,
      "difficulty": "Easy",
      "sourceTag": "Placement Level",
      "explanation": "Cyclicity of 7 is 4: 95 mod 4 = 3 -> 7^3 ends in 3. Cyclicity of 3 is 4: 58 mod 4 = 2 -> 3^2 ends in 9. 13 - 9 = 4."
    }
  ]
}
```

---

## 3. LocalStorage State Management

All user progress persists in client-side localStorage:
- `placement_dsa_roadmap_v1`: `{ solvedProblems: {}, completedTopics: {}, gridCols: 4 }`
- `placement_aptitude_roadmap_v1`: `{ solvedQuestions: {}, completedChapters: {}, gridCols: 4 }`
- `placementHabitDays_v1`: Streak count & daily habit tracking.
- `placementTaskChecklist_v1`: Real-time checklist states across 119 preparation days.

---

## 4. UI/UX Rules & Guidelines

1. **Light SaaS Theme**:
   - Clean white card backgrounds (`#FFFFFF`), subtle borders (`#E2E8F0`), and soft shadows.
   - 60-30-10 color principle: 60% light canvas (`#F8FAFC`), 30% structured cards/surfaces, 10% high-contrast category accents.
2. **Category Color Coding**:
   - 🟦 **Arithmetic**: Vibrant Blue (`#2563EB`)
   - 🟪 **Algebra**: Deep Violet / Purple (`#7C3AED`)
   - 🟩 **Geometry & Mensuration**: Emerald Green (`#059669`)
   - 🟧 **Data-Based**: Rich Orange / Amber (`#EA580C` / `#D97706`)
3. **Dynamic Density Controller**:
   - Toolbar controls `Grid: [ − ] 4 / row [ + ]` must dynamically update CSS variable `--apt-grid-cols` or `--dsa-grid-cols` without page reload.
4. **Zero Revision Rule (Aptitude)**:
   - NEVER add or display revision, one-shot, or marathon playlists for Aptitude. Only full conceptual batches are permitted.
5. **DOM Boundary Integrity**:
   - When updating any page (e.g. `#page-aptitude`), NEVER overwrite or delete sibling views (`#page-phase-5`, `#page-guides`, `#page-tracker`). Always verify with automated integrity tests.
