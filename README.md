# 🏋️ IronCore — Gym Management PWA

A mobile-first Progressive Web App for managing gym members, tracking check-ins, and handling membership renewals.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Vite |
| Backend | Node.js, Express |
| ORM | Prisma |
| Database | PostgreSQL |

## Project Structure

```
gym/
├── package.json              ← Root scripts
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma     ← Member + CheckIn models
│   └── src/
│       ├── index.js          ← Express entry point
│       ├── lib/
│       │   └── prisma.js     ← Prisma singleton
│       └── routes/
│           ├── members.js    ← CRUD + renew endpoints
│           └── checkIns.js   ← Check-in endpoints
└── client/
    ├── vite.config.js        ← Proxy to :5000, Tailwind plugin
    ├── index.html
    ├── public/
    │   ├── manifest.json     ← PWA manifest
    │   └── icon.svg
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── lib/
        │   ├── api.js        ← Axios client
        │   └── dateUtils.js  ← Expiry helpers
        ├── hooks/
        │   └── useMembers.js ← Debounced search hook
        └── components/
            ├── SearchBar.jsx
            ├── MemberList.jsx
            ├── MemberCard.jsx
            ├── AddMemberModal.jsx
            └── FAB.jsx
```

## Setup

### 1. Database (PostgreSQL)

Make sure PostgreSQL is running. Create a database:

```sql
CREATE DATABASE gymdb;
```

### 2. Server setup

```bash
cd server

# Copy and fill in your DB credentials
cp .env.example .env
# Edit .env → set DATABASE_URL

npm install

# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start the API server (port 5000)
npm run dev
```

### 3. Client setup

```bash
cd client
npm install

# Start the dev server (port 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/members` | Create a new member (30-day membership) |
| `GET` | `/api/members?q=term` | List / search members by name or phone |
| `GET` | `/api/members/:id` | Get single member + recent check-ins |
| `PATCH` | `/api/members/:id/renew` | Extend membership by 30 days |
| `DELETE` | `/api/members/:id` | Delete a member |
| `POST` | `/api/checkins` | Log a check-in `{ memberId }` |
| `GET` | `/api/checkins?memberId=X` | Get check-in history |
| `GET` | `/api/health` | Health check |

## Features

- 🔍 **Live search** — debounced search by name or phone
- 🟢🔴 **Color-coded status** — Active (green), Expiring soon (amber), Expired (red)
- ✅ **One-tap check-in** — logs timestamp immediately
- 🔄 **Membership renewal** — adds 30 days from expiry (or today if expired)
- ➕ **FAB** — floating action button opens bottom-sheet registration form
- 📱 **PWA-ready** — installable on mobile via manifest
- 🌐 **Offline indicator** — detects network status
