# CivicBridge

CivicBridge is a full-stack, data-driven volunteer coordination prototype built with:
- React + Vite + Tailwind CSS (frontend)
- Node.js + Express (backend)
- SQLite (database)

It supports anonymous user IDs, issue reporting, credibility scoring, smart volunteer matching, role dashboards, a community feed, needs heatmap, and a mock donation flow.

## Project Structure

```text
/civicbridge
  /backend
    server.js
    db.js
    seed.js
    /routes
    /middleware
    /uploads
  /frontend
    /src
      /pages
      /components
      /context
      /services
```

## Setup

1. Install dependencies from the root:
```bash
npm install
```

2. (Optional but recommended) Reset and seed dummy data:
```bash
npm run seed
```

3. Start backend + frontend together:
```bash
npm start
```

Backend runs on `http://localhost:5000` and frontend on `http://localhost:5173`.

## Seeded Demo Accounts

Password for all seeded users: `password123`

- Volunteers:
  - `vol1@civicbridge.local`
  - `vol2@civicbridge.local`
  - `vol3@civicbridge.local`
  - `vol4@civicbridge.local`
  - `vol5@civicbridge.local`
- NGOs:
  - `ngo1@civicbridge.local`
  - `ngo2@civicbridge.local`
  - `ngo3@civicbridge.local`
- Community Members:
  - `user1@civicbridge.local`
  - `user2@civicbridge.local`

## Key Features Implemented

- JWT authentication with anonymous IDs:
  - Volunteer: `VOL-XXXXX`
  - Community Member: `USR-XXXXX`
  - NGO: `ORG-XXXXX`
- Issue reporting with:
  - category, description, pincode, people affected, photo upload, online resolvable toggle
  - auto `NEED-XXXXX` ID
  - auto urgency tier
  - credibility scoring (0-100)
- Smart volunteer matching:
  - pincode / adjacent pincode fallback
  - weighted score
  - top 3 match assignment
  - volunteer accept/decline
  - 48-hour contact token on accept
- Role dashboards:
  - Volunteer impact stats + badges
  - NGO area issues + verification + match visibility + announcement posting
  - Community issue tracking + assigned volunteer + resolve flow
- Public community feed (pincode-filtered)
- Needs heatmap with category/urgency filters
- Donation/online action page with pledge counter and progress bars

## Notes

- Uploaded issue photos are stored locally in `backend/uploads`.
- DB file is `backend/civicbridge.db`.
- On backend startup, initial seeding is auto-run only if the database is empty.
