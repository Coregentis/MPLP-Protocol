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

echo "[local governance baseline discovery]"
echo "LOCAL_BASELINE_DISCOVERY_REQUIRED=YES"
echo "DYNAMIC_GOVERNANCE_BASELINE_SELECTION_PRECONDITION=Dynamic governance baseline selection is a precondition for every non-trivial task."
echo "required_phrase=Prompt assertions are not governance authority unless supported by local repository evidence."
echo "required_table=local baseline evidence table"
echo "package_policy_discovery=required_when_package_related"
echo "version_baseline_discovery=required_when_release_or_version_related"
echo "copyright_baseline_discovery=required_when_legal_or_copyright_related"
echo "cross_repo_boundary_discovery=required_when_cross_repo_related"
echo "blocked_local_baseline_missing=BLOCKED_LOCAL_GOVERNANCE_BASELINE_MISSING"
echo "blocked_local_baseline_conflict=BLOCKED_LOCAL_GOVERNANCE_BASELINE_CONFLICT"
echo "blocked_prompt_overrides_local_baseline=BLOCKED_PROMPT_POLICY_OVERRIDES_LOCAL_BASELINE"
echo "blocked_dynamic_selection_not_performed=BLOCKED_DYNAMIC_BASELINE_SELECTION_NOT_PERFORMED"
echo "blocked_substantive_decision_without_evidence=BLOCKED_SUBSTANTIVE_DECISION_WITHOUT_LOCAL_EVIDENCE"
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
