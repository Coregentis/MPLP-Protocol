#!/bin/bash

# MPLP npm发布脚本
# 基于SCTM+GLFB+ITCM+RBCT方法论
# 版本: 1.0.0
# 日期: 2025-10-17

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    print_error "错误：未找到package.json文件"
    print_info "请在项目根目录运行此脚本"
    exit 1
fi

# 获取包信息
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")

print_header "MPLP npm发布脚本"
echo ""
print_info "包名: $PACKAGE_NAME"
print_info "版本: $PACKAGE_VERSION"
echo ""

# ============================================
# Phase 1: 发布前检查
# ============================================
print_header "Phase 1: 发布前检查"

# 1.1 检查Git状态
print_info "检查Git状态..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "工作目录有未提交的更改"
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "发布已取消"
        exit 1
    fi
else
    print_success "工作目录干净"
fi

# 1.2 检查必要文件
print_info "检查必要文件..."
REQUIRED_FILES=("README.md" "LICENSE" "CHANGELOG.md" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "缺少必要文件: $file"
        exit 1
    fi
done
print_success "所有必要文件都存在"

# 1.3 检查dist目录
print_info "检查dist目录..."
if [ ! -d "dist" ]; then
    print_error "dist目录不存在"
    print_info "请先运行: npm run build"
    exit 1
fi

if [ ! -f "dist/index.js" ] || [ ! -f "dist/index.d.ts" ]; then
    print_error "dist目录不完整"
    print_info "请先运行: npm run build"
    exit 1
fi
print_success "dist目录完整"

# 1.4 检查npm登录状态
print_info "检查npm登录状态..."
if ! npm whoami &> /dev/null; then
    print_error "未登录npm"
    print_info "请先运行: npm login"
    exit 1
fi
NPM_USER=$(npm whoami)
print_success "已登录npm (用户: $NPM_USER)"

# 1.5 检查版本是否已存在
print_info "检查版本是否已存在..."
if npm view "$PACKAGE_NAME@$PACKAGE_VERSION" version &> /dev/null; then
    print_error "版本 $PACKAGE_VERSION 已存在于npm registry"
    print_info "请更新package.json中的版本号"
    exit 1
fi
print_success "版本号可用"

echo ""

# ============================================
# Phase 2: 构建和测试
# ============================================
print_header "Phase 2: 构建和测试"

# 2.1 清理旧的构建
print_info "清理旧的构建..."
npm run clean
print_success "清理完成"

# 2.2 安装依赖
print_info "安装依赖..."
npm install
print_success "依赖安装完成"

# 2.3 TypeScript类型检查
print_info "TypeScript类型检查..."
npm run typecheck
print_success "类型检查通过"

# 2.4 运行测试
print_info "运行测试..."
npm test
print_success "所有测试通过"

# 2.5 构建项目
print_info "构建项目..."
npm run build
print_success "构建完成"

# 2.6 安全审计
print_info "安全审计..."
npm audit --audit-level=moderate || print_warning "发现安全漏洞，请检查"

echo ""

# ============================================
# Phase 3: 打包测试
# ============================================
print_header "Phase 3: 打包测试"

# 3.1 npm pack测试
print_info "执行npm pack..."
PACK_FILE=$(npm pack)
print_success "打包成功: $PACK_FILE"

# 3.2 检查包大小
PACK_SIZE=$(du -h "$PACK_FILE" | cut -f1)
print_info "包大小: $PACK_SIZE"

# 3.3 列出包内容
print_info "包内容预览:"
tar -tzf "$PACK_FILE" | head -20
echo "..."
print_info "总文件数: $(tar -tzf "$PACK_FILE" | wc -l)"

# 3.4 询问是否查看完整内容
read -p "是否查看完整包内容？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    tar -tzf "$PACK_FILE" | less
fi

echo ""

# ============================================
# Phase 4: 本地安装测试
# ============================================
print_header "Phase 4: 本地安装测试"

# 4.1 创建测试目录
TEST_DIR="test-npm-install-$$"
print_info "创建测试目录: $TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# 4.2 初始化测试项目
print_info "初始化测试项目..."
npm init -y > /dev/null

# 4.3 安装本地包
print_info "安装本地包..."
npm install "../$PACK_FILE"
print_success "本地安装成功"

# 4.4 测试导入
print_info "测试导入..."
cat > test.js << 'EOF'
const mplp = require('mplp');
console.log('MPLP Version:', mplp.MPLP_VERSION);
console.log('MPLP Info:', mplp.MPLP_INFO);
console.log('✅ 导入测试成功');
EOF

node test.js
print_success "导入测试通过"

# 4.5 测试TypeScript类型
print_info "测试TypeScript类型..."
cat > test.ts << 'EOF'
import { MPLP_VERSION, MPLP_INFO } from 'mplp';
console.log('MPLP Version:', MPLP_VERSION);
console.log('MPLP Info:', MPLP_INFO);
EOF

if command -v tsc &> /dev/null; then
    tsc --noEmit test.ts && print_success "TypeScript类型测试通过"
else
    print_warning "未安装TypeScript，跳过类型测试"
fi

# 4.6 清理测试目录
cd ..
rm -rf "$TEST_DIR"
print_success "测试目录已清理"

echo ""

# ============================================
# Phase 5: 发布确认
# ============================================
print_header "Phase 5: 发布确认"

print_info "即将发布到npm registry:"
echo ""
echo "  包名: $PACKAGE_NAME"
echo "  版本: $PACKAGE_VERSION"
echo "  用户: $NPM_USER"
echo "  标签: beta"
echo ""

read -p "确认发布？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "发布已取消"
    rm -f "$PACK_FILE"
    exit 1
fi

echo ""

# ============================================
# Phase 6: 发布到npm
# ============================================
print_header "Phase 6: 发布到npm"

# 6.1 发布（beta标签）
print_info "发布到npm (beta标签)..."
npm publish --tag beta

print_success "发布成功！"

# 6.2 清理打包文件
rm -f "$PACK_FILE"

echo ""

# ============================================
# Phase 7: 发布后验证
# ============================================
print_header "Phase 7: 发布后验证"

# 7.1 等待npm registry更新
print_info "等待npm registry更新..."
sleep 5

# 7.2 检查npm registry
print_info "检查npm registry..."
npm view "$PACKAGE_NAME@$PACKAGE_VERSION" version
print_success "版本已在npm registry上"

# 7.3 检查包页面
print_info "npm包页面: https://www.npmjs.com/package/$PACKAGE_NAME"

echo ""

# ============================================
# 完成
# ============================================
print_header "发布完成！"

echo ""
print_success "MPLP $PACKAGE_VERSION 已成功发布到npm！"
echo ""
print_info "用户现在可以通过以下命令安装:"
echo ""
echo "  npm install $PACKAGE_NAME@beta"
echo ""
print_info "或者安装最新版本:"
echo ""
echo "  npm install $PACKAGE_NAME"
echo ""
print_info "下一步:"
echo "  1. 在新目录测试远程安装"
echo "  2. 更新GitHub Release"
echo "  3. 更新文档"
echo "  4. 通知社区"
echo ""

print_success "🎉 恭喜！npm发布流程圆满完成！"

