# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rsrizal2-ai/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rsrizal2-ai/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [make.fun bounty “Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy** with its official name, description and grade as PlayStation publishes them, plus a guide in our own words that names its sources (KeenGamer, PushSquare, GTABase, EGamers.io, Leonida Hub).
- **A roadmap to the platinum** in four stages: play the story, reach 100% completion, finish the Strangers & Freaks strands, then the platinum.
- **Missable flags** built from the official descriptions — one trophy is possibly missable (Positive Mental Attitude, the Chapter 1 balcony meditation with Lucia).
- **A tracker**: check trophies off as you earn them; progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** by kind (story, missable, collectibles, activities, crime, exploration) and by earned / not yet earned, plus search.
- **A spoiler setting** that hides the names and descriptions of story trophies until they are earned.

## Run it

The app is plain static files under `app/` with no build step. Serve it and open `index.html`:

```sh
node serve.ts
# open http://localhost:8080
```

It works with the network off: every file it loads is a file under `app/`, and it makes no network request at run time.

## Hand it in

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Data

`app/data/trophies.json` holds the 55 trophies: each item has the official `name`, `description`, `grade`, whether it is `hidden`, its `kind`, a `missable` flag, its roadmap `stage`, a `guide` in our own words, and the `sources` its facts come from.

## License

MIT. Unofficial fan-made guide — Grand Theft Auto and GTA are trademarks of Rockstar Games; this guide uses no Rockstar logo, artwork, box art or game screenshots.
