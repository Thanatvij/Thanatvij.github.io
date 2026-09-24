#!/usr/bin/env node
/**
 * Preview server for the migration period.
 *
 * Serves ./dist (the Astro build) first and falls back to the repository root (the existing
 * hand-written site: other pages, PDFs, tarot/, …). This mirrors what GitHub Pages will serve when
 * the built files are copied over the repo root one page at a time, so links from a migrated page
 * to a not-yet-migrated page (or to a PDF) can be tested for real.
 *
 *   npm run build && npm run preview:merged        → http://localhost:4321/
 *   PORT=5000 npm run preview:merged
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '..', 'dist');
const legacy = path.resolve(here, '..', '..');
const port = Number(process.env.PORT || 4321);
const legacyOnly = process.env.LEGACY_ONLY === '1';     // serve only the existing site (handy for before/after comparisons)
const compressible = /\.(html|css|js|mjs|json|svg|webmanifest|xml|txt)$/i;

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

function locate(urlPath) {
  const rel = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  for (const root of legacyOnly ? [legacy] : [dist, legacy]) {
    if (root === legacy && /^(astro|\.git)(\/|$)/.test(rel)) continue;       // never expose the pilot's sources or .git
    let file = path.resolve(root, rel);
    if (file !== root && !file.startsWith(root + path.sep)) continue;         // path-traversal guard
    try {
      let st = fs.statSync(file);
      if (st.isDirectory()) { file = path.join(file, 'index.html'); st = fs.statSync(file); }
      return { file, size: st.size, from: root === dist ? 'astro' : 'legacy' };
    } catch { /* try the next root */ }
  }
  return null;
}

http.createServer((req, res) => {
  const hit = locate(req.url || '/');
  if (!hit) {
    const notFound = path.join(legacy, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    return fs.existsSync(notFound) ? fs.createReadStream(notFound).pipe(res) : res.end('Not found');
  }
  const headers = { 'content-type': types[path.extname(hit.file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-cache', 'x-served-from': hit.from, 'accept-ranges': 'bytes' };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), hit.size - 1) : hit.size - 1;
    res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${hit.size}`, 'content-length': end - start + 1 });
    return req.method === 'HEAD' ? res.end() : fs.createReadStream(hit.file, { start, end }).pipe(res);
  }
  // GitHub Pages compresses text responses; do the same here so size/timing comparisons are realistic.
  if (compressible.test(hit.file) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    res.writeHead(200, { ...headers, 'content-encoding': 'gzip', vary: 'accept-encoding' });
    return req.method === 'HEAD' ? res.end() : fs.createReadStream(hit.file).pipe(zlib.createGzip({ level: 6 })).pipe(res);
  }
  res.writeHead(200, { ...headers, 'content-length': hit.size });
  return req.method === 'HEAD' ? res.end() : fs.createReadStream(hit.file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Astro build over legacy site → http://localhost:${port}/  (dist first, repo root as fallback)`));
