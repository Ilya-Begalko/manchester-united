# Manchester United Fan Portal

Independent single-page fan portal for Manchester United built with Vue 3, TypeScript, Vite, Tailwind CSS,
VueUse Motion, Lucide icons and Axios. Not affiliated with Manchester United FC.

## Data sources

| Section | Source |
|---|---|
| Next match, results, fixtures | football-data.org `GET /v4/teams/66/matches` |
| Squad, club crest, coach, venue | football-data.org `GET /v4/teams/66` |
| Standings, club statistics | football-data.org `GET /v4/competitions/PL/standings` |
| Top scorers (goals / assists) | football-data.org `GET /v4/competitions/PL/scorers` |
| News | BBC Sport Manchester United RSS feed |
| Hero photo | [Old Trafford panorama](https://commons.wikimedia.org/wiki/File:Oldtraffordstadpano.jpg) by LiamUK, CC BY-SA 3.0 |

football-data.org does not provide player photos, so neutral placeholders are shown.

## Staying within the free tier (10 requests / minute)

- The browser never talks to football-data.org directly. Requests go through `/api/football`
  (a Vercel serverless function in `api/`, and the same handler as Vite middleware during development),
  which keeps the token server-side.
- Only four whitelisted resources can be requested. A full page load costs at most **4** upstream calls.
- The proxy caches responses in memory (matches 2 min, standings 5 min, scorers 10 min, squad 6 h) and sends
  `s-maxage` headers so Vercel's CDN serves repeated visits without touching the API.
- The proxy refuses to exceed 9 upstream calls per minute and serves stale cache when the provider fails.
- On the client, sections sharing data (e.g. Hero, Next Match, Fixtures) share one request via composables.

## Setup

```bash
npm install
cp .env.example .env.local   # then put your token into FOOTBALL_DATA_API_KEY
npm run dev
```

Do **not** prefix the token with `VITE_` — that would embed it in the client bundle.

## Deploy to Vercel

1. Import the repository in Vercel (framework preset: Vite).
2. Add `FOOTBALL_DATA_API_KEY` in Project Settings → Environment Variables.
3. Deploy. Functions in `api/` are picked up automatically.

## Scripts

- `npm run dev` — dev server with the API proxy
- `npm run build` — type-check and production build
- `npm run preview` — preview the production build (API proxy included)
