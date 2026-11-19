// Leonida Trophy Guide — the entry program for gta6-trophy-guide-01.
//
// The guide itself is the app/ folder next to this file: plain static files a
// browser opens at app/index.html (one ES module, one stylesheet, one JSON data
// file, no build step). It works fully offline — nothing it loads comes over the
// network, and the trophy list with its guides is app/data/trophies.json.
//
// This program hands the guide in. It copies app/ and screenshots/ from beside
// this file into the output directory and writes dossier.json there with the
// vendored make.fun library — the summary the judge reads (the screenshots, the
// first load's files and bytes, and the source). Do not edit
// vendor/makefun-frontend.ts: the scorer rebuilds the dossier with its own copy
// of that library and requires the two to be byte for byte identical.
//
// Try it locally first with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps come from the kit's reference/gate.json. text_max_bytes is the only
// one that shapes the dossier's bytes; the rest refuse an entry the sealed
// scorer would refuse anyway (more than 4 screenshots, or one over 256 KiB;
// more than 993 files and directories in app/, or app/ over 48 MiB — app/
// counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
