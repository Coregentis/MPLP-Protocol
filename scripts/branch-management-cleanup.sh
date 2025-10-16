#!/bin/bash

# MPLP分支管理清理脚本
# 基于SCTM+GLFB+ITCM+RBCT增强框架分析结果

set -e

echo "🔧 MPLP分支管理清理脚本"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 确认函数
confirm() {
    read -p "$1 (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        echo -e "${YELLOW}操作已取消${NC}"
        return 1
    fi
    return 0
}

# ============================================
# 阶段1: 清理备份分支
# ============================================
echo -e "${BLUE}阶段1: 清理备份分支${NC}"
echo "================================"
echo ""

echo "当前备份分支:"
git branch | grep backup || echo "  (无)"
echo ""

if confirm "是否将备份分支转换为标签？"; then
    echo -e "${GREEN}创建标签...${NC}"
    
    # 为备份点创建标签
    if git rev-parse --verify backup-before-organization-20251016-221528 >/dev/null 2>&1; then
        git tag backup-before-organization-20251016 backup-before-organization-20251016-221528
        echo "  ✅ 创建标签: backup-before-organization-20251016"
    fi
    
    if git rev-parse --verify backup-before-reorganization-20250806-001253 >/dev/null 2>&1; then
        git tag backup-before-reorganization-20250806 backup-before-reorganization-20250806-001253
        echo "  ✅ 创建标签: backup-before-reorganization-20250806"
    fi
    
    if git rev-parse --verify backup-confirm-module-completion-20250809-111939 >/dev/null 2>&1; then
        git tag backup-confirm-module-20250809 backup-confirm-module-completion-20250809-111939
        echo "  ✅ 创建标签: backup-confirm-module-20250809"
    fi
    
    echo ""
    echo -e "${GREEN}删除本地备份分支...${NC}"
    
    # 删除本地备份分支
    git branch -D backup-before-organization-20251016-221528 2>/dev/null && echo "  ✅ 删除: backup-before-organization-20251016-221528" || true
    git branch -D backup-before-reorganization-20250806-001253 2>/dev/null && echo "  ✅ 删除: backup-before-reorganization-20250806-001253" || true
    git branch -D backup-confirm-module-completion-20250809-111939 2>/dev/null && echo "  ✅ 删除: backup-confirm-module-completion-20250809-111939" || true
    
    echo ""
    if confirm "是否推送标签到远程并删除远程备份分支？"; then
        echo -e "${GREEN}推送标签到远程...${NC}"
        git push origin backup-before-organization-20251016 2>/dev/null && echo "  ✅ 推送: backup-before-organization-20251016" || true
        git push origin backup-before-reorganization-20250806 2>/dev/null && echo "  ✅ 推送: backup-before-reorganization-20250806" || true
        git push origin backup-confirm-module-20250809 2>/dev/null && echo "  ✅ 推送: backup-confirm-module-20250809" || true
        
        echo ""
        echo -e "${GREEN}删除远程备份分支...${NC}"
        git push origin --delete backup-before-organization-20251016-221528 2>/dev/null && echo "  ✅ 删除: origin/backup-before-organization-20251016-221528" || true
        git push origin --delete backup-before-reorganization-20250806-001253 2>/dev/null && echo "  ✅ 删除: origin/backup-before-reorganization-20250806-001253" || true
    fi
fi

echo ""

# ============================================
# 阶段2: 整合公开发布分支
# ============================================
echo -e "${BLUE}阶段2: 整合公开发布分支${NC}"
echo "================================"
echo ""

echo "当前公开发布分支:"
git branch | grep public-release || echo "  (无)"
echo ""

if confirm "是否删除本地公开发布分支？"; then
    echo -e "${GREEN}删除本地公开发布分支...${NC}"
    git branch -D public-release 2>/dev/null && echo "  ✅ 删除: public-release" || true
    git branch -D public-release-correct 2>/dev/null && echo "  ✅ 删除: public-release-correct" || true
fi

echo ""

# ============================================
# 阶段3: 同步公开库
# ============================================
echo -e "${BLUE}阶段3: 同步公开库${NC}"
echo "================================"
echo ""

echo "检查main分支与release/main的差异..."
git fetch release
AHEAD=$(git rev-list --count release/main..main 2>/dev/null || echo "0")
BEHIND=$(git rev-list --count main..release/main 2>/dev/null || echo "0")

echo "  main分支领先release/main: $AHEAD 个提交"
echo "  main分支落后release/main: $BEHIND 个提交"
echo ""

if [ "$AHEAD" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  公开库需要更新${NC}"
    if confirm "是否推送最新更新到公开库 (release/main)？"; then
        echo -e "${GREEN}推送到公开库...${NC}"
        git push release main:main --force-with-lease
        echo "  ✅ 公开库已更新"
    fi
else
    echo -e "${GREEN}✅ 公开库已是最新${NC}"
fi

echo ""

# ============================================
# 阶段4: 清理CircleCI分支
# ============================================
echo -e "${BLUE}阶段4: 清理CircleCI分支${NC}"
echo "================================"
echo ""

if git ls-remote --heads origin circleci-project-setup | grep -q circleci-project-setup; then
    echo "发现远程CircleCI配置分支"
    if confirm "CircleCI配置已合并到main，是否删除此分支？"; then
        echo -e "${GREEN}删除远程CircleCI分支...${NC}"
        git push origin --delete circleci-project-setup 2>/dev/null && echo "  ✅ 删除: origin/circleci-project-setup" || true
    fi
else
    echo -e "${GREEN}✅ 无需清理CircleCI分支${NC}"
fi

echo ""

# ============================================
# 总结
# ============================================
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}分支清理完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

echo "当前分支状态:"
git branch -a | head -20
echo ""

echo "当前标签:"
git tag | grep backup || echo "  (无备份标签)"
echo ""

echo -e "${BLUE}建议的后续步骤:${NC}"
echo "  1. 查看分支管理分析报告: BRANCH-MANAGEMENT-ANALYSIS-REPORT.md"
echo "  2. 创建分支管理策略文档: BRANCH-STRATEGY.md"
echo "  3. 在GitHub设置中将默认分支改为main"
echo "  4. 配置GitHub Actions自动清理已合并分支"
echo ""

echo -e "${GREEN}✅ 分支管理清理脚本执行完成！${NC}"

