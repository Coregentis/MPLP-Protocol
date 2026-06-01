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
git rev-parse --verify origin/main 2>/dev/null || echo "origin/main unavailable"
echo

echo "[origin/codex/latest-ops-foundation-wave-01 HEAD]"
git rev-parse --verify origin/codex/latest-ops-foundation-wave-01 2>/dev/null || echo "origin/codex/latest-ops-foundation-wave-01 unavailable"
echo

echo "[recent commits]"
git log --oneline -5 || true
echo

echo "[AGENTS.md bytes]"
if [ -f AGENTS.md ]; then
  wc -c AGENTS.md
else
  echo "AGENTS.md missing"
fi
echo

echo "[skill mirror drift]"
if [ -d .codex/skills ] && [ -d .agents/skills ]; then
  if diff -qr .codex/skills .agents/skills; then
    echo "SKILL_MIRROR_DRIFT=NO"
  else
    echo "SKILL_MIRROR_DRIFT=YES"
  fi
else
  echo "SKILL_MIRROR_DRIFT=NOT_APPLICABLE"
fi
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
