#!/bin/bash

###############################################################################
# 双版本切换工具
# Dual Version Switching Tool
#
# 功能：一键切换Dev和Public版本
# 自动处理.gitignore、package.json、文档链接等
#
# 使用方法：
# bash scripts/switch-version.sh dev
# bash scripts/switch-version.sh public
# 或
# npm run version:switch-to-dev
# npm run version:switch-to-public
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
VERSION=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 仓库URL
DEV_REPO="https://github.com/Coregentis/MPLP-Protocol-Dev"
PUBLIC_REPO="https://github.com/Coregentis/MPLP-Protocol"

###############################################################################
# 辅助函数
###############################################################################

# 打印信息
print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# 打印成功
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# 打印警告
print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# 打印错误
print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# 打印分隔线
print_separator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

###############################################################################
# 验证函数
###############################################################################

# 验证参数
validate_args() {
  if [ -z "$VERSION" ]; then
    print_error "缺少版本参数"
    echo ""
    echo "使用方法："
    echo "  bash scripts/switch-version.sh [dev|public]"
    echo ""
    echo "示例："
    echo "  bash scripts/switch-version.sh dev      # 切换到Dev版本"
    echo "  bash scripts/switch-version.sh public   # 切换到Public版本"
    exit 1
  fi

  if [ "$VERSION" != "dev" ] && [ "$VERSION" != "public" ]; then
    print_error "无效的版本参数: $VERSION"
    echo ""
    echo "有效的版本："
    echo "  dev     - 开发版本（MPLP-Protocol-Dev）"
    echo "  public  - 开源版本（MPLP-Protocol）"
    exit 1
  fi
}

# 检查必要的文件
check_required_files() {
  print_info "检查必要的文件..."

  local required_files=(
    ".gitignore"
    ".gitignore.public"
    "package.json"
  )

  for file in "${required_files[@]}"; do
    if [ ! -f "$PROJECT_ROOT/$file" ]; then
      print_error "缺少必要的文件: $file"
      exit 1
    fi
  done

  print_success "所有必要的文件都存在"
}

###############################################################################
# 切换函数
###############################################################################

# 切换到Dev版本
switch_to_dev() {
  print_separator
  print_info "切换到Dev版本..."
  print_separator
  echo ""

  # 1. 备份当前.gitignore
  print_info "步骤 1/5: 备份当前.gitignore..."
  if [ -f "$PROJECT_ROOT/.gitignore" ]; then
    cp "$PROJECT_ROOT/.gitignore" "$PROJECT_ROOT/.gitignore.backup"
    print_success "已备份到 .gitignore.backup"
  fi
  echo ""

  # 2. 恢复Dev版本的.gitignore（当前的.gitignore就是Dev版本）
  print_info "步骤 2/5: 确认使用Dev版本的.gitignore..."
  # Dev版本的.gitignore已经是当前的.gitignore，无需操作
  print_success "Dev版本的.gitignore已就位"
  echo ""

  # 3. 更新package.json的repository字段
  print_info "步骤 3/5: 更新package.json的repository字段..."
  if command -v node &> /dev/null; then
    node "$SCRIPT_DIR/update-package-repository.js" "$DEV_REPO"
    print_success "已更新repository为Dev仓库"
  else
    print_warning "未找到Node.js，请手动更新package.json的repository.url为："
    echo "  $DEV_REPO.git"
  fi
  echo ""

  # 4. 更新文档中的GitHub链接
  print_info "步骤 4/5: 更新文档中的GitHub链接..."
  if command -v node &> /dev/null; then
    node "$SCRIPT_DIR/switch-repository-links.js" "dev"
    print_success "已更新所有文档链接为Dev仓库"
  else
    print_warning "未找到Node.js，请手动更新文档中的GitHub链接"
  fi
  echo ""

  # 5. 清理dist/目录（Dev版本不需要）
  print_info "步骤 5/5: 清理dist/目录..."
  if [ -d "$PROJECT_ROOT/dist" ]; then
    rm -rf "$PROJECT_ROOT/dist"
    print_success "已删除dist/目录"
  else
    print_success "dist/目录不存在，无需清理"
  fi
  echo ""

  print_separator
  print_success "成功切换到Dev版本！"
  print_separator
  echo ""
  print_info "仓库信息："
  echo "  📦 仓库: $DEV_REPO"
  echo "  🔧 .gitignore: Dev版本（最小排除）"
  echo "  📝 文档链接: 已更新为Dev仓库"
  echo ""
  print_info "下一步操作："
  echo "  1. 查看变更: git status --ignored"
  echo "  2. 运行测试: npm test"
  echo "  3. 提交变更: git add . && git commit -m 'chore: switch to dev version'"
  echo ""
}

# 切换到Public版本
switch_to_public() {
  print_separator
  print_info "切换到Public版本..."
  print_separator
  echo ""

  # 1. 备份当前.gitignore
  print_info "步骤 1/6: 备份当前.gitignore..."
  cp "$PROJECT_ROOT/.gitignore" "$PROJECT_ROOT/.gitignore.dev.backup"
  print_success "已备份到 .gitignore.dev.backup"
  echo ""

  # 2. 切换到Public版本的.gitignore
  print_info "步骤 2/6: 切换到Public版本的.gitignore..."
  cp "$PROJECT_ROOT/.gitignore.public" "$PROJECT_ROOT/.gitignore"
  print_success "已切换到Public版本的.gitignore"
  echo ""

  # 3. 构建项目
  print_info "步骤 3/6: 构建项目..."
  if command -v npm &> /dev/null; then
    cd "$PROJECT_ROOT"
    npm run build
    print_success "项目构建完成"
  else
    print_error "未找到npm，无法构建项目"
    exit 1
  fi
  echo ""

  # 4. 验证dist/目录
  print_info "步骤 4/6: 验证dist/目录..."
  if [ ! -d "$PROJECT_ROOT/dist" ]; then
    print_error "dist/目录不存在，构建可能失败"
    exit 1
  fi
  if [ ! -f "$PROJECT_ROOT/dist/index.js" ]; then
    print_error "dist/index.js不存在，构建可能不完整"
    exit 1
  fi
  print_success "dist/目录验证通过"
  echo ""

  # 5. 更新package.json的repository字段
  print_info "步骤 5/6: 更新package.json的repository字段..."
  if command -v node &> /dev/null; then
    node "$SCRIPT_DIR/update-package-repository.js" "$PUBLIC_REPO"
    print_success "已更新repository为Public仓库"
  else
    print_warning "未找到Node.js，请手动更新package.json的repository.url为："
    echo "  $PUBLIC_REPO.git"
  fi
  echo ""

  # 6. 更新文档中的GitHub链接
  print_info "步骤 6/6: 更新文档中的GitHub链接..."
  if command -v node &> /dev/null; then
    node "$SCRIPT_DIR/switch-repository-links.js" "public"
    print_success "已更新所有文档链接为Public仓库"
  else
    print_warning "未找到Node.js，请手动更新文档中的GitHub链接"
  fi
  echo ""

  print_separator
  print_success "成功切换到Public版本！"
  print_separator
  echo ""
  print_info "仓库信息："
  echo "  📦 仓库: $PUBLIC_REPO"
  echo "  🔧 .gitignore: Public版本（最大排除）"
  echo "  📝 文档链接: 已更新为Public仓库"
  echo "  📦 dist/: 已构建"
  echo ""
  print_info "下一步操作："
  echo "  1. 查看变更: git status --ignored"
  echo "  2. 运行验证: npm run release:validate-public"
  echo "  3. 提交变更: git add . && git commit -m 'chore: switch to public version'"
  echo "  4. 发布到npm: npm publish --tag beta"
  echo ""
}

###############################################################################
# 主函数
###############################################################################

main() {
  # 验证参数
  validate_args

  # 检查必要的文件
  check_required_files

  # 切换版本
  if [ "$VERSION" = "dev" ]; then
    switch_to_dev
  else
    switch_to_public
  fi
}

# 执行主函数
main

