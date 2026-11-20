// Leonida Trophy Atlas — serves app/ on localhost for local testing.
// Usage: node serve.ts [port]   (default 8080)
import { createServer } from 'node:http';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const APP_DIR = resolve(new URL('.', import.meta.url).pathname, 'app');
const PORT = Number(process.argv[2] || 8080);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const relPath = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
  const filePath = join(APP_DIR, normalize(relPath));
  if (!filePath.startsWith(APP_DIR)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  if (!existsSync(filePath) || !lstatSync(filePath).isFile()) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(filePath)] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

server.listen(PORT, () => {
  console.log(`Leonida Trophy Atlas at http://localhost:${PORT}`);
});
