#!/bin/bash

# =============================================================================
# MPLP Clean Public Release Script v3.0
# =============================================================================
# Purpose: Push clean, user-facing content to public repository
# Strategy: User-centric filtering with language completeness validation
# Method: SCTM+GLFB+ITCM+RBCT Enhanced Framework
# Date: 2025-10-17
# =============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEMP_BRANCH="temp-clean-public-$(date +%s)"
PUBLIC_REMOTE="release"
PUBLIC_BRANCH="main"
GITIGNORE_FILE=".gitignore.public"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}MPLP Clean Public Release v3.0${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =============================================================================
# Phase 1: Pre-flight Checks
# =============================================================================
echo -e "${YELLOW}=== Phase 1: Pre-flight Checks ===${NC}"

# Check if .gitignore.public exists
if [ ! -f "$GITIGNORE_FILE" ]; then
    echo -e "${RED}Error: $GITIGNORE_FILE not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Found $GITIGNORE_FILE${NC}"

# Check if release remote exists
if ! git remote | grep -q "^${PUBLIC_REMOTE}$"; then
    echo -e "${RED}Error: Remote '$PUBLIC_REMOTE' not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Remote '$PUBLIC_REMOTE' exists${NC}"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}✓ Current branch: $CURRENT_BRANCH${NC}"

echo ""

# =============================================================================
# Phase 2: Create Temporary Branch
# =============================================================================
echo -e "${YELLOW}=== Phase 2: Create Temporary Branch ===${NC}"

# Create and checkout temporary branch
git checkout -b "$TEMP_BRANCH"
echo -e "${GREEN}✓ Created temporary branch: $TEMP_BRANCH${NC}"

echo ""

# =============================================================================
# Phase 3: Clear Git Index
# =============================================================================
echo -e "${YELLOW}=== Phase 3: Clear Git Index ===${NC}"

# Remove all files from git index
git rm -rf --cached . > /dev/null 2>&1
echo -e "${GREEN}✓ Cleared git index${NC}"

echo ""

# =============================================================================
# Phase 4: Add Files Using .gitignore.public
# =============================================================================
echo -e "${YELLOW}=== Phase 4: Add Public Files ===${NC}"

# Copy .gitignore.public to .gitignore temporarily
cp .gitignore.public .gitignore

# Add all files respecting .gitignore.public rules
git add .
echo -e "${GREEN}✓ Added files using .gitignore.public rules${NC}"

# Show what will be committed
echo ""
echo -e "${BLUE}Files to be committed:${NC}"
git status --short | head -50
TOTAL_FILES=$(git status --short | wc -l)
echo -e "${BLUE}Total files: $TOTAL_FILES${NC}"

echo ""

# =============================================================================
# Phase 5: Verify Language Documentation
# =============================================================================
echo -e "${YELLOW}=== Phase 5: Verify Language Documentation ===${NC}"

# Check if required language docs are included
if git ls-files | grep -q "^docs/en/"; then
    echo -e "${GREEN}✓ English documentation included${NC}"
else
    echo -e "${RED}✗ English documentation missing!${NC}"
    exit 1
fi

if git ls-files | grep -q "^docs/zh-CN/"; then
    echo -e "${GREEN}✓ Chinese documentation included${NC}"
else
    echo -e "${RED}✗ Chinese documentation missing!${NC}"
    exit 1
fi

if git ls-files | grep -q "^docs/ja/"; then
    echo -e "${GREEN}✓ Japanese documentation included${NC}"
else
    echo -e "${YELLOW}⚠ Japanese documentation missing (optional)${NC}"
fi

# Check if incomplete language docs are excluded
if git ls-files | grep -q "^docs/de/"; then
    echo -e "${RED}✗ German documentation should be excluded (incomplete)!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ German documentation excluded (incomplete)${NC}"
fi

if git ls-files | grep -q "^docs/es/"; then
    echo -e "${RED}✗ Spanish documentation should be excluded (incomplete)!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Spanish documentation excluded (incomplete)${NC}"
fi

# Check if internal Chinese docs are excluded
if git ls-files | grep -q "^docs/zh-CN/project-management/"; then
    echo -e "${RED}✗ Chinese project-management should be excluded (internal)!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Chinese project-management excluded (internal)${NC}"
fi

if git ls-files | grep -q "^docs/zh-CN/quality-assurance/"; then
    echo -e "${RED}✗ Chinese quality-assurance should be excluded (internal)!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Chinese quality-assurance excluded (internal)${NC}"
fi

echo ""

# =============================================================================
# Phase 6: Verify Examples Cleanup
# =============================================================================
echo -e "${YELLOW}=== Phase 6: Verify Examples Cleanup ===${NC}"

# Check if example source code is included
if git ls-files | grep -q "^examples/.*/src/"; then
    echo -e "${GREEN}✓ Example source code included${NC}"
else
    echo -e "${YELLOW}⚠ Example source code missing${NC}"
fi

# Check if example node_modules are excluded
if git ls-files | grep -q "^examples/.*/node_modules/"; then
    echo -e "${RED}✗ Example node_modules should be excluded!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Example node_modules excluded${NC}"
fi

# Check if example jest.setup.js are excluded
if git ls-files | grep -q "^examples/.*/jest.setup.js"; then
    echo -e "${RED}✗ Example jest.setup.js should be excluded!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Example jest.setup.js excluded${NC}"
fi

echo ""

# =============================================================================
# Phase 7: Commit Changes
# =============================================================================
echo -e "${YELLOW}=== Phase 7: Commit Changes ===${NC}"

# Commit the changes
git commit -m "chore: Clean public release v3.0 - User-centric content

- Include complete language documentation (English, Chinese, Japanese)
- Exclude incomplete language documentation (German, Spanish, French, Korean, Russian)
- Exclude internal Chinese documentation (project-management, quality-assurance)
- Clean up examples (exclude node_modules, jest.setup.js, dist)
- Update README language navigation to reflect available languages

Quality: User-centric filtering with language completeness validation
Method: SCTM+GLFB+ITCM+RBCT Enhanced Framework
Date: $(date +%Y-%m-%d)" > /dev/null

COMMIT_HASH=$(git rev-parse --short HEAD)
echo -e "${GREEN}✓ Committed changes: $COMMIT_HASH${NC}"

echo ""

# =============================================================================
# Phase 8: Push to Public Repository
# =============================================================================
echo -e "${YELLOW}=== Phase 8: Push to Public Repository ===${NC}"

echo -e "${BLUE}Pushing to $PUBLIC_REMOTE/$PUBLIC_BRANCH...${NC}"

# Push to public repository (force push to ensure clean state)
git push "$PUBLIC_REMOTE" "$TEMP_BRANCH:$PUBLIC_BRANCH" --force

echo -e "${GREEN}✓ Successfully pushed to $PUBLIC_REMOTE/$PUBLIC_BRANCH${NC}"

echo ""

# =============================================================================
# Phase 9: Cleanup
# =============================================================================
echo -e "${YELLOW}=== Phase 9: Cleanup ===${NC}"

# Return to original branch
git checkout "$CURRENT_BRANCH"
echo -e "${GREEN}✓ Returned to branch: $CURRENT_BRANCH${NC}"

# Delete temporary branch
git branch -D "$TEMP_BRANCH"
echo -e "${GREEN}✓ Deleted temporary branch: $TEMP_BRANCH${NC}"

# Restore original .gitignore
git checkout .gitignore
echo -e "${GREEN}✓ Restored original .gitignore${NC}"

echo ""

# =============================================================================
# Success Summary
# =============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Clean Public Release v3.0 Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo -e "  • Commit: $COMMIT_HASH"
echo -e "  • Remote: $PUBLIC_REMOTE"
echo -e "  • Branch: $PUBLIC_BRANCH"
echo -e "  • Files: $TOTAL_FILES"
echo -e "  • Languages: English, Chinese, Japanese"
echo -e "  • Quality: User-centric filtering"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Verify public repository: https://github.com/Coregentis/MPLP-Protocol"
echo -e "  2. Check README language links"
echo -e "  3. Test example applications"
echo ""
echo -e "${GREEN}🎉 Public release is ready for users!${NC}"

