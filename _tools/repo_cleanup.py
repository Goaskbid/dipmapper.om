#!/usr/bin/env python3
"""DipMapper repo clean-up check. Usage: repo_cleanup.py REPO_DIR [report.txt] [delete.txt]
- Junk (stray upload copies, zips, OS files, editor backups) in the repository root -> written to delete.txt
  (the deploy workflow removes the listed root files on the next upload).
- Possibly unused files (nothing in the site, workflows or tools names them) -> report only, never deleted
  automatically: anything that still serves a page or a feature needs the owner's yes.
- Repository health: size of the website and of the git history, largest files, biggest history items.
Read-only on the repository itself."""
import os, re, sys, subprocess, fnmatch
R = sys.argv[1]; REP = sys.argv[2] if len(sys.argv) > 2 else None; DEL = sys.argv[3] if len(sys.argv) > 3 else None
JUNK = ['* (1)*', '* (2)*', '* (3)*', '*.zip', 'download', 'download (*', '.DS_Store', 'Thumbs.db', 'desktop.ini', '*~', '*.bak', '*.orig', '*.tmp', '*.swp', 'package.json', 'package-lock.json', 'node_modules']
KEEP = {'CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml', 'ads.txt', 'llms.txt', 'version.txt', 'sw.js', 'manifest.webmanifest', 'LICENSE.txt', 'README.md', '404.html', 'offline.html', 'wrangler.jsonc', '_headers', '_delete.txt', 'apple-touch-icon.png', 'favicon.ico', 'favicon.svg', 'icon-192.png', 'icon-512.png'}
DATA_DIRS = ('tides/', 'water/', 'visa/', 'flags/', 'fonts/', 'og/', 'vendor/', '_tools/', '.github/')
def files():
    for r, ds, fs in os.walk(R):
        ds[:] = [d for d in ds if d != '.git']
        for f in fs: yield os.path.relpath(os.path.join(r, f), R).replace(os.sep, '/')
ALL = sorted(files())
junk = [p for p in ALL if '/' not in p and any(fnmatch.fnmatch(p, j) for j in JUNK)]
text = []
for p in ALL:
    if p.endswith(('.html', '.js', '.css', '.json', '.yml', '.yaml', '.py', '.txt', '.webmanifest', '.svg', '.md', '.jsonc')) and os.path.getsize(os.path.join(R, p)) < 8_000_000:
        try: text.append(open(os.path.join(R, p), encoding='utf8', errors='ignore').read())
        except Exception: pass
blob = '\n'.join(text)
unused = []
for p in ALL:
    if p in KEEP or p in junk or p.startswith(DATA_DIRS) or p.endswith('.html'): continue
    name = p.split('/')[-1]; stem = re.sub(r'\.[a-z0-9]+$', '', name)
    if ('/' + p) in blob or p in blob or name in blob or (len(stem) > 5 and re.search(r'[\'"/]' + re.escape(stem) + r'[\'".?]', blob)): continue
    unused.append(p)
size = sum(os.path.getsize(os.path.join(R, p)) for p in ALL)
big = sorted(((os.path.getsize(os.path.join(R, p)), p) for p in ALL), reverse=True)[:8]
git = ''
if os.path.isdir(os.path.join(R, '.git')):
    try:
        cv = subprocess.run(['git', '-C', R, 'count-objects', '-vH'], capture_output=True, text=True).stdout
        git = 'Git history: ' + ', '.join(l.strip() for l in cv.splitlines() if l.startswith(('size-pack', 'count', 'in-pack')))
    except Exception: pass
out = ['DipMapper repo clean-up check', '', 'Website files: %d, %.1f MB (GitHub Pages limit 1 GB)' % (len(ALL), size / 1e6), git, '',
       'Junk in the repository root (removed by the next deploy): %d' % len(junk)] + ['  ' + p for p in junk] + ['',
       'Possibly unused (report only – needs the owner\'s yes before removal): %d' % len(unused)] + ['  ' + p for p in unused] + ['', 'Largest files:'] + ['  %.1f MB  %s' % (s / 1e6, p) for s, p in big]
rep = '\n'.join(out) + '\n'
if REP: open(REP, 'w').write(rep)
if DEL: open(DEL, 'w').write(''.join(p + '\n' for p in junk))
print(rep)
