'use strict';
/**
 * Zero-dependency static file server for the Abheet Isher portfolio.
 * Serves ./public on the port Fly expects (8080), with correct content types
 * for html/css/js/svg/gif/png/jpg/webp/mp4/pdf, HTTP Range support for video
 * (so <video> seeking/streaming works, incl. Safari), a /health endpoint, and
 * hardened path resolution (no traversal outside ./public).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.join(__dirname, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function cacheControl(ext) {
  if (ext === '.html') return 'no-cache';
  // hashed-ish static media / assets: cache hard
  if (['.mp4', '.gif', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.pdf', '.woff2', '.woff', '.ico', '.css', '.js'].includes(ext)) {
    return 'public, max-age=86400';
  }
  return 'public, max-age=300';
}

function send(res, status, headers, body) {
  res.writeHead(status, Object.assign({}, securityHeaders(), headers));
  if (body) res.end(body); else res.end();
}

function securityHeaders() {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' }, 'Method Not Allowed');
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (_) {
    return send(res, 400, { 'Content-Type': 'text/plain' }, 'Bad Request');
  }

  if (urlPath === '/health' || urlPath === '/healthz') {
    return send(res, 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, 'ok');
  }

  if (urlPath.endsWith('/')) urlPath += 'index.html';

  // Resolve safely inside ROOT (block path traversal).
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    return send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = TYPES[ext] || 'application/octet-stream';
    const baseHeaders = Object.assign({}, securityHeaders(), {
      'Content-Type': type,
      'Cache-Control': cacheControl(ext),
      'Accept-Ranges': 'bytes',
    });

    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (m) {
        let start = m[1] === '' ? null : parseInt(m[1], 10);
        let end = m[2] === '' ? null : parseInt(m[2], 10);
        if (start === null) { start = stat.size - end; end = stat.size - 1; }
        else if (end === null) { end = stat.size - 1; }
        if (isNaN(start) || isNaN(end) || start > end || start < 0 || end >= stat.size) {
          return send(res, 416, { 'Content-Range': `bytes */${stat.size}` });
        }
        res.writeHead(206, Object.assign({}, baseHeaders, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Content-Length': end - start + 1,
        }));
        if (req.method === 'HEAD') return res.end();
        return fs.createReadStream(filePath, { start, end }).pipe(res);
      }
    }

    res.writeHead(200, Object.assign({}, baseHeaders, { 'Content-Length': stat.size }));
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`portfolio static server listening on http://${HOST}:${PORT} (root: ${ROOT})`);
});
