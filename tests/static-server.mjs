// Small static file server for the E2E tests. It serves the static export like Netlify does:
// directory URLs get a trailing slash, "/" redirects to the default locale (public/_redirects), unknown paths get 404.html.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.env.STATIC_DIR ?? '');
const PORT = Number(process.env.PORT);
const ROOT_REDIRECT = process.env.ROOT_REDIRECT;

if (!process.env.STATIC_DIR || !PORT || !ROOT_REDIRECT) {
  throw new Error('Set STATIC_DIR, PORT and ROOT_REDIRECT');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(res, file, status = 200) {
  res.writeHead(status, { 'Content-Type': MIME_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

function isFile(file) {
  return fs.statSync(file, { throwIfNoEntry: false })?.isFile() ?? false;
}

function isDirectory(file) {
  return fs.statSync(file, { throwIfNoEntry: false })?.isDirectory() ?? false;
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const file = path.join(ROOT, pathname);

  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }

  if (pathname === '/') {
    res.writeHead(302, { Location: ROOT_REDIRECT }).end();
    return;
  }

  if (isFile(file)) {
    sendFile(res, file);
    return;
  }

  if (isDirectory(file)) {
    if (!pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${pathname}/${url.search}` }).end();
      return;
    }
    const index = path.join(file, 'index.html');
    if (isFile(index)) {
      sendFile(res, index);
      return;
    }
  }

  const notFound = path.join(ROOT, '404.html');
  if (isFile(notFound)) {
    sendFile(res, notFound, 404);
  } else {
    res.writeHead(404).end();
  }
}).listen(PORT);
