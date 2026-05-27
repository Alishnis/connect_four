# NEONGRID — Connect Four

> Drop your line. Dominate the grid.

A retro-futuristic Connect Four game built for the nFactor hackathon. Not just another game clone — a product with real differentiators.

## What makes this different

### The aesthetic
Full vaporwave/outrun design system: CRT scanlines, perspective grid, neon glows, Orbitron typography. Everything is designed to be screenshot-worthy and shareable.

### The features
- **AI Opponent** — Minimax with alpha-beta pruning. Three difficulty levels (Easy/Medium/Hard). The Hard AI searches 8 moves deep.
- **Real-time Multiplayer** — Share a link, play anywhere. Built on Supabase Realtime broadcast channels (~50ms latency).
- **AI Coach** — Post-game analysis. Finds blunders, missed wins, fork opportunities, and gives you an accuracy score. Turns a casual game into something educational.
- **Global Leaderboard** — Ranked by wins, with city-level granularity. Social hook for organic growth.
- **Pro Tier** — Cosmetic upgrades (disc skins, board themes) + unlimited hints + full AI Coach on multiplayer games. $3.99/mo. Monetization from day one.
- **Auth & Match History** — Sign up, all your games are saved, profile shows your stats.

## Tech stack

- **Next.js 14** (App Router) — server components, API routes, middleware
- **Tailwind CSS v4** — custom vaporwave design tokens
- **Framer Motion** — disc drop animations, modal transitions, hover effects
- **Supabase** — PostgreSQL, Auth (email + Google OAuth), Realtime broadcast
- **TypeScript** — throughout
- **Recharts** — AI Coach evaluation chart

## Running locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key

# Run the dev server
node node_modules/next/dist/bin/next dev

# Open http://localhost:3000
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Enable Realtime on the `matches` table
4. Add your URL and anon key to `.env.local`

The app works without Supabase (mock data for leaderboard, demo mode for AI Coach) but multiplayer and auth require it.

## Deploy

```bash
# Deploy to Vercel
vercel deploy
```

Add your Supabase env vars in the Vercel dashboard.

## Why this could be a real product

1. **The aesthetic works as marketing** — Users will screenshot this and share it. The vaporwave execution is extreme enough to be memorable.
2. **Social loops** — Shareable room links bring new users. City leaderboard creates local pride and competition.
3. **Retention hook** — AI Coach gives players a reason to keep coming back (self-improvement). This is the key differentiator from the 1,000 other Connect Four games.
4. **Monetization is in place** — Pro tier is live at $3.99/mo. Even at 1% conversion on 10,000 MAU, that's real revenue.

## Author

Built with Claude Code + nFactor Hackathon · 2026
