#!/usr/bin/env python3
"""DipMapper: build the public folder for Cloudflare (Workers static assets).

Copies ONLY public website files from the repository into ./public, writes _headers,
and refuses to publish when a check fails. Nothing here runs on GitHub Pages; the live
GitHub site is untouched. Usage (repository root):  python3 _tools/cf_public.py [src] [dst]
"""
import os, re, shutil, sys

SRC = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
DST = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(SRC, 'public'))

# allowlist: only these file types are public
EXT = {'.html', '.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.xml',
       '.webmanifest', '.woff', '.woff2', '.ttf', '.mp3', '.mp4'}
TXT_OK = {'robots.txt', 'llms.txt', 'version.txt', 'ads.txt', 'LICENSE.txt', 'humans.txt'}
SKIP_DIRS = {'.git', '.github', '_tools', 'node_modules', 'public', '.wrangler', 'tests', 'docs', 'build'}
SKIP_FILES = {'wrangler.jsonc', 'wrangler.toml', 'package.json', 'package-lock.json', 'CNAME', '.nojekyll', '_delete.txt', 'README.md'}
FORBID = re.compile(r'(\.map$|\.env|\.py$|\.sh$|\.zip$|\.ya?ml$|\.md$|id_rsa|\.pem$|\.key$)', re.I)
MAX_FILES, WARN_FILES = 100_000, 80_000
MAX_BYTES, WARN_BYTES = 25 * 1024 * 1024, 20 * 1024 * 1024

HEADERS = """/*
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=()

/sw.js
  Cache-Control: no-cache

/version.txt
  Cache-Control: no-cache

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/flags/*
  Cache-Control: public, max-age=2592000
"""


def main():
    if os.path.exists(DST):
        shutil.rmtree(DST)
    os.makedirs(DST)
    n = total = 0
    warn, err, skipped = [], [], 0
    for root, dirs, files in os.walk(SRC):
        rel = os.path.relpath(root, SRC)
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.') and not (rel == '.' and d.startswith('_'))]
        for f in files:
            p = os.path.join(root, f)
            r = os.path.normpath(os.path.join(rel, f))
            ext = os.path.splitext(f)[1].lower()
            public = (ext in EXT or f in TXT_OK or (ext == '.txt' and re.search(r'(OFL|LICEN[CS]E|NOTICE)', f))) and f not in SKIP_FILES and not f.startswith('.') and not f.startswith('_')
            if not public:
                skipped += 1
                continue
            if FORBID.search(f):
                err.append('forbidden file type: ' + r)
                continue
            sz = os.path.getsize(p)
            if sz > MAX_BYTES:
                err.append('over 25 MiB: %s (%d bytes)' % (r, sz))
                continue
            if sz > WARN_BYTES:
                warn.append('over 20 MiB: %s' % r)
            d = os.path.join(DST, r)
            os.makedirs(os.path.dirname(d), exist_ok=True)
            if ext in ('.js', '.css'):
                with open(p, 'rb') as fh:
                    b = fh.read()
                if b'sourceMappingURL=' in b:
                    if not r.startswith('vendor' + os.sep):
                        err.append('source map reference in ' + r)
                        continue
                    # third-party library: drop the pointer to a map file that is not published
                    b = re.sub(rb'\n?//# sourceMappingURL=[^\n]*|/\*# sourceMappingURL=[^*]*\*/', b'', b)
                    with open(d, 'wb') as fh:
                        fh.write(b)
                    n += 1
                    total += len(b)
                    continue
            shutil.copy2(p, d)
            n += 1
            total += sz
    if not os.path.exists(os.path.join(DST, 'index.html')) or not os.path.exists(os.path.join(DST, '404.html')):
        err.append('index.html or 404.html missing from the public folder')
    with open(os.path.join(DST, '_headers'), 'w') as fh:
        fh.write(HEADERS)
    n += 1
    if n > MAX_FILES:
        err.append('too many files: %d (limit %d)' % (n, MAX_FILES))
    elif n > WARN_FILES:
        warn.append('file count %d is above the warning line %d' % (n, WARN_FILES))
    print('public folder: %d files, %.1f MB, %d repository files left out' % (n, total / 1048576, skipped))
    for w in warn:
        print('WARNING', w)
    for e in err:
        print('ERROR', e)
    if err:
        sys.exit(1)


if __name__ == '__main__':
    main()
