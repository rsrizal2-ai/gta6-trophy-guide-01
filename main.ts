// Leonida Trophy Atlas — hand-in program.
//
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json there with buildDossier from
// vendor/makefun-frontend.ts.
//
// The output directory may be a bind mount (that is how the grader hands
// it to us: an empty directory mounted at /output). Removing a mount point
// fails with EBUSY, so we NEVER remove the output directory itself — we
// only remove what is inside it, entry by entry, then copy in fresh.

import { buildDossier } from './vendor/makefun-frontend.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function emptyDirectoryContents(dir: string): void {
  // Empty the directory without touching the directory itself, so a
  // bind-mounted output directory stays mounted and usable.
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyTreeIntoOutput(): void {
  for (const name of ['app', 'screenshots']) {
    const source = join(REPO_ROOT, name);
    if (!existsSync(source)) {
      throw new Error(`main.ts: missing ${name}/ in ${REPO_ROOT}`);
    }
    cpSync(source, join(OUTPUT_DIR, name), { recursive: true });
  }
  if (!existsSync(join(OUTPUT_DIR, 'app', 'index.html'))) {
    throw new Error('main.ts: app/index.html did not land in the output');
  }
  const shots = readdirSync(join(OUTPUT_DIR, 'screenshots')).filter((n) => !n.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`main.ts: screenshots/ must hold 3 or 4 images, found ${shots.length}`);
  }
  // Sanity-check the trophy data before the dossier is built: the guide
  // is worthless if the dataset is short, so fail loudly here.
  const data = JSON.parse(readFileSync(join(OUTPUT_DIR, 'app', 'data', 'trophies.json'), 'utf8'));
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies) || trophies.length !== 55) {
    throw new Error(`main.ts: expected 55 trophies, found ${Array.isArray(trophies) ? trophies.length : 'none'}`);
  }
  if (trophies.some((t) => !t || typeof t.name !== 'string' || typeof t.guide !== 'string' || !t.guide.trim())) {
    throw new Error('main.ts: every trophy needs a name and a non-empty guide');
  }
  console.log(`main.ts: verified ${trophies.length} trophies and ${shots.length} screenshots`);
}

function writeDossier(): void {
  const caps = {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 48 * 1024 * 1024,
    app_path_max_bytes: 1000,
  };
  // Build twice and require identical bytes: the hand-in must be
  // deterministic, and a flaky dossier must fail loudly here, not later.
  // (buildDossier returns a Uint8Array, so compare through Buffer.)
  const first = buildDossier(OUTPUT_DIR, caps);
  const second = buildDossier(OUTPUT_DIR, caps);
  if (!Buffer.from(first).equals(Buffer.from(second))) {
    throw new Error('main.ts: dossier is not deterministic across two builds');
  }
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), first);
  const shotCount = readdirSync(join(OUTPUT_DIR, 'screenshots')).length;
  console.log(
    `Leonida Trophy Atlas handed in to ${OUTPUT_DIR}: ` +
      `app/ + ${shotCount} screenshot(s) + dossier.json (${first.length} bytes)`,
  );
}

function main(): void {
  emptyDirectoryContents(OUTPUT_DIR);
  copyTreeIntoOutput();
  writeDossier();
}

main();
