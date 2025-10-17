#!/bin/bash

# =============================================================================
# MPLP纯净开源版本推送脚本 v2.0
# =============================================================================
# 目的: 推送纯净的开源版本到公开仓库
# 原则: 开源仓库是用户使用MPLP构建项目的库，不是内部开发仓库
# 方法论: SCTM+GLFB+ITCM+RBCT
# =============================================================================

set -e  # 遇到错误立即退出

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  MPLP纯净开源版本推送 v2.0                                ║"
echo "║  原则: 仅包含用户使用MPLP所需的内容                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 保存当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"

# 创建临时分支
TEMP_BRANCH="temp-clean-public-$(date +%s)"
echo "🔧 创建临时分支: $TEMP_BRANCH"
git checkout -b "$TEMP_BRANCH"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Phase 1: 清空索引                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# 从索引中移除所有文件
git rm -r --cached . > /dev/null 2>&1
echo "✅ 索引已清空"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Phase 2: 添加公开文件                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# =============================================================================
# 核心功能代码
# =============================================================================
echo "📦 添加核心代码..."
git add -f src/ 2>/dev/null || echo "  ⚠️  src/ 不存在"
git add -f dist/ 2>/dev/null || echo "  ⚠️  dist/ 不存在"
echo "✅ 核心代码已添加"

# =============================================================================
# 用户文档
# =============================================================================
echo ""
echo "📚 添加用户文档..."
git add -f README.md 2>/dev/null || echo "  ⚠️  README.md 不存在"
git add -f QUICK_START.md 2>/dev/null || echo "  ⚠️  QUICK_START.md 不存在"
git add -f CHANGELOG.md 2>/dev/null || echo "  ⚠️  CHANGELOG.md 不存在"
git add -f LICENSE 2>/dev/null || echo "  ⚠️  LICENSE 不存在"
git add -f CONTRIBUTING.md 2>/dev/null || echo "  ⚠️  CONTRIBUTING.md 不存在"
git add -f CODE_OF_CONDUCT.md 2>/dev/null || echo "  ⚠️  CODE_OF_CONDUCT.md 不存在"
git add -f ROADMAP.md 2>/dev/null || echo "  ⚠️  ROADMAP.md 不存在"
git add -f TROUBLESHOOTING.md 2>/dev/null || echo "  ⚠️  TROUBLESHOOTING.md 不存在"
echo "✅ 用户文档已添加"

# =============================================================================
# 文档目录（排除内部文档）
# =============================================================================
echo ""
echo "📖 添加文档目录..."
git add -f docs/en/ 2>/dev/null || echo "  ⚠️  docs/en/ 不存在"
git add -f docs/zh/ 2>/dev/null || echo "  ⚠️  docs/zh/ 不存在"
git add -f docs/README.md 2>/dev/null || echo "  ⚠️  docs/README.md 不存在"
echo "✅ 文档目录已添加"

# =============================================================================
# 示例应用（排除开发文件）
# =============================================================================
echo ""
echo "🎯 添加示例应用..."

# 添加示例目录，但排除node_modules和dist
if [ -d "examples" ]; then
    # 先添加整个examples目录
    git add -f examples/ 2>/dev/null
    
    # 然后移除不需要的文件
    git reset HEAD examples/*/node_modules/ 2>/dev/null || true
    git reset HEAD examples/*/dist/ 2>/dev/null || true
    git reset HEAD examples/emergency-fix.js 2>/dev/null || true
    git reset HEAD examples/final-quality-fix.js 2>/dev/null || true
    git reset HEAD examples/fix-quality-issues.js 2>/dev/null || true
    git reset HEAD examples/quality-fix-phase2.js 2>/dev/null || true
    
    echo "✅ 示例应用已添加（已排除开发文件）"
else
    echo "  ⚠️  examples/ 不存在"
fi

# =============================================================================
# SDK（排除开发文件）
# =============================================================================
echo ""
echo "🔧 添加SDK..."

if [ -d "sdk" ]; then
    # 添加SDK源代码和文档
    git add -f sdk/packages/*/src/ 2>/dev/null || true
    git add -f sdk/packages/*/README.md 2>/dev/null || true
    git add -f sdk/packages/*/package.json 2>/dev/null || true
    git add -f sdk/packages/*/docs/ 2>/dev/null || true
    
    # 添加SDK示例
    git add -f sdk/examples/ 2>/dev/null || true
    git reset HEAD sdk/examples/*/node_modules/ 2>/dev/null || true
    git reset HEAD sdk/examples/*/dist/ 2>/dev/null || true
    git reset HEAD sdk/examples/*/coverage/ 2>/dev/null || true
    
    # 添加SDK文档
    git add -f sdk/README.md 2>/dev/null || true
    git add -f sdk/DEVELOPMENT.md 2>/dev/null || true
    
    echo "✅ SDK已添加（已排除开发文件）"
else
    echo "  ⚠️  sdk/ 不存在"
fi

# =============================================================================
# 配置文件
# =============================================================================
echo ""
echo "⚙️  添加配置文件..."
git add -f package.json 2>/dev/null || echo "  ⚠️  package.json 不存在"
git add -f package-lock.json 2>/dev/null || echo "  ⚠️  package-lock.json 不存在"
echo "✅ 配置文件已添加"

# =============================================================================
# GitHub Actions工作流
# =============================================================================
echo ""
echo "🔄 添加GitHub Actions..."
git add -f .github/workflows/ 2>/dev/null || echo "  ⚠️  .github/workflows/ 不存在"
echo "✅ GitHub Actions已添加"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Phase 3: 提交更改                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# 检查是否有文件被添加
if git diff --cached --quiet; then
    echo "❌ 错误: 没有文件被添加到索引"
    echo "请检查文件路径是否正确"
    git checkout "$CURRENT_BRANCH"
    git branch -D "$TEMP_BRANCH"
    exit 1
fi

# 显示将要提交的文件统计
echo ""
echo "📊 将要提交的文件统计:"
git diff --cached --stat | head -20
echo ""

# 提交
git commit -m "chore: clean public release - user-facing content only

This is a clean public release containing only user-facing content:

Included:
- ✅ src/ - Source code
- ✅ dist/ - Build artifacts
- ✅ docs/ - User documentation (en + zh)
- ✅ examples/ - Example applications (without dev files)
- ✅ sdk/ - SDK packages (without dev files)
- ✅ README.md, LICENSE, CHANGELOG.md, etc.
- ✅ .github/workflows/ - Public CI/CD workflows

Excluded:
- ❌ tests/ - Test suites
- ❌ config/ - Internal configuration
- ❌ Archived/ - Internal archives
- ❌ .augment/ - AI assistant rules
- ❌ scripts/ - Development scripts
- ❌ *.test.ts, *.spec.ts - Test files
- ❌ jest.config.js, tsconfig.json - Dev configs
- ❌ node_modules/, coverage/ - Dev artifacts

Purpose: User-facing library for building applications with MPLP
Repository: https://github.com/Coregentis/MPLP-Protocol
Version: v1.1.0-beta
Date: $(date +%Y-%m-%d)"

echo "✅ 更改已提交"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Phase 4: 推送到公开仓库                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# 推送到公开仓库
echo "🚀 推送到release/main..."
git push release "$TEMP_BRANCH":main --force

echo "✅ 推送成功"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Phase 5: 清理                                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# 返回原分支
git checkout "$CURRENT_BRANCH"
echo "✅ 已返回 $CURRENT_BRANCH 分支"

# 删除临时分支
git branch -D "$TEMP_BRANCH"
echo "✅ 临时分支已删除"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ 纯净开源版本推送完成！                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 公开仓库: https://github.com/Coregentis/MPLP-Protocol"
echo "🔍 请访问上述链接验证推送结果"
echo ""

