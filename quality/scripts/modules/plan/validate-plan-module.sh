#!/bin/bash

# Plan模块专用质量门禁验证
# 📊 质量标准: 100%完美质量标准 (基于Plan模块成功经验)
# 基于: Plan模块成功经验 + CircleCI工作流规范
# ==================================================

echo "🔍 Plan模块专用质量门禁验证"
echo "📊 质量标准: 100%完美质量标准 (基于Plan模块成功经验)"
echo "基于: Plan模块成功经验 + CircleCI工作流规范"
echo "=================================================="

# 设置错误处理
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "[INFO] $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] ⚠️ $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] ❌ $1${NC}"
}

# 1. TypeScript编译检查
log_info "1. 检查TypeScript编译状态..."
if npx tsc --project quality/configs/tsconfig/tsconfig.plan.json --noEmit; then
    log_success "✅ TypeScript编译检查"
else
    log_error "❌ TypeScript编译失败"
    exit 1
fi

# 2. ESLint代码质量检查
log_info "2. 检查ESLint代码质量..."
if npx eslint src/modules/plan --ext .ts --quiet; then
    log_success "✅ ESLint代码质量检查"
else
    log_error "❌ ESLint检查失败"
    exit 1
fi
if [ "$PLAN_ESLINT_ERRORS" -gt 0 ]; then
    echo "❌ ESLint错误详情:"
    head -10 validation-results/plan-eslint-errors.log
fi

echo ""
echo "3. 测试检查..."
echo "-----------------------------------------"
npx jest tests/modules/plan --passWithNoTests --json > validation-results/plan-test-results.json 2>&1 || true
if [ -f validation-results/plan-test-results.json ]; then
    PLAN_TEST_PASS=$(cat validation-results/plan-test-results.json | jq -r '.success // false' 2>/dev/null || echo "false")
    PLAN_TEST_TOTAL=$(cat validation-results/plan-test-results.json | jq -r '.numTotalTests // 0' 2>/dev/null || echo "0")
    PLAN_TEST_PASSED=$(cat validation-results/plan-test-results.json | jq -r '.numPassedTests // 0' 2>/dev/null || echo "0")
    PLAN_TEST_FAILED=$(cat validation-results/plan-test-results.json | jq -r '.numFailedTests // 0' 2>/dev/null || echo "0")
else
    PLAN_TEST_PASS="false"
    PLAN_TEST_TOTAL=0
    PLAN_TEST_PASSED=0
    PLAN_TEST_FAILED=0
fi
echo "Plan模块测试结果: $PLAN_TEST_PASSED/$PLAN_TEST_TOTAL 通过"
echo "测试通过状态: $PLAN_TEST_PASS"

echo ""
echo "4. 文档任务完成度检查..."
echo "-----------------------------------------"
UNCOMPLETED_TASKS=$(grep -c "\- \[ \]" docs/L4-Intelligent-Agent-OPS-Refactor/02-plan/plan-TDD-refactor-plan.md || echo "0")
COMPLETED_TASKS=$(grep -c "\- \[x\]" docs/L4-Intelligent-Agent-OPS-Refactor/02-plan/plan-TDD-refactor-plan.md || echo "0")
TOTAL_TASKS=$((UNCOMPLETED_TASKS + COMPLETED_TASKS))
echo "文档任务完成度: $COMPLETED_TASKS/$TOTAL_TASKS"
echo "未完成任务数: $UNCOMPLETED_TASKS"

echo ""
echo "5. 文件结构完整性检查..."
echo "-----------------------------------------"
REQUIRED_FILES=(
    "src/modules/plan/api/controllers/plan.controller.ts"
    "src/modules/plan/api/dto/plan.dto.ts"
    "src/modules/plan/api/mappers/plan.mapper.ts"
    "src/modules/plan/application/services/plan-management.service.ts"
    "src/modules/plan/application/coordinators/task-planning.coordinator.ts"
    "src/modules/plan/application/coordinators/dependency-management.coordinator.ts"
    "src/modules/plan/application/coordinators/execution-strategy.coordinator.ts"
    "src/modules/plan/application/coordinators/risk-assessment.coordinator.ts"
    "src/modules/plan/application/coordinators/failure-recovery.coordinator.ts"
    "src/modules/plan/domain/entities/plan.entity.ts"
    "src/modules/plan/infrastructure/repositories/plan-repository.impl.ts"
    "src/modules/plan/infrastructure/adapters/plan-module.adapter.ts"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺失文件: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done
echo "文件完整性: $((${#REQUIRED_FILES[@]} - MISSING_FILES))/${#REQUIRED_FILES[@]} 文件存在"

echo ""
echo "========================================="
echo "验证结果汇总"
echo "========================================="
echo "TypeScript错误: $PLAN_TS_ERRORS"
echo "ESLint错误: $PLAN_ESLINT_ERRORS"
echo "测试通过: $PLAN_TEST_PASS ($PLAN_TEST_PASSED/$PLAN_TEST_TOTAL)"
echo "未完成任务: $UNCOMPLETED_TASKS"
echo "缺失文件: $MISSING_FILES"

# 计算完成度分数
SCORE=0
if [ $PLAN_TS_ERRORS -eq 0 ]; then SCORE=$((SCORE + 25)); fi
if [ $PLAN_ESLINT_ERRORS -eq 0 ]; then SCORE=$((SCORE + 15)); fi
if [ "$PLAN_TEST_PASS" = "true" ]; then SCORE=$((SCORE + 25)); fi
if [ $UNCOMPLETED_TASKS -eq 0 ]; then SCORE=$((SCORE + 25)); fi
if [ $MISSING_FILES -eq 0 ]; then SCORE=$((SCORE + 10)); fi

echo ""
echo "完成度评分: $SCORE/100"

if [ $PLAN_TS_ERRORS -eq 0 ] && [ $PLAN_ESLINT_ERRORS -eq 0 ] && [ "$PLAN_TEST_PASS" = "true" ] && [ $UNCOMPLETED_TASKS -eq 0 ] && [ $MISSING_FILES -eq 0 ]; then
    echo "🎉 Plan模块TDD重构验证通过！"
    exit 0
else
    echo "❌ Plan模块TDD重构验证失败"
    echo ""
    echo "需要修复的问题:"
    if [ $PLAN_TS_ERRORS -gt 0 ]; then echo "  - 修复 $PLAN_TS_ERRORS 个TypeScript错误"; fi
    if [ $PLAN_ESLINT_ERRORS -gt 0 ]; then echo "  - 修复 $PLAN_ESLINT_ERRORS 个ESLint错误"; fi
    if [ "$PLAN_TEST_PASS" != "true" ]; then echo "  - 修复测试失败问题 ($PLAN_TEST_FAILED 个失败)"; fi
    if [ $UNCOMPLETED_TASKS -gt 0 ]; then echo "  - 完成 $UNCOMPLETED_TASKS 个文档任务"; fi
    if [ $MISSING_FILES -gt 0 ]; then echo "  - 创建 $MISSING_FILES 个缺失文件"; fi
    exit 1
fi
