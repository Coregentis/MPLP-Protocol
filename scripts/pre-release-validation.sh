#!/bin/bash

###############################################################################
# 发布前验证脚本
# Pre-Release Validation Script
#
# 功能：在发布前自动运行所有验证检查
# 确保版本配置正确，避免发布错误
#
# 使用方法：
# bash scripts/pre-release-validation.sh dev
# bash scripts/pre-release-validation.sh public
# 或
# npm run release:validate-dev
# npm run release:validate-public
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

# 验证结果
VALIDATION_PASSED=true

###############################################################################
# 辅助函数
###############################################################################

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
  VALIDATION_PASSED=false
}

print_separator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_section() {
  echo ""
  echo -e "${BLUE}▶ $1${NC}"
  echo ""
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
    echo "  bash scripts/pre-release-validation.sh [dev|public]"
    exit 1
  fi

  if [ "$VERSION" != "dev" ] && [ "$VERSION" != "public" ]; then
    print_error "无效的版本参数: $VERSION"
    exit 1
  fi
}

# 验证.gitignore配置
validate_gitignore() {
  print_section "1. 验证.gitignore配置"

  if [ "$VERSION" = "public" ]; then
    # Public版本应该使用.gitignore.public
    if ! diff -q "$PROJECT_ROOT/.gitignore" "$PROJECT_ROOT/.gitignore.public" > /dev/null 2>&1; then
      print_error ".gitignore与.gitignore.public不一致"
      print_info "请运行: cp .gitignore.public .gitignore"
    else
      print_success ".gitignore配置正确（Public版本）"
    fi
  else
    # Dev版本应该使用原始的.gitignore
    if diff -q "$PROJECT_ROOT/.gitignore" "$PROJECT_ROOT/.gitignore.public" > /dev/null 2>&1; then
      print_warning ".gitignore与.gitignore.public相同，可能不是Dev版本"
    else
      print_success ".gitignore配置正确（Dev版本）"
    fi
  fi
}

# 验证package.json
validate_package_json() {
  print_section "2. 验证package.json"

  if ! command -v node &> /dev/null; then
    print_warning "未找到Node.js，跳过package.json验证"
    return
  fi

  # 检查repository字段
  REPO_URL=$(node -p "require('$PROJECT_ROOT/package.json').repository.url" 2>/dev/null || echo "")

  if [ -z "$REPO_URL" ]; then
    print_error "package.json中缺少repository.url字段"
    return
  fi

  if [ "$VERSION" = "dev" ]; then
    if [[ ! "$REPO_URL" =~ "MPLP-Protocol-Dev" ]]; then
      print_error "repository.url应该指向Dev仓库"
      print_info "当前: $REPO_URL"
      print_info "应该: https://github.com/Coregentis/MPLP-Protocol-Dev.git"
    else
      print_success "repository.url正确（Dev仓库）"
    fi
  else
    if [[ "$REPO_URL" =~ "Dev" ]]; then
      print_error "repository.url不应该指向Dev仓库"
      print_info "当前: $REPO_URL"
      print_info "应该: https://github.com/Coregentis/MPLP-Protocol.git"
    else
      print_success "repository.url正确（Public仓库）"
    fi
  fi
}

# 验证文档链接
validate_documentation_links() {
  print_section "3. 验证文档链接"

  if ! command -v node &> /dev/null; then
    print_warning "未找到Node.js，跳过文档链接验证"
    return
  fi

  if [ -f "$SCRIPT_DIR/verify-repository-links.js" ]; then
    if node "$SCRIPT_DIR/verify-repository-links.js"; then
      print_success "文档链接验证通过"
    else
      print_error "文档链接验证失败"
    fi
  else
    print_warning "未找到verify-repository-links.js，跳过文档链接验证"
  fi
}

# 验证构建
validate_build() {
  print_section "4. 验证构建"

  if ! command -v npm &> /dev/null; then
    print_warning "未找到npm，跳过构建验证"
    return
  fi

  print_info "运行构建..."
  cd "$PROJECT_ROOT"
  
  if npm run build > /dev/null 2>&1; then
    print_success "构建成功"
  else
    print_error "构建失败"
    return
  fi

  # 验证dist/目录（仅Public版本）
  if [ "$VERSION" = "public" ]; then
    if [ ! -d "$PROJECT_ROOT/dist" ]; then
      print_error "dist/目录不存在"
      return
    fi

    if [ ! -f "$PROJECT_ROOT/dist/index.js" ]; then
      print_error "dist/index.js不存在"
      return
    fi

    if [ ! -f "$PROJECT_ROOT/dist/index.d.ts" ]; then
      print_error "dist/index.d.ts不存在"
      return
    fi

    print_success "dist/目录验证通过"
  fi
}

# 运行测试（仅Dev版本）
validate_tests() {
  if [ "$VERSION" != "dev" ]; then
    return
  fi

  print_section "5. 运行测试（Dev版本）"

  if ! command -v npm &> /dev/null; then
    print_warning "未找到npm，跳过测试"
    return
  fi

  print_info "运行测试..."
  cd "$PROJECT_ROOT"
  
  if npm test > /dev/null 2>&1; then
    print_success "所有测试通过"
  else
    print_error "测试失败"
  fi
}

# 验证文档对等性
validate_docs_parity() {
  print_section "6. 验证文档对等性"

  if ! command -v node &> /dev/null; then
    print_warning "未找到Node.js，跳过文档对等性验证"
    return
  fi

  if [ -f "$SCRIPT_DIR/check-docs-parity.js" ]; then
    if node "$SCRIPT_DIR/check-docs-parity.js"; then
      print_success "文档对等性验证通过"
    else
      print_warning "文档对等性验证失败（非致命错误）"
    fi
  else
    print_warning "未找到check-docs-parity.js，跳过文档对等性验证"
  fi
}

###############################################################################
# 主函数
###############################################################################

main() {
  # 验证参数
  validate_args

  # 打印标题
  print_separator
  print_info "开始发布前验证（$VERSION 版本）"
  print_separator

  # 执行验证
  validate_gitignore
  validate_package_json
  validate_documentation_links
  validate_build
  validate_tests
  validate_docs_parity

  # 打印最终结果
  echo ""
  print_separator
  if [ "$VALIDATION_PASSED" = true ]; then
    print_success "所有验证通过！可以发布 $VERSION 版本"
  else
    print_error "验证失败！请修复上述问题后再发布"
  fi
  print_separator
  echo ""

  # 退出
  if [ "$VALIDATION_PASSED" = true ]; then
    exit 0
  else
    exit 1
  fi
}

# 执行主函数
main

