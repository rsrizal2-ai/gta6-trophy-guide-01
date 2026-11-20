[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rsrizal2-ai/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rsrizal2-ai/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Atlas — GTA 6 Trophy Guide & Tracker

An offline guide and checklist tracker for all 55 Grand Theft Auto VI
trophies on PlayStation 5: 1 platinum, 2 gold, 6 silver and 46 bronze.
Built for the make.fun bounty
[Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Every trophy, with the official facts.** All 55 trophies show their
  official PlayStation name, description and grade, plus a guide written in
  our own words that names its sources beside each trophy.
- **Checklist tracker.** Tick trophies off as you earn them. Progress is
  saved in the browser (localStorage), survives a reload, and can be
  exported to a JSON file and imported back.
- **Filters and search.** Filter by grade (platinum, gold, silver, bronze),
  by group (story, missable, strangers, collectibles, activities, heists and
  combat, exploration), or by earned / not yet earned. Search by name.
- **Spoiler-safe mode.** Story trophies stay hidden — name and description
  blurred — until you earn them. Turn the spoiler setting off to see them.
- **Missable warning.** One trophy is flagged as possibly missable
  (Positive Mental Attitude: a meditation spot at Jason's house is only
  reachable in Chapter 1). A banner at the top says so before you start.
- **4-stage platinum roadmap.** Stage 1 story, stage 2 stranger strands,
  stage 3 activities and collectibles, stage 4 heists, combat and the
  100% completion clean-up — each stage with its own checklist and progress
  bar, in the order to play them.
- **Per-stage checklists.** Every roadmap stage lists its trophies so you
  can work one stage at a time without losing the thread.
- **Fully offline.** Static files only, no network requests at run time.
  Open it with the network off and everything still works.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
install step.

## Files

- `app/index.html` — the page: header, progress, roadmap, filters, list.
- `app/style.css` — all styling, no external fonts or images.
- `app/app.js` — loads the trophy data, renders the list and roadmap,
  saves progress, handles search, filters, spoiler mode, export and import.
- `app/data/trophies.json` — the 55 trophies: official name, description
  and grade, kind, missable flag, roadmap stage, and a guide in our own
  words with named sources.
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json` with `buildDossier` from
  `vendor/makefun-frontend.ts`.
- `serve.ts` — tiny static server for local testing.
- `screenshots/` — screenshots of the running app.
- `shots.json` — the screenshot list.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`out/` then holds `app/`, `screenshots/` and `dossier.json`.

## Sources

Trophy names, descriptions and grades follow the official PlayStation list
as published by Exophase and PSNProfiles. The guides draw on, and cite,
Push Square's GTA 6 Trophy Guide & Roadmap, KeenGamer's GTA 6 Trophy Guide,
EGamers' GTA 6 Trophy List, GTA Scoop's GTA 6 Trophies & Achievements and
GamesFuze's GTA 6 Trophy List — each guide names its sources, and every
guide is written in our own words. No guide text is copied from any of them.

## Disclaimer

An unofficial fan guide. Not affiliated with, endorsed by or connected to
Rockstar Games or PlayStation. No Rockstar logo, wordmark or official
artwork is used anywhere in this guide.

## License

MIT — see [LICENSE](LICENSE).
