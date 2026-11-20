// Leonida Trophy Atlas — hands the guide in. Copies app/ and screenshots/
// from the repository into the output directory and writes dossier.json
// with buildDossier from vendor/makefun-frontend.ts. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output.
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = new URL('.', import.meta.url).pathname;
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir)) {
    const from = join(sourceDir, entry);
    const to = join(targetDir, entry);
    const stat = lstatSync(from);
    if (stat.isDirectory()) {
      copyTree(from, to);
    } else if (stat.isFile()) {
      copyFileSync(from, to);
    }
    // Symbolic links and other special files are left out: the gate
    // wants plain files and directories only.
  }
}

function main(): void {
  const appDir = join(REPO_ROOT, 'app');
  const shotsDir = join(REPO_ROOT, 'screenshots');
  if (!existsSync(appDir)) throw new Error('app/ is missing from the repository');
  if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing from the repository');

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTree(appDir, join(OUTPUT_DIR, 'app'));
  copyTree(shotsDir, join(OUTPUT_DIR, 'screenshots'));

  const dossier = buildDossier(OUTPUT_DIR, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  // The grader runs the program twice and requires the same bytes both
  // times, so build the dossier a second time and refuse to hand in a
  // result that does not reproduce itself.
  const dossierAgain = buildDossier(OUTPUT_DIR, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  // buildDossier returns a Uint8Array, which has no .equals, so compare
  // through Buffer.
  if (Buffer.compare(Buffer.from(dossier), Buffer.from(dossierAgain)) !== 0) {
    throw new Error('dossier.json is not deterministic across builds');
  }
  console.log(`wrote ${OUTPUT_DIR}/dossier.json (${dossier.length} bytes, deterministic)`);
}

main();
