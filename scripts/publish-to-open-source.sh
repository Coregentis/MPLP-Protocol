#!/bin/bash

# =============================================================================
# MPLP Open Source Publishing Script (Non-Destructive Version)
# =============================================================================
# This script publishes the MPLP project to the public open source repository
# while filtering out internal development content using .gitignore.public
#
# IMPORTANT: This script does NOT delete files from the internal repository!
# It only filters what gets pushed to the public repository.
#
# Framework: SCTM+GLFB+ITCM+RBCT
# Repository: https://github.com/Coregentis/MPLP-Protocol
# Version: 2.0.0 (Non-Destructive)
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
echo -e "${BLUE}(Non-Destructive Version)${NC}"
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
echo "内部库总文件数: $TOTAL_FILES"

# Show what will be filtered
echo ""
echo -e "${YELLOW}将被过滤的内容（不会从内部库删除）:${NC}"
echo "  - .augment/ (AI助手规则)"
echo "  - .backup-configs/ (备份配置)"
echo "  - Archived/ (历史归档)"
echo "  - config/ (内部配置)"
echo "  - docker/ (Docker配置)"
echo "  - k8s/ (Kubernetes配置)"
echo "  - 内部文档 (14个文件)"
echo "  - 方法论文档 (*methodology*.md, *strategy*.md等)"
echo "  - 开发脚本 (大部分)"
echo ""

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
echo -e "${GREEN}✓ 内部库文件不会被删除，只是不推送到公开库${NC}"
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
# GLFB: Local Execution - Content Filtering (Non-Destructive)
# =============================================================================

echo -e "${BLUE}[GLFB] 局部执行 - 内容过滤（非破坏性）...${NC}"
echo ""

# Backup current .gitignore
echo "备份当前.gitignore..."
cp .gitignore .gitignore.internal.backup

# Replace with public .gitignore
echo "应用公开专用.gitignore..."
cp $PUBLIC_GITIGNORE .gitignore

# Re-index files with new .gitignore
echo "重新索引文件（应用过滤规则）..."
git rm -r --cached . > /dev/null 2>&1
git add .

echo -e "${GREEN}✓ 内容过滤完成（内部文件未被删除）${NC}"
echo ""

# =============================================================================
# RBCT: Security Review
# =============================================================================

echo -e "${BLUE}[RBCT] 安全审查...${NC}"
echo ""

# Show what will be published
echo "检查将要发布的文件..."
echo ""
echo -e "${YELLOW}将要发布的主要内容:${NC}"
git ls-files | head -20
echo "  ... (共 $(git ls-files | wc -l) 个文件)"
echo ""

# Check for sensitive patterns in files that will be published
echo "检查敏感信息..."

SENSITIVE_FOUND=0

# Check for API keys
if git ls-files | xargs grep -l "api[_-]key" 2>/dev/null | grep -v node_modules; then
    echo -e "${RED}警告: 发现可能的API密钥${NC}"
    SENSITIVE_FOUND=1
fi

# Check for passwords
if git ls-files | xargs grep -l "password.*=" 2>/dev/null | grep -v node_modules | grep -v "// "; then
    echo -e "${RED}警告: 发现可能的密码${NC}"
    SENSITIVE_FOUND=1
fi

# Check for internal URLs
if git ls-files | xargs grep -l "internal\." 2>/dev/null | grep -v node_modules; then
    echo -e "${YELLOW}警告: 发现可能的内部URL${NC}"
fi

# Verify internal files are NOT in the index
echo ""
echo "验证内部文件已被过滤..."
INTERNAL_FILES_FOUND=0

if git ls-files | grep -q "\.augment/"; then
    echo -e "${RED}错误: .augment/ 未被过滤${NC}"
    INTERNAL_FILES_FOUND=1
fi

if git ls-files | grep -q "Archived/"; then
    echo -e "${RED}错误: Archived/ 未被过滤${NC}"
    INTERNAL_FILES_FOUND=1
fi

if git ls-files | grep -q "^config/"; then
    echo -e "${RED}错误: config/ 未被过滤${NC}"
    INTERNAL_FILES_FOUND=1
fi

if git ls-files | grep -q "BRANCH-MANAGEMENT"; then
    echo -e "${RED}错误: 分支管理文档未被过滤${NC}"
    INTERNAL_FILES_FOUND=1
fi

if [ $INTERNAL_FILES_FOUND -eq 1 ]; then
    echo -e "${RED}发现内部文件未被过滤，请检查.gitignore.public${NC}"
    git checkout main
    git branch -D $TEMP_BRANCH
    mv .gitignore.internal.backup .gitignore
    exit 1
fi

if [ $SENSITIVE_FOUND -eq 1 ]; then
    echo -e "${RED}发现敏感信息，请手动审查后再继续${NC}"
    read -p "是否继续? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}操作已取消${NC}"
        git checkout main
        git branch -D $TEMP_BRANCH
        mv .gitignore.internal.backup .gitignore
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

# Commit the .gitignore change
git add .gitignore
git commit -m "chore: apply public .gitignore for open source release

- Use .gitignore.public to filter internal content
- Keep internal files in development repository
- Only publish clean public version to open source repository

Filtered content (NOT published):
- .augment/ (AI assistant rules)
- .backup-configs/ (backup configurations)
- Archived/ (historical archives)
- config/ (internal configurations)
- docker/, k8s/ (infrastructure)
- Internal documentation (14 files)
- Methodology documents
- Development scripts (most)

Published content:
- Core source code (src/, sdk/)
- Public documentation (docs/, docs-sdk/)
- Examples and tutorials
- Basic configurations
- Open source license

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
mv .gitignore.internal.backup .gitignore

echo -e "${GREEN}✓ 清理完成${NC}"
echo -e "${GREEN}✓ 内部库保持完整，所有文件都在${NC}"
echo ""

# =============================================================================
# Summary
# =============================================================================

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}发布成功！${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "内部仓库: $(git remote get-url $INTERNAL_REPO) (完整保留)"
echo "公开仓库: $(git remote get-url $PUBLIC_REPO) (纯净版)"
echo "发布分支: main"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "1. 访问公开仓库验证内容"
echo "2. 检查是否有遗漏的敏感信息"
echo "3. 验证内部库文件完整性"
echo "4. 创建GitHub Release (v1.0.0-alpha)"
echo "5. 发布公告"
echo ""
echo -e "${GREEN}✓ 开源发布流程完成！${NC}"
echo -e "${GREEN}✓ 内部开发库未受影响！${NC}"

