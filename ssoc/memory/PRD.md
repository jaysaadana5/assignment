# SSoC Season 5 — Product Requirements

## Original problem statement
Full-stack platform for **Social Summer of Code (SSoC) Season 5** — vanilla HTML/JS frontend, FastAPI backend, MongoDB. Includes a dynamic admin dashboard to manage site content.

### Core requirements
- Central MongoDB database
- Fully dynamic content via Admin Dashboard
- High-performance, SEO-friendly site (AI crawler friendly)
- UTM / referral link tracking (Campus Advocates + Contributors)
- Campus Advocate & Contributor leaderboards
- Multi-role Contributor Badge Generator (Contributor / Mentor / Project Admin) with high-res Canvas export
- Badge Gallery Wall & social share

## Architecture
```
/app/
├── backend/
│   └── server.py             # FastAPI, all endpoints, Pydantic models
├── frontend/
│   └── public/
│       ├── index.html        # Landing page (referral block, FABs)
│       ├── admin.html        # Admin dashboard (manage everything)
│       ├── admin-app.js      # Admin JS logic
│       ├── badge.html        # Canvas badge generator
│       ├── gallery.html      # Public badge gallery
│       ├── projects.html     # Public projects listing
│       ├── getting-started.html  # Beginner guide (popup + standalone)
│       ├── onboarding.html   # HIDDEN — contributor onboarding form
│       ├── raids.html        # HIDDEN — community raids/tasks page
│       └── ... (styles.css, script.js, etc.)
└── memory/
    ├── PRD.md
    └── test_credentials.md
```

## What's been implemented (CHANGELOG)

### Feb 2026 — Contributor Raids/Tasks (latest)
- **Hidden `/raids.html`** for contributors: identity bar (name + email saved to localStorage), list of active raids with points/completion counts/deadline, "I did this" → proof-URL modal, real-time top-raiders leaderboard.
- **Admin Raids panel** (sidebar item "Raids"): CRUD via clean modal form (title, description, link, deadline, points, active toggle), full completion submissions table, **Download Completions CSV**.
- **Backend** (`/api/raids` CRUD + `/api/raids/{id}/complete` + `/api/raids/completions` + `/api/raids/stats`): leaderboard aggregation by points then completions, one-completion-per-email-per-raid (upsert).
- Indices: `raid_completions (raidId, email)` unique; `raids (createdAt -1)`.

### Feb 2026 — Contributor Onboarding
- **Hidden `/onboarding.html`**: Name, Email, Country code + phone, 3 checklist items (badge generated, Product Hunt account + upvote, Discord joined), optional notes. Beautiful success state. Upsert by email so contributors can update.
- **Admin Onboarding panel** with table + **Download CSV**.
- Fast-load via `/api/admin/init` (single combined request).

### Feb 2026 — Getting Started Guide
- New `/getting-started.html`: 6-step beginner journey for first-time OSS contributors (install Git, GitHub setup, 7 essential Git commands, finding good first issues, fork+branch+commit, opening PRs) + cheatsheet, etiquette, 6 curated resources.
- Embedded in homepage as a floating popup (purple FAB above Badge FAB).

### Feb 2026 — Projects fix & cleanup
- Removed broken `via.placeholder.com` logo from project cards.
- Removed `stars / forks / contributors` columns (cleaner cards).
- Added `PUT /api/projects/{id}` (edit was silently failing before).
- Replaced 6-prompt chain in admin with clean modal form (add + edit).

### Earlier (this fork)
- Contributor Referral Generator + Homepage Leaderboard
- Badge Gallery Wall (`/gallery.html`)
- Social Share Panel (X / LinkedIn / WhatsApp)
- Admin CSV Export per-role filter
- *REVERTED*: User Auth, Dashboard, Project Applications (user request)

## Key API endpoints (current)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/init` | Combined endpoint — siteData, projects, mentors, registrations, **onboardingSubmissions**, **raids**, **raidCompletions**, etc. |
| POST | `/api/projects/add` | Add a project |
| PUT | `/api/projects/{id}` | Edit a project |
| DELETE | `/api/projects/{id}` | Delete a project |
| POST | `/api/onboarding/submit` | Contributor onboarding submission |
| GET | `/api/onboarding/list` | Admin: list submissions |
| DELETE | `/api/onboarding/{id}` | Admin: delete |
| GET/POST/PUT/DELETE | `/api/raids[...]` | Raid CRUD (admin) |
| POST | `/api/raids/{id}/complete` | Contributor submits proof |
| GET | `/api/raids/stats` | Public leaderboard + counts |
| GET | `/api/raids/completions` | Admin: all completions |

## Roadmap (next)
- **P1 Fix broken footer links** — `href="#"` on Community column (Discord/Twitter/GitHub/LinkedIn) and missing `mailto:` for the contact email
- P2 Real Add Project form for image upload (currently only manual URL)
- P3 Auto-open Getting Started popup on first visit (cookie-gated)
- P3 Email notifications for new raid completions (admin alert)

## Test credentials
See `/app/memory/test_credentials.md` (admin login).
