#!/bin/bash

###############################################################################
# Public版本发布准备脚本
# Public Release Preparation Script
#
# 功能：自动准备Public版本发布
# 包括切换.gitignore、构建项目、验证dist/目录等
#
# 使用方法：
# bash scripts/prepare-public-release.sh
# 或
# npm run release:prepare-public
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

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
}

print_separator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

###############################################################################
# 准备函数
###############################################################################

# 备份当前.gitignore
backup_gitignore() {
  print_info "步骤 1/6: 备份当前.gitignore..."
  
  if [ -f "$PROJECT_ROOT/.gitignore" ]; then
    cp "$PROJECT_ROOT/.gitignore" "$PROJECT_ROOT/.gitignore.dev.backup"
    print_success "已备份到 .gitignore.dev.backup"
  else
    print_warning ".gitignore不存在，跳过备份"
  fi
  
  echo ""
}

# 切换到Public版本的.gitignore
switch_gitignore() {
  print_info "步骤 2/6: 切换到Public版本的.gitignore..."
  
  if [ ! -f "$PROJECT_ROOT/.gitignore.public" ]; then
    print_error ".gitignore.public不存在"
    exit 1
  fi
  
  cp "$PROJECT_ROOT/.gitignore.public" "$PROJECT_ROOT/.gitignore"
  print_success "已切换到Public版本的.gitignore"
  
  echo ""
}

# 清理旧的构建输出
clean_build() {
  print_info "步骤 3/6: 清理旧的构建输出..."
  
  if [ -d "$PROJECT_ROOT/dist" ]; then
    rm -rf "$PROJECT_ROOT/dist"
    print_success "已删除旧的dist/目录"
  else
    print_success "dist/目录不存在，无需清理"
  fi
  
  echo ""
}

# 构建项目
build_project() {
  print_info "步骤 4/6: 构建项目..."
  
  if ! command -v npm &> /dev/null; then
    print_error "未找到npm，无法构建项目"
    exit 1
  fi
  
  cd "$PROJECT_ROOT"
  
  print_info "运行: npm run build"
  if npm run build; then
    print_success "项目构建完成"
  else
    print_error "项目构建失败"
    exit 1
  fi
  
  echo ""
}

# 验证dist/目录
verify_dist() {
  print_info "步骤 5/6: 验证dist/目录..."
  
  # 检查dist/目录是否存在
  if [ ! -d "$PROJECT_ROOT/dist" ]; then
    print_error "dist/目录不存在，构建可能失败"
    exit 1
  fi
  print_success "dist/目录存在"
  
  # 检查关键文件
  local critical_files=(
    "dist/index.js"
    "dist/index.d.ts"
  )
  
  for file in "${critical_files[@]}"; do
    if [ ! -f "$PROJECT_ROOT/$file" ]; then
      print_error "缺少关键文件: $file"
      exit 1
    fi
  done
  print_success "所有关键文件都存在"
  
  # 检查dist/目录大小
  local dist_size=$(du -sh "$PROJECT_ROOT/dist" | cut -f1)
  print_info "dist/目录大小: $dist_size"
  
  echo ""
}

# 验证package.json
verify_package_json() {
  print_info "步骤 6/6: 验证package.json..."
  
  if ! command -v node &> /dev/null; then
    print_warning "未找到Node.js，跳过package.json验证"
    return
  fi
  
  # 检查main字段
  local main_field=$(node -p "require('$PROJECT_ROOT/package.json').main" 2>/dev/null || echo "")
  if [ -z "$main_field" ]; then
    print_error "package.json中缺少main字段"
    exit 1
  fi
  print_success "main字段: $main_field"
  
  # 检查types字段
  local types_field=$(node -p "require('$PROJECT_ROOT/package.json').types" 2>/dev/null || echo "")
  if [ -z "$types_field" ]; then
    print_warning "package.json中缺少types字段"
  else
    print_success "types字段: $types_field"
  fi
  
  # 检查files字段
  local files_field=$(node -p "JSON.stringify(require('$PROJECT_ROOT/package.json').files)" 2>/dev/null || echo "")
  if [ "$files_field" = "undefined" ] || [ -z "$files_field" ]; then
    print_warning "package.json中缺少files字段，将发布所有文件"
  else
    print_success "files字段已配置"
  fi
  
  echo ""
}

###############################################################################
# 主函数
###############################################################################

main() {
  print_separator
  print_info "开始准备Public版本发布"
  print_separator
  echo ""
  
  # 执行准备步骤
  backup_gitignore
  switch_gitignore
  clean_build
  build_project
  verify_dist
  verify_package_json
  
  # 打印最终结果
  print_separator
  print_success "Public版本发布准备完成！"
  print_separator
  echo ""
  
  print_info "下一步操作："
  echo "  1. 验证发布: npm run release:validate-public"
  echo "  2. 查看变更: git status --ignored"
  echo "  3. 提交变更: git add . && git commit -m 'chore: prepare public release'"
  echo "  4. 发布到npm: npm publish --tag beta"
  echo ""
}

# 执行主函数
main

