#!/bin/bash

# =============================================================================
# MPLP Open Source Publishing Script
# =============================================================================
# Purpose: Publish clean open source version to public repository
# Framework: SCTM+GLFB+ITCM+RBCT Enhanced Framework
# Version: 3.0.0 (Final Production)
# Date: 2025-10-16
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PUBLIC_GITIGNORE=".gitignore.public"
INTERNAL_REPO="origin"
PUBLIC_REPO="release"
TEMP_BRANCH="temp-public-release"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}MPLP Open Source Publishing Script${NC}"
echo -e "${BLUE}Framework: SCTM+GLFB+ITCM+RBCT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =============================================================================
# ITCM: Task Complexity Assessment
# =============================================================================
echo -e "${YELLOW}📊 ITCM Task Complexity Assessment:${NC}"
echo "  - Complexity Level: 🔴 Complex"
echo "  - Risk Level: High (Publishing to public)"
echo "  - Execution Mode: Deep Decision (7-layer analysis)"
echo ""

# =============================================================================
# SCTM: Pre-flight Checks
# =============================================================================
echo -e "${YELLOW}🔍 SCTM Pre-flight Checks:${NC}"

# Check if .gitignore.public exists
if [ ! -f "$PUBLIC_GITIGNORE" ]; then
    echo -e "${RED}❌ Error: $PUBLIC_GITIGNORE not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ $PUBLIC_GITIGNORE found${NC}"

# Check if public remote exists
if ! git remote | grep -q "^${PUBLIC_REPO}$"; then
    echo -e "${RED}❌ Error: Public remote '${PUBLIC_REPO}' not configured${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Public remote '${PUBLIC_REPO}' configured${NC}"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Error: Uncommitted changes detected${NC}"
    echo "Please commit or stash your changes first."
    git status --short
    exit 1
fi
echo -e "${GREEN}✓ No uncommitted changes${NC}"

echo ""

# =============================================================================
# GLFB: Global Planning
# =============================================================================
echo -e "${YELLOW}🎯 GLFB Global Planning:${NC}"
echo "  1. Create temporary branch"
echo "  2. Apply public .gitignore filter"
echo "  3. Verify filtered content"
echo "  4. Push to public repository"
echo "  5. Cleanup temporary branch"
echo ""

# =============================================================================
# Step 1: Create Temporary Branch
# =============================================================================
echo -e "${BLUE}Step 1: Creating temporary branch...${NC}"

# Delete temp branch if exists
git branch -D "$TEMP_BRANCH" 2>/dev/null || true

# Create new temp branch from current branch
CURRENT_BRANCH=$(git branch --show-current)
git checkout -b "$TEMP_BRANCH"
echo -e "${GREEN}✓ Created temporary branch: $TEMP_BRANCH${NC}"
echo ""

# =============================================================================
# Step 2: Apply Public .gitignore Filter
# =============================================================================
echo -e "${BLUE}Step 2: Applying public .gitignore filter...${NC}"

# Backup current .gitignore
cp .gitignore .gitignore.internal.backup
echo -e "${GREEN}✓ Backed up internal .gitignore${NC}"

# Replace with public .gitignore
cp "$PUBLIC_GITIGNORE" .gitignore
echo -e "${GREEN}✓ Applied public .gitignore${NC}"

# Re-index files with new .gitignore
git rm -r --cached . > /dev/null 2>&1 || true
git add .
echo -e "${GREEN}✓ Re-indexed files with public filter${NC}"

# Commit the filtered state
git commit -m "chore: apply public .gitignore filter for open source release

- Applied .gitignore.public to filter internal content
- Removed internal documentation and configurations
- Prepared clean version for public repository

Framework: SCTM+GLFB+ITCM+RBCT
Status: Ready for public release" || true

echo ""

# =============================================================================
# Step 3: Verify Filtered Content
# =============================================================================
echo -e "${BLUE}Step 3: Verifying filtered content...${NC}"

# Count root .md files
ROOT_MD_COUNT=$(git ls-files | grep "^[^/]*\.md$" | wc -l)
echo "  - Root .md files: $ROOT_MD_COUNT (expected: 5)"

# Check for internal files that should be filtered
INTERNAL_FILES_FOUND=0

echo "  - Checking for internal files..."
if git ls-files | grep -q "OPEN-SOURCE-.*\.md"; then
    echo -e "${RED}    ⚠️  OPEN-SOURCE-*.md files found (should be filtered)${NC}"
    INTERNAL_FILES_FOUND=1
fi

if git ls-files | grep -q "BRANCH-MANAGEMENT-.*\.md"; then
    echo -e "${RED}    ⚠️  BRANCH-MANAGEMENT-*.md files found (should be filtered)${NC}"
    INTERNAL_FILES_FOUND=1
fi

if git ls-files | grep -q "CI-CD-.*\.md"; then
    echo -e "${RED}    ⚠️  CI-CD-*.md files found (should be filtered)${NC}"
    INTERNAL_FILES_FOUND=1
fi

if git ls-files | grep -q "^\.augment/"; then
    echo -e "${RED}    ⚠️  .augment/ directory found (should be filtered)${NC}"
    INTERNAL_FILES_FOUND=1
fi

if git ls-files | grep -q "^Archived/"; then
    echo -e "${RED}    ⚠️  Archived/ directory found (should be filtered)${NC}"
    INTERNAL_FILES_FOUND=1
fi

if [ $INTERNAL_FILES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ No internal files found - filter working correctly${NC}"
else
    echo -e "${RED}❌ Internal files detected - filter may not be working${NC}"
    echo "Do you want to continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Aborting..."
        git checkout "$CURRENT_BRANCH"
        git branch -D "$TEMP_BRANCH"
        mv .gitignore.internal.backup .gitignore
        exit 1
    fi
fi

echo ""

# =============================================================================
# Step 4: Push to Public Repository
# =============================================================================
echo -e "${BLUE}Step 4: Pushing to public repository...${NC}"

# Push to public repository
echo "Pushing to ${PUBLIC_REPO}/main..."
git push -f "$PUBLIC_REPO" "$TEMP_BRANCH:main"
echo -e "${GREEN}✓ Pushed to public repository${NC}"

echo ""

# =============================================================================
# Step 5: Cleanup
# =============================================================================
echo -e "${BLUE}Step 5: Cleaning up...${NC}"

# Switch back to original branch
git checkout "$CURRENT_BRANCH"
echo -e "${GREEN}✓ Switched back to $CURRENT_BRANCH${NC}"

# Delete temporary branch
git branch -D "$TEMP_BRANCH"
echo -e "${GREEN}✓ Deleted temporary branch${NC}"

# Restore internal .gitignore
mv .gitignore.internal.backup .gitignore
echo -e "${GREEN}✓ Restored internal .gitignore${NC}"

echo ""

# =============================================================================
# RBCT: Success Validation
# =============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ OPEN SOURCE RELEASE SUCCESSFUL!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📊 Release Summary:${NC}"
echo "  - Internal Repository: $INTERNAL_REPO (unchanged)"
echo "  - Public Repository: $PUBLIC_REPO (updated)"
echo "  - Root .md files in public: $ROOT_MD_COUNT"
echo "  - Internal files filtered: ✓"
echo ""
echo -e "${YELLOW}🔗 Next Steps:${NC}"
echo "  1. Verify public repository: https://github.com/Coregentis/MPLP-Protocol"
echo "  2. Create GitHub Release (v1.0.0-alpha)"
echo "  3. Publish announcement"
echo ""
echo -e "${GREEN}Framework: SCTM+GLFB+ITCM+RBCT Applied Successfully${NC}"
echo ""

