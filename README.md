# Leonida Trophy Guide — GTA VI, all 55 PS5 trophies

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rsrizal2-ai/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rsrizal2-ai/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for the **55 official PlayStation 5 trophies** of
Grand Theft Auto VI — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

Open `app/index.html` in a desktop browser. It works with the network off: every
file it loads lives under `app/`, and your checklist never leaves your browser
except when you export it yourself.

## What it does

- **Every one of the 55 official trophies** — exact name, official description and
  grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), as published on PlayStation
  Network and reported 18 November 2026 — in `app/data/trophies.json`.
- **A guide to each trophy in our own words** — what to do, where and how, and
  when it can be missed — each citing its sources (Exophase via Planet GTA 6,
  Push Square, KeenGamer, Output Lag). No guide text is copied from other guides.
- **Checklist saved in the browser** (localStorage), with **export and import**
  as a JSON file.
- **Filters** by kind, grade, earned/unearned, a search box, and a missable-only
  toggle.
- **Spoiler setting** (on by default): the 17 story trophies stay hidden until
  you earn them.
- **Roadmap to the platinum** (`Vice Got a Price!`) in seven steps, built from
  the official descriptions — plus the **missable trophies flagged**. Only one
  trophy is currently reported as missable: **Positive Mental Attitude** (one
  meditation spot, Lucia's balcony, is only available in Chapter 1, and the game
  has no mission replay). A few hidden trophies' exact triggers are still being
  confirmed by the community a day after launch — those entries say so plainly
  instead of inventing a method.
- **No cheats warning**: cheats disable trophies and saving.

## Try it

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

Or just open `app/index.html` directly in Chrome.

## Files

- `main.ts` — the entry program (Node 22): copies `app/` and `screenshots/`
  to the output and writes `dossier.json`.
- `app/` — the static guide: `index.html`, `app.js`, `style.css`,
  `data/trophies.json` (all 55 trophies with guides and sources).
- `screenshots/` — real renders of this guide.
- `vendor/makefun-frontend.ts` — the make.fun library, unchanged from the kit.
- `serve.ts` — a tiny local static server for trying the guide.

## Notes

Unofficial and not affiliated with Rockstar Games or PlayStation. Trophy names,
descriptions and grades are the official PlayStation Network text. No Rockstar
logo or official artwork is used. MIT licensed — see `LICENSE`.
