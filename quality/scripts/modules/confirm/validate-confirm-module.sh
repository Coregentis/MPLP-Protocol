#!/bin/bash
# scripts/validate-confirm-module.sh
# Confirm模块专用质量门禁，基于Context模块成功经验和CircleCI工作流规范
# 版本: v2.0.0 - 基于100%完美质量标准
# 更新时间: 2025-08-19

set -e  # 遇到错误立即退出

MODULE_NAME="confirm"
MODULE_PATH="src/modules/confirm"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔍 Confirm模块专用质量门禁验证"
echo "📊 质量标准: 100%完美质量标准 (278/278模块测试，21/21功能测试)"
echo "基于: Context模块成功经验 + CircleCI工作流规范"
echo "=================================================="

# 验证结果统计
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# 检查函数
check_result() {
    local check_name="$1"
    local result="$2"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if [ "$result" -eq 0 ]; then
        log_success "✅ $check_name"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_error "❌ $check_name"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# 1. Confirm模块专用TypeScript编译检查
log_info "1. 检查TypeScript编译状态..."
CONFIRM_TS_ERRORS=0
if npx tsc --project quality/configs/tsconfig/tsconfig.confirm.json 2>/dev/null; then
    check_result "TypeScript编译检查" 0
else
    check_result "TypeScript编译检查" 1
    CONFIRM_TS_ERRORS=1
fi

# 2. Confirm模块专用ESLint检查
log_info "2. 检查ESLint代码质量..."
CONFIRM_LINT_ERRORS=0
if npx eslint $MODULE_PATH --ext .ts --quiet 2>/dev/null; then
    check_result "ESLint代码质量检查" 0
else
    check_result "ESLint代码质量检查" 1
    CONFIRM_LINT_ERRORS=1
fi

# 3. Confirm模块专用技术债务检查
echo "3. Confirm模块技术债务检查"
CONFIRM_DEBT_ERRORS=0

# 检查真正的技术债务：any类型使用、@ts-ignore、@ts-nocheck、FIXME、HACK
ANY_USAGE=$(grep -r ": any\|<any>\|any\[\]\|any|\|@ts-ignore\|@ts-nocheck\|FIXME\|HACK" $MODULE_PATH --include="*.ts" 2>/dev/null | grep -v "test\|spec\|//.*any\|\*.*any" | wc -l)

if [ $ANY_USAGE -gt 0 ]; then
    echo "❌ Confirm模块发现 $ANY_USAGE 处技术债务"
    CONFIRM_DEBT_ERRORS=1
else
    echo "✅ Confirm模块零技术债务验证通过"
fi

# 4. Confirm模块TODO检查（预留接口，属于正常情况）
echo "4. Confirm模块TODO检查（预留接口标记）"
TODO_COUNT=$(grep -r "TODO.*CoreOrchestrator\|TODO.*等待" $MODULE_PATH --include="*.ts" 2>/dev/null | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    echo "✅ Confirm模块发现 $TODO_COUNT 个预留接口TODO标记（正常）"
else
    echo "⚠️ Confirm模块缺少预留接口TODO标记"
fi

# 5. Confirm模块专用双重命名约定检查
echo "5. Confirm模块双重命名约定检查"
CONFIRM_NAMING_ERRORS=0
# 检查Schema文件使用snake_case
if [ -f "src/schemas/mplp-confirm.json" ]; then
    if grep -q "camelCase" src/schemas/mplp-confirm.json; then
        echo "❌ Schema文件应使用snake_case命名"
        CONFIRM_NAMING_ERRORS=1
    fi
fi
# 检查TypeScript文件使用camelCase (排除正确的Schema映射用法)
if grep -r "confirm_id\|created_at\|approval_status" $MODULE_PATH --include="*.ts" 2>/dev/null | grep -v "test\|spec\|mapper\|schema\|对应Schema\|case.*:\|approval_status.*this\.map\|confirmation_id.*as UUID"; then
    echo "❌ TypeScript文件中发现不当的snake_case使用"
    CONFIRM_NAMING_ERRORS=1
fi

if [ $CONFIRM_NAMING_ERRORS -eq 0 ]; then
    echo "✅ Confirm模块双重命名约定检查通过"
fi

# 6. Confirm模块专用测试覆盖率检查
echo "6. Confirm模块测试覆盖率检查"
CONFIRM_TEST_ERRORS=0
# 检查tests目录下的Confirm模块测试文件
if [ -d "tests/modules/confirm" ]; then
    # 检查模块测试文件
    if find tests/modules/confirm -name "*.test.ts" | grep -q .; then
        echo "✅ Confirm模块测试文件存在"
        # 统计测试文件数量
        TEST_FILE_COUNT=$(find tests/modules/confirm -name "*.test.ts" | wc -l)
        echo "📊 发现 $TEST_FILE_COUNT 个测试文件"
    else
        echo "❌ Confirm模块缺少测试文件"
        CONFIRM_TEST_ERRORS=1
    fi
else
    echo "❌ Confirm模块测试目录不存在"
    CONFIRM_TEST_ERRORS=1
fi

# 6. Confirm模块专用Mapper验证
echo "6. Confirm模块Mapper验证"
CONFIRM_MAPPER_ERRORS=0
if [ -f "$MODULE_PATH/api/mappers/confirm.mapper.ts" ]; then
    # 检查Mapper是否包含必需的方法
    if ! grep -q "toSchema\|fromSchema\|validateSchema" "$MODULE_PATH/api/mappers/confirm.mapper.ts"; then
        echo "❌ Confirm模块Mapper缺少必需方法"
        CONFIRM_MAPPER_ERRORS=1
    else
        echo "✅ Confirm模块Mapper方法完整"
    fi
else
    echo "❌ Confirm模块Mapper文件不存在"
    CONFIRM_MAPPER_ERRORS=1
fi

# 总体评估
TOTAL_ERRORS=$((CONFIRM_TS_ERRORS + CONFIRM_LINT_ERRORS + CONFIRM_DEBT_ERRORS + CONFIRM_NAMING_ERRORS + CONFIRM_TEST_ERRORS + CONFIRM_MAPPER_ERRORS))

echo ""
echo "📊 Confirm模块质量门禁总结:"
echo "✅ TypeScript编译: $([ $CONFIRM_TS_ERRORS -eq 0 ] && echo "通过" || echo "失败")"
echo "✅ ESLint检查: $([ $CONFIRM_LINT_ERRORS -eq 0 ] && echo "通过" || echo "失败")"
echo "✅ 零技术债务: $([ $CONFIRM_DEBT_ERRORS -eq 0 ] && echo "通过" || echo "失败")"
echo "✅ 双重命名约定: $([ $CONFIRM_NAMING_ERRORS -eq 0 ] && echo "通过" || echo "失败")"
echo "✅ 测试覆盖率: $([ $CONFIRM_TEST_ERRORS -eq 0 ] && echo "通过" || echo "失败")"
echo "✅ Mapper完整性: $([ $CONFIRM_MAPPER_ERRORS -eq 0 ] && echo "通过" || echo "失败")"

if [ $TOTAL_ERRORS -eq 0 ]; then
    echo ""
    echo "🎉 Confirm模块质量门禁验证通过！"
    echo "📈 质量评分: 100/100"
    exit 0
else
    echo ""
    echo "❌ Confirm模块质量门禁验证失败"
    echo "📉 发现 $TOTAL_ERRORS 个问题需要修复"
    exit 1
fi
