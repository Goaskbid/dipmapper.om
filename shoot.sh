#!/bin/bash
# usage: MODES=paddle,sail shoot.sh OUTDIR [w h]
H=$(cd "$(dirname "$0")" && pwd)
cd "$H/../../tests"
export SHOTDIR=$1  # set NODE_PATH / CHROME_PATH if puppeteer or Chrome are not found
mkdir -p $1 _site; cp ../../website/index.html _site/final.html
python3 "$H/gen_shots.py"
(node lib/serve.js 8765 >/dev/null 2>&1 &); sleep 1
node _shots.js ${2:-390} ${3:-844}
pkill -f "^node lib/serve.js"; rm -f _shots.js
