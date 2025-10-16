#!/bin/bash

# =============================================================================
# MPLP Open Source Publishing Script
# =============================================================================
# This script publishes the MPLP project to the public open source repository
# while filtering out internal development content.
#
# Framework: SCTM+GLFB+ITCM+RBCT
# Repository: https://github.com/Coregentis/MPLP-Protocol
# Version: 1.0.0
# Last Updated: 2025-10-16
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INTERNAL_REPO="origin"
PUBLIC_REPO="release"
TEMP_BRANCH="temp-public-release-$(date +%Y%m%d-%H%M%S)"
PUBLIC_GITIGNORE=".gitignore.public"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}MPLP Open Source Publishing Script${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# =============================================================================
# SCTM: System Analysis
# =============================================================================

echo -e "${BLUE}[SCTM] 系统性分析...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 未找到package.json，请在项目根目录运行此脚本${NC}"
    exit 1
fi

# Check if public .gitignore exists
if [ ! -f "$PUBLIC_GITIGNORE" ]; then
    echo -e "${RED}错误: 未找到 $PUBLIC_GITIGNORE${NC}"
    echo -e "${YELLOW}请先创建公开专用的.gitignore文件${NC}"
    exit 1
fi

# Check remotes
echo "检查Git远程仓库..."
if ! git remote get-url $INTERNAL_REPO > /dev/null 2>&1; then
    echo -e "${RED}错误: 未找到内部仓库远程 '$INTERNAL_REPO'${NC}"
    exit 1
fi

if ! git remote get-url $PUBLIC_REPO > /dev/null 2>&1; then
    echo -e "${RED}错误: 未找到公开仓库远程 '$PUBLIC_REPO'${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 系统检查通过${NC}"
echo ""

# =============================================================================
# ITCM: Complexity Assessment
# =============================================================================

echo -e "${BLUE}[ITCM] 复杂度评估...${NC}"
echo ""

# Count files to be published
TOTAL_FILES=$(git ls-files | wc -l)
echo "总文件数: $TOTAL_FILES"

# Estimate filtered files
FILTERED_ESTIMATE=$(grep -v '^#' $PUBLIC_GITIGNORE | grep -v '^$' | wc -l)
echo "预计过滤规则数: $FILTERED_ESTIMATE"

echo -e "${GREEN}✓ 复杂度评估完成${NC}"
echo ""

# =============================================================================
# User Confirmation
# =============================================================================

echo -e "${YELLOW}准备发布到公开仓库:${NC}"
echo "  内部仓库: $(git remote get-url $INTERNAL_REPO)"
echo "  公开仓库: $(git remote get-url $PUBLIC_REPO)"
echo "  当前分支: $(git branch --show-current)"
echo "  临时分支: $TEMP_BRANCH"
echo ""

read -p "是否继续? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

# =============================================================================
# GLFB: Global Planning
# =============================================================================

echo ""
echo -e "${BLUE}[GLFB] 全局规划执行...${NC}"
echo ""

# Ensure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}警告: 当前不在main分支，切换到main分支...${NC}"
    git checkout main
fi

# Pull latest changes
echo "拉取最新更新..."
git pull $INTERNAL_REPO main

# Create temporary branch
echo "创建临时发布分支: $TEMP_BRANCH"
git checkout -b $TEMP_BRANCH

echo -e "${GREEN}✓ 全局规划完成${NC}"
echo ""

# =============================================================================
# GLFB: Local Execution - Content Filtering
# =============================================================================

echo -e "${BLUE}[GLFB] 局部执行 - 内容过滤...${NC}"
echo ""

# Backup current .gitignore
echo "备份当前.gitignore..."
cp .gitignore .gitignore.backup

# Replace with public .gitignore
echo "应用公开专用.gitignore..."
cp $PUBLIC_GITIGNORE .gitignore

# Remove files that should not be published
echo "移除内部开发文件..."

# Remove internal documentation
rm -f COMMIT-HISTORY-CLARIFICATION.md
rm -f OPEN-SOURCE-READINESS-REPORT.md
rm -f OPEN-SOURCE-RELEASE-PLAN.md
rm -f QUALITY-REPORT.md
rm -f GOVERNANCE.md
rm -f PRIVACY.md
rm -f SECURITY.md
rm -f MAINTAINERS.md
rm -f RELEASE-CHECKLIST.md
rm -f BRANCH-MANAGEMENT-*.md
rm -f CI-CD-FIX-SUMMARY.md
rm -f ci-diagnostic-report.json

# Remove internal directories
rm -rf .augment/
rm -rf .circleci/
rm -rf .github/
rm -rf .husky/
rm -rf .pctd/
rm -rf .quality/
rm -rf Archived/
rm -rf config/
rm -rf docker/
rm -rf k8s/
rm -rf validation-results/
rm -rf temp_studio/

# Remove most scripts (keep only build.js and test.js)
if [ -d "scripts" ]; then
    find scripts -type f ! -name 'build.js' ! -name 'test.js' -delete
    # Remove empty directories
    find scripts -type d -empty -delete
fi

# Remove development test configurations
rm -f cucumber.config.js
rm -f jest.schema-application.config.js

# Remove methodology files
find . -name '*methodology*.md' -delete
find . -name '*strategy*.md' -delete
find . -name '*analysis*.md' -delete
find . -name 'glfb-pseudocode-report.txt' -delete

# Remove internal documentation
rm -rf docs/L4-Intelligent-Agent-OPS-Refactor/
rm -f V1.1.0-beta-文档分类整合规划.md

# Remove development examples
rm -f examples/emergency-fix.js
rm -f examples/final-quality-fix.js
rm -f examples/fix-quality-issues.js
rm -f examples/quality-fix-phase2.js

echo -e "${GREEN}✓ 内容过滤完成${NC}"
echo ""

# =============================================================================
# RBCT: Security Review
# =============================================================================

echo -e "${BLUE}[RBCT] 安全审查...${NC}"
echo ""

# Check for sensitive patterns
echo "检查敏感信息..."

SENSITIVE_FOUND=0

# Check for API keys
if grep -r "api[_-]key" --include="*.ts" --include="*.js" --include="*.json" . 2>/dev/null; then
    echo -e "${RED}警告: 发现可能的API密钥${NC}"
    SENSITIVE_FOUND=1
fi

# Check for passwords
if grep -r "password.*=" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v "// "; then
    echo -e "${RED}警告: 发现可能的密码${NC}"
    SENSITIVE_FOUND=1
fi

# Check for internal URLs
if grep -r "internal\." --include="*.ts" --include="*.js" --include="*.md" . 2>/dev/null; then
    echo -e "${YELLOW}警告: 发现可能的内部URL${NC}"
fi

if [ $SENSITIVE_FOUND -eq 1 ]; then
    echo -e "${RED}发现敏感信息，请手动审查后再继续${NC}"
    read -p "是否继续? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}操作已取消${NC}"
        git checkout main
        git branch -D $TEMP_BRANCH
        mv .gitignore.backup .gitignore
        exit 1
    fi
fi

echo -e "${GREEN}✓ 安全审查完成${NC}"
echo ""

# =============================================================================
# Commit and Push
# =============================================================================

echo -e "${BLUE}提交和推送...${NC}"
echo ""

# Stage all changes
git add -A

# Commit
git commit -m "chore: prepare public open source release

- Apply public .gitignore to filter internal content
- Remove internal documentation and reports
- Remove development tools and configurations
- Remove methodology and strategy documents
- Keep core source code and public documentation
- Keep examples and SDK

This is a clean public release of MPLP v1.0 Alpha + v1.1.0-beta SDK
for the open source community.

Framework: SCTM+GLFB+ITCM+RBCT
Repository: https://github.com/Coregentis/MPLP-Protocol"

# Push to public repository
echo "推送到公开仓库..."
git push $PUBLIC_REPO $TEMP_BRANCH:main --force-with-lease

echo -e "${GREEN}✓ 推送完成${NC}"
echo ""

# =============================================================================
# Cleanup
# =============================================================================

echo -e "${BLUE}清理临时文件...${NC}"
echo ""

# Switch back to main branch
git checkout main

# Delete temporary branch
git branch -D $TEMP_BRANCH

# Restore original .gitignore
mv .gitignore.backup .gitignore

echo -e "${GREEN}✓ 清理完成${NC}"
echo ""

# =============================================================================
# Summary
# =============================================================================

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}发布成功！${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "公开仓库: $(git remote get-url $PUBLIC_REPO)"
echo "发布分支: main"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "1. 访问公开仓库验证内容"
echo "2. 检查是否有遗漏的敏感信息"
echo "3. 创建GitHub Release"
echo "4. 发布公告"
echo ""
echo -e "${GREEN}✓ 开源发布流程完成！${NC}"

