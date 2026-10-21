# 🏋️ IronCore Gym Management PWA — Complete

## Project Status: ✅ Built & Verified

The full-stack PWA built successfully with **zero compilation errors** (`vite build` passed, Prisma client generated).

---

## Folder Structure

```
gym/
├── package.json                  ← Root convenience scripts
├── README.md
│
├── server/                       ← Node.js + Express + Prisma
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma         ← Member + CheckIn models
│   └── src/
│       ├── index.js              ← Express entry (port 5000)
│       ├── lib/
│       │   └── prisma.js         ← Singleton Prisma client
│       └── routes/
│           ├── members.js        ← Create, search, renew, delete
│           └── checkIns.js       ← Log & fetch check-ins
│
└── client/                       ← React + Tailwind CSS v4 + Vite
    ├── vite.config.js            ← API proxy + Tailwind plugin
    ├── index.html                ← PWA meta tags
    ├── public/
    │   ├── manifest.json         ← PWA installable manifest
    │   └── icon.svg              ← Dumbbell app icon
    └── src/
        ├── main.jsx              ← React root + Toaster config
        ├── App.jsx               ← Root layout + offline detection
        ├── index.css             ← Tailwind + theme tokens
        ├── lib/
        │   ├── api.js            ← Axios client helpers
        │   └── dateUtils.js      ← Expiry status + formatting
        ├── hooks/
        │   └── useMembers.js     ← Debounced search hook
        └── components/
            ├── SearchBar.jsx     ← Live search with clear button
            ├── MemberList.jsx    ← List, skeleton, empty, error states
            ├── MemberCard.jsx    ← Card with status badge + actions
            ├── AddMemberModal.jsx← Bottom-sheet registration form
            └── FAB.jsx           ← Floating action button (+)
```

---

## Setup Commands

### Step 1 — Configure Database

```bash
# In PostgreSQL, create the database:
CREATE DATABASE gymdb;
```

### Step 2 — Server Setup

```bash
cd server

# Copy the env template and fill in your credentials
copy .env.example .env
# Open .env and set:
#   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gymdb?schema=public"

# Run DB migrations (creates tables)
npx prisma migrate dev --name init

# Start the API server (port 5000, with hot reload)
npm run dev
```

### Step 3 — Client Setup (new terminal)

```bash
cd client

# Start the dev server (port 5173)
npm run dev
```

Open **http://localhost:5173**

> The Vite dev server proxies all `/api/*` requests to `http://localhost:5000` automatically — no CORS configuration needed in development.

---

## API Reference

| Method | Route | Body / Query | Description |
|--------|-------|-------------|-------------|
| `POST` | `/api/members` | `{ fullName, phoneNumber }` | Register new member (30-day membership) |
| `GET` | `/api/members` | `?q=searchTerm` | List / search members |
| `GET` | `/api/members/:id` | — | Get member + last 10 check-ins |
| `PATCH` | `/api/members/:id/renew` | — | Extend membership +30 days |
| `DELETE` | `/api/members/:id` | — | Delete member (cascades check-ins) |
| `POST` | `/api/checkins` | `{ memberId }` | Log a check-in |
| `GET` | `/api/checkins` | `?memberId=X&limit=20` | Get check-in history |
| `GET` | `/api/health` | — | Health check |

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Tailwind CSS v4** (via `@tailwindcss/vite`) | Latest version, no config file needed |
| **Debounced search** (300ms) | Reduces API calls while typing |
| **Renewal logic** | Extends from `max(today, expirationDate)` — so expired members start fresh |
| **Skeleton loaders** | Better perceived performance than spinners |
| **Color-coded status** | 🟢 Active · 🟡 Expiring (≤7 days) · 🔴 Expired |
| **PWA manifest** | App is installable on Android/iOS from the browser |
| **Offline detection** | Shows banner and connectivity state indicator |

---

## Environment Variables

Create `server/.env` (copy from `server/.env.example`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gymdb?schema=public"
PORT=5000
```

> [!IMPORTANT]
> You must run `npx prisma migrate dev --name init` inside the `server/` directory **before** starting the server, to create the database tables.
