#!/usr/bin/env bash
set -euo pipefail

echo "== Repo Truth First =="
echo

echo "[branch]"
git branch --show-current || true
echo

echo "[status]"
git status --short || true
echo

echo "[local HEAD]"
git rev-parse HEAD || true
echo

echo "[origin/main HEAD]"
git rev-parse --verify origin/main || true
echo

echo "[recent commits]"
git log --oneline -5 || true
echo

echo "[top-level files]"
find . -maxdepth 2 \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './.next/*' \
  -not -path './dist/*' \
  -type f | sort | head -200
echo

echo "[package scripts if package.json exists]"
if [ -f package.json ]; then
  node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts||{}, null, 2))"
fi
