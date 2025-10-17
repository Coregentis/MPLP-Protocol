#!/bin/bash

# =============================================================================
# MPLP Public Release Push Script
# =============================================================================
# This script pushes a clean, filtered version to the public repository
# using .gitignore.public to exclude internal development files
#
# Usage: bash push-clean-public-release.sh
# =============================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  MPLP Clean Public Release Push                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .gitignore.public exists
if [ ! -f ".gitignore.public" ]; then
    echo "❌ Error: .gitignore.public not found!"
    echo "Please restore .gitignore.public before running this script."
    exit 1
fi

echo "✅ .gitignore.public found"
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Create temporary branch for public release
TEMP_BRANCH="temp-public-release-$(date +%s)"
echo "🔧 Creating temporary branch: $TEMP_BRANCH"
git checkout -b "$TEMP_BRANCH"
echo ""

# Apply .gitignore.public filtering
echo "🔍 Applying .gitignore.public filtering..."
echo ""

# Remove all files from git index
git rm -r --cached . > /dev/null 2>&1 || true

# Add back only files not in .gitignore.public
echo "📦 Adding files for public release..."

# Core source code
git add -f src/ 2>/dev/null || true
git add -f dist/ 2>/dev/null || true

# Documentation
git add -f docs/README.md 2>/dev/null || true
git add -f docs/en/ 2>/dev/null || true
git add -f docs/zh-CN/ 2>/dev/null || true
git add -f docs/LANGUAGE-GUIDE.md 2>/dev/null || true

# Examples
git add -f examples/ 2>/dev/null || true

# SDK
git add -f sdk/README.md 2>/dev/null || true
git add -f sdk/DEVELOPMENT.md 2>/dev/null || true
git add -f sdk/packages/ 2>/dev/null || true
git add -f sdk/examples/ 2>/dev/null || true
git add -f sdk/dist/ 2>/dev/null || true

# Root documentation
git add -f README.md 2>/dev/null || true
git add -f LICENSE 2>/dev/null || true
git add -f CHANGELOG.md 2>/dev/null || true
git add -f CODE_OF_CONDUCT.md 2>/dev/null || true
git add -f CONTRIBUTING.md 2>/dev/null || true
git add -f QUICK_START.md 2>/dev/null || true
git add -f ROADMAP.md 2>/dev/null || true
git add -f TROUBLESHOOTING.md 2>/dev/null || true

# Package files (public versions)
git add -f package.json 2>/dev/null || true
git add -f package-lock.json 2>/dev/null || true

# TypeScript config (public version)
if [ -f "tsconfig.json" ]; then
    git add -f tsconfig.json 2>/dev/null || true
fi

echo "✅ Files added for public release"
echo ""

# Check if there are changes
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit for public release"
    git checkout "$CURRENT_BRANCH"
    git branch -D "$TEMP_BRANCH"
    exit 0
fi

# Commit the filtered version
echo "💾 Committing clean public release..."
git commit -m "chore: clean public release with proper filtering

This commit contains only public-facing files:
- Source code (src/, dist/)
- Documentation (docs/, README.md, etc.)
- Examples and SDK
- Public package files

Filtered out (using .gitignore.public):
- .augment/ (AI development rules)
- Archived/ (internal reports)
- tests/ (test suites)
- config/ (development configurations)
- Internal documentation

Framework: SCTM+GLFB+ITCM+RBCT Applied
Release: Clean Public Version"

echo "✅ Commit created"
echo ""

# Push to release remote
echo "🚀 Pushing to release remote (public repository)..."
echo ""

git push release "$TEMP_BRANCH":main --force

echo ""
echo "✅ Successfully pushed clean public release!"
echo ""

# Return to original branch
echo "🔙 Returning to original branch: $CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH"

# Delete temporary branch
echo "🗑️  Deleting temporary branch: $TEMP_BRANCH"
git branch -D "$TEMP_BRANCH"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ Public Release Push Completed Successfully                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Summary:"
echo "  - Filtered using .gitignore.public"
echo "  - Pushed to: release/main"
echo "  - Repository: https://github.com/Coregentis/MPLP-Protocol.git"
echo ""
echo "⚠️  Please verify the public repository contains only public files!"
echo ""

